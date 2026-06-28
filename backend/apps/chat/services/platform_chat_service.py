"""Platform desk chat — student ↔ admin direct messaging."""

from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.chat.models import Conversation, ConversationContext, ConversationParticipant
from apps.chat.services.conversation_service import get_or_create_contextual_conversation
from apps.chat.services.seed import seed_chat_infrastructure

User = get_user_model()

MODULE = ConversationContext.Module.PLATFORM
STUDENT_ADMIN_DM = 'student_admin_dm'
ADMIN_DESK_ENTITY = 'admin_desk'
STUDENT_CHANNEL_CODE = 'support-stage'
ADMIN_CHANNEL_CODE = 'administration'

# Legacy alias kept for backwards compatibility with existing rows.
STUDENT_DESK_ENTITY = STUDENT_ADMIN_DM


def _ensure_chat_infrastructure() -> None:
    seed_chat_infrastructure()


def _platform_admin_users() -> list[User]:
    return list(
        User.objects.filter(
            role=User.RoleChoices.ADMIN,
            is_active=True,
            platform_access_granted=True,
        ).order_by('id')
    )


def user_can_manage_platform_desk(user: User) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return user.role == User.RoleChoices.ADMIN and user.platform_access_granted


def _user_display_name(user: User | None) -> str:
    if not user:
        return ''
    profile = getattr(user, 'profile', None)
    if profile:
        from_profile = f'{profile.first_name} {profile.last_name}'.strip()
        if from_profile:
            return from_profile
    full = f'{user.first_name} {user.last_name}'.strip()
    return full or user.email


def _student_display_name(student: StudentProfile) -> str:
    return _user_display_name(student.user)


def _student_avatar_url(student: StudentProfile, request=None) -> str | None:
    from core.media_urls import resolve_student_profile_avatar_url

    return resolve_student_profile_avatar_url(student, request)


def _admin_avatar_url(admin: User | None) -> str | None:
    if not admin:
        return None
    profile = getattr(admin, 'profile', None)
    if not profile or not profile.avatar:
        return None
    return profile.avatar.url


def _dm_entity_id(left_id: int, right_id: int) -> str:
    a, b = sorted((int(left_id), int(right_id)))
    return f'{a}:{b}'


def _student_admin_dm_entity_id(student_user_id: int, admin_user_id: int) -> str:
    return _dm_entity_id(student_user_id, admin_user_id)


def build_student_admin_dm_snapshot(
    student: StudentProfile,
    admin: User,
    request=None,
) -> dict[str, Any]:
    student_user = student.user
    return {
        'student_user_id': student_user.pk if student_user else None,
        'student_name': _student_display_name(student),
        'student_email': student_user.email if student_user else '',
        'student_avatar_url': _student_avatar_url(student, request),
        'filiere_name': student.filiere.name if student.filiere else '',
        'class_code': student.class_group.code if student.class_group else '',
        'academic_level_name': (
            student.academic_level.name if student.academic_level else ''
        ),
        'admin_user_id': admin.pk,
        'admin_name': _user_display_name(admin),
        'admin_email': admin.email,
        'admin_avatar_url': _admin_avatar_url(admin),
        'admin_role_label': 'Administrateur',
    }


def build_admin_desk_snapshot(admin: User) -> dict[str, Any]:
    return {
        'admin_user_id': admin.pk,
        'admin_name': _user_display_name(admin),
        'admin_email': admin.email,
        'admin_avatar_url': _admin_avatar_url(admin),
        'admin_role_label': 'Administrateur',
    }


def _find_existing_student_admin_dm(student_user: User, admin: User) -> Conversation | None:
    """Return the existing admin↔student desk thread, including archived rows."""
    entity_id = _student_admin_dm_entity_id(student_user.pk, admin.pk)
    conv = (
        Conversation.objects.filter(
            context__module=MODULE,
            context__entity_type=STUDENT_ADMIN_DM,
            context__entity_id=entity_id,
        )
        .select_related('context')
        .order_by('-last_message_at', '-updated_at', '-id')
        .first()
    )
    if conv:
        return conv
    return (
        Conversation.objects.filter(
            context__module=MODULE,
            context__entity_type=STUDENT_ADMIN_DM,
            context__student_user_id=student_user.pk,
            participants__user_id=admin.pk,
        )
        .select_related('context')
        .distinct()
        .order_by('-last_message_at', '-updated_at', '-id')
        .first()
    )


