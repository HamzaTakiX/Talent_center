"""
Realtime calendar synchronisation.

Uses the Django Channels layer already configured for chat and notifications —
same transport, same JWT middleware, same in-memory/Redis switch. No second
realtime technology is introduced.

Each affected user has their own group, so an encadrant moving a meeting
refreshes exactly the student's calendar and nobody else's.
"""

from __future__ import annotations

import logging
import threading

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction

from ..constants import AGENDA_USER_GROUP
from ..models import CalendarEvent, EventParticipant

logger = logging.getLogger(__name__)


def user_group(user_id: int) -> str:
    return AGENDA_USER_GROUP.format(user_id=user_id)


def _group_send(group: str, message: dict) -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    try:
        async_to_sync(channel_layer.group_send)(group, message)
    except RuntimeError:
        # Called from inside a running event loop: hand off to a worker thread,
        # mirroring apps.notifications.services.realtime.
        def _deliver() -> None:
            try:
                async_to_sync(channel_layer.group_send)(group, message)
            except Exception:
                logger.exception('Failed to push agenda event to %s', group)

        threading.Thread(target=_deliver, daemon=True, name='agenda-realtime-send').start()
    except Exception:
        logger.exception('Failed to push agenda event to %s', group)


def audience_ids(event: CalendarEvent) -> list[int]:
    """Everyone whose calendar view is affected by a change to this event."""
    ids = {event.organizer_id}
    ids.update(
        EventParticipant.objects.filter(event=event).values_list('user_id', flat=True),
    )
    ids.discard(None)
    return sorted(ids)


def broadcast(event: CalendarEvent, action: str, *, payload: dict | None = None, extra_user_ids=None) -> None:
    """
    Push a calendar change to every affected user, after commit.

    The payload carries the event id and action only — clients refetch through
    the authorized API rather than trusting a pushed body, so the socket can
    never leak a field the recipient is not allowed to read.
    """
    recipients = set(audience_ids(event))
    if extra_user_ids:
        recipients.update(extra_user_ids)

    body = {
        'type': 'agenda.event',
        'payload': {
            'action': action,
            'event_id': str(event.uuid),
            'start': event.start_at.isoformat(),
            'end': event.end_at.isoformat(),
            **(payload or {}),
        },
    }

    def _publish() -> None:
        for user_id in recipients:
            _group_send(user_group(user_id), body)

    transaction.on_commit(_publish)
