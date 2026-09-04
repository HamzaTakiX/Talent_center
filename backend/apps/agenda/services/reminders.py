"""
Reminder dispatch.

A scanner runs periodically (Celery beat, or the management command from an
external scheduler) and fires every reminder whose moment has arrived.

Two properties matter:

* **Idempotent.** ``EventReminderDispatch`` is keyed on (reminder, occurrence),
  so a reminder fires once per occurrence no matter how often the scanner runs
  or how many workers race. A recurring series therefore reminds weekly rather
  than once forever.
* **Catch-up safe.** The scanner looks back over a grace window, so a worker
  that was down for a few minutes still delivers rather than silently skipping.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta

from django.db import IntegrityError, transaction
from django.db.models import Q

from ..models import (
    CalendarEvent,
    EventParticipant,
    EventReminder,
    EventReminderDispatch,
    EventStatus,
)
from .notifications import notify_reminder
from .recurrence import expand_series
from .timezones import now_utc

logger = logging.getLogger(__name__)

DEFAULT_GRACE_MINUTES = 10
MAX_REMINDER_MINUTES = 60 * 24 * 30


def due_reminders(*, moment: datetime | None = None, grace_minutes: int = DEFAULT_GRACE_MINUTES):
    """
    Reminders whose fire time falls inside the catch-up window.

    Yields ``(reminder, occurrence_start)`` pairs.
    """
    now = moment or now_utc()
    window_start = now - timedelta(minutes=grace_minutes)

    candidates = (
        EventReminder.objects
        .filter(is_active=True)
        .exclude(event__status=EventStatus.CANCELLED)
        .filter(
            # Recurring series can fire at any time; one-off events only matter
            # if their start is still inside the widest possible reminder lead.
            Q(event__recurrence__isnull=False)
            | Q(event__start_at__gte=window_start,
                event__start_at__lte=now + timedelta(minutes=MAX_REMINDER_MINUTES)),
        )
        .select_related('event', 'event__recurrence', 'event__organizer')
    )

    for reminder in candidates:
        lead = timedelta(minutes=reminder.minutes_before)
        target_from = window_start + lead
        target_to = now + lead

        for occurrence_start in _occurrence_starts(reminder.event, target_from, target_to):
            yield reminder, occurrence_start


def _occurrence_starts(event: CalendarEvent, window_start: datetime, window_end: datetime) -> list[datetime]:
    recurrence = getattr(event, 'recurrence', None)
    if recurrence is None:
        if window_start <= event.start_at <= window_end:
            return [event.start_at]
        return []

    excluded = set(
        event.recurrence_exceptions.filter(
            occurrence_start__gte=window_start,
            occurrence_start__lte=window_end,
        ).values_list('occurrence_start', flat=True),
    )
    occurrences = expand_series(
        event,
        recurrence,
        range_start=window_start,
        range_end=window_end + timedelta(seconds=1),
        excluded_starts=excluded,
    )
    return [o.start_at for o in occurrences if window_start <= o.start_at <= window_end]


def recipients_for(reminder: EventReminder) -> list[int]:
    """Who gets this reminder. Declined invitees are skipped."""
    if reminder.user_id:
        return [reminder.user_id]
    ids = set(
        EventParticipant.objects
        .filter(event_id=reminder.event_id)
        .exclude(response=EventParticipant.Response.DECLINED)
        .values_list('user_id', flat=True),
    )
    ids.add(reminder.event.organizer_id)
    ids.discard(None)
    return sorted(ids)


def dispatch_due_reminders(
    *,
    moment: datetime | None = None,
    grace_minutes: int = DEFAULT_GRACE_MINUTES,
) -> int:
    """Fire every due reminder exactly once. Returns how many were sent."""
    sent = 0
    for reminder, occurrence_start in due_reminders(moment=moment, grace_minutes=grace_minutes):
        try:
            with transaction.atomic():
                EventReminderDispatch.objects.create(
                    reminder=reminder,
                    occurrence_start=occurrence_start,
                )
                notify_reminder(reminder.event, occurrence_start, recipients_for(reminder))
        except IntegrityError:
            # Already fired for this occurrence — another worker won the race.
            continue
        except Exception:
            logger.exception('Failed to dispatch reminder %s', reminder.pk)
            continue
        sent += 1
    return sent
