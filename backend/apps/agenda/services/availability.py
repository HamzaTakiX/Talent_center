"""
Availability, free/busy and meeting-slot suggestion.

A user's bookable time is built in three layers, in order:

1. ``AvailabilityRule`` — recurring weekly working hours, stored as local wall
   clock in the user's own zone and projected onto each day of the window. A
   user with no rules falls back to a sensible default working week rather than
   appearing permanently unavailable.
2. ``AvailabilityException`` — one-off blocks (holiday, out of office) and
   one-off openings outside normal hours.
3. existing calendar events — subtracted as busy time.

All arithmetic happens on aware UTC instants; the only place local time is used
is projecting a weekly rule onto a concrete date, which is exactly where DST
must be honoured.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

from ..models import AvailabilityException, AvailabilityRule
from .conflicts import find_conflicts
from .timezones import combine_in_zone, resolve_zone, to_zone

# Applied when a user has never configured working hours: Mon-Fri 09:00-18:00.
DEFAULT_WORKING_DAYS = (0, 1, 2, 3, 4)
DEFAULT_WORKING_START = time(9, 0)
DEFAULT_WORKING_END = time(18, 0)

MAX_SUGGESTED_SLOTS = 50


@dataclass(frozen=True)
class Interval:
    start: datetime
    end: datetime

    def overlaps(self, other: 'Interval') -> bool:
        return self.start < other.end and other.start < self.end

    def as_dict(self) -> dict:
        return {'start': self.start.isoformat(), 'end': self.end.isoformat()}


def merge_intervals(intervals: list[Interval]) -> list[Interval]:
    """Union of possibly overlapping intervals, sorted."""
    if not intervals:
        return []
    ordered = sorted(intervals, key=lambda i: i.start)
    merged = [ordered[0]]
    for current in ordered[1:]:
        last = merged[-1]
        if current.start <= last.end:
            if current.end > last.end:
                merged[-1] = Interval(last.start, current.end)
        else:
            merged.append(current)
    return merged


def subtract_intervals(base: list[Interval], blocked: list[Interval]) -> list[Interval]:
    """Remove ``blocked`` from ``base``, splitting where a block lands inside."""
    if not blocked:
        return list(base)
    result: list[Interval] = []
    for span in base:
        pieces = [span]
        for block in blocked:
            next_pieces: list[Interval] = []
            for piece in pieces:
                if not piece.overlaps(block):
                    next_pieces.append(piece)
                    continue
                if block.start > piece.start:
                    next_pieces.append(Interval(piece.start, block.start))
                if block.end < piece.end:
                    next_pieces.append(Interval(block.end, piece.end))
            pieces = next_pieces
            if not pieces:
                break
        result.extend(pieces)
    return merge_intervals(result)


def intersect_intervals(left: list[Interval], right: list[Interval]) -> list[Interval]:
    """Intervals present in both sets — how two people's free time is combined."""
    result: list[Interval] = []
    for a in left:
        for b in right:
            start = max(a.start, b.start)
            end = min(a.end, b.end)
            if start < end:
                result.append(Interval(start, end))
    return merge_intervals(result)


def working_intervals(
    user_id: int,
    *,
    range_start: datetime,
    range_end: datetime,
    fallback_timezone: str | None = None,
) -> list[Interval]:
    """Bookable windows for a user, before existing events are subtracted."""
    rules = list(
        AvailabilityRule.objects.filter(user_id=user_id, is_active=True).order_by('weekday', 'start_time'),
    )

    zone_name = rules[0].timezone if rules else fallback_timezone
    zone = resolve_zone(zone_name)

    local_first = to_zone(range_start, zone).date()
    local_last = to_zone(range_end, zone).date()

    spans: list[Interval] = []
    day = local_first
    while day <= local_last:
        spans.extend(_day_windows(rules, day, zone))
        day += timedelta(days=1)

    spans = merge_intervals(spans)

    exceptions = list(
        AvailabilityException.objects.filter(
            user_id=user_id,
            start_at__lt=range_end,
            end_at__gt=range_start,
        ),
    )
    extra = [Interval(e.start_at, e.end_at) for e in exceptions if e.is_available]
    blocked = [Interval(e.start_at, e.end_at) for e in exceptions if not e.is_available]

    spans = merge_intervals(spans + extra)
    spans = subtract_intervals(spans, blocked)

    window = Interval(range_start, range_end)
    return [
        Interval(max(s.start, window.start), min(s.end, window.end))
        for s in spans
        if s.overlaps(window)
    ]


def _day_windows(rules: list[AvailabilityRule], day: date, zone) -> list[Interval]:
    """Project the weekly rules (or the default working week) onto one date."""
    applicable = [
        rule for rule in rules
        if rule.weekday == day.weekday()
        and (rule.effective_from is None or rule.effective_from <= day)
        and (rule.effective_to is None or rule.effective_to >= day)
    ]

    if not rules:
        if day.weekday() not in DEFAULT_WORKING_DAYS:
            return []
        return [
            Interval(
                combine_in_zone(day, DEFAULT_WORKING_START, zone),
                combine_in_zone(day, DEFAULT_WORKING_END, zone),
            ),
        ]

    return [
        Interval(
            combine_in_zone(day, rule.start_time, resolve_zone(rule.timezone)),
            combine_in_zone(day, rule.end_time, resolve_zone(rule.timezone)),
        )
        for rule in applicable
    ]


