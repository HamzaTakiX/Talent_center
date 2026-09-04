"""
Calendar audit trail.

Delegates to the platform-wide ``HistoryEvent`` recorder rather than keeping a
private log. Nothing sensitive is recorded: the Jitsi room name and any join
credentials are deliberately excluded — only the fact that a video meeting is
attached, and its id.
"""

from __future__ import annotations

from apps.history.audit import audit

from ..constants import AUDIT_MODULE
from ..models import CalendarEvent


def _entity(event: CalendarEvent) -> dict:
    return {'entity_type': 'calendar_event', 'entity_id': event.pk}


def _snapshot(event: CalendarEvent) -> dict:
    return {
        'event_id': str(event.uuid),
        'event_type': event.event_type,
        'status': event.status,
        'visibility': event.visibility,
        'start': event.start_at.isoformat(),
        'end': event.end_at.isoformat(),
        'timezone': event.timezone,
        'all_day': event.all_day,
        'is_online': event.is_online,
        'meeting_id': event.meeting_id,
        'related_student_id': event.related_student_id,
        'related_encadrant_id': event.related_encadrant_id,
        'related_assignment_id': event.related_assignment_id,
    }


def event_created(event: CalendarEvent, actor=None) -> None:
    audit.emit(
        module=AUDIT_MODULE,
        action='CREATE',
        event_code='agenda.event.created',
        summary=f'Calendar event created: {event.title}',
        actor=actor,
        new_values=_snapshot(event),
        **_entity(event),
    )


def event_updated(event: CalendarEvent, actor=None, *, old_values=None, changed_fields=None) -> None:
    audit.emit(
        module=AUDIT_MODULE,
        action='UPDATE',
        event_code='agenda.event.updated',
        summary=f'Calendar event updated: {event.title}',
        actor=actor,
        old_values=old_values,
        new_values=_snapshot(event),
        details={'changed_fields': changed_fields or []},
        **_entity(event),
    )


def event_moved(event: CalendarEvent, actor=None, *, previous_start=None, previous_end=None) -> None:
    audit.emit(
        module=AUDIT_MODULE,
        action='UPDATE',
        event_code='agenda.event.rescheduled',
        summary=f'Calendar event rescheduled: {event.title}',
        actor=actor,
        old_values={
            'start': previous_start.isoformat() if previous_start else None,
            'end': previous_end.isoformat() if previous_end else None,
        },
        new_values={'start': event.start_at.isoformat(), 'end': event.end_at.isoformat()},
        **_entity(event),
    )


def event_cancelled(event: CalendarEvent, actor=None) -> None:
    audit.emit(
        module=AUDIT_MODULE,
        action='CANCEL',
        event_code='agenda.event.cancelled',
        summary=f'Calendar event cancelled: {event.title}',
        actor=actor,
        new_values=_snapshot(event),
        **_entity(event),
    )


def event_deleted(event: CalendarEvent, actor=None) -> None:
    audit.emit(
        module=AUDIT_MODULE,
        action='DELETE',
        event_code='agenda.event.deleted',
        summary=f'Calendar event deleted: {event.title}',
        actor=actor,
        old_values=_snapshot(event),
        **_entity(event),
    )


def participant_added(event: CalendarEvent, participant_user, actor=None) -> None:
    audit.emit(
        module=AUDIT_MODULE,
        action='UPDATE',
        event_code='agenda.participant.added',
        summary=f'Participant added to {event.title}',
        actor=actor,
        details={'participant_user_id': participant_user.pk},
        **_entity(event),
    )


def participant_removed(event: CalendarEvent, participant_user, actor=None) -> None:
    audit.emit(
        module=AUDIT_MODULE,
        action='UPDATE',
        event_code='agenda.participant.removed',
        summary=f'Participant removed from {event.title}',
        actor=actor,
        details={'participant_user_id': participant_user.pk},
        **_entity(event),
    )


def invitation_answered(event: CalendarEvent, participant, actor=None) -> None:
    audit.emit(
        module=AUDIT_MODULE,
        action='UPDATE',
        event_code='agenda.invitation.answered',
        summary=f'Invitation {participant.response.lower()} for {event.title}',
        actor=actor,
        details={
            'participant_user_id': participant.user_id,
            'response': participant.response,
        },
        **_entity(event),
    )
