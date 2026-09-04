"""
Request payload parsing and validation.

Datetimes are parsed here rather than by a DRF ``DateTimeField`` on purpose: a
naive input must be read in the *event's* zone, whereas DRF would silently
apply ``settings.TIME_ZONE``. Getting that wrong is how calendars end up an
hour out twice a year.

Every relational id is resolved through ``services.access``, so a payload can
never reference a student, encadrant, assignment or user the caller is not
entitled to.
"""

from __future__ import annotations

from datetime import timedelta

from rest_framework.exceptions import NotFound, ValidationError

from apps.accounts_et_roles.models import User

from ..models import (
    CalendarEvent,
    EventPriority,
    EventReminder,
    EventStatus,
    EventType,
    EventVisibility,
)
from . import access
from .recurrence import validate_recurrence_payload
from .timezones import all_day_bounds, is_valid_zone, parse_aware, parse_aware_optional, resolve_zone

MAX_PARTICIPANTS = 50
MAX_REMINDERS = 5

# Which related entity each id field resolves to, and the app that owns it.
_SIMPLE_RELATIONS = {
    'related_offer_id': ('stage', 'InternshipOffer', 'related_offer'),
    'related_application_id': ('stage', 'OfferApplication', 'related_application'),
    'related_report_id': ('encadrant', 'Report', 'related_report'),
    'related_task_id': ('encadrant', 'Task', 'related_task'),
    'related_document_request_id': ('documents', 'DocumentRequest', 'related_document_request'),
}


def parse_event_payload(ctx: access.ActorContext, data: dict, *, partial: bool = False, instance=None) -> dict:
    """
    Validate an incoming create/update body into model-ready values.

    ``partial=True`` only validates keys that are actually present, which is
    what makes drag-and-drop and inline edits safe partial updates.
    """
    parsed: dict = {}
    present = data.keys()

    zone_name = data.get('timezone') or (instance.timezone if instance else None)
    if 'timezone' in present:
        if not is_valid_zone(zone_name):
            raise ValidationError({'timezone': f'Unknown timezone "{data.get("timezone")}".'})
        parsed['timezone'] = zone_name
    zone = resolve_zone(zone_name)

    if 'title' in present or not partial:
        title = str(data.get('title') or '').strip()
        if not title:
            raise ValidationError({'title': 'Title is required.'})
        if len(title) > 255:
            raise ValidationError({'title': 'Title cannot exceed 255 characters.'})
        parsed['title'] = title

    if 'description' in present:
        parsed['description'] = str(data.get('description') or '').strip()

    if 'location' in present:
        parsed['location'] = str(data.get('location') or '').strip()[:255]

    if 'event_type' in present or not partial:
        parsed['event_type'] = _choice(
            data.get('event_type', EventType.MEETING), EventType, 'event_type',
        )

    if 'status' in present:
        parsed['status'] = _choice(data.get('status'), EventStatus, 'status')

    if 'priority' in present:
        parsed['priority'] = _choice(data.get('priority'), EventPriority, 'priority')

    if 'visibility' in present:
        parsed['visibility'] = _choice(data.get('visibility'), EventVisibility, 'visibility')

    all_day = _bool(data.get('all_day'), default=instance.all_day if instance else False)
    if 'all_day' in present:
        parsed['all_day'] = all_day

    if 'is_online' in present:
        parsed['is_online'] = _bool(data.get('is_online'), default=False)

    if 'external_meeting_url' in present:
        parsed['external_meeting_url'] = str(data.get('external_meeting_url') or '').strip()[:512]

    _parse_schedule(parsed, data, zone=zone, partial=partial, instance=instance, all_day=all_day)
    _parse_relations(ctx, parsed, data, partial=partial)

    return parsed


