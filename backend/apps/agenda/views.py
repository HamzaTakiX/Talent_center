"""
Calendar event API.

Follows the platform conventions: ``APIView`` classes, every body wrapped in
``envelope()``, list responses paginated with the shared
``admin_management.pagination`` helpers, and errors surfaced through the global
``custom_exception_handler``.

One range endpoint serves the day, week and month views. There is no
``/daily``, ``/weekly`` or ``/monthly`` variant.
"""

from __future__ import annotations

import logging

from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.pagination import paginate_queryset, paginated_payload
from apps.authentication.utils import envelope

from .constants import SCOPE_SERIES, SCOPE_THIS
from .models import EventStatus, EventType, EventVisibility
from .permissions import CanUseCalendar
from .serializers import (
    serialize_event,
    serialize_events,
    serialize_occurrences,
    serialize_user,
)
from .services import access, events as event_service, payloads, query
from .services.conflicts import find_conflicts, summarize
from .services.integrations import join_payload
from .services.timezones import parse_aware, parse_aware_optional, resolve_zone

logger = logging.getLogger(__name__)

CONFLICT_STATUS = 409


def _ctx(request) -> access.ActorContext:
    return access.build_actor_context(request.user)


def _conflict_response(exc: event_service.SchedulingConflict) -> Response:
    return Response(
        envelope(
            False,
            'Scheduling conflict detected.',
            errors={'code': 'scheduling_conflict', **exc.payload},
        ),
        status=CONFLICT_STATUS,
    )


def _occurrence_start(request, *, source: str = 'query'):
    raw = (
        request.query_params.get('occurrence_start')
        if source == 'query'
        else request.data.get('occurrence_start')
    )
    return parse_aware_optional(raw, field='occurrence_start')


class CalendarEventListCreateView(APIView):
    """
    ``GET``  list events — range mode when ``start``/``end`` are supplied,
             paginated flat mode otherwise (search, agenda list).
    ``POST`` create an event.
    """

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def get(self, request):
        ctx = _ctx(request)
        window, result = query.list_events(request, ctx)

        if window is None:
            items, meta = paginate_queryset(result, request, default_page_size=25, max_page_size=200)
            return Response(
                envelope(
                    True,
                    'Events loaded.',
                    data=paginated_payload(
                        serialize_events(items, ctx=ctx, request=request), meta,
                    ),
                ),
            )

        range_start, range_end = window
        return Response(
            envelope(
                True,
                'Events loaded.',
                data={
                    'items': serialize_occurrences(result, ctx=ctx, request=request),
                    'total': len(result),
                    'range': {
                        'start': range_start.isoformat(),
                        'end': range_end.isoformat(),
                    },
                },
            ),
        )

    def post(self, request):
        ctx = _ctx(request)
        try:
            event = event_service.create_event(ctx, request.data)
        except event_service.SchedulingConflict as exc:
            return _conflict_response(exc)
        return Response(
            envelope(
                True,
                'Event created.',
                data=serialize_event(event, ctx=ctx, request=request, detail=True),
            ),
            status=201,
        )


