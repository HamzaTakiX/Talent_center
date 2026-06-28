"""Document service chat — student questions to the documents desk."""

from __future__ import annotations

from typing import Any

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.admin_management.services.scopes import is_super_admin
from apps.chat.models import Channel, Conversation, ConversationContext, Message
from apps.chat.services.conversation_service import get_or_create_contextual_conversation
from apps.chat.services.message_service import send_message as chat_send_message
from apps.chat.services.seed import seed_chat_infrastructure
from apps.documents.models import DocumentType
from apps.stage.services.chat_service import _student_avatar_url, ensure_conversation_participants

User = get_user_model()
MODULE = ConversationContext.Module.DOCUMENTS
CHANNEL_CODE = 'documents'
ENTITY_TYPE = 'document_service'


def _ensure_chat_infrastructure() -> None:
    if Channel.objects.filter(code=CHANNEL_CODE, is_archived=False).exists():
        return
    seed_chat_infrastructure()


def _document_admin_users() -> list[User]:
    admins = User.objects.filter(role=User.RoleChoices.ADMIN, is_active=True)
    result = []
    for admin in admins:
        if is_super_admin(admin):
            result.append(admin)
            continue
        perms = get_admin_effective_permissions(admin)
        if 'documents.validate' in perms or 'documents.manage' in perms:
            result.append(admin)
    return result


def user_can_manage_document_chat(user: User) -> bool:
    if not user or not user.is_authenticated:
        return False
    if is_super_admin(user):
        return True
    if user.role != User.RoleChoices.ADMIN:
        return False
    perms = get_admin_effective_permissions(user)
    return 'documents.validate' in perms or 'documents.manage' in perms


def document_service_thread_entity_id(document_type: DocumentType, student: StudentProfile) -> str:
    return f'{document_type.pk}:{student.pk}'


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
    document_type: DocumentType,
    student: StudentProfile,
    request=None,
) -> dict[str, Any]:
    user = student.user
    cfg = document_type.service_config_json or {}
    proc = cfg.get('processing', {}) if isinstance(cfg, dict) else {}
    delivery = cfg.get('delivery', {}) if isinstance(cfg, dict) else {}
    online = delivery.get('online', {}) if isinstance(delivery, dict) else {}
    physical = delivery.get('physical', {}) if isinstance(delivery, dict) else {}
    avail = cfg.get('availability', {}) if isinstance(cfg, dict) else {}
    filiere = getattr(student, 'filiere', None)
    return {
        'document_service_id': document_type.pk,
        'document_service_code': document_type.code,
        'document_service_name': document_type.name,
        'document_category': document_type.category,
        'document_description': document_type.description,
        'document_icon_key': document_type.icon_key or 'file-text',
        'document_color_theme': document_type.color_theme or 'brand',
        'sla_hours': proc.get('slaHours') or document_type.default_validity_days or 48,
        'estimated_hours': proc.get('estimatedHours', 24),
        'online_enabled': online.get('enabled', False),
        'physical_enabled': physical.get('enabled', False),
        'reservation_required': physical.get('reservationRequired', False),
        'visible_to_students': avail.get('visibleToStudents', True),
        'student_profile_id': student.pk,
        'student_user_id': user.pk if user else None,
        'student_name': _student_display_name(student),
        'student_email': user.email if user else '',
        'student_avatar_url': _student_avatar_url(student, request),
        'filiere_id': student.filiere_id,
        'filiere_name': filiere.name if filiere else '',
    }


def get_or_create_document_service_conversation(
    *,
    document_type: DocumentType,
    student: StudentProfile,
    admin_users: list[User] | None = None,
    created_by: User | None = None,
    request=None,
) -> Conversation:
    _ensure_chat_infrastructure()
    entity_id = document_service_thread_entity_id(document_type, student)
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
        _sync_document_context(existing, document_type=document_type, student=student, request=request)
        return existing

    student_name = _student_display_name(student)
    display_name = student_name or (student.user.email if student.user else '')
    admins = list(admin_users or [])
    for admin in _document_admin_users():
        if admin.pk not in {u.pk for u in admins}:
            admins.append(admin)

    conv = get_or_create_contextual_conversation(
        module=MODULE,
        entity_type=ENTITY_TYPE,
        entity_id=entity_id,
        title=f'{document_type.name} — {display_name}',
        entity_label=document_type.name,
        workflow_status='INQUIRY',
        student_user=student.user,
        is_internal_only=False,
        context_snapshot=_build_context_snapshot(
            document_type=document_type,
            student=student,
            request=request,
        ),
        participant_users=[student.user, *admins],
        created_by=created_by,
        channel_code=CHANNEL_CODE,
        context_kind=ConversationContext.ContextKind.WORKFLOW_THREAD,
    )
    ensure_conversation_participants(conv, [student.user, *admins])
    return conv


def _sync_document_context(
    conversation: Conversation,
    *,
    document_type: DocumentType,
    student: StudentProfile,
    request=None,
) -> None:
    ctx = getattr(conversation, 'context', None)
    if not ctx:
        return
    ctx.context_snapshot_json = _build_context_snapshot(
        document_type=document_type,
        student=student,
        request=request,
    )
    ctx.entity_label = document_type.name
    ctx.save(update_fields=['context_snapshot_json', 'entity_label', 'updated_at'])


def send_document_message(
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


def resolve_document_conversation(
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
    meta = dict(conversation.metadata_json or {})
    meta['resolved'] = True
    conversation.metadata_json = meta
    conversation.save(update_fields=['metadata_json', 'updated_at'])
    return conversation


def archive_document_conversation(conversation: Conversation, actor: User) -> Conversation:
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


def unarchive_document_conversation(conversation: Conversation, actor: User) -> Conversation:
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


def archive_student_document_conversation(conversation: Conversation, actor: User) -> Conversation:
    meta = dict(conversation.metadata_json or {})
    meta['student_archived_by'] = actor.pk
    meta['student_archived_at'] = timezone.now().isoformat()
    meta.pop('student_unarchived_by', None)
    meta.pop('student_unarchived_at', None)
    conversation.is_archived = True
    conversation.metadata_json = meta
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation


def unarchive_student_document_conversation(conversation: Conversation, actor: User) -> Conversation:
    meta = dict(conversation.metadata_json or {})
    meta.pop('student_archived_by', None)
    meta.pop('student_archived_at', None)
    meta['student_unarchived_by'] = actor.pk
    meta['student_unarchived_at'] = timezone.now().isoformat()
    conversation.is_archived = False
    conversation.metadata_json = meta
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation
