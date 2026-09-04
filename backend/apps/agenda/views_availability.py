"""
Availability API — backs the "Availability" control in the calendar toolbar.

Three capabilities:

* manage your own weekly working hours and one-off blocks,
* read free/busy for yourself or for someone you are allowed to schedule with,
* ask for concrete meeting slots where everyone involved is free.

Reading another person's availability is restricted to the users you may
already invite, and it only ever exposes *free/busy shape* — never the titles,
participants or business context of the events behind it.
"""

from __future__ import annotations

from datetime import timedelta

from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope

from .models import AvailabilityException, AvailabilityRule
from .permissions import CanUseCalendar
from .serializers import serialize_availability_exception, serialize_availability_rule
from .services import access
from .services.availability import free_busy, replace_rules, suggest_slots
from .services.timezones import now_utc, parse_aware, resolve_zone

MAX_FREE_BUSY_DAYS = 62


def _ctx(request) -> access.ActorContext:
    return access.build_actor_context(request.user)


def _authorized_user_ids(ctx: access.ActorContext, raw_ids) -> list[int]:
    """
    Resolve the users whose availability may be read.

    Yourself always; anyone else only if they are in your invitable set. This
    is the same rule that governs participants, so availability cannot become
    a side channel for probing unrelated calendars.
    """
    if not raw_ids:
        return [ctx.user.pk]

    wanted: set[int] = set()
    for item in raw_ids:
        try:
            wanted.add(int(item))
        except (TypeError, ValueError):
            raise ValidationError({'users': 'Must be a list of integer user ids.'})

    others = wanted - {ctx.user.pk}
    if others:
        allowed = set(access.invitable_users(ctx).filter(pk__in=others).values_list('pk', flat=True))
        rejected = sorted(others - allowed)
        if rejected:
            raise PermissionDenied(
                'You cannot read availability for: ' + ', '.join(str(i) for i in rejected) + '.',
            )
    return sorted(wanted)


def _parse_window(request, *, default_days: int = 7):
    zone = resolve_zone(request.query_params.get('timezone'))
    raw_start = request.query_params.get('start')
    raw_end = request.query_params.get('end')

    start = parse_aware(raw_start, field='start', zone=zone) if raw_start else now_utc()
    end = (
        parse_aware(raw_end, field='end', zone=zone)
        if raw_end
        else start + timedelta(days=default_days)
    )
    if end <= start:
        raise ValidationError({'end': 'Must be after start.'})
    if (end - start) > timedelta(days=MAX_FREE_BUSY_DAYS):
        raise ValidationError({'range': f'Window cannot exceed {MAX_FREE_BUSY_DAYS} days.'})
    return start, end, zone


class AvailabilityRulesView(APIView):
    """Your recurring weekly working hours."""

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def get(self, request):
        rules = AvailabilityRule.objects.filter(user=request.user).order_by('weekday', 'start_time')
        exceptions = AvailabilityException.objects.filter(
            user=request.user,
            end_at__gte=now_utc(),
        ).order_by('start_at')[:100]
        return Response(
            envelope(
                True,
                'OK',
                data={
                    'rules': [serialize_availability_rule(r) for r in rules],
                    'exceptions': [serialize_availability_exception(e) for e in exceptions],
                },
            ),
        )

    def put(self, request):
        raw = request.data.get('rules')
        if not isinstance(raw, (list, tuple)):
            raise ValidationError({'rules': 'Must be a list of availability windows.'})
        rules = replace_rules(request.user, list(raw))
        return Response(
            envelope(
                True,
                'Availability updated.',
                data={'rules': [serialize_availability_rule(r) for r in rules]},
            ),
        )


class AvailabilityExceptionsView(APIView):
    """One-off blocked or extra-available periods."""

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def post(self, request):
        zone = resolve_zone(request.data.get('timezone'))
        start = parse_aware(request.data.get('start'), field='start', zone=zone)
        end = parse_aware(request.data.get('end'), field='end', zone=zone)
        if end <= start:
            raise ValidationError({'end': 'Must be after start.'})

        item = AvailabilityException.objects.create(
            user=request.user,
            start_at=start,
            end_at=end,
            is_available=bool(request.data.get('is_available', False)),
            reason=str(request.data.get('reason') or '')[:255],
        )
        return Response(
            envelope(True, 'Availability exception saved.', data=serialize_availability_exception(item)),
            status=201,
        )

    def delete(self, request, exception_id):
        deleted, _ = AvailabilityException.objects.filter(
            pk=exception_id, user=request.user,
        ).delete()
        if not deleted:
            from rest_framework.exceptions import NotFound

            raise NotFound('Availability exception not found.')
        return Response(envelope(True, 'Availability exception removed.', data={'id': exception_id}))


class FreeBusyView(APIView):
    """Working / busy / free breakdown for one or more authorized users."""

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def get(self, request):
        ctx = _ctx(request)
        start, end, zone = _parse_window(request)
        raw = request.query_params.get('users') or ''
        user_ids = _authorized_user_ids(ctx, [i for i in raw.split(',') if i.strip()])
        return Response(
            envelope(
                True,
                'OK',
                data=free_busy(
                    user_ids,
                    range_start=start,
                    range_end=end,
                    fallback_timezone=zone.key,
                ),
            ),
        )


class SuggestedSlotsView(APIView):
    """Concrete slots where every listed participant is free."""

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def get(self, request):
        ctx = _ctx(request)
        start, end, zone = _parse_window(request, default_days=14)
        raw = request.query_params.get('users') or ''
        # The organizer is always part of a slot search — a suggestion they are
        # busy for is not a suggestion.
        user_ids = sorted(
            {ctx.user.pk, *_authorized_user_ids(ctx, [i for i in raw.split(',') if i.strip()])},
        )

        try:
            duration = int(request.query_params.get('duration_minutes') or 30)
        except (TypeError, ValueError):
            raise ValidationError({'duration_minutes': 'Must be an integer.'})
        if not 5 <= duration <= 8 * 60:
            raise ValidationError({'duration_minutes': 'Must be between 5 and 480.'})

        try:
            limit = int(request.query_params.get('limit') or 20)
        except (TypeError, ValueError):
            raise ValidationError({'limit': 'Must be an integer.'})

        slots = suggest_slots(
            user_ids,
            range_start=start,
            range_end=end,
            duration_minutes=duration,
            limit=max(1, min(limit, 50)),
            fallback_timezone=zone.key,
        )
        return Response(
            envelope(
                True,
                'OK',
                data={
                    'range': {'start': start.isoformat(), 'end': end.isoformat()},
                    'duration_minutes': duration,
                    'users': user_ids,
                    'slots': slots,
                },
            ),
        )