def busy_intervals(
    user_id: int,
    *,
    range_start: datetime,
    range_end: datetime,
    exclude_event_id: int | None = None,
) -> list[Interval]:
    """Time already consumed by the user's calendar."""
    conflicts = find_conflicts(
        user_ids=[user_id],
        start_at=range_start,
        end_at=range_end,
        exclude_event_id=exclude_event_id,
    )
    return merge_intervals([
        Interval(c.start_at, c.end_at) for c in conflicts if c.blocking
    ])


def free_busy(
    user_ids: list[int],
    *,
    range_start: datetime,
    range_end: datetime,
    fallback_timezone: str | None = None,
) -> dict:
    """Per-user free/busy breakdown for the requested window."""
    payload = []
    for user_id in user_ids:
        working = working_intervals(
            user_id,
            range_start=range_start,
            range_end=range_end,
            fallback_timezone=fallback_timezone,
        )
        busy = busy_intervals(user_id, range_start=range_start, range_end=range_end)
        payload.append({
            'user_id': user_id,
            'working': [i.as_dict() for i in working],
            'busy': [i.as_dict() for i in busy],
            'free': [i.as_dict() for i in subtract_intervals(working, busy)],
        })
    return {
        'range': {'start': range_start.isoformat(), 'end': range_end.isoformat()},
        'users': payload,
    }


def suggest_slots(
    user_ids: list[int],
    *,
    range_start: datetime,
    range_end: datetime,
    duration_minutes: int = 30,
    granularity_minutes: int = 15,
    limit: int = 20,
    fallback_timezone: str | None = None,
) -> list[dict]:
    """
    Slots of ``duration_minutes`` where *every* listed user is free.

    Free time is intersected across users, then walked at ``granularity_minutes``
    so suggestions land on clean boundaries instead of arbitrary offsets.
    """
    if not user_ids:
        return []
    duration = timedelta(minutes=max(5, duration_minutes))
    step = timedelta(minutes=max(5, granularity_minutes))

    common: list[Interval] | None = None
    for user_id in user_ids:
        working = working_intervals(
            user_id,
            range_start=range_start,
            range_end=range_end,
            fallback_timezone=fallback_timezone,
        )
        busy = busy_intervals(user_id, range_start=range_start, range_end=range_end)
        free = subtract_intervals(working, busy)
        common = free if common is None else intersect_intervals(common, free)
        if not common:
            return []

    slots: list[dict] = []
    for span in common or []:
        cursor = _ceil_to_step(span.start, step)
        while cursor + duration <= span.end and len(slots) < min(limit, MAX_SUGGESTED_SLOTS):
            slots.append({
                'start': cursor.isoformat(),
                'end': (cursor + duration).isoformat(),
            })
            cursor += step
        if len(slots) >= min(limit, MAX_SUGGESTED_SLOTS):
            break
    return slots


def _ceil_to_step(moment: datetime, step: timedelta) -> datetime:
    """Round up to the next clean boundary (09:07 with a 15m step → 09:15)."""
    seconds = int(step.total_seconds())
    epoch_seconds = int(moment.timestamp())
    remainder = epoch_seconds % seconds
    if remainder == 0 and moment.microsecond == 0:
        return moment
    return datetime.fromtimestamp(
        epoch_seconds + (seconds - remainder),
        tz=moment.tzinfo,
    )


def replace_rules(user, rules_payload: list[dict]) -> list[AvailabilityRule]:
    """Overwrite a user's weekly availability with the submitted set."""
    from rest_framework.exceptions import ValidationError

    from .timezones import is_valid_zone

    parsed: list[dict] = []
    seen: set[tuple[int, time, time]] = set()

    for index, raw in enumerate(rules_payload):
        try:
            weekday = int(raw.get('weekday'))
        except (TypeError, ValueError):
            raise ValidationError({f'rules[{index}].weekday': 'Must be an integer 0-6.'})
        if not 0 <= weekday <= 6:
            raise ValidationError({f'rules[{index}].weekday': 'Must be between 0 (Mon) and 6 (Sun).'})

        start_time = _parse_time(raw.get('start_time'), f'rules[{index}].start_time')
        end_time = _parse_time(raw.get('end_time'), f'rules[{index}].end_time')
        if end_time <= start_time:
            raise ValidationError({f'rules[{index}].end_time': 'Must be after start_time.'})

        zone_name = raw.get('timezone') or getattr(getattr(user, 'profile', None), 'timezone', '') or None
        if zone_name and not is_valid_zone(zone_name):
            raise ValidationError({f'rules[{index}].timezone': f'Unknown timezone "{zone_name}".'})

        key = (weekday, start_time, end_time)
        if key in seen:
            raise ValidationError({f'rules[{index}]': 'Duplicate availability window.'})
        seen.add(key)

        parsed.append({
            'weekday': weekday,
            'start_time': start_time,
            'end_time': end_time,
            'timezone': zone_name or resolve_zone(None).key,
            'is_active': bool(raw.get('is_active', True)),
        })

    AvailabilityRule.objects.filter(user=user).delete()
    return AvailabilityRule.objects.bulk_create([
        AvailabilityRule(user=user, **item) for item in parsed
    ])


def _parse_time(raw, field: str) -> time:
    from django.utils.dateparse import parse_time
    from rest_framework.exceptions import ValidationError

    if isinstance(raw, time):
        return raw
    parsed = parse_time(str(raw or ''))
    if parsed is None:
        raise ValidationError({field: 'Invalid time. Use HH:MM.'})
    return parsed
