"""
Event querying: date ranges, filters, search and recurrence expansion.

One code path serves the day, week and month views. The frontend asks for a
window and renders whatever it gets; there is deliberately no ``/daily``,
``/weekly`` or ``/monthly`` endpoint.

Expansion strategy — three disjoint sets are fetched in three queries, never
per-event:

1. plain events overlapping the window,
2. detached occurrence overrides overlapping the window,
3. series masters whose rule could still be producing inside the window,
   expanded in memory with their exception and override instants excluded.
"""

from __future__ import annotations

from datetime import datetime, timedelta

from django.db.models import Q, QuerySet
from rest_framework.exceptions import ValidationError

from ..constants import MAX_RANGE_DAYS
from ..models import (
    CalendarEvent,
    EventRecurrenceException,
    EventStatus,
    EventType,
)
from .access import ActorContext, visible_events
from .recurrence import Occurrence, expand_series

SORT_FIELDS = {
    'start': 'start_at',
    '-start': '-start_at',
    'end': 'end_at',
    '-end': '-end_at',
    'title': 'title',
    '-title': '-title',
    'created': 'created_at',
    '-created': '-created_at',
    'updated': 'updated_at',
    '-updated': '-updated_at',
}


def parse_range(request, *, zone) -> tuple[datetime, datetime] | None:
    """Read and validate the ``start`` / ``end`` window from query params."""
    from .timezones import parse_aware

    raw_start = request.query_params.get('start')
    raw_end = request.query_params.get('end')
    if not raw_start and not raw_end:
        return None
    if not raw_start or not raw_end:
        raise ValidationError({'range': 'Both "start" and "end" are required for a range query.'})

    start = parse_aware(raw_start, field='start', zone=zone)
    end = parse_aware(raw_end, field='end', zone=zone)
    if end <= start:
        raise ValidationError({'range': '"end" must be after "start".'})
    if (end - start) > timedelta(days=MAX_RANGE_DAYS):
        raise ValidationError({'range': f'Range cannot exceed {MAX_RANGE_DAYS} days.'})
    return start, end


def apply_filters(qs: QuerySet[CalendarEvent], request, ctx: ActorContext) -> QuerySet[CalendarEvent]:
    """
    Apply the UI filters.

    Filters narrow an already-authorized queryset. Passing another student's id
    here cannot widen access, it can only return nothing.
    """
    params = request.query_params

    types = _csv(params.get('type') or params.get('types'))
    if types:
        unknown = [t for t in types if t not in EventType.values]
        if unknown:
            raise ValidationError({'type': f'Unknown event type(s): {", ".join(unknown)}.'})
        qs = qs.filter(event_type__in=types)

    statuses = _csv(params.get('status'))
    if statuses:
        unknown = [s for s in statuses if s not in EventStatus.values]
        if unknown:
            raise ValidationError({'status': f'Unknown status(es): {", ".join(unknown)}.'})
        qs = qs.filter(status__in=statuses)
    elif _flag(params.get('include_cancelled')) is not True:
        qs = qs.exclude(status=EventStatus.CANCELLED)

    if participant := params.get('participant'):
        qs = qs.filter(
            Q(participants__user_id=_as_int(participant, 'participant'))
            | Q(organizer_id=_as_int(participant, 'participant')),
        )

    if student := params.get('student'):
        qs = qs.filter(related_student_id=_as_int(student, 'student'))

    if encadrant := params.get('encadrant'):
        qs = qs.filter(related_encadrant_id=_as_int(encadrant, 'encadrant'))

    if assignment := params.get('assignment') or params.get('internship'):
        qs = qs.filter(related_assignment_id=_as_int(assignment, 'assignment'))

    if offer := params.get('offer'):
        qs = qs.filter(related_offer_id=_as_int(offer, 'offer'))

    online = _flag(params.get('online'))
    if online is not None:
        qs = qs.filter(is_online=online)

    mine = _flag(params.get('mine'))
    if mine:
        qs = qs.filter(Q(organizer_id=ctx.user.pk) | Q(participants__user_id=ctx.user.pk))

    if search := (params.get('q') or params.get('search') or '').strip():
        qs = apply_search(qs, search)

    return qs.distinct()


