"""History audit integration for chat events."""

from __future__ import annotations

from typing import Any, Optional

from apps.history.audit import audit

from ..models import Conversation, Message


def record_message_sent(
    *,
    message: Message,
    actor,
    module: str,
    entity_type: str = '',
    entity_id: str | int | None = None,
    metadata: Optional[dict[str, Any]] = None,
) -> None:
    conv = message.conversation
    ctx = getattr(conv, 'context', None)
    audit.emit(
        module=module or (ctx.module if ctx else 'chat'),
        action='CREATE',
        event_code='chat.message.sent',
        summary=f'Message sent in conversation {conv.pk}',
        actor=actor,
        entity_type=entity_type or (ctx.entity_type if ctx else 'conversation'),
        entity_id=int(entity_id) if entity_id and str(entity_id).isdigit() else conv.pk,
        metadata={
            'conversation_id': conv.pk,
            'message_id': message.pk,
            'message_type': message.message_type,
            **(metadata or {}),
        },
        visibility_scope='platform',
    )


def record_chat_action(
    *,
    action_code: str,
    summary: str,
    actor,
    conversation: Conversation,
    metadata: Optional[dict[str, Any]] = None,
) -> None:
    ctx = getattr(conversation, 'context', None)
    audit.emit(
        module=ctx.module if ctx else 'chat',
        action='UPDATE',
        event_code=f'chat.action.{action_code}',
        summary=summary,
        actor=actor,
        entity_type=ctx.entity_type if ctx else 'conversation',
        entity_id=int(ctx.entity_id) if ctx and str(ctx.entity_id).isdigit() else conversation.pk,
        metadata={
            'conversation_id': conversation.pk,
            'action_code': action_code,
            **(metadata or {}),
        },
    )