class CalendarEventDetailView(APIView):
    """Read, partially update, or delete a single event or occurrence."""

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def get(self, request, event_uuid):
        ctx = _ctx(request)
        event = access.get_visible_event_or_404(ctx, event_uuid)
        return Response(
            envelope(
                True,
                'OK',
                data=serialize_event(event, ctx=ctx, request=request, detail=True),
            ),
        )

    def patch(self, request, event_uuid):
        ctx = _ctx(request)
        event = access.get_visible_event_or_404(ctx, event_uuid)
        scope = payloads.parse_scope(request.data, default=SCOPE_SERIES)
        try:
            updated = event_service.update_event(
                ctx,
                event,
                request.data,
                scope=scope,
                occurrence_start=_occurrence_start(request, source='body'),
            )
        except event_service.SchedulingConflict as exc:
            return _conflict_response(exc)
        return Response(
            envelope(
                True,
                'Event updated.',
                data=serialize_event(updated, ctx=ctx, request=request, detail=True),
            ),
        )

    def delete(self, request, event_uuid):
        ctx = _ctx(request)
        event = access.get_visible_event_or_404(ctx, event_uuid)
        scope = payloads.parse_scope(request.query_params, default=SCOPE_SERIES)
        occurrence_start = _occurrence_start(request)

        # Cancelling keeps the entry visible and notifies; deleting removes it.
        if str(request.query_params.get('mode') or 'delete').lower() == 'cancel':
            cancelled = event_service.cancel_event(
                ctx, event, scope=scope, occurrence_start=occurrence_start,
            )
            return Response(
                envelope(
                    True,
                    'Event cancelled.',
                    data=serialize_event(cancelled, ctx=ctx, request=request, detail=True),
                ),
            )

        event_service.delete_event(ctx, event, scope=scope, occurrence_start=occurrence_start)
        return Response(envelope(True, 'Event deleted.', data={'id': str(event_uuid)}))


class CalendarEventMoveView(APIView):
    """
    Drag-and-drop and resize.

    A narrow endpoint so the frontend can send only the new bounds, while the
    backend still runs the full authorization, validation, conflict,
    notification and broadcast chain.
    """

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def post(self, request, event_uuid):
        ctx = _ctx(request)
        event = access.get_visible_event_or_404(ctx, event_uuid)
        scope = payloads.parse_scope(request.data, default=SCOPE_THIS)
        zone = resolve_zone(request.data.get('timezone') or event.timezone)

        if 'delta_days' in request.data:
            try:
                days = int(request.data.get('delta_days'))
            except (TypeError, ValueError):
                raise ValidationError({'delta_days': 'Must be an integer.'})
            try:
                moved = event_service.shift_event_days(
                    ctx,
                    event,
                    days=days,
                    scope=scope,
                    occurrence_start=_occurrence_start(request, source='body'),
                )
            except event_service.SchedulingConflict as exc:
                return _conflict_response(exc)
            return Response(
                envelope(True, 'Event moved.', data=serialize_event(moved, ctx=ctx, request=request)),
            )

        start = parse_aware(request.data.get('start'), field='start', zone=zone)
        end = parse_aware_optional(request.data.get('end'), field='end', zone=zone)
        try:
            moved = event_service.move_event(
                ctx,
                event,
                start=start,
                end=end,
                scope=scope,
                occurrence_start=_occurrence_start(request, source='body'),
                allow_conflicts=payloads._bool(request.data.get('allow_conflicts')),
            )
        except event_service.SchedulingConflict as exc:
            return _conflict_response(exc)
        return Response(
            envelope(True, 'Event moved.', data=serialize_event(moved, ctx=ctx, request=request)),
        )


class CalendarEventParticipantsView(APIView):
    """Add or remove attendees. Only the organizer (or a scoped admin) may."""

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def post(self, request, event_uuid):
        ctx = _ctx(request)
        event = access.get_visible_event_or_404(ctx, event_uuid)
        raw = request.data.get('user_ids')
        if raw is None and request.data.get('user_id') is not None:
            raw = [request.data.get('user_id')]
        if not isinstance(raw, (list, tuple)) or not raw:
            raise ValidationError({'user_ids': 'Provide a non-empty list of user ids.'})

        event_service.add_participants(ctx, event, list(raw))
        event.refresh_from_db()
        return Response(
            envelope(
                True,
                'Participants added.',
                data=serialize_event(event, ctx=ctx, request=request, detail=True),
            ),
            status=201,
        )

    def delete(self, request, event_uuid):
        ctx = _ctx(request)
        event = access.get_visible_event_or_404(ctx, event_uuid)
        user_id = request.query_params.get('user_id') or request.data.get('user_id')
        if not user_id:
            raise ValidationError({'user_id': 'This query parameter is required.'})

        event_service.remove_participant(ctx, event, user_id)
        event.refresh_from_db()
        return Response(
            envelope(
                True,
                'Participant removed.',
                data=serialize_event(event, ctx=ctx, request=request, detail=True),
            ),
        )


