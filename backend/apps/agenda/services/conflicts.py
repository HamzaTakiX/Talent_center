"""
Scheduling conflict detection.

Overlap is half-open: ``[start, end)``. An event ending at 15:00 and one
starting at 15:00 are back-to-back, not conflicting — the usual calendar
convention, and the one the week grid draws.

Detection never blocks by itself. It returns structure; the caller decides.
Some Talent Center events are legitimately concurrent (a cohort deadline sits
on top of everyone's day), so deadlines, milestones and reminders are treated
as non-blocking markers while meetings and evaluations block by default. A
client that means it can pass ``allow_conflicts`` to proceed anyway; nothing is
ever silently overwritten.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from django.db.models import Q

from ..models import CalendarEvent, EventParticipant, EventStatus, EventType
from .access import base_event_queryset
from .query import expand_range

# Event types that occupy a person's time and therefore block.
BLOCKING_TYPES = {
    EventType.MEETING,
    EventType.EVALUATION,
    EventType.ADMINISTRATIVE,
    EventType.OUT_OF_OFFICE,
}


@dataclass(frozen=True)
class Conflict:
    user_id: int
    event: CalendarEvent
    start_at: datetime
    end_at: datetime
    blocking: bool

    def as_dict(self) -> dict:
        return {
            'user_id': self.user_id,
            'event_id': str(self.event.uuid),
            'title': self.event.title,
            'event_type': self.event.event_type,
            'start': self.start_at.isoformat(),
            'end': self.end_at.isoformat(),
            'blocking': self.blocking,
        }


def is_blocking(event_type: str) -> bool:
    return event_type in BLOCKING_TYPES


def find_conflicts(
    *,
    user_ids: list[int],
    start_at: datetime,
    end_at: datetime,
    exclude_event_id: int | None = None,
    exclude_series_id: int | None = None,
) -> list[Conflict]:
    """
    Busy events for ``user_ids`` overlapping [start_at, end_at).

    Recurring series are expanded over the probe window, so a weekly meeting
    conflicts on every week it actually lands on. Declined invitations do not
    count as busy.
    """
    if not user_ids or end_at <= start_at:
        return []

    busy_for_user = Q(organizer_id__in=user_ids) | Q(
        participants__user_id__in=user_ids,
    ) & ~Q(participants__response=EventParticipant.Response.DECLINED)

    qs = (
        base_event_queryset()
        .filter(busy_for_user)
        .exclude(status=EventStatus.CANCELLED)
        .distinct()
    )
    if exclude_event_id:
        qs = qs.exclude(pk=exclude_event_id)
    if exclude_series_id:
        qs = qs.exclude(pk=exclude_series_id).exclude(recurrence_parent_id=exclude_series_id)

    occurrences = expand_range(qs, range_start=start_at, range_end=end_at)

    attendee_map = _attendees_by_event([o.event.pk for o in occurrences], user_ids)

    conflicts: list[Conflict] = []
    for occurrence in occurrences:
        if occurrence.event.all_day:
            # All-day markers annotate the day; they do not consume a time slot.
            continue
        blocking = is_blocking(occurrence.event.event_type)
        for user_id in attendee_map.get(occurrence.event.pk, set()):
            conflicts.append(
                Conflict(
                    user_id=user_id,
                    event=occurrence.event,
                    start_at=occurrence.start_at,
                    end_at=occurrence.end_at,
                    blocking=blocking,
                ),
            )
    conflicts.sort(key=lambda c: (c.start_at, c.user_id))
    return conflicts


def _attendees_by_event(event_ids: list[int], user_ids: list[int]) -> dict[int, set[int]]:
    """Map event → which of the probed users are actually busy on it (one query)."""
    if not event_ids:
        return {}
    wanted = set(user_ids)
    result: dict[int, set[int]] = {}

    rows = EventParticipant.objects.filter(
        event_id__in=event_ids,
        user_id__in=wanted,
    ).exclude(
        response=EventParticipant.Response.DECLINED,
    ).values_list('event_id', 'user_id')
    for event_id, user_id in rows:
        result.setdefault(event_id, set()).add(user_id)

    organizers = CalendarEvent.objects.filter(
        pk__in=event_ids,
        organizer_id__in=wanted,
    ).values_list('pk', 'organizer_id')
    for event_id, user_id in organizers:
        result.setdefault(event_id, set()).add(user_id)

    return result


def summarize(conflicts: list[Conflict]) -> dict:
    blocking = [c for c in conflicts if c.blocking]
    return {
        'has_conflicts': bool(conflicts),
        'has_blocking_conflicts': bool(blocking),
        'conflicts': [c.as_dict() for c in conflicts],
    }
