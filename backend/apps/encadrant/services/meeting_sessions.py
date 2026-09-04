"""Meeting session lifecycle for embedded Jitsi collaboration.

Lifecycle side-effects (timeline + history audit for future notification hooks)
are emitted through ``transition_meeting_status`` →
``apps.history.integrations.meetings.meeting_status_changed``.
"""

from __future__ import annotations

import secrets
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.accounts_et_roles.models import User
from apps.admin_management.models import Assignment
from apps.encadrant.models import Meeting
from apps.encadrant.services.meeting_authorization import (
    assert_user_can_access_meeting,
    get_encadrant_profile,
    get_student_profile,
    resolve_student_encadrant_for_user,
)
from apps.encadrant.services.meeting_workflow import transition_meeting_status


def jitsi_domain() -> str:
    return getattr(settings, 'JITSI_DOMAIN', 'meet.jit.si')


def generate_jitsi_room_name() -> str:
    token = secrets.token_urlsafe(24)
    return f'tc_meeting_{token}'


def ensure_jitsi_room_name(meeting: Meeting) -> str:
    if meeting.jitsi_room_name:
        return meeting.jitsi_room_name
    room_name = generate_jitsi_room_name()
    meeting.jitsi_room_name = room_name
    meeting.save(update_fields=['jitsi_room_name', 'updated_at'])
    return room_name


def _active_assignment(student_profile_id: int, encadrant_profile_id: int):
    return Assignment.objects.filter(
        student_profile_id=student_profile_id,
        encadrant_profile_id=encadrant_profile_id,
        is_active=True,
    ).order_by('-updated_at').first()


@transaction.atomic
def create_or_get_meeting_session(
    user: User,
    *,
    mode: str = 'video',
    meeting_id: int | None = None,
    student_profile_id: int | None = None,
    encadrant_profile_id: int | None = None,
    title: str | None = None,
) -> Meeting:
    media_mode = 'voice' if mode == 'voice' else 'video'

    if meeting_id:
        meeting = get_object_or_404(Meeting.objects.select_for_update(), pk=int(meeting_id))
        assert_user_can_access_meeting(user, meeting)
        metadata = dict(meeting.metadata_json or {})
        metadata['preferred_media_mode'] = media_mode
        meeting.metadata_json = metadata
        update_fields = ['metadata_json', 'updated_at']
        if meeting.status in {Meeting.Status.SCHEDULED, Meeting.Status.CONFIRMED}:
            transition_meeting_status(meeting, Meeting.Status.IN_PROGRESS, actor=user, note='Session started')
        if not meeting.actual_start:
            meeting.actual_start = timezone.now()
            update_fields.append('actual_start')
        if meeting.meeting_mode != Meeting.MeetingMode.ONLINE:
            meeting.meeting_mode = Meeting.MeetingMode.ONLINE
            update_fields.append('meeting_mode')
        meeting.save(update_fields=update_fields)
        ensure_jitsi_room_name(meeting)
        return meeting

    student, encadrant = resolve_student_encadrant_for_user(
        user,
        student_profile_id=student_profile_id,
        encadrant_profile_id=encadrant_profile_id,
    )
    assignment = _active_assignment(student.pk, encadrant.pk)
    now = timezone.now()
    meeting = Meeting.objects.create(
        encadrant_profile=encadrant,
        student_profile=student,
        assignment=assignment,
        title=title or 'Supervision meeting',
        meeting_type=Meeting.MeetingType.FOLLOW_UP,
        status=Meeting.Status.IN_PROGRESS,
        meeting_mode=Meeting.MeetingMode.ONLINE,
        planned_start=now,
        planned_end=now + timedelta(minutes=30),
        scheduled_at=now,
        duration_minutes=30,
        actual_start=now,
        created_by=user,
        metadata_json={'preferred_media_mode': media_mode, 'ad_hoc': True},
        jitsi_room_name=generate_jitsi_room_name(),
    )
    return meeting


