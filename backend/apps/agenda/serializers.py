"""
Response shaping for the calendar API.

Plain functions rather than DRF ``ModelSerializer`` classes, matching
``apps.encadrant.services.meeting_sessions``: a rendered item is an
*occurrence*, not a model row, so a model-bound serializer would fight the
recurrence layer. Views wrap these payloads in the platform ``envelope()``.

Field names are chosen so the existing agenda UI can consume them directly:
lowercase ``type`` / ``status``, ``start`` / ``end`` rather than the internal
``start_at`` / ``end_at``.
"""

from __future__ import annotations

from .models import (
    CalendarEvent,
    EventParticipant,
    EventStatus,
    EventType,
)
from .services import access
from .services.integrations import meeting_summary
from .services.recurrence import Occurrence

# Internal enum → the vocabulary the calendar UI already speaks.
UI_TYPE = {
    EventType.MEETING: 'meeting',
    EventType.DEADLINE: 'deadline',
    EventType.EVALUATION: 'evaluation',
    EventType.MILESTONE: 'milestone',
    EventType.ADMINISTRATIVE: 'admin',
    EventType.FINANCE: 'financial',
    EventType.REMINDER: 'reminder',
    EventType.OUT_OF_OFFICE: 'out_of_office',
    EventType.OTHER: 'other',
}

UI_STATUS = {
    EventStatus.CONFIRMED: 'confirmed',
    EventStatus.TENTATIVE: 'pending',
    EventStatus.CANCELLED: 'cancelled',
    EventStatus.COMPLETED: 'completed',
}


def serialize_user(user, *, request=None) -> dict | None:
    if user is None:
        return None
    profile = getattr(user, 'profile', None)
    avatar = None
    if profile and getattr(profile, 'avatar', None):
        try:
            avatar = profile.avatar.url
            if request is not None and avatar and not str(avatar).startswith('http'):
                avatar = request.build_absolute_uri(avatar)
        except Exception:
            avatar = None
    return {
        'user_id': user.pk,
        'name': user.full_name,
        'email': user.email,
        'role': user.role,
        'avatar_url': avatar,
    }


def serialize_participant(participant: EventParticipant, *, request=None) -> dict:
    return {
        **(serialize_user(participant.user, request=request) or {}),
        'role': participant.role,
        'response': participant.response,
        'responded_at': participant.responded_at.isoformat() if participant.responded_at else None,
        'is_organizer': participant.role == EventParticipant.Role.ORGANIZER,
    }


def serialize_student(profile) -> dict | None:
    if profile is None:
        return None
    return {
        'student_profile_id': profile.pk,
        'user_id': profile.user_id,
        'name': profile.user.full_name if profile.user_id else '',
        'student_number': profile.student_number,
    }


def serialize_encadrant(profile) -> dict | None:
    if profile is None:
        return None
    supervisor = getattr(profile, 'supervisor_profile', None)
    user = getattr(supervisor, 'user', None)
    return {
        'encadrant_profile_id': profile.pk,
        'user_id': getattr(user, 'pk', None),
        'name': user.full_name if user else '',
    }


def serialize_internship(assignment) -> dict | None:
    """The internship/supervision context, named for the domain not the table."""
    if assignment is None:
        return None
    return {
        'assignment_id': assignment.pk,
        'academic_year': assignment.academic_year,
        'start_date': assignment.start_date.isoformat() if assignment.start_date else None,
        'end_date': assignment.end_date.isoformat() if assignment.end_date else None,
        'is_active': assignment.is_active,
    }


def serialize_recurrence(recurrence) -> dict | None:
    if recurrence is None:
        return None
    return {
        'frequency': recurrence.frequency,
        'interval': recurrence.interval,
        'by_weekdays': list(recurrence.by_weekdays or []),
        'by_month_day': recurrence.by_month_day,
        'until': recurrence.until_at.isoformat() if recurrence.until_at else None,
        'count': recurrence.count,
    }


def serialize_reminders(event: CalendarEvent) -> list[dict]:
    return [
        {
            'id': reminder.pk,
            'minutes_before': reminder.minutes_before,
            'channel': reminder.channel,
            'user_id': reminder.user_id,
        }
        for reminder in event.reminders.all()
        if reminder.is_active
    ]


