"""Announcement-specific chat — student questions to admins."""

from __future__ import annotations

from typing import Any, Optional

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.admin_management.services.scopes import is_super_admin
from apps.announcements.models import Announcement
from apps.chat.models import Channel, Conversation, ConversationContext, ConversationParticipant, Message
from apps.chat.services.conversation_service import get_or_create_contextual_conversation
from apps.chat.services.message_service import send_message as chat_send_message
from apps.chat.services.seed import seed_chat_infrastructure
from apps.stage.services.chat_service import ensure_conversation_participants, _student_avatar_url

User = get_user_model()
MODULE = ConversationContext.Module.ANNOUNCEMENTS
CHANNEL_CODE = 'announcements'
ENTITY_TYPE = 'announcement'


def _ensure_chat_infrastructure() -> None:
    if Channel.objects.filter(code=CHANNEL_CODE, is_archived=False).exists():
        return
    seed_chat_infrastructure()


def _announcement_admin_users() -> list[User]:
    admins = User.objects.filter(role=User.RoleChoices.ADMIN, is_active=True)
    result = []
    for admin in admins:
        if is_super_admin(admin):
            result.append(admin)
            continue
        perms = get_admin_effective_permissions(admin)
        if 'announcements.view' in perms or 'announcements.create' in perms:
            result.append(admin)
    return result


def announcement_thread_entity_id(announcement: Announcement, student: StudentProfile) -> str:
    return f'{announcement.uuid}:{student.pk}'


def _cover_url(announcement: Announcement, request=None) -> str | None:
    if not announcement.cover_image:
        return None
    url = announcement.cover_image.url
    if request:
        return request.build_absolute_uri(url)
    return url


def _student_display_name(student: StudentProfile) -> str:
    user = student.user
    profile = getattr(user, 'profile', None)
    for first, last in (
        (user.first_name, user.last_name),
        (getattr(profile, 'first_name', '') if profile else '', getattr(profile, 'last_name', '') if profile else ''),
    ):
        name = f'{first} {last}'.strip()
        if name:
            return name
    return user.email if user else ''


def _build_context_snapshot(
    *,
    announcement: Announcement,
    student: StudentProfile,
    request=None,
) -> dict[str, Any]:
    user = student.user
    at = announcement.announcement_type
    filiere = getattr(student, 'filiere', None)
    return {
        'announcement_id': announcement.pk,
        'announcement_uuid': str(announcement.uuid),
        'announcement_title': announcement.title,
        'announcement_type_code': at.code,
        'announcement_type_name': at.name,
        'announcement_priority': announcement.priority,
        'company_name': announcement.company_name or '',
        'cover_image_url': _cover_url(announcement, request),
        'application_deadline': (
            announcement.application_deadline.isoformat()
            if announcement.application_deadline
            else None
        ),
        'published_at': (
            announcement.published_at.isoformat()
            if announcement.published_at
            else announcement.created_at.isoformat()
        ),
        'created_at': announcement.created_at.isoformat(),
        'publish_end_at': (
            announcement.publish_end_at.isoformat()
            if announcement.publish_end_at
            else None
        ),
        'announcement_status': announcement.status,
        'target_scope': announcement.target_scope,
        'student_profile_id': student.pk,
        'student_user_id': user.pk if user else None,
        'student_name': _student_display_name(student),
        'student_email': user.email if user else '',
        'student_avatar_url': _student_avatar_url(student, request),
        'filiere_id': student.filiere_id,
        'filiere_name': filiere.name if filiere else '',
    }