def _parse_schedule(parsed, data, *, zone, partial, instance, all_day) -> None:
    """Resolve start/end, accepting either an explicit end or a duration."""
    has_start = 'start' in data or 'start_at' in data
    has_end = 'end' in data or 'end_at' in data
    has_duration = 'duration_minutes' in data

    if not has_start and not has_end and not has_duration:
        if partial:
            return
        raise ValidationError({'start': 'This field is required.'})

    start = (
        parse_aware(data.get('start') or data.get('start_at'), field='start', zone=zone)
        if has_start
        else (instance.start_at if instance else None)
    )
    if start is None:
        raise ValidationError({'start': 'This field is required.'})

    if has_end:
        end = parse_aware(data.get('end') or data.get('end_at'), field='end', zone=zone)
    elif has_duration:
        end = start + timedelta(minutes=_positive_int(data.get('duration_minutes'), 'duration_minutes'))
    elif instance:
        # Preserve the original length when only the start moved.
        end = start + (instance.end_at - instance.start_at)
    else:
        end = start + timedelta(minutes=60)

    if all_day:
        start, end = all_day_bounds(start, end, zone)
    elif end <= start:
        raise ValidationError({'end': 'End time must be after start time.'})

    parsed['start_at'] = start
    parsed['end_at'] = end


def _parse_relations(ctx, parsed, data, *, partial) -> None:
    """Resolve every business-context id through the authorization layer."""
    if 'related_student_id' in data:
        raw = data.get('related_student_id')
        parsed['related_student'] = (
            access.resolve_student_profile(ctx, raw) if raw not in (None, '') else None
        )

    if 'related_encadrant_id' in data:
        raw = data.get('related_encadrant_id')
        parsed['related_encadrant'] = (
            access.resolve_encadrant_profile(ctx, raw) if raw not in (None, '') else None
        )

    if 'related_assignment_id' in data:
        raw = data.get('related_assignment_id')
        parsed['related_assignment'] = (
            access.resolve_assignment(ctx, raw) if raw not in (None, '') else None
        )

    for key, (app_label, model_name, field) in _SIMPLE_RELATIONS.items():
        if key not in data:
            continue
        raw = data.get(key)
        parsed[field] = _resolve_simple(app_label, model_name, raw, key) if raw not in (None, '') else None


def _resolve_simple(app_label: str, model_name: str, raw, field: str):
    """
    Look up a secondary business entity.

    These are annotations on an event the caller already controls, and the
    event's own visibility governs who can read them back, so existence is the
    only check needed here.
    """
    from django.apps import apps as django_apps

    model = django_apps.get_model(app_label, model_name)
    try:
        pk = int(raw)
    except (TypeError, ValueError):
        raise ValidationError({field: 'Must be an integer id.'})
    instance = model.objects.filter(pk=pk).first()
    if instance is None:
        raise NotFound(f'{model_name} not found.')
    return instance


def parse_participants(ctx: access.ActorContext, data: dict) -> list[User] | None:
    """Validate the requested attendee list against the caller's invite rights."""
    if 'participant_user_ids' not in data:
        return None
    raw = data.get('participant_user_ids') or []
    if not isinstance(raw, (list, tuple)):
        raise ValidationError({'participant_user_ids': 'Must be a list of user ids.'})
    if len(raw) > MAX_PARTICIPANTS:
        raise ValidationError({
            'participant_user_ids': f'Cannot invite more than {MAX_PARTICIPANTS} participants.',
        })
    ids: list[int] = []
    for item in raw:
        try:
            ids.append(int(item))
        except (TypeError, ValueError):
            raise ValidationError({'participant_user_ids': 'Must be a list of integer user ids.'})
    return access.assert_can_invite(ctx, ids)


def parse_reminders(data: dict) -> list[dict] | None:
    if 'reminders' not in data:
        return None
    raw = data.get('reminders') or []
    if not isinstance(raw, (list, tuple)):
        raise ValidationError({'reminders': 'Must be a list.'})
    if len(raw) > MAX_REMINDERS:
        raise ValidationError({'reminders': f'Cannot set more than {MAX_REMINDERS} reminders.'})

    parsed: list[dict] = []
    seen: set[tuple[int, str]] = set()
    for index, item in enumerate(raw):
        if isinstance(item, (int, str)) and str(item).lstrip('-').isdigit():
            item = {'minutes_before': int(item)}
        if not isinstance(item, dict):
            raise ValidationError({f'reminders[{index}]': 'Must be an object or a number of minutes.'})

        minutes = _positive_int(
            item.get('minutes_before'), f'reminders[{index}].minutes_before', allow_zero=True,
        )
        if minutes > 60 * 24 * 30:
            raise ValidationError({
                f'reminders[{index}].minutes_before': 'Cannot exceed 30 days.',
            })
        channel = str(item.get('channel') or EventReminder.Channel.IN_APP).upper()
        if channel not in EventReminder.Channel.values:
            raise ValidationError({
                f'reminders[{index}].channel': f'Must be one of {", ".join(EventReminder.Channel.values)}.',
            })
        key = (minutes, channel)
        if key in seen:
            continue
        seen.add(key)
        parsed.append({'minutes_before': minutes, 'channel': channel})
    return parsed


