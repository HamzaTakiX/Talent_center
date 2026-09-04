"""Student ↔ Encadrant supervision DM chat."""

from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.models import EncadrantProfile
from apps.chat.models import Channel, Conversation, ConversationContext
from apps.chat.services.conversation_service import get_or_create_contextual_conversation
from apps.chat.services.platform_chat_service import (
    _admin_avatar_url,
    _encadrant_profile_snapshot,
    _user_display_name,
)
from apps.chat.services.seed import seed_chat_infrastructure
from apps.stage.services.chat_service import ensure_conversation_participants

User = get_user_model()

MODULE = ConversationContext.Module.ENCADRANT
CHANNEL_CODE = 'encadrants'
ENTITY_TYPE = 'supervision_dm'


def _ensure_chat_infrastructure() -> None:
    if Channel.objects.filter(code=CHANNEL_CODE, is_archived=False).exists():
        return
    seed_chat_infrastructure()


def supervision_dm_entity_id(student: StudentProfile, encadrant: EncadrantProfile) -> str:
    return f'{student.pk}:{encadrant.pk}'


def _avatar_url(user: User | None, request=None) -> str | None:
    if not user:
        return None
    profile = getattr(user, 'profile', None)
    if not profile or not getattr(profile, 'avatar', None):
        return None
    try:
        url = profile.avatar.url
    except Exception:
        return None
    if request is not None and url and not str(url).startswith('http'):
        return request.build_absolute_uri(url)
    return url


def _encadrant_user(encadrant: EncadrantProfile) -> User | None:
    supervisor = getattr(encadrant, 'supervisor_profile', None)
    return getattr(supervisor, 'user', None) if supervisor else None


def build_supervision_dm_snapshot(
    *,
    student: StudentProfile,
    encadrant: EncadrantProfile,
    request=None,
) -> dict[str, Any]:
    student_user = student.user
    encadrant_user = _encadrant_user(encadrant)
    profile_snapshot = (
        _encadrant_profile_snapshot(encadrant_user) if encadrant_user else {}
    )
    avatar_url = profile_snapshot.pop('encadrant_avatar_url', None)
    return {
        **profile_snapshot,
        'student_profile_id': student.pk,
        'student_user_id': student_user.pk if student_user else None,
        'student_name': _user_display_name(student_user),
        'student_email': student_user.email if student_user else '',
        'student_avatar_url': _avatar_url(student_user, request),
        'encadrant_profile_id': encadrant.pk,
        'encadrant_user_id': encadrant_user.pk if encadrant_user else None,
        'encadrant_name': _user_display_name(encadrant_user),
        'encadrant_email': encadrant_user.email if encadrant_user else '',
        'encadrant_avatar_url': avatar_url
        or _avatar_url(encadrant_user, request)
        or (_admin_avatar_url(encadrant_user) if encadrant_user else None),
        'encadrant_role_label': 'Encadrant',
    }


def get_or_create_supervision_dm(
    *,
    student: StudentProfile,
    encadrant: EncadrantProfile,
    created_by: User | None = None,
    request=None,
) -> Conversation:
    _ensure_chat_infrastructure()

    student = (
        StudentProfile.objects.select_related('user', 'user__profile')
        .filter(pk=student.pk)
        .first()
        or student
    )
    encadrant = (
        EncadrantProfile.objects.select_related(
            'supervisor_profile__user',
            'supervisor_profile__user__profile',
            'supervisor_profile__encadrant_profile',
        )
        .filter(pk=encadrant.pk)
        .first()
        or encadrant
    )

    encadrant_user = _encadrant_user(encadrant)
    student_user = student.user
    if not student_user or not encadrant_user:
        raise ValueError('Student and encadrant users are required for supervision chat.')

    entity_id = supervision_dm_entity_id(student, encadrant)
    existing = (
        Conversation.objects.filter(
            context__module=MODULE,
            context__entity_type=ENTITY_TYPE,
            context__entity_id=entity_id,
        )
        .select_related('context')
        .order_by('-last_message_at', '-updated_at', '-id')
        .first()
    )
    if existing:
        ensure_conversation_participants(existing, [student_user, encadrant_user])
        _sync_supervision_context(
            existing,
            student=student,
            encadrant=encadrant,
            request=request,
        )
        return existing

    snap = build_supervision_dm_snapshot(
        student=student,
        encadrant=encadrant,
        request=request,
    )
    encadrant_name = snap.get('encadrant_name') or encadrant_user.email
    student_name = snap.get('student_name') or student_user.email

    conv = get_or_create_contextual_conversation(
        module=MODULE,
        entity_type=ENTITY_TYPE,
        entity_id=entity_id,
        title=f'{student_name} ↔ {encadrant_name}',
        entity_label=encadrant_name,
        workflow_status='OPEN',
        student_user=student_user,
        is_internal_only=False,
        context_snapshot=snap,
        participant_users=[student_user, encadrant_user],
        created_by=created_by,
        channel_code=CHANNEL_CODE,
        context_kind=ConversationContext.ContextKind.DIRECT,
    )
    ensure_conversation_participants(conv, [student_user, encadrant_user])
    return conv


def sync_supervision_dms_for_encadrant(user: User, request=None) -> int:
    """Ensure one supervision DM exists for each student assigned to this encadrant."""
    supervisor = getattr(user, 'supervisor_profile', None)
    encadrant = getattr(supervisor, 'encadrant_profile', None) if supervisor else None
    if not encadrant:
        return 0

    from apps.encadrant.services.meeting_authorization import supervised_student_ids

    student_ids = supervised_student_ids(encadrant)
    if not student_ids:
        return 0

    students = StudentProfile.objects.filter(pk__in=student_ids).select_related(
        'user',
        'user__profile',
    )
    opened = 0
    for student in students:
        try:
            get_or_create_supervision_dm(
                student=student,
                encadrant=encadrant,
                created_by=user,
                request=request,
            )
            opened += 1
        except ValueError:
            continue
    return opened


def _sync_supervision_context(
    conversation: Conversation,
    *,
    student: StudentProfile,
    encadrant: EncadrantProfile,
    request=None,
) -> None:
    ctx = getattr(conversation, 'context', None)
    if not ctx:
        return
    snap = build_supervision_dm_snapshot(
        student=student,
        encadrant=encadrant,
        request=request,
    )
    ctx.context_snapshot_json = snap
    ctx.entity_label = snap.get('encadrant_name') or ctx.entity_label
    ctx.save(update_fields=['context_snapshot_json', 'entity_label', 'updated_at'])
