"""
Event lifecycle: create, update, reschedule, cancel, delete.

Series semantics follow Google Calendar / Outlook:

``scope=series``     edit the master; every generated occurrence follows.
``scope=this``       detach that one occurrence into its own row, recorded as
                     an exception on the master so it stops being generated.
``scope=following``  end the master the moment before the target occurrence and
                     start a fresh series from it, carrying participants and
                     reminders across.

Every mutation runs in one transaction and, on commit, notifies participants,
broadcasts over the realtime layer and records an audit entry.
"""

from __future__ import annotations

from datetime import timedelta

from django.db import transaction
from django.utils import timezone as dj_timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.accounts_et_roles.models import User

from ..constants import SCOPE_FOLLOWING, SCOPE_SERIES, SCOPE_THIS
from ..models import (
    CalendarEvent,
    EventParticipant,
    EventRecurrence,
    EventRecurrenceException,
    EventReminder,
    EventSource,
    EventStatus,
)
from . import access, audit, integrations, notifications, payloads, realtime
from .conflicts import find_conflicts, summarize
from .recurrence import find_occurrence
from .timezones import shift_wall_clock, resolve_zone


class SchedulingConflict(Exception):
    """Raised when a blocking overlap is found and the caller did not opt in."""

    def __init__(self, payload: dict):
        self.payload = payload
        super().__init__('Scheduling conflict detected.')


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

@transaction.atomic
def create_event(ctx: access.ActorContext, data: dict) -> CalendarEvent:
    parsed = payloads.parse_event_payload(ctx, data)
    participants = payloads.parse_participants(ctx, data) or []
    reminders = payloads.parse_reminders(data)
    recurrence = payloads.parse_recurrence(data)

    payloads.infer_business_context(ctx, parsed, participants)

    attendee_ids = [ctx.user.pk] + [u.pk for u in participants]
    _guard_conflicts(
        data,
        user_ids=attendee_ids,
        start_at=parsed['start_at'],
        end_at=parsed['end_at'],
        event_type=parsed.get('event_type'),
    )

    event = CalendarEvent.objects.create(
        organizer=ctx.user,
        created_by=ctx.user,
        **parsed,
    )

    EventParticipant.objects.create(
        event=event,
        user=ctx.user,
        role=EventParticipant.Role.ORGANIZER,
        response=EventParticipant.Response.ACCEPTED,
        responded_at=dj_timezone.now(),
    )
    created_participants = _add_participants(event, participants, invited_by=ctx.user)

    if recurrence not in (False, None):
        _write_recurrence(event, recurrence)

    _write_reminders(event, reminders if reminders is not None else _default_reminders(event))

    if event.is_online:
        integrations.ensure_meeting_for_event(event, actor=ctx.user)
    if payloads._bool(data.get('attach_conversation'), default=False):
        integrations.attach_conversation(event, actor=ctx.user)

    audit.event_created(event, actor=ctx.user)
    notifications.notify_event_created(event, actor=ctx.user)
    notifications.notify_invitations(event, created_participants, actor=ctx.user)
    realtime.broadcast(event, 'created')
    return event


def _default_reminders(event: CalendarEvent) -> list[dict]:
    """Sensible defaults so an event is never silently un-reminded."""
    if event.all_day:
        return [{'minutes_before': 60 * 24, 'channel': EventReminder.Channel.IN_APP}]
    return [{'minutes_before': 15, 'channel': EventReminder.Channel.IN_APP}]


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------

