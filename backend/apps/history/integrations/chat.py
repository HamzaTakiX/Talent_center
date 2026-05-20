"""History integration hooks for contextual chat domain."""

from __future__ import annotations

from apps.history.audit import audit


def emit_chat_message_sent(*, actor, conversation_id: int, message_id: int, module: str, **metadata):
    audit.emit(
        module=module or 'chat',
        action='CREATE',
        event_code='chat.message.sent',
        summary=f'Chat message #{message_id} in conversation #{conversation_id}',
        actor=actor,
        entity_type='conversation',
        entity_id=conversation_id,
        metadata={'message_id': message_id, **metadata},
    )


def emit_chat_smart_action(*, actor, conversation_id: int, action_code: str, module: str, **metadata):
    audit.emit(
        module=module or 'chat',
        action='UPDATE',
        event_code=f'chat.action.{action_code}',
        summary=f'Chat smart action {action_code} on conversation #{conversation_id}',
        actor=actor,
        entity_type='conversation',
        entity_id=conversation_id,
        metadata={'action_code': action_code, **metadata},
    )
