"""
Bridges to the existing meeting, chat and internship subsystems.

Nothing here re-implements a feature that already exists:

* video calls stay in ``encadrant.Meeting`` + Jitsi, reached through
  ``apps.encadrant.services.meeting_sessions``;
* conversations stay in ``apps.chat``, reached through the existing
  ``get_or_create_supervision_dm`` helper, so a student and encadrant keep the
  single DM thread they already have instead of gaining one per event;
* meetings scheduled elsewhere (admin supervision scheduling, ad-hoc calls) are
  projected into the calendar so the two views cannot drift apart.
"""

from __future__ import annotations

import logging
from datetime import timedelta

from django.db import transaction

from apps.encadrant.models import Meeting
from apps.encadrant.services.meeting_authorization import user_can_access_meeting

from ..models import CalendarEvent, EventSource, EventStatus, EventType

logger = logging.getLogger(__name__)

# Supervision meeting status → calendar event status.
_MEETING_STATUS_MAP = {
    Meeting.Status.SCHEDULED: EventStatus.CONFIRMED,
    Meeting.Status.CONFIRMED: EventStatus.CONFIRMED,
    Meeting.Status.IN_PROGRESS: EventStatus.CONFIRMED,
    Meeting.Status.COMPLETED: EventStatus.COMPLETED,
    Meeting.Status.DELAYED: EventStatus.TENTATIVE,
    Meeting.Status.RESCHEDULED: EventStatus.TENTATIVE,
    Meeting.Status.CANCELLED: EventStatus.CANCELLED,
    Meeting.Status.MISSED: EventStatus.COMPLETED,
    Meeting.Status.NO_SHOW: EventStatus.COMPLETED,
    Meeting.Status.NEEDS_FOLLOWUP: EventStatus.COMPLETED,
}

_EVALUATION_MEETING_TYPES = {
    Meeting.MeetingType.MID_TERM_EVAL,
    Meeting.MeetingType.FINAL_EVAL,
    Meeting.MeetingType.JURY,
}


# ---------------------------------------------------------------------------
# Meeting → calendar projection
# ---------------------------------------------------------------------------

def meeting_participants(meeting: Meeting) -> list:
    """The user rows on both sides of a supervision meeting."""
    from apps.accounts_et_roles.models import User

    user_ids: set[int] = set()
    if meeting.student_profile and meeting.student_profile.user_id:
        user_ids.add(meeting.student_profile.user_id)
    for student in meeting.students.all():
        if student.user_id:
            user_ids.add(student.user_id)
    supervisor = getattr(meeting.encadrant_profile, 'supervisor_profile', None)
    if supervisor and supervisor.user_id:
        user_ids.add(supervisor.user_id)
    return list(User.objects.filter(pk__in=user_ids).select_related('profile'))


def project_meeting(meeting: Meeting) -> CalendarEvent | None:
    """
    Create or refresh the calendar row mirroring a supervision meeting.

    Ad-hoc "call now" sessions are skipped: they are not scheduled entries and
    would litter the grid with one-minute artefacts.
    """
    from ..models import EventParticipant

    if (meeting.metadata_json or {}).get('ad_hoc'):
        return None

    start = meeting.planned_start or meeting.scheduled_at
    if not start:
        return None
    end = meeting.planned_end or (start + timedelta(minutes=meeting.duration_minutes or 30))

    organizer = None
    supervisor = getattr(meeting.encadrant_profile, 'supervisor_profile', None)
    if supervisor:
        organizer = supervisor.user
    organizer = organizer or meeting.created_by
    if organizer is None:
        return None

    if meeting.meeting_type in _EVALUATION_MEETING_TYPES:
        event_type = EventType.EVALUATION
    else:
        event_type = EventType.MEETING

    is_online = meeting.meeting_mode in {Meeting.MeetingMode.ONLINE, Meeting.MeetingMode.HYBRID}

    defaults = {
        'title': meeting.title,
        'description': meeting.description or '',
        'event_type': event_type,
        'status': _MEETING_STATUS_MAP.get(meeting.status, EventStatus.CONFIRMED),
        'start_at': start,
        'end_at': end if end > start else start + timedelta(minutes=30),
        'all_day': False,
        'location': meeting.location or '',
        'is_online': is_online,
        'external_meeting_url': meeting.meeting_url or '',
        'organizer': organizer,
        'created_by': meeting.created_by,
        'related_student': meeting.student_profile,
        'related_encadrant': meeting.encadrant_profile,
        'related_assignment': meeting.assignment,
        'source': EventSource.MEETING,
        'visibility': CalendarEvent._meta.get_field('visibility').default,
    }

    event = CalendarEvent.objects.filter(meeting=meeting, source=EventSource.MEETING).first()
    if event is None:
        event = CalendarEvent.objects.create(meeting=meeting, **defaults)
    else:
        for field, value in defaults.items():
            setattr(event, field, value)
        event.save()

    existing = set(
        EventParticipant.objects.filter(event=event).values_list('user_id', flat=True),
    )
    for user in meeting_participants(meeting):
        if user.pk in existing:
            continue
        EventParticipant.objects.create(
            event=event,
            user=user,
            role=(
                EventParticipant.Role.ORGANIZER
                if user.pk == organizer.pk
                else EventParticipant.Role.REQUIRED
            ),
            response=(
                EventParticipant.Response.ACCEPTED
                if user.pk == organizer.pk
                else EventParticipant.Response.PENDING
            ),
        )
    return event