@transaction.atomic
def update_event(
    ctx: access.ActorContext,
    event: CalendarEvent,
    data: dict,
    *,
    scope: str = SCOPE_SERIES,
    occurrence_start=None,
) -> CalendarEvent:
    access.assert_can_manage_event(ctx, event)

    target = _resolve_scope_target(ctx, event, scope=scope, occurrence_start=occurrence_start)

    old_snapshot = payloads.event_field_snapshot(target)
    previous_start, previous_end = target.start_at, target.end_at

    parsed = payloads.parse_event_payload(ctx, data, partial=True, instance=target)
    participants = payloads.parse_participants(ctx, data)
    reminders = payloads.parse_reminders(data)
    recurrence = payloads.parse_recurrence(data)

    if parsed.get('start_at') or parsed.get('end_at'):
        attendee_ids = _attendee_ids(target)
        if participants is not None:
            attendee_ids = sorted({target.organizer_id, *(u.pk for u in participants)})
        _guard_conflicts(
            data,
            user_ids=attendee_ids,
            start_at=parsed.get('start_at', target.start_at),
            end_at=parsed.get('end_at', target.end_at),
            event_type=parsed.get('event_type', target.event_type),
            exclude_event_id=target.pk,
            exclude_series_id=target.recurrence_parent_id or target.pk,
        )

    for field, value in parsed.items():
        setattr(target, field, value)
    target.save()

    if participants is not None:
        added, removed = _sync_participants(target, participants, invited_by=ctx.user)
        notifications.notify_invitations(target, added, actor=ctx.user)
        for user in removed:
            notifications.notify_participant_removed(target, user, actor=ctx.user)
    if reminders is not None:
        _write_reminders(target, reminders)
    if recurrence is not False and scope == SCOPE_SERIES:
        _write_recurrence(target, recurrence)

    if target.is_online and not target.meeting_id:
        integrations.ensure_meeting_for_event(target, actor=ctx.user)
    if target.meeting_id:
        integrations.sync_meeting_from_event(target, actor=ctx.user)

    new_snapshot = payloads.event_field_snapshot(target)
    changed = [key for key, value in new_snapshot.items() if old_snapshot.get(key) != value]

    audit.event_updated(target, actor=ctx.user, old_values=old_snapshot, changed_fields=changed)
    if target.start_at != previous_start or target.end_at != previous_end:
        notifications.notify_event_rescheduled(
            target, actor=ctx.user, previous_start=previous_start, previous_end=previous_end,
        )
    elif changed:
        notifications.notify_event_updated(target, actor=ctx.user, changed_fields=changed)
    realtime.broadcast(target, 'updated', payload={'scope': scope})
    return target


@transaction.atomic
def move_event(
    ctx: access.ActorContext,
    event: CalendarEvent,
    *,
    start,
    end=None,
    scope: str = SCOPE_THIS,
    occurrence_start=None,
    allow_conflicts: bool = False,
) -> CalendarEvent:
    """
    Drag-and-drop / resize entry point.

    Deliberately narrow: only the times move. The full validation chain still
    runs — authorization, datetime sanity, participant conflicts, notification
    and realtime broadcast — so a drag can never bypass a rule that a form
    submission would enforce.
    """
    body: dict = {'start': start, 'allow_conflicts': allow_conflicts}
    if end is not None:
        body['end'] = end
    return update_event(ctx, event, body, scope=scope, occurrence_start=occurrence_start)


@transaction.atomic
def shift_event_days(
    ctx: access.ActorContext,
    event: CalendarEvent,
    *,
    days: int,
    scope: str = SCOPE_THIS,
    occurrence_start=None,
) -> CalendarEvent:
    """Move an event across days keeping its local wall-clock time (DST-safe)."""
    zone = resolve_zone(event.timezone)
    base_start = occurrence_start or event.start_at
    duration = event.end_at - event.start_at
    new_start = shift_wall_clock(base_start, timedelta(days=days), zone)
    return move_event(
        ctx,
        event,
        start=new_start,
        end=new_start + duration,
        scope=scope,
        occurrence_start=occurrence_start,
    )


# ---------------------------------------------------------------------------
# Cancel / delete
# ---------------------------------------------------------------------------

@transaction.atomic
def cancel_event(
    ctx: access.ActorContext,
    event: CalendarEvent,
    *,
    scope: str = SCOPE_SERIES,
    occurrence_start=None,
) -> CalendarEvent:
    """Soft cancellation — the event stays visible, struck through, and notifies."""
    access.assert_can_manage_event(ctx, event)
    target = _resolve_scope_target(ctx, event, scope=scope, occurrence_start=occurrence_start)

    target.status = EventStatus.CANCELLED
    target.cancelled_at = dj_timezone.now()
    target.cancelled_by = ctx.user
    target.save(update_fields=['status', 'cancelled_at', 'cancelled_by', 'updated_at'])

    if target.meeting_id:
        integrations.cancel_linked_meeting(target, actor=ctx.user)

    audit.event_cancelled(target, actor=ctx.user)
    notifications.notify_event_cancelled(target, actor=ctx.user)
    realtime.broadcast(target, 'cancelled', payload={'scope': scope})
    return target