def serialize_event(
    event: CalendarEvent,
    *,
    ctx: access.ActorContext,
    occurrence: Occurrence | None = None,
    request=None,
    detail: bool = False,
) -> dict:
    """
    Render one occurrence.

    ``occurrence_id`` is stable per instance of a recurring series, which is
    what the grid needs as a React key and what a per-occurrence edit posts
    back as ``occurrence_start``.
    """
    start = occurrence.start_at if occurrence else event.start_at
    end = occurrence.end_at if occurrence else event.end_at
    occurrence_start = occurrence.occurrence_start if occurrence else event.start_at
    is_instance = bool(occurrence and occurrence.is_recurring_instance)

    participants = list(event.participants.all())
    mine = next((p for p in participants if p.user_id == ctx.user.pk), None)

    payload = {
        'id': str(event.uuid),
        'occurrence_id': f'{event.uuid}@{occurrence_start.isoformat()}',
        'occurrence_start': occurrence_start.isoformat(),
        'title': event.title,
        'description': event.description,
        'type': UI_TYPE.get(event.event_type, 'other'),
        'event_type': event.event_type,
        'status': UI_STATUS.get(event.status, 'confirmed'),
        'event_status': event.status,
        'priority': event.priority,
        'visibility': event.visibility,
        'source': event.source,
        'start': start.isoformat(),
        'end': end.isoformat(),
        'timezone': event.timezone,
        'all_day': event.all_day,
        'location': event.location,
        'is_online': event.is_online,
        'external_meeting_url': event.external_meeting_url,
        'organizer': serialize_user(event.organizer, request=request),
        'participants': [serialize_participant(p, request=request) for p in participants],
        'participant_count': len(participants),
        'related_student': serialize_student(event.related_student),
        'related_encadrant': serialize_encadrant(event.related_encadrant),
        'related_internship': serialize_internship(event.related_assignment),
        'video_meeting': meeting_summary(event),
        'conversation_id': event.conversation_id,
        'is_recurring': event.is_series_master,
        'is_recurring_instance': is_instance,
        'recurrence': serialize_recurrence(getattr(event, 'recurrence', None)),
        'series_id': str(event.recurrence_parent.uuid) if event.recurrence_parent_id else None,
        'my_response': mine.response if mine else None,
        'can_edit': access.can_manage_event(ctx, event),
        'can_respond': bool(mine and mine.role != EventParticipant.Role.ORGANIZER),
        'created_at': event.created_at.isoformat(),
        'updated_at': event.updated_at.isoformat(),
    }

    if detail:
        payload.update({
            'reminders': serialize_reminders(event),
            'related_offer': _named(event.related_offer, 'offer_id', 'title'),
            'related_report': _named(event.related_report, 'report_id', 'title'),
            'related_task': _named(event.related_task, 'task_id', 'title'),
            'related_application': (
                {'application_id': event.related_application_id,
                 'offer_title': event.related_application.offer.title}
                if event.related_application_id and event.related_application.offer_id
                else None
            ),
            'related_document_request': (
                {'request_id': event.related_document_request_id}
                if event.related_document_request_id else None
            ),
            'metadata': event.metadata_json or {},
        })

    return payload


def _named(instance, id_key: str, title_attr: str) -> dict | None:
    if instance is None:
        return None
    return {id_key: instance.pk, 'title': getattr(instance, title_attr, '')}


def serialize_occurrences(occurrences, *, ctx, request=None) -> list[dict]:
    return [
        serialize_event(o.event, ctx=ctx, occurrence=o, request=request)
        for o in occurrences
    ]


def serialize_events(events, *, ctx, request=None) -> list[dict]:
    return [serialize_event(event, ctx=ctx, request=request) for event in events]


def serialize_availability_rule(rule) -> dict:
    return {
        'id': rule.pk,
        'weekday': rule.weekday,
        'start_time': rule.start_time.strftime('%H:%M'),
        'end_time': rule.end_time.strftime('%H:%M'),
        'timezone': rule.timezone,
        'is_active': rule.is_active,
    }


def serialize_availability_exception(item) -> dict:
    return {
        'id': item.pk,
        'start': item.start_at.isoformat(),
        'end': item.end_at.isoformat(),
        'is_available': item.is_available,
        'reason': item.reason,
    }