def sync_meeting_from_event(event: CalendarEvent, *, actor=None) -> None:
    """Push a calendar reschedule back onto the linked supervision meeting."""
    meeting = event.meeting
    if meeting is None:
        return
    duration = max(1, int((event.end_at - event.start_at).total_seconds() // 60))
    meeting.planned_start = event.start_at
    meeting.planned_end = event.end_at
    meeting.scheduled_at = event.start_at
    meeting.duration_minutes = duration
    meeting.title = event.title
    meeting.location = event.location
    meeting.save(update_fields=[
        'planned_start', 'planned_end', 'scheduled_at',
        'duration_minutes', 'title', 'location', 'updated_at',
    ])


def cancel_linked_meeting(event: CalendarEvent, *, actor=None) -> None:
    from apps.encadrant.services.meeting_workflow import transition_meeting_status

    meeting = event.meeting
    if meeting is None or meeting.status == Meeting.Status.CANCELLED:
        return
    transition_meeting_status(
        meeting,
        Meeting.Status.CANCELLED,
        actor=actor,
        note='Calendar event cancelled',
    )


# ---------------------------------------------------------------------------
# Calendar → meeting creation
# ---------------------------------------------------------------------------

def ensure_meeting_for_event(event: CalendarEvent, *, actor=None) -> Meeting | None:
    """
    Attach a Jitsi-backed supervision meeting to an online calendar event.

    Requires a validated student ↔ encadrant pair, because that is the
    relationship the existing meeting authorization is built on. Online events
    without such a pair simply carry no video room.
    """
    if event.meeting_id:
        return event.meeting
    if not event.is_online:
        return None
    if not (event.related_student_id and event.related_encadrant_id):
        return None

    from apps.encadrant.services.meeting_sessions import generate_jitsi_room_name

    duration = max(1, int((event.end_at - event.start_at).total_seconds() // 60))
    meeting = Meeting.objects.create(
        encadrant_profile_id=event.related_encadrant_id,
        student_profile_id=event.related_student_id,
        assignment_id=event.related_assignment_id,
        title=event.title,
        description=event.description or '',
        meeting_type=(
            Meeting.MeetingType.MID_TERM_EVAL
            if event.event_type == EventType.EVALUATION
            else Meeting.MeetingType.FOLLOW_UP
        ),
        status=Meeting.Status.SCHEDULED,
        meeting_mode=Meeting.MeetingMode.ONLINE,
        planned_start=event.start_at,
        planned_end=event.end_at,
        scheduled_at=event.start_at,
        duration_minutes=duration,
        location=event.location or '',
        created_by=actor,
        jitsi_room_name=generate_jitsi_room_name(),
        metadata_json={'created_from_calendar_event': str(event.uuid)},
    )
    CalendarEvent.objects.filter(pk=event.pk).update(meeting=meeting)
    event.meeting = meeting
    return meeting


def meeting_summary(event: CalendarEvent) -> dict | None:
    """
    Non-sensitive meeting descriptor for the event payload.

    Deliberately excludes ``jitsi_room_name``: on a public Jitsi instance the
    room name *is* the credential, so it is only handed out by the join
    endpoint after the caller has been authorized for that specific meeting.
    """
    meeting = event.meeting
    if meeting is None:
        return None
    return {
        'meeting_id': meeting.pk,
        'session_id': str(meeting.session_uuid),
        'status': meeting.status,
        'mode': meeting.meeting_mode,
        'can_join': meeting.status in {
            Meeting.Status.SCHEDULED,
            Meeting.Status.CONFIRMED,
            Meeting.Status.IN_PROGRESS,
        },
    }


def join_payload(user, event: CalendarEvent) -> dict:
    """Resolve join credentials through the existing meeting authorization."""
    from rest_framework.exceptions import NotFound, PermissionDenied

    from apps.encadrant.services.meeting_sessions import serialize_meeting_session

    meeting = event.meeting
    if meeting is None:
        raise NotFound('This event has no video meeting.')
    if not user_can_access_meeting(user, meeting):
        raise PermissionDenied('You are not allowed to join this meeting.')
    return serialize_meeting_session(meeting)


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------

def attach_conversation(event: CalendarEvent, *, actor=None) -> None:
    """
    Link the event to the student ↔ encadrant DM that already exists.

    Reuses the supervision DM helper, which is get-or-create keyed on the pair,
    so no duplicate thread is ever produced.
    """
    if event.conversation_id:
        return
    if not (event.related_student_id and event.related_encadrant_id):
        return

    from apps.accounts_et_roles.models import StudentProfile
    from apps.admin_management.models import EncadrantProfile
    from apps.encadrant.services.chat_service import get_or_create_supervision_dm

    student = StudentProfile.objects.filter(pk=event.related_student_id).select_related('user').first()
    encadrant = EncadrantProfile.objects.filter(pk=event.related_encadrant_id).first()
    if not student or not encadrant:
        return

    def _link() -> None:
        try:
            conversation = get_or_create_supervision_dm(
                student=student,
                encadrant=encadrant,
                created_by=actor,
            )
        except Exception:
            logger.exception('Could not attach conversation to calendar event %s', event.pk)
            return
        CalendarEvent.objects.filter(pk=event.pk).update(conversation=conversation)

    transaction.on_commit(_link)
