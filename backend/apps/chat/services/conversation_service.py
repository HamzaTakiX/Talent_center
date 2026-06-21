"""Contextual conversation lifecycle."""

from __future__ import annotations

from typing import Any, Optional

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.accounts_et_roles.models import User

from ..models import (
    Channel,
    Conversation,
    ConversationContext,
    ConversationParticipant,
    Message,
)
from .audit_hooks import record_chat_action


def get_or_create_contextual_conversation(
    *,
    module: str,
    entity_type: str,
    entity_id: str,
    title: str,
    context_kind: str = ConversationContext.ContextKind.WORKFLOW_THREAD,
    entity_label: str = '',
    workflow_status: str = '',
    urgency: str = ConversationContext.Urgency.NONE,
    student_user: User | None = None,
    is_internal_only: bool = False,
    context_snapshot: Optional[dict[str, Any]] = None,
    participant_users: list[User],
    created_by: User | None = None,
    channel_code: str | None = None,
) -> Conversation:
    existing = (
        Conversation.objects.filter(
            context__module=module,
            context__entity_type=entity_type,
            context__entity_id=str(entity_id),
            is_archived=False,
        )
        .select_related('context')
        .first()
    )
    if existing:
        return existing

    channel = None
    if channel_code:
        channel = Channel.objects.filter(code=channel_code, is_archived=False).first()

    with transaction.atomic():
        conv = Conversation.objects.create(
            channel=channel,
            title=title,
            conversation_type=Conversation.ConversationType.THREAD
            if context_kind != ConversationContext.ContextKind.DIRECT
            else Conversation.ConversationType.DIRECT,
            created_by=created_by,
            metadata_json={'module': module},
        )
        ConversationContext.objects.create(
            conversation=conv,
            module=module,
            context_kind=context_kind,
            entity_type=entity_type,
            entity_id=str(entity_id),
            entity_label=entity_label,
            workflow_status=workflow_status,
            urgency=urgency,
            student_user=student_user,
            is_internal_only=is_internal_only,
            context_snapshot_json=context_snapshot or {},
        )
        seen = set()
        for user in participant_users:
            if not user or user.pk in seen:
                continue
            seen.add(user.pk)
            ConversationParticipant.objects.create(
                conversation=conv,
                user=user,
                role=ConversationParticipant.Role.OWNER
                if created_by and user.pk == created_by.pk
                else ConversationParticipant.Role.MEMBER,
            )
    return conv


def list_module_conversations(
    user: User,
    *,
    module: str,
    context_kind: str | None = None,
    entity_type: str | None = None,
    urgency: str | None = None,
    unread_only: bool = False,
    search: str = '',
) -> list[Conversation]:
    from ..permissions import conversations_for_user

    qs = conversations_for_user(user).filter(context__module=module)
    if context_kind:
        qs = qs.filter(context__context_kind=context_kind)
    if entity_type:
        qs = qs.filter(context__entity_type=entity_type)
    if urgency:
        qs = qs.filter(context__urgency=urgency)
    if search.strip():
        q = search.strip()
        qs = qs.filter(
            Q(title__icontains=q)
            | Q(context__entity_label__icontains=q)
            | Q(messages__body__icontains=q)
        ).distinct()
    qs = qs.prefetch_related(
        'participants__user',
        'messages',
    )
    convs = list(qs.order_by('-last_message_at', '-updated_at')[:200])
    if not unread_only:
        return convs
    result = []
    for conv in convs:
        part = ConversationParticipant.objects.filter(conversation=conv, user=user).first()
        last_msg = Message.objects.filter(conversation=conv, deleted_at__isnull=True).order_by('-id').first()
        if last_msg and (not part or (part.last_read_message_id or 0) < last_msg.pk):
            result.append(conv)
    return result


def apply_smart_action(
    *,
    conversation: Conversation,
    action_code: str,
    actor: User,
    payload: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    from ..constants import SMART_ACTION_CODES

    if action_code not in SMART_ACTION_CODES:
        raise ValueError(f'Unknown action: {action_code}')

    ctx = getattr(conversation, 'context', None)
    meta = payload or {}

    if action_code == 'mark_urgent' and ctx:
        ctx.urgency = ConversationContext.Urgency.CRITICAL
        ctx.save(update_fields=['urgency', 'updated_at'])

    if ctx and ctx.module == ConversationContext.Module.OFFERS:
        from apps.stage.services import chat_service as offer_chat

        if action_code == 'mark_resolved':
            offer_chat.resolve_offer_conversation(conversation, actor, meta.get('note', ''))
        elif action_code == 'archive_conversation':
            offer_chat.archive_offer_conversation(conversation, actor)

    record_chat_action(
        action_code=action_code,
        summary=f'Smart action {action_code} on conversation {conversation.pk}',
        actor=actor,
        conversation=conversation,
        metadata=meta,
    )

    Message.objects.create(
        conversation=conversation,
        sender=actor,
        body=f'[Action: {action_code}]',
        message_type=Message.MessageType.EVENT,
        metadata_json={'smart_action': action_code, **meta},
    )
    conversation.last_message_at = timezone.now()
    conversation.save(update_fields=['last_message_at', 'updated_at'])

    return {'action_code': action_code, 'conversation_id': conversation.pk, 'status': 'applied'}
