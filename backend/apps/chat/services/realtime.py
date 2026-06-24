"""WebSocket event publisher via Django Channels."""

from __future__ import annotations

import logging
import threading
from dataclasses import asdict, dataclass, field
from typing import Any

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)


@dataclass
class ChatRealtimeEvent:
    event_type: str
    conversation_id: int | None = None
    user_id: int | None = None
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _layer():
    return get_channel_layer()


def _group_send_sync(layer, group: str, message: dict[str, Any]) -> None:
    """Publish to a Channels group from synchronous Django code."""
    try:
        async_to_sync(layer.group_send)(group, message)
    except RuntimeError:
        # Called from database_sync_to_async (WebSocket connect/disconnect) — use a fresh thread.
        def _deliver() -> None:
            try:
                async_to_sync(layer.group_send)(group, message)
            except Exception:
                logger.exception('chat.realtime group_send failed group=%s', group)

        threading.Thread(
            target=_deliver,
            daemon=True,
            name='chat-realtime-send',
        ).start()
    except Exception:
        logger.exception('chat.realtime group_send failed group=%s', group)


def _group_send(group: str, message_type: str, payload: dict[str, Any]) -> None:
    layer = _layer()
    if not layer:
        logger.debug('chat.realtime no channel layer (%s)', message_type)
        return

    _group_send_sync(layer, group, {'type': message_type, 'payload': payload})


def publish(event: ChatRealtimeEvent) -> None:
    data = event.to_dict()
    logger.debug('chat.realtime %s conv=%s', event.event_type, event.conversation_id)

    if event.conversation_id:
        envelope = {'event_type': event.event_type, **event.payload}
        _group_send(f'chat_conv_{event.conversation_id}', 'chat.message', envelope)

    if event.user_id:
        _group_send(f'chat_user_{event.user_id}', 'chat.message', data)


def _participant_user_ids(conversation_id: int) -> list[int]:
    from apps.chat.models import ConversationParticipant

    return list(
        ConversationParticipant.objects.filter(
            conversation_id=conversation_id,
            left_at__isnull=True,
        ).values_list('user_id', flat=True)
    )


def _conversation_subscriber_ids(conversation_id: int) -> list[int]:
    """Participants plus offer-inbox admins who may not yet be participants."""
    from apps.chat.models import Conversation, ConversationContext

    subscriber_ids = set(_participant_user_ids(conversation_id))
    conv = (
        Conversation.objects.filter(pk=conversation_id)
        .select_related('context')
        .first()
    )
    ctx = getattr(conv, 'context', None) if conv else None
    if ctx and ctx.student_user_id:
        subscriber_ids.add(ctx.student_user_id)
    if ctx and ctx.module == ConversationContext.Module.OFFERS:
        from apps.stage.services.notifications import internship_admin_users

        for admin in internship_admin_users():
            subscriber_ids.add(admin.pk)
    return list(subscriber_ids)


def publish_message_created(
    conversation_id: int,
    message_payload: dict[str, Any],
) -> None:
    payload = {'event_type': 'message.created', 'conversation_id': conversation_id, **message_payload}
    _group_send(f'chat_conv_{conversation_id}', 'chat.message', payload)
    for user_id in _conversation_subscriber_ids(conversation_id):
        _group_send(f'chat_user_{user_id}', 'chat.message', payload)


def publish_typing(conversation_id: int, user_id: int, is_typing: bool) -> None:
    from .presence import set_typing

    set_typing(user_id, conversation_id if is_typing else None, is_typing)
    payload = {
        'event_type': 'typing',
        'conversation_id': conversation_id,
        'user_id': user_id,
        'is_typing': is_typing,
    }
    _group_send(f'chat_conv_{conversation_id}', 'chat.typing', payload)


def publish_read_receipt(conversation_id: int, reader_user_id: int, message_id: int) -> None:
    payload = {
        'event_type': 'read_receipt',
        'conversation_id': conversation_id,
        'user_id': reader_user_id,
        'last_read_message_id': message_id,
        'read_at': message_payload_now(),
    }
    _group_send(f'chat_conv_{conversation_id}', 'chat.read_receipt', payload)
    for subscriber_id in _conversation_subscriber_ids(conversation_id):
        _group_send(f'chat_user_{subscriber_id}', 'chat.read_receipt', payload)


def publish_inbox_updated(conversation_id: int, payload: dict[str, Any] | None = None) -> None:
    """Notify inbox subscribers that unread counters or list metadata changed."""
    envelope = {
        'event_type': 'inbox.updated',
        'conversation_id': conversation_id,
        **(payload or {}),
    }
    for user_id in _conversation_subscriber_ids(conversation_id):
        _group_send(f'chat_user_{user_id}', 'chat.message', envelope)


def publish_conversation_updated(conversation_id: int, payload: dict[str, Any]) -> None:
    envelope = {'event_type': 'conversation.updated', 'conversation_id': conversation_id, **payload}
    _group_send(f'chat_conv_{conversation_id}', 'chat.conversation_updated', envelope)
    for user_id in _conversation_subscriber_ids(conversation_id):
        _group_send(f'chat_user_{user_id}', 'chat.conversation_updated', envelope)


def publish_presence(user_id: int, presence_payload: dict[str, Any]) -> None:
    payload = {'event_type': 'presence', 'user_id': user_id, **presence_payload}
    _group_send(f'chat_user_{user_id}', 'chat.presence', payload)


def message_payload_now() -> str:
    from django.utils import timezone

    return timezone.now().isoformat()
