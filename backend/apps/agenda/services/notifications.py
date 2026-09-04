"""
Calendar notifications.

Thin wrappers over the existing notification centre. The calendar never sends
an email or writes a ``Notification`` row itself — it emits a domain event and
``apps.notifications`` decides channels, templates, preferences, rate limits
and digesting, exactly as the chat, SRF and documents modules already do.

Recipients are resolved server-side by ``resolve_agenda_participants``, which
reads the participant table rather than trusting a client-supplied list.
"""

from __future__ import annotations

import logging

from django.db import transaction

from apps.notifications.events.publisher import emit_event

from ..constants import (
    EVENT_CANCELLED,
    EVENT_CREATED,
    EVENT_RESCHEDULED,
    EVENT_UPDATED,
    INVITATION_ANSWERED,
    INVITATION_SENT,
    PARTICIPANT_REMOVED,
)
from ..models import CalendarEvent, EventParticipant

logger = logging.getLogger(__name__)

SOURCE_APP = 'agenda'


def _base_payload(event: CalendarEvent, **extra) -> dict:
    payload = {
        'title': event.title,
        'event_id': str(event.uuid),
        'event_type': event.event_type,
        'start': event.start_at.isoformat(),
        'end': event.end_at.isoformat(),
        'timezone': event.timezone,
        'all_day': event.all_day,
        'location': event.location,
        'is_online': event.is_online,
    }
    payload.update(extra)
    return payload


def _emit(event_code: str, event: CalendarEvent, *, actor=None, recipients=None, **extra) -> None:
    """
    Publish on commit so a rolled-back transaction cannot notify anyone.

    Notification failures are logged, never raised: a mail provider outage must
    not fail the user's calendar write.
    """
    payload = _base_payload(event, **extra)
    if recipients is not None:
        payload['recipient_user_ids'] = list(recipients)

    def _publish() -> None:
        try:
            emit_event(
                event_code=event_code,
                source_app=SOURCE_APP,
                entity_type='calendar_event',
                entity_id=event.pk,
                payload=payload,
                actor=actor,
            )
        except Exception:
            logger.exception('Failed to emit agenda notification %s for event %s', event_code, event.pk)

    transaction.on_commit(_publish)


def notify_event_created(event: CalendarEvent, *, actor=None) -> None:
    _emit(EVENT_CREATED, event, actor=actor)


def notify_invitations(event: CalendarEvent, participants: list[EventParticipant], *, actor=None) -> None:
    if not participants:
        return
    _emit(
        INVITATION_SENT,
        event,
        actor=actor,
        recipients=[p.user_id for p in participants],
        organizer_name=event.organizer.full_name,
    )


def notify_event_updated(event: CalendarEvent, *, actor=None, changed_fields: list[str] | None = None) -> None:
    _emit(EVENT_UPDATED, event, actor=actor, changed_fields=changed_fields or [])


def notify_event_rescheduled(
    event: CalendarEvent,
    *,
    actor=None,
    previous_start=None,
    previous_end=None,
) -> None:
    _emit(
        EVENT_RESCHEDULED,
        event,
        actor=actor,
        previous_start=previous_start.isoformat() if previous_start else None,
        previous_end=previous_end.isoformat() if previous_end else None,
    )


def notify_event_cancelled(event: CalendarEvent, *, actor=None) -> None:
    _emit(EVENT_CANCELLED, event, actor=actor)


def notify_invitation_answered(participant: EventParticipant, *, actor=None) -> None:
    event = participant.event
    _emit(
        INVITATION_ANSWERED,
        event,
        actor=actor,
        recipients=[event.organizer_id],
        response=participant.response,
        responder_name=participant.user.full_name,
    )


def notify_participant_removed(event: CalendarEvent, user, *, actor=None) -> None:
    _emit(
        PARTICIPANT_REMOVED,
        event,
        actor=actor,
        recipients=[user.pk],
    )


def notify_reminder(event: CalendarEvent, occurrence_start, recipient_ids: list[int]) -> None:
    """Fired by the reminder scanner; occurrence-aware for recurring series."""
    from ..constants import EVENT_REMINDER

    if not recipient_ids:
        return
    _emit(
        EVENT_REMINDER,
        event,
        recipients=recipient_ids,
        occurrence_start=occurrence_start.isoformat(),
    )
