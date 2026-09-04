"""
Timezone-aware datetime handling for the calendar.

Rules enforced here, so no caller has to remember them:

* Every datetime crossing the API boundary is parsed into an aware UTC value.
  A naive input is interpreted in the event's own zone, never in the server's.
* Nothing is ever stored or compared naive, so no aware/naive comparison can
  happen downstream.
* Wall-clock arithmetic (recurrence, working hours) is done in the event zone
  and converted back to UTC, which is what makes it DST-safe: "every Monday at
  10:00" stays 10:00 local across a DST boundary even though the UTC offset
  moves.
"""

from __future__ import annotations

from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.utils import timezone as dj_timezone
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework.exceptions import ValidationError

from ..constants import DEFAULT_TIMEZONE

UTC = ZoneInfo('UTC')


def resolve_zone(name: str | None) -> ZoneInfo:
    """Return a ZoneInfo for an IANA name, falling back to the platform default."""
    if not name:
        return ZoneInfo(DEFAULT_TIMEZONE)
    try:
        return ZoneInfo(str(name))
    except (ZoneInfoNotFoundError, ValueError, KeyError):
        raise ValidationError({'timezone': f'Unknown timezone "{name}".'})


def is_valid_zone(name: str | None) -> bool:
    if not name:
        return False
    try:
        ZoneInfo(str(name))
    except (ZoneInfoNotFoundError, ValueError, KeyError):
        return False
    return True


def parse_aware(value, *, field: str, zone: ZoneInfo | None = None) -> datetime:
    """
    Parse an ISO-8601 datetime into an aware UTC datetime.

    Offset-carrying input wins. Naive input is interpreted in ``zone`` (the
    event's authoring zone) rather than the server zone.
    """
    if value is None or value == '':
        raise ValidationError({field: 'This field is required.'})
    if isinstance(value, datetime):
        parsed = value
    else:
        parsed = parse_datetime(str(value))
        if parsed is None:
            # Accept a bare date for all-day payloads.
            as_date = parse_date(str(value))
            if as_date is None:
                raise ValidationError({field: 'Invalid datetime. Use ISO-8601.'})
            parsed = datetime.combine(as_date, time.min)
    if dj_timezone.is_naive(parsed):
        parsed = parsed.replace(tzinfo=zone or ZoneInfo(DEFAULT_TIMEZONE))
    return parsed.astimezone(UTC)


def parse_aware_optional(value, *, field: str, zone: ZoneInfo | None = None) -> datetime | None:
    if value is None or value == '':
        return None
    return parse_aware(value, field=field, zone=zone)


def to_zone(moment: datetime, zone: ZoneInfo) -> datetime:
    """Convert an aware datetime into ``zone``. Rejects naive input loudly."""
    if dj_timezone.is_naive(moment):
        raise ValueError('Refusing to convert a naive datetime; parse it first.')
    return moment.astimezone(zone)


def combine_in_zone(day: date, moment: time, zone: ZoneInfo) -> datetime:
    """Build an aware UTC datetime from a local wall-clock date and time."""
    return datetime.combine(day, moment).replace(tzinfo=zone).astimezone(UTC)


def day_bounds(day: date, zone: ZoneInfo) -> tuple[datetime, datetime]:
    """UTC half-open bounds of a local calendar day, DST transitions included."""
    start = combine_in_zone(day, time.min, zone)
    end = combine_in_zone(day + timedelta(days=1), time.min, zone)
    return start, end


def all_day_bounds(start: datetime, end: datetime, zone: ZoneInfo) -> tuple[datetime, datetime]:
    """
    Snap a range to whole local days.

    An all-day event runs from local midnight to the local midnight after its
    last day, so a single-day event is exactly 24 local hours (23 or 25 across
    a DST change), matching how the grid renders it.
    """
    local_start = to_zone(start, zone).date()
    local_end = to_zone(end, zone)
    last_day = local_end.date()
    if local_end.time() != time.min or last_day <= local_start:
        last_day = last_day + timedelta(days=1)
    return (
        combine_in_zone(local_start, time.min, zone),
        combine_in_zone(last_day, time.min, zone),
    )


def now_utc() -> datetime:
    return dj_timezone.now().astimezone(UTC)


def shift_wall_clock(moment: datetime, delta: timedelta, zone: ZoneInfo) -> datetime:
    """
    Add ``delta`` to the local wall clock rather than to absolute time.

    Moving an event "one day later" must keep its local start time even if a
    DST transition sits in between.
    """
    local = to_zone(moment, zone)
    naive_shifted = local.replace(tzinfo=None) + delta
    return naive_shifted.replace(tzinfo=zone).astimezone(UTC)
