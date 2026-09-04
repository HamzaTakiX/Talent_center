"""
Recurrence expansion.

A series is stored as one ``CalendarEvent`` master plus an ``EventRecurrence``
rule; occurrences are generated on read. Expansion runs on the *local* wall
clock of the event's zone and converts back to UTC, so "every Monday 10:00"
survives DST transitions.

Two kinds of per-occurrence divergence are supported:

* ``EventRecurrenceException`` — the occurrence was deleted, or detached into
  its own row. Either way the generated instance is suppressed.
* a child ``CalendarEvent`` with ``recurrence_parent`` set — the detached,
  independently editable replacement, returned as a normal event.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from dateutil.rrule import DAILY, MONTHLY, WEEKLY, YEARLY, rrule
from rest_framework.exceptions import ValidationError

from ..constants import MAX_OCCURRENCES_PER_SERIES
from ..models import CalendarEvent, EventRecurrence
from .timezones import UTC, resolve_zone, to_zone

_FREQ_MAP = {
    EventRecurrence.Frequency.DAILY: DAILY,
    EventRecurrence.Frequency.WEEKLY: WEEKLY,
    EventRecurrence.Frequency.MONTHLY: MONTHLY,
    EventRecurrence.Frequency.YEARLY: YEARLY,
}


@dataclass(frozen=True)
class Occurrence:
    """One materialised instance of a series."""

    event: CalendarEvent
    start_at: datetime
    end_at: datetime
    occurrence_start: datetime
    is_recurring_instance: bool

    @property
    def is_master(self) -> bool:
        return self.occurrence_start == self.event.start_at


def validate_recurrence_payload(payload: dict) -> dict:
    """Normalise and validate an incoming recurrence rule."""
    frequency = str(payload.get('frequency', '')).upper()
    if frequency not in EventRecurrence.Frequency.values:
        raise ValidationError({
            'recurrence': {
                'frequency': f'Must be one of {", ".join(EventRecurrence.Frequency.values)}.',
            },
        })

    try:
        interval = int(payload.get('interval') or 1)
    except (TypeError, ValueError):
        raise ValidationError({'recurrence': {'interval': 'Must be an integer.'}})
    if not 1 <= interval <= 365:
        raise ValidationError({'recurrence': {'interval': 'Must be between 1 and 365.'}})

    weekdays_raw = payload.get('by_weekdays') or []
    if not isinstance(weekdays_raw, (list, tuple)):
        raise ValidationError({'recurrence': {'by_weekdays': 'Must be a list of 0-6 integers.'}})
    weekdays: list[int] = []
    for item in weekdays_raw:
        try:
            day = int(item)
        except (TypeError, ValueError):
            raise ValidationError({'recurrence': {'by_weekdays': 'Must be a list of 0-6 integers.'}})
        if not 0 <= day <= 6:
            raise ValidationError({'recurrence': {'by_weekdays': 'Days must be 0 (Mon) to 6 (Sun).'}})
        if day not in weekdays:
            weekdays.append(day)
    weekdays.sort()
    if weekdays and frequency != EventRecurrence.Frequency.WEEKLY:
        raise ValidationError({'recurrence': {'by_weekdays': 'Only valid for WEEKLY recurrence.'}})

    by_month_day = payload.get('by_month_day')
    if by_month_day not in (None, ''):
        try:
            by_month_day = int(by_month_day)
        except (TypeError, ValueError):
            raise ValidationError({'recurrence': {'by_month_day': 'Must be an integer.'}})
        if not 1 <= by_month_day <= 31:
            raise ValidationError({'recurrence': {'by_month_day': 'Must be between 1 and 31.'}})
        if frequency not in {EventRecurrence.Frequency.MONTHLY, EventRecurrence.Frequency.YEARLY}:
            raise ValidationError({
                'recurrence': {'by_month_day': 'Only valid for MONTHLY or YEARLY recurrence.'},
            })
    else:
        by_month_day = None

    count = payload.get('count')
    if count not in (None, ''):
        try:
            count = int(count)
        except (TypeError, ValueError):
            raise ValidationError({'recurrence': {'count': 'Must be an integer.'}})
        if not 1 <= count <= 500:
            raise ValidationError({'recurrence': {'count': 'Must be between 1 and 500.'}})
    else:
        count = None

    return {
        'frequency': frequency,
        'interval': interval,
        'by_weekdays': weekdays,
        'by_month_day': by_month_day,
        'count': count,
    }


def build_rule(event: CalendarEvent, recurrence: EventRecurrence, *, horizon_end: datetime):
    """
    Build a dateutil rule over local wall-clock time.

    dateutil is fed naive local datetimes so that recurrence steps follow the
    calendar rather than fixed 24h offsets; results are localised afterwards.
    """
    zone = resolve_zone(event.timezone)
    local_start = to_zone(event.start_at, zone).replace(tzinfo=None)

    kwargs: dict = {
        'freq': _FREQ_MAP[recurrence.frequency],
        'interval': max(1, recurrence.interval or 1),
        'dtstart': local_start,
    }

    if recurrence.frequency == EventRecurrence.Frequency.WEEKLY and recurrence.by_weekdays:
        kwargs['byweekday'] = sorted(int(d) for d in recurrence.by_weekdays)
    if recurrence.by_month_day and recurrence.frequency in {
        EventRecurrence.Frequency.MONTHLY,
        EventRecurrence.Frequency.YEARLY,
    }:
        kwargs['bymonthday'] = int(recurrence.by_month_day)

    if recurrence.count:
        kwargs['count'] = min(int(recurrence.count), MAX_OCCURRENCES_PER_SERIES)
    else:
        # Bound the rule by whichever comes first: its own end, or the query
        # horizon. Without this an open-ended rule would generate forever.
        hard_stop = to_zone(horizon_end, zone).replace(tzinfo=None)
        if recurrence.until_at:
            rule_until = to_zone(recurrence.until_at, zone).replace(tzinfo=None)
            hard_stop = min(hard_stop, rule_until)
        kwargs['until'] = hard_stop

    return rrule(**kwargs), zone


def expand_series(
    event: CalendarEvent,
    recurrence: EventRecurrence,
    *,
    range_start: datetime,
    range_end: datetime,
    excluded_starts: set[datetime] | None = None,
) -> list[Occurrence]:
    """
    Materialise the occurrences of ``event`` that overlap [range_start, range_end).

    Overlap, not containment: an occurrence that begins before the window but
    is still running inside it belongs to the window.
    """
    duration = event.end_at - event.start_at
    excluded = excluded_starts or set()

    rule, zone = build_rule(event, recurrence, horizon_end=range_end)

    # Start generating slightly before the window so a long occurrence that
    # started earlier is not missed.
    lookback = to_zone(range_start - duration, zone).replace(tzinfo=None)
    window_end_local = to_zone(range_end, zone).replace(tzinfo=None)

    results: list[Occurrence] = []
    for index, local_naive in enumerate(rule):
        if index >= MAX_OCCURRENCES_PER_SERIES:
            break
        if local_naive >= window_end_local:
            break
        if local_naive < lookback:
            continue

        start_utc = local_naive.replace(tzinfo=zone).astimezone(UTC)
        end_utc = start_utc + duration
        if end_utc <= range_start or start_utc >= range_end:
            continue
        if start_utc in excluded:
            continue

        results.append(
            Occurrence(
                event=event,
                start_at=start_utc,
                end_at=end_utc,
                occurrence_start=start_utc,
                is_recurring_instance=True,
            ),
        )
    return results


def series_occurrence_starts(
    event: CalendarEvent,
    recurrence: EventRecurrence,
    *,
    limit: int = MAX_OCCURRENCES_PER_SERIES,
    horizon: datetime | None = None,
) -> list[datetime]:
    """All occurrence start instants of a series, used by the reminder scanner."""
    end = horizon or (event.start_at + timedelta(days=365 * 3))
    rule, zone = build_rule(event, recurrence, horizon_end=end)
    starts: list[datetime] = []
    for index, local_naive in enumerate(rule):
        if index >= limit:
            break
        starts.append(local_naive.replace(tzinfo=zone).astimezone(UTC))
    return starts


def find_occurrence(
    event: CalendarEvent,
    recurrence: EventRecurrence,
    target_start: datetime,
) -> datetime | None:
    """Return the exact occurrence instant matching ``target_start``, if any."""
    window = expand_series(
        event,
        recurrence,
        range_start=target_start - timedelta(seconds=1),
        range_end=target_start + timedelta(seconds=1),
    )
    for occurrence in window:
        if occurrence.start_at == target_start:
            return occurrence.start_at
    return None