def apply_search(qs: QuerySet[CalendarEvent], term: str) -> QuerySet[CalendarEvent]:
    """
    Full-text-ish search across the event and its business context.

    Kept as one indexed database query — the calendar is never loaded into the
    frontend to be filtered there.
    """
    predicate = (
        Q(title__icontains=term)
        | Q(description__icontains=term)
        | Q(location__icontains=term)
        | Q(participants__user__email__icontains=term)
        | Q(participants__user__profile__first_name__icontains=term)
        | Q(participants__user__profile__last_name__icontains=term)
        | Q(organizer__email__icontains=term)
        | Q(organizer__profile__first_name__icontains=term)
        | Q(organizer__profile__last_name__icontains=term)
        | Q(related_student__user__email__icontains=term)
        | Q(related_student__user__profile__first_name__icontains=term)
        | Q(related_student__user__profile__last_name__icontains=term)
        | Q(related_student__student_number__icontains=term)
        | Q(related_encadrant__supervisor_profile__user__email__icontains=term)
        | Q(related_encadrant__supervisor_profile__user__profile__first_name__icontains=term)
        | Q(related_encadrant__supervisor_profile__user__profile__last_name__icontains=term)
        | Q(related_offer__title__icontains=term)
        | Q(related_application__offer__title__icontains=term)
        | Q(related_report__title__icontains=term)
        | Q(related_task__title__icontains=term)
        | Q(meeting__title__icontains=term)
    )

    upper = term.upper().replace(' ', '_')
    matching_types = [value for value in EventType.values if upper in value]
    if matching_types:
        predicate |= Q(event_type__in=matching_types)

    return qs.filter(predicate)


def apply_sort(qs: QuerySet[CalendarEvent], request) -> QuerySet[CalendarEvent]:
    raw = (request.query_params.get('sort') or 'start').strip()
    field = SORT_FIELDS.get(raw)
    if field is None:
        raise ValidationError({
            'sort': f'Unsupported sort. Use one of: {", ".join(sorted(SORT_FIELDS))}.',
        })
    return qs.order_by(field, 'pk')


def expand_range(
    qs: QuerySet[CalendarEvent],
    *,
    range_start: datetime,
    range_end: datetime,
) -> list[Occurrence]:
    """Materialise every occurrence overlapping [range_start, range_end)."""
    overlapping = Q(start_at__lt=range_end) & Q(end_at__gt=range_start)

    singles = list(
        qs.filter(overlapping, recurrence__isnull=True, recurrence_parent__isnull=True),
    )
    overrides = list(
        qs.filter(overlapping, recurrence_parent__isnull=False),
    )
    masters = list(
        qs.filter(
            Q(recurrence__isnull=False)
            & Q(start_at__lt=range_end)
            & (Q(recurrence__until_at__isnull=True) | Q(recurrence__until_at__gte=range_start)),
        ),
    )

    occurrences: list[Occurrence] = [
        Occurrence(
            event=event,
            start_at=event.start_at,
            end_at=event.end_at,
            occurrence_start=event.start_at,
            is_recurring_instance=False,
        )
        for event in singles
    ]
    occurrences += [
        Occurrence(
            event=event,
            start_at=event.start_at,
            end_at=event.end_at,
            occurrence_start=event.recurrence_original_start or event.start_at,
            is_recurring_instance=True,
        )
        for event in overrides
    ]

    if masters:
        excluded = _excluded_instants([m.pk for m in masters])
        for master in masters:
            occurrences += expand_series(
                master,
                master.recurrence,
                range_start=range_start,
                range_end=range_end,
                excluded_starts=excluded.get(master.pk, set()),
            )

    occurrences.sort(key=lambda item: (item.start_at, item.event.pk))
    return occurrences


def _excluded_instants(master_ids: list[int]) -> dict[int, set[datetime]]:
    """
    Occurrence instants a series must not generate.

    Two sources: explicit cancellations, and occurrences already detached into
    their own row (otherwise the detached copy and the generated instance would
    both appear).
    """
    excluded: dict[int, set[datetime]] = {pk: set() for pk in master_ids}

    for series_id, instant in EventRecurrenceException.objects.filter(
        series_id__in=master_ids,
    ).values_list('series_id', 'occurrence_start'):
        excluded[series_id].add(instant)

    for parent_id, instant in CalendarEvent.objects.filter(
        recurrence_parent_id__in=master_ids,
        recurrence_original_start__isnull=False,
    ).values_list('recurrence_parent_id', 'recurrence_original_start'):
        excluded.setdefault(parent_id, set()).add(instant)

    return excluded


def list_events(request, ctx: ActorContext):
    """
    Entry point for ``GET /api/agenda/events``.

    Returns either an expanded occurrence list (range mode, used by the day /
    week / month grids) or a paginated flat list (search and agenda modes).
    """
    from .timezones import resolve_zone

    zone = resolve_zone(request.query_params.get('timezone'))
    qs = apply_filters(visible_events(ctx), request, ctx)

    window = parse_range(request, zone=zone)
    if window is None:
        return None, apply_sort(qs, request)

    range_start, range_end = window
    return (range_start, range_end), expand_range(
        apply_sort(qs, request),
        range_start=range_start,
        range_end=range_end,
    )


def _csv(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [chunk.strip() for chunk in raw.split(',') if chunk.strip()]


def _flag(raw: str | None) -> bool | None:
    if raw is None or raw == '':
        return None
    return str(raw).strip().lower() in {'1', 'true', 'yes', 'on'}


def _as_int(raw: str, field: str) -> int:
    try:
        return int(raw)
    except (TypeError, ValueError):
        raise ValidationError({field: 'Must be an integer id.'})