@transaction.atomic
def delete_event(
    ctx: access.ActorContext,
    event: CalendarEvent,
    *,
    scope: str = SCOPE_SERIES,
    occurrence_start=None,
) -> None:
    access.assert_can_manage_event(ctx, event)

    if event.source == EventSource.MEETING:
        raise ValidationError({
            'detail': 'This event mirrors a supervision meeting. Cancel the meeting instead.',
        })

    audience = realtime.audience_ids(event)

    if scope == SCOPE_THIS and event.is_series_master:
        instant = _require_occurrence(event, occurrence_start)
        EventRecurrenceException.objects.get_or_create(series=event, occurrence_start=instant)
        CalendarEvent.objects.filter(
            recurrence_parent=event, recurrence_original_start=instant,
        ).delete()
        audit.event_updated(
            event, actor=ctx.user, changed_fields=['recurrence_exceptions'],
        )
        realtime.broadcast(
            event, 'occurrence_deleted',
            payload={'occurrence_start': instant.isoformat()},
            extra_user_ids=audience,
        )
        return

    if scope == SCOPE_FOLLOWING and event.is_series_master:
        instant = _require_occurrence(event, occurrence_start)
        _truncate_series(event, before=instant)
        CalendarEvent.objects.filter(
            recurrence_parent=event, recurrence_original_start__gte=instant,
        ).delete()
        audit.event_updated(event, actor=ctx.user, changed_fields=['recurrence'])
        realtime.broadcast(
            event, 'series_truncated',
            payload={'from': instant.isoformat()},
            extra_user_ids=audience,
        )
        return

    audit.event_deleted(event, actor=ctx.user)
    notifications.notify_event_cancelled(event, actor=ctx.user)
    realtime.broadcast(event, 'deleted', extra_user_ids=audience)
    event.delete()


# ---------------------------------------------------------------------------
# Participants
# ---------------------------------------------------------------------------

@transaction.atomic
def add_participants(ctx: access.ActorContext, event: CalendarEvent, user_ids: list[int]) -> list[EventParticipant]:
    access.assert_can_manage_event(ctx, event)
    users = access.assert_can_invite(ctx, user_ids)
    created = _add_participants(event, users, invited_by=ctx.user)
    for participant in created:
        audit.participant_added(event, participant.user, actor=ctx.user)
    notifications.notify_invitations(event, created, actor=ctx.user)
    realtime.broadcast(event, 'participants_changed')
    return created


@transaction.atomic
def remove_participant(ctx: access.ActorContext, event: CalendarEvent, user_id: int) -> None:
    access.assert_can_manage_event(ctx, event)
    participant = EventParticipant.objects.filter(event=event, user_id=int(user_id)).first()
    if participant is None:
        from rest_framework.exceptions import NotFound

        raise NotFound('Participant not found on this event.')
    if participant.role == EventParticipant.Role.ORGANIZER:
        raise ValidationError({'detail': 'The organizer cannot be removed from the event.'})

    user = participant.user
    participant.delete()
    audit.participant_removed(event, user, actor=ctx.user)
    notifications.notify_participant_removed(event, user, actor=ctx.user)
    realtime.broadcast(event, 'participants_changed', extra_user_ids=[user.pk])


@transaction.atomic
def respond_to_invitation(
    ctx: access.ActorContext,
    event: CalendarEvent,
    response: str,
    *,
    comment: str = '',
) -> EventParticipant:
    """
    Answer your own invitation.

    Being able to respond is intentionally decoupled from being able to edit:
    an invitee may accept or decline without gaining any right to change the
    event, and may never answer on someone else's behalf.
    """
    value = str(response or '').strip().upper()
    if value not in EventParticipant.Response.values:
        raise ValidationError({
            'response': f'Must be one of {", ".join(EventParticipant.Response.values)}.',
        })

    participant = EventParticipant.objects.filter(event=event, user=ctx.user).first()
    if participant is None:
        raise PermissionDenied('You were not invited to this event.')
    if participant.role == EventParticipant.Role.ORGANIZER:
        raise ValidationError({'detail': 'The organizer does not respond to their own invitation.'})

    participant.response = value
    participant.responded_at = dj_timezone.now()
    participant.comment = str(comment or '')[:255]
    participant.save(update_fields=['response', 'responded_at', 'comment', 'updated_at'])

    audit.invitation_answered(event, participant, actor=ctx.user)
    notifications.notify_invitation_answered(participant, actor=ctx.user)
    realtime.broadcast(event, 'participant_responded', payload={'response': value})
    return participant


# ---------------------------------------------------------------------------
# Internals
# ---------------------------------------------------------------------------

def _add_participants(event: CalendarEvent, users: list[User], *, invited_by) -> list[EventParticipant]:
    """Idempotent: re-inviting an existing participant is a no-op, not an error."""
    existing = set(
        EventParticipant.objects.filter(event=event).values_list('user_id', flat=True),
    )
    created: list[EventParticipant] = []
    for user in users:
        if user.pk in existing:
            continue
        created.append(
            EventParticipant.objects.create(
                event=event,
                user=user,
                role=EventParticipant.Role.REQUIRED,
                response=EventParticipant.Response.PENDING,
                invited_by=invited_by,
            ),
        )
        existing.add(user.pk)
    return created


def _sync_participants(event: CalendarEvent, users: list[User], *, invited_by):
    """Reconcile the attendee list to exactly ``users`` plus the organizer."""
    wanted = {u.pk for u in users}
    wanted.add(event.organizer_id)

    stale = EventParticipant.objects.filter(event=event).exclude(user_id__in=wanted)
    removed = [p.user for p in stale.select_related('user')]
    stale.delete()

    added = _add_participants(event, users, invited_by=invited_by)
    return added, removed


def _attendee_ids(event: CalendarEvent) -> list[int]:
    ids = set(EventParticipant.objects.filter(event=event).values_list('user_id', flat=True))
    ids.add(event.organizer_id)
    return sorted(ids)


def _write_reminders(event: CalendarEvent, reminders: list[dict] | None) -> None:
    if reminders is None:
        return
    EventReminder.objects.filter(event=event).delete()
    EventReminder.objects.bulk_create([
        EventReminder(
            event=event,
            minutes_before=item['minutes_before'],
            channel=item['channel'],
        )
        for item in reminders
    ])


def _write_recurrence(event: CalendarEvent, rule: dict | None) -> None:
    if rule is None:
        EventRecurrence.objects.filter(event=event).delete()
        return
    EventRecurrence.objects.update_or_create(
        event=event,
        defaults={
            'frequency': rule['frequency'],
            'interval': rule['interval'],
            'by_weekdays': rule['by_weekdays'],
            'by_month_day': rule['by_month_day'],
            'until_at': rule['until_at'],
            'count': rule['count'],
        },
    )


def _require_occurrence(event: CalendarEvent, occurrence_start):
    if occurrence_start is None:
        raise ValidationError({
            'occurrence_start': 'Required when acting on a single occurrence of a series.',
        })
    instant = find_occurrence(event, event.recurrence, occurrence_start)
    if instant is None:
        raise ValidationError({
            'occurrence_start': 'No occurrence of this series starts at that instant.',
        })
    return instant


def _truncate_series(master: CalendarEvent, *, before) -> None:
    """End a series just before ``before`` so earlier occurrences survive."""
    recurrence = master.recurrence
    recurrence.until_at = before - timedelta(seconds=1)
    recurrence.count = None
    recurrence.save(update_fields=['until_at', 'count', 'updated_at'])


def _resolve_scope_target(
    ctx: access.ActorContext,
    event: CalendarEvent,
    *,
    scope: str,
    occurrence_start,
) -> CalendarEvent:
    """
    Return the row an edit should actually be written to.

    For ``series`` that is the master. For ``this`` and ``following`` it is a
    newly split row, so the rest of the series is left intact.
    """
    if not event.is_series_master or scope == SCOPE_SERIES:
        return event
    if scope == SCOPE_THIS:
        return _detach_occurrence(ctx, event, occurrence_start)
    if scope == SCOPE_FOLLOWING:
        return _split_series(ctx, event, occurrence_start)
    return event


def _detach_occurrence(ctx: access.ActorContext, master: CalendarEvent, occurrence_start) -> CalendarEvent:
    """Turn one generated occurrence into an independently editable row."""
    instant = _require_occurrence(master, occurrence_start)

    existing = CalendarEvent.objects.filter(
        recurrence_parent=master, recurrence_original_start=instant,
    ).first()
    if existing:
        return existing

    duration = master.end_at - master.start_at
    detached = _clone_event(
        master,
        overrides={
            'start_at': instant,
            'end_at': instant + duration,
            'recurrence_parent': master,
            'recurrence_original_start': instant,
        },
    )
    EventRecurrenceException.objects.get_or_create(series=master, occurrence_start=instant)
    _copy_children(master, detached)
    return detached


def _split_series(ctx: access.ActorContext, master: CalendarEvent, occurrence_start) -> CalendarEvent:
    """End the master before the target occurrence and open a new series at it."""
    instant = _require_occurrence(master, occurrence_start)
    recurrence = master.recurrence

    duration = master.end_at - master.start_at
    new_master = _clone_event(
        master,
        overrides={'start_at': instant, 'end_at': instant + duration},
    )
    EventRecurrence.objects.create(
        event=new_master,
        frequency=recurrence.frequency,
        interval=recurrence.interval,
        by_weekdays=recurrence.by_weekdays,
        by_month_day=recurrence.by_month_day,
        until_at=recurrence.until_at,
        count=_remaining_count(master, recurrence, from_instant=instant),
    )
    _copy_children(master, new_master)

    _truncate_series(master, before=instant)
    CalendarEvent.objects.filter(
        recurrence_parent=master, recurrence_original_start__gte=instant,
    ).delete()
    return new_master


def _remaining_count(master: CalendarEvent, recurrence: EventRecurrence, *, from_instant) -> int | None:
    """
    How many occurrences a split-off series still owes.

    "Every Monday, 4 times" split at the second occurrence leaves three, not an
    open-ended series. Rules bounded by an end date carry that date instead and
    need no count.
    """
    if not recurrence.count:
        return None
    from .recurrence import series_occurrence_starts

    consumed = sum(
        1 for start in series_occurrence_starts(master, recurrence) if start < from_instant
    )
    return max(1, int(recurrence.count) - consumed)


def _clone_event(source: CalendarEvent, *, overrides: dict) -> CalendarEvent:
    clone = CalendarEvent(
        title=source.title,
        description=source.description,
        event_type=source.event_type,
        status=source.status,
        priority=source.priority,
        visibility=source.visibility,
        source=source.source,
        start_at=source.start_at,
        end_at=source.end_at,
        timezone=source.timezone,
        all_day=source.all_day,
        location=source.location,
        is_online=source.is_online,
        external_meeting_url=source.external_meeting_url,
        organizer=source.organizer,
        created_by=source.created_by,
        related_student=source.related_student,
        related_encadrant=source.related_encadrant,
        related_assignment=source.related_assignment,
        related_application=source.related_application,
        related_offer=source.related_offer,
        related_report=source.related_report,
        related_task=source.related_task,
        related_document_request=source.related_document_request,
        conversation=source.conversation,
        metadata_json=dict(source.metadata_json or {}),
    )
    for field, value in overrides.items():
        setattr(clone, field, value)
    clone.save()
    return clone


def _copy_children(source: CalendarEvent, target: CalendarEvent) -> None:
    """Carry participants and reminders onto a split-off event."""
    EventParticipant.objects.bulk_create([
        EventParticipant(
            event=target,
            user_id=p.user_id,
            role=p.role,
            response=p.response,
            responded_at=p.responded_at,
            invited_by_id=p.invited_by_id,
        )
        for p in EventParticipant.objects.filter(event=source)
    ])
    EventReminder.objects.bulk_create([
        EventReminder(
            event=target,
            user_id=r.user_id,
            minutes_before=r.minutes_before,
            channel=r.channel,
            is_active=r.is_active,
        )
        for r in EventReminder.objects.filter(event=source)
    ])


def _guard_conflicts(
    data: dict,
    *,
    user_ids: list[int],
    start_at,
    end_at,
    event_type,
    exclude_event_id: int | None = None,
    exclude_series_id: int | None = None,
) -> None:
    """
    Refuse a blocking overlap unless the caller explicitly opted in.

    Non-blocking types (deadlines, milestones, reminders) are reported but
    never refused — several of them landing on the same afternoon is normal.
    """
    from .conflicts import is_blocking

    if not is_blocking(event_type):
        return
    if payloads._bool(data.get('allow_conflicts'), default=False):
        return

    conflicts = find_conflicts(
        user_ids=user_ids,
        start_at=start_at,
        end_at=end_at,
        exclude_event_id=exclude_event_id,
        exclude_series_id=exclude_series_id,
    )
    blocking = [c for c in conflicts if c.blocking]
    if blocking:
        raise SchedulingConflict(summarize(blocking))