def _display_name(user_obj) -> str:
    if not user_obj:
        return ''
    if user_obj.full_name:
        return user_obj.full_name
    profile = getattr(user_obj, 'profile', None)
    if profile and (profile.first_name or profile.last_name):
        return f'{profile.first_name} {profile.last_name}'.strip()
    return user_obj.email


def _avatar_url(user_obj, request=None) -> str | None:
    if not user_obj:
        return None
    profile = getattr(user_obj, 'profile', None)
    if not profile or not getattr(profile, 'avatar', None):
        return None
    try:
        url = profile.avatar.url
    except Exception:
        return None
    if request is not None and url and not str(url).startswith('http'):
        return request.build_absolute_uri(url)
    return url


def list_scheduled_meetings_for_user(user: User):
    """Scheduled online meetings the user may join (excludes ad-hoc sessions)."""
    qs = (
        Meeting.objects.filter(
            status__in=[
                Meeting.Status.SCHEDULED,
                Meeting.Status.CONFIRMED,
                Meeting.Status.IN_PROGRESS,
            ],
            meeting_mode__in=[Meeting.MeetingMode.ONLINE, Meeting.MeetingMode.HYBRID],
        )
        .exclude(metadata_json__ad_hoc=True)
        .select_related(
            'student_profile__user__profile',
            'encadrant_profile__supervisor_profile__user__profile',
        )
        .order_by('planned_start', 'scheduled_at', 'pk')
    )

    if user.role == User.RoleChoices.STUDENT:
        student = get_student_profile(user)
        return qs.filter(student_profile_id=student.pk)
    if user.role == User.RoleChoices.SUPERVISOR:
        encadrant = get_encadrant_profile(user)
        return qs.filter(encadrant_profile_id=encadrant.pk)
    return Meeting.objects.none()


def serialize_scheduled_meeting_item(meeting: Meeting) -> dict:
    student_user = getattr(meeting.student_profile, 'user', None) if meeting.student_profile else None
    planned = meeting.planned_start or meeting.scheduled_at
    return {
        'meeting_id': meeting.pk,
        'session_id': str(meeting.session_uuid),
        'title': meeting.title,
        'planned_start': planned.isoformat() if planned else None,
        'student': {
            'profile_id': meeting.student_profile_id,
            'display_name': _display_name(student_user),
        },
    }


def serialize_meeting_session(meeting: Meeting, *, mode: str | None = None) -> dict:
    metadata = meeting.metadata_json or {}
    preferred_mode = mode or metadata.get('preferred_media_mode') or 'video'
    student_user = getattr(meeting.student_profile, 'user', None) if meeting.student_profile else None
    encadrant_user = None
    if meeting.encadrant_profile and meeting.encadrant_profile.supervisor_profile:
        encadrant_user = meeting.encadrant_profile.supervisor_profile.user

    return {
        'session_id': str(meeting.session_uuid),
        'meeting_id': meeting.pk,
        'title': meeting.title,
        'status': meeting.status,
        'mode': preferred_mode,
        'jitsi_domain': jitsi_domain(),
        'jitsi_room_name': ensure_jitsi_room_name(meeting),
        'planned_start': meeting.planned_start.isoformat() if meeting.planned_start else None,
        'student': {
            'profile_id': meeting.student_profile_id,
            'display_name': _display_name(student_user),
            'avatar_url': _avatar_url(student_user),
        },
        'encadrant': {
            'profile_id': meeting.encadrant_profile_id,
            'display_name': _display_name(encadrant_user),
            'avatar_url': _avatar_url(encadrant_user),
        },
    }


def end_meeting_session(user: User, meeting: Meeting) -> Meeting:
    assert_user_can_access_meeting(user, meeting)
    if meeting.status not in {Meeting.Status.COMPLETED, Meeting.Status.CANCELLED}:
        transition_meeting_status(meeting, Meeting.Status.COMPLETED, actor=user, note='Session ended')
    if not meeting.actual_end:
        meeting.actual_end = timezone.now()
        meeting.save(update_fields=['actual_end', 'updated_at'])
    return meeting