def ensure_student_admin_dm(
    student: StudentProfile,
    admin: User,
    request=None,
) -> Conversation | None:
    student_user = student.user
    if not student_user or not student_user.is_active or not student_user.platform_access_granted:
        return None
    if not admin or not admin.is_active or not admin.platform_access_granted:
        return None
    if admin.role != User.RoleChoices.ADMIN:
        return None

    _ensure_chat_infrastructure()
    display_name = _student_display_name(student) or student_user.email
    snapshot = build_student_admin_dm_snapshot(student, admin, request=request)

    existing = _find_existing_student_admin_dm(student_user, admin)
    if existing:
        _refresh_context_snapshot(existing, snapshot)
        ensure_conversation_participants(existing, [student_user, admin])
        return existing

    conv = get_or_create_contextual_conversation(
        module=MODULE,
        entity_type=STUDENT_ADMIN_DM,
        entity_id=_student_admin_dm_entity_id(student_user.pk, admin.pk),
        title=f'{display_name} — {_user_display_name(admin)}',
        context_kind=ConversationContext.ContextKind.DIRECT,
        entity_label='Messagerie étudiant',
        workflow_status='OPEN',
        student_user=student_user,
        is_internal_only=False,
        context_snapshot=snapshot,
        participant_users=[student_user, admin],
        created_by=admin,
        channel_code=STUDENT_CHANNEL_CODE,
    )
    _refresh_context_snapshot(conv, snapshot)
    ensure_conversation_participants(conv, [student_user, admin])
    return conv


def ensure_admin_desk_dm(admin_a: User, admin_b: User) -> Conversation | None:
    if not admin_a or not admin_b or admin_a.pk == admin_b.pk:
        return None
    if not admin_a.is_active or not admin_b.is_active:
        return None
    if not admin_a.platform_access_granted or not admin_b.platform_access_granted:
        return None
    if admin_a.role != User.RoleChoices.ADMIN or admin_b.role != User.RoleChoices.ADMIN:
        return None

    _ensure_chat_infrastructure()
    snapshot = {
        **build_admin_desk_snapshot(admin_a),
        'peer_admin_user_id': admin_b.pk,
        'peer_admin_name': _user_display_name(admin_b),
        'peer_admin_email': admin_b.email,
        'peer_admin_avatar_url': _admin_avatar_url(admin_b),
    }
    conv = get_or_create_contextual_conversation(
        module=MODULE,
        entity_type=ADMIN_DESK_ENTITY,
        entity_id=_dm_entity_id(admin_a.pk, admin_b.pk),
        title=_user_display_name(admin_b) or admin_b.email,
        context_kind=ConversationContext.ContextKind.DIRECT,
        entity_label='Coordination administrateurs',
        workflow_status='OPEN',
        is_internal_only=True,
        context_snapshot=snapshot,
        participant_users=[admin_a, admin_b],
        created_by=admin_a,
        channel_code=ADMIN_CHANNEL_CODE,
    )
    _refresh_context_snapshot(conv, snapshot)
    ensure_conversation_participants(conv, [admin_a, admin_b])
    return conv


def _refresh_context_snapshot(conversation: Conversation, snapshot: dict[str, Any]) -> None:
    ctx = getattr(conversation, 'context', None)
    if not ctx:
        return
    merged = {**(ctx.context_snapshot_json or {}), **snapshot}
    if merged != (ctx.context_snapshot_json or {}):
        ctx.context_snapshot_json = merged
        ctx.save(update_fields=['context_snapshot_json', 'updated_at'])


def _authorized_students_qs():
    return (
        StudentProfile.objects.select_related(
            'user',
            'user__profile',
            'filiere',
            'class_group',
            'academic_level',
        )
        .filter(user__is_active=True, user__platform_access_granted=True)
        .order_by('id')
    )


def sync_student_admin_dms_for_admin(admin: User) -> int:
    if not user_can_manage_platform_desk(admin):
        return 0
    count = 0
    for student in _authorized_students_qs().iterator(chunk_size=200):
        if ensure_student_admin_dm(student, admin):
            count += 1
    return count


def sync_student_admin_dms_for_student(student_user: User) -> int:
    if student_user.role != User.RoleChoices.STUDENT or not student_user.platform_access_granted:
        return 0
    student = (
        StudentProfile.objects.select_related(
            'user',
            'user__profile',
            'filiere',
            'class_group',
            'academic_level',
        )
        .filter(user_id=student_user.pk)
        .first()
    )
    if not student:
        return 0
    count = 0
    for admin in _platform_admin_users():
        if ensure_student_admin_dm(student, admin):
            count += 1
    return count