def get_or_create_announcement_conversation(
    *,
    announcement: Announcement,
    student: StudentProfile,
    admin_users: list[User] | None = None,
    created_by: User | None = None,
    request=None,
) -> Conversation:
    _ensure_chat_infrastructure()
    entity_id = announcement_thread_entity_id(announcement, student)
    existing = (
        Conversation.objects.filter(
            context__module=MODULE,
            context__entity_type=ENTITY_TYPE,
            context__entity_id=entity_id,
            is_archived=False,
        )
        .select_related('context')
        .first()
    )
    if existing:
        ensure_conversation_participants(existing, [student.user])
        return existing

    student_name = _student_display_name(student)
    display_name = student_name or (student.user.email if student.user else '')
    admins = list(admin_users or [])
    for admin in _announcement_admin_users():
        if admin.pk not in {u.pk for u in admins}:
            admins.append(admin)

    conv = get_or_create_contextual_conversation(
        module=MODULE,
        entity_type=ENTITY_TYPE,
        entity_id=entity_id,
        title=f'{announcement.title} — {display_name}',
        entity_label=announcement.title,
        workflow_status='INQUIRY',
        student_user=student.user,
        is_internal_only=False,
        context_snapshot=_build_context_snapshot(
            announcement=announcement,
            student=student,
            request=request,
        ),
        participant_users=[student.user, *admins],
        created_by=created_by,
        channel_code=CHANNEL_CODE,
        context_kind=ConversationContext.ContextKind.ANNOUNCEMENT_THREAD,
    )
    ensure_conversation_participants(conv, [student.user, *admins])
    return conv


def send_announcement_message(
    *,
    conversation: Conversation,
    sender: User,
    body: str,
) -> Message | None:
    ensure_conversation_participants(conversation, [sender])
    return chat_send_message(
        user=sender,
        conversation_id=conversation.pk,
        body=body,
        metadata={},
    )


def _user_can_manage_announcements(user: User) -> bool:
    if is_super_admin(user):
        return True
    perms = get_admin_effective_permissions(user)
    return 'announcements.view' in perms or 'announcements.create' in perms


def resolve_announcement_conversation(
    conversation: Conversation,
    actor: User,
    resolution_note: str = '',
) -> Conversation:
    ctx = getattr(conversation, 'context', None)
    if ctx:
        ctx.workflow_status = 'RESOLVED'
        ctx.workflow_state = ConversationContext.WorkflowState.RESOLVED
        ctx.context_snapshot_json = {
            **(ctx.context_snapshot_json or {}),
            'resolution_note': resolution_note,
            'resolved_by': actor.pk,
        }
        ctx.save(update_fields=['workflow_status', 'workflow_state', 'context_snapshot_json', 'updated_at'])
    return conversation


def archive_announcement_conversation(conversation: Conversation, actor: User) -> Conversation:
    """Hide a thread from the admin inbox only; students keep full access."""
    meta = conversation.metadata_json or {}
    meta['admin_inbox_archived'] = True
    meta['archived_by'] = actor.pk
    meta['admin_inbox_archived_at'] = timezone.now().isoformat()
    meta.pop('unarchived_by', None)
    meta.pop('admin_inbox_unarchived_at', None)
    conversation.metadata_json = meta
    conversation.is_archived = False
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation


def unarchive_announcement_conversation(conversation: Conversation, actor: User) -> Conversation:
    """Restore a thread to the active admin inbox."""
    meta = conversation.metadata_json or {}
    meta['admin_inbox_archived'] = False
    meta.pop('archived_by', None)
    meta.pop('admin_inbox_archived_at', None)
    meta['unarchived_by'] = actor.pk
    meta['admin_inbox_unarchived_at'] = timezone.now().isoformat()
    conversation.metadata_json = meta
    conversation.is_archived = False
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation


def archive_student_announcement_conversation(conversation: Conversation, actor: User) -> Conversation:
    """Archive a thread in the student inbox (global is_archived flag)."""
    meta = dict(conversation.metadata_json or {})
    meta['student_archived_by'] = actor.pk
    meta['student_archived_at'] = timezone.now().isoformat()
    meta.pop('student_unarchived_by', None)
    meta.pop('student_unarchived_at', None)
    conversation.is_archived = True
    conversation.metadata_json = meta
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation


def unarchive_student_announcement_conversation(conversation: Conversation, actor: User) -> Conversation:
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