def parse_recurrence(data: dict) -> dict | None | bool:
    """
    Returns the validated rule, ``None`` to clear it, or ``False`` when absent.

    The three-way result lets an update distinguish "remove the recurrence"
    from "do not touch the recurrence".
    """
    if 'recurrence' not in data:
        return False
    raw = data.get('recurrence')
    if raw in (None, '', {}):
        return None
    if not isinstance(raw, dict):
        raise ValidationError({'recurrence': 'Must be an object.'})

    rule = validate_recurrence_payload(raw)
    rule['until_at'] = parse_aware_optional(
        raw.get('until') or raw.get('until_at'),
        field='recurrence.until',
    )
    if rule['until_at'] and rule['count']:
        raise ValidationError({
            'recurrence': 'Provide either "until" or "count", not both.',
        })
    return rule


def infer_business_context(ctx: access.ActorContext, parsed: dict, participants: list[User]) -> None:
    """
    Fill in the supervision context the caller did not spell out.

    A student booking a slot with their encadrant should not have to know
    profile ids; the pairing is derived from the relationship that already
    exists in the database and then re-validated.
    """
    if ctx.is_student and ctx.student_profile and 'related_student' not in parsed:
        parsed['related_student'] = ctx.student_profile
    if ctx.is_encadrant and ctx.encadrant_profile and 'related_encadrant' not in parsed:
        parsed['related_encadrant'] = ctx.encadrant_profile

    for user in participants:
        if parsed.get('related_encadrant') is None:
            supervisor = getattr(user, 'supervisor_profile', None)
            encadrant = getattr(supervisor, 'encadrant_profile', None)
            if encadrant:
                parsed['related_encadrant'] = encadrant
        if parsed.get('related_student') is None:
            student = getattr(user, 'student_profile', None)
            if student:
                parsed['related_student'] = student

    student = parsed.get('related_student')
    encadrant = parsed.get('related_encadrant')
    if student and encadrant:
        access.assert_pair_allowed(student.pk, encadrant.pk)
        if parsed.get('related_assignment') is None:
            parsed['related_assignment'] = _active_assignment(student.pk, encadrant.pk)


def _active_assignment(student_profile_id: int, encadrant_profile_id: int):
    from apps.admin_management.models import Assignment

    return (
        Assignment.objects
        .filter(
            student_profile_id=student_profile_id,
            encadrant_profile_id=encadrant_profile_id,
            is_active=True,
        )
        .order_by('-updated_at')
        .first()
    )


def parse_scope(data, *, default: str) -> str:
    from ..constants import EDIT_SCOPES

    scope = str(data.get('scope') or default).strip().lower()
    if scope not in EDIT_SCOPES:
        raise ValidationError({'scope': f'Must be one of {", ".join(EDIT_SCOPES)}.'})
    return scope


def _choice(raw, choices_cls, field: str) -> str:
    value = str(raw or '').strip().upper()
    if value not in choices_cls.values:
        raise ValidationError({
            field: f'Must be one of {", ".join(choices_cls.values)}.',
        })
    return value


def _bool(raw, *, default: bool = False) -> bool:
    if raw is None:
        return default
    if isinstance(raw, bool):
        return raw
    return str(raw).strip().lower() in {'1', 'true', 'yes', 'on'}


def _positive_int(raw, field: str, *, allow_zero: bool = False) -> int:
    try:
        value = int(raw)
    except (TypeError, ValueError):
        raise ValidationError({field: 'Must be an integer.'})
    if value < 0 or (value == 0 and not allow_zero):
        raise ValidationError({field: 'Must be a positive integer.'})
    return value


def event_field_snapshot(event: CalendarEvent) -> dict:
    """Comparable snapshot used to compute changed fields on update."""
    return {
        'title': event.title,
        'description': event.description,
        'event_type': event.event_type,
        'status': event.status,
        'priority': event.priority,
        'visibility': event.visibility,
        'start_at': event.start_at.isoformat(),
        'end_at': event.end_at.isoformat(),
        'timezone': event.timezone,
        'all_day': event.all_day,
        'location': event.location,
        'is_online': event.is_online,
    }