def sync_student_desk_conversations() -> int:
    """Backwards-compatible alias — sync all student↔admin DM threads."""
    count = 0
    for admin in _platform_admin_users():
        count += sync_student_admin_dms_for_admin(admin)
    return count


def sync_admin_desk_conversations_for_admin(admin: User) -> int:
    if not user_can_manage_platform_desk(admin):
        return 0
    count = 0
    for peer in _platform_admin_users():
        if peer.pk == admin.pk:
            continue
        if ensure_admin_desk_dm(admin, peer):
            count += 1
    return count


def is_platform_desk_archived(conversation: Conversation) -> bool:
    meta = conversation.metadata_json or {}
    if 'admin_inbox_archived' in meta:
        return meta.get('admin_inbox_archived') is True
    return conversation.is_archived


def archive_platform_desk_conversation(conversation: Conversation, actor: User) -> Conversation:
    meta = dict(conversation.metadata_json or {})
    meta['admin_inbox_archived'] = True
    meta['admin_inbox_archived_by'] = actor.pk
    meta['admin_inbox_archived_at'] = timezone.now().isoformat()
    conversation.metadata_json = meta
    conversation.save(update_fields=['metadata_json', 'updated_at'])
    return conversation


def unarchive_platform_desk_conversation(conversation: Conversation, actor: User) -> Conversation:
    meta = dict(conversation.metadata_json or {})
    meta['admin_inbox_archived'] = False
    meta.pop('admin_inbox_archived_by', None)
    meta.pop('admin_inbox_archived_at', None)
    conversation.metadata_json = meta
    conversation.is_archived = False
    conversation.save(update_fields=['metadata_json', 'is_archived', 'updated_at'])
    return conversation


def archive_student_platform_desk_conversation(conversation: Conversation, actor: User) -> Conversation:
    """Archive a thread in the student inbox."""
    meta = dict(conversation.metadata_json or {})
    meta['student_archived_by'] = actor.pk
    meta['student_archived_at'] = timezone.now().isoformat()
    meta.pop('student_unarchived_by', None)
    meta.pop('student_unarchived_at', None)
    conversation.is_archived = True
    conversation.metadata_json = meta
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation


def unarchive_student_platform_desk_conversation(conversation: Conversation, actor: User) -> Conversation:
    """Restore a thread to the active student inbox."""
    meta = dict(conversation.metadata_json or {})
    meta.pop('student_archived_by', None)
    meta.pop('student_archived_at', None)
    meta['student_unarchived_by'] = actor.pk
    meta['student_unarchived_at'] = timezone.now().isoformat()
    conversation.is_archived = False
    conversation.metadata_json = meta
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation


def resolve_platform_desk_conversation(
    conversation: Conversation,
    actor: User,
    note: str = '',
) -> Conversation:
    ctx = getattr(conversation, 'context', None)
    if ctx:
        ctx.workflow_state = ConversationContext.WorkflowState.RESOLVED
        ctx.workflow_status = 'RESOLVED'
        ctx.save(update_fields=['workflow_state', 'workflow_status', 'updated_at'])
    meta = dict(conversation.metadata_json or {})
    meta['resolved'] = True
    meta['resolved_by'] = actor.pk
    meta['resolved_at'] = timezone.now().isoformat()
    if note.strip():
        meta['resolution_note'] = note.strip()
    conversation.metadata_json = meta
    conversation.save(update_fields=['metadata_json', 'updated_at'])
    return conversation


def ensure_conversation_participants(
    conversation: Conversation,
    users: list[User],
    *,
    default_role: str = ConversationParticipant.Role.MEMBER,
) -> None:
    seen: set[int] = set()
    for user in users:
        if not user or user.pk in seen:
            continue
        seen.add(user.pk)
        part, created = ConversationParticipant.objects.get_or_create(
            conversation=conversation,
            user=user,
            defaults={'role': default_role},
        )
        if part.left_at:
            part.left_at = None
            part.save(update_fields=['left_at', 'updated_at'])
        if created and user.role == User.RoleChoices.ADMIN:
            part.role = ConversationParticipant.Role.ADMIN
            part.save(update_fields=['role', 'updated_at'])