class CalendarEventRespondView(APIView):
    """Accept, decline or tentatively answer *your own* invitation."""

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def post(self, request, event_uuid):
        ctx = _ctx(request)
        event = access.get_visible_event_or_404(ctx, event_uuid)
        event_service.respond_to_invitation(
            ctx,
            event,
            request.data.get('response'),
            comment=request.data.get('comment') or '',
        )
        event.refresh_from_db()
        return Response(
            envelope(
                True,
                'Response recorded.',
                data=serialize_event(event, ctx=ctx, request=request, detail=True),
            ),
        )


class CalendarEventJoinView(APIView):
    """
    Resolve video-call credentials for an event.

    Delegates to the existing supervision meeting authorization, so join data
    is only produced for someone already allowed into that meeting — the room
    name is never part of the ordinary event payload.
    """

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def post(self, request, event_uuid):
        ctx = _ctx(request)
        event = access.get_visible_event_or_404(ctx, event_uuid)
        return Response(envelope(True, 'Join authorized.', data=join_payload(request.user, event)))


class CalendarConflictCheckView(APIView):
    """Pre-flight overlap probe, so the form can warn before submitting."""

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def post(self, request):
        ctx = _ctx(request)
        zone = resolve_zone(request.data.get('timezone'))
        start = parse_aware(request.data.get('start'), field='start', zone=zone)
        end = parse_aware(request.data.get('end'), field='end', zone=zone)
        if end <= start:
            raise ValidationError({'end': 'End time must be after start time.'})

        requested = request.data.get('participant_user_ids') or []
        allowed = access.assert_can_invite(ctx, [int(uid) for uid in requested])
        user_ids = sorted({ctx.user.pk, *(u.pk for u in allowed)})

        exclude = None
        if event_uuid := request.data.get('exclude_event_id'):
            existing = access.visible_events(ctx).filter(uuid=event_uuid).first()
            exclude = existing.pk if existing else None

        conflicts = find_conflicts(
            user_ids=user_ids, start_at=start, end_at=end, exclude_event_id=exclude,
        )
        return Response(envelope(True, 'OK', data=summarize(conflicts)))


class CalendarContactsView(APIView):
    """
    Exactly who the caller may invite.

    The Add Event form is populated from this endpoint rather than from a
    generic user directory, which is what keeps the participant picker honest:
    the same rule rejects anything else at write time.
    """

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def get(self, request):
        ctx = _ctx(request)
        qs = access.invitable_users(ctx)
        if term := (request.query_params.get('q') or '').strip():
            from django.db.models import Q

            qs = qs.filter(
                Q(email__icontains=term)
                | Q(profile__first_name__icontains=term)
                | Q(profile__last_name__icontains=term),
            )
        items, meta = paginate_queryset(qs.order_by('email'), request, default_page_size=50)
        return Response(
            envelope(
                True,
                'OK',
                data=paginated_payload(
                    [serialize_user(u, request=request) for u in items], meta,
                ),
            ),
        )


class CalendarMetadataView(APIView):
    """Enumerations the event form needs, so the UI never hardcodes them."""

    permission_classes = [IsAuthenticated, CanUseCalendar]

    def get(self, request):
        ctx = _ctx(request)
        from .serializers import UI_TYPE

        return Response(
            envelope(
                True,
                'OK',
                data={
                    'event_types': [
                        {'value': value, 'ui': UI_TYPE.get(value, 'other'), 'label': label}
                        for value, label in EventType.choices
                    ],
                    'statuses': [
                        {'value': value, 'label': label} for value, label in EventStatus.choices
                    ],
                    'visibilities': [
                        {'value': value, 'label': label} for value, label in EventVisibility.choices
                    ],
                    'reminder_presets': [5, 15, 30, 60, 1440],
                    'role': ctx.role,
                    'default_timezone': (
                        getattr(getattr(request.user, 'profile', None), 'timezone', '')
                        or resolve_zone(None).key
                    ),
                },
            ),
        )
