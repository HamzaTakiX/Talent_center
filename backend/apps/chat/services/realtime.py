"""WebSocket-ready realtime event publisher (stub until Channels is wired)."""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from typing import Any

logger = logging.getLogger(__name__)

_EVENT_BUFFER: list[dict[str, Any]] = []
_MAX_BUFFER = 500


@dataclass
class ChatRealtimeEvent:
    event_type: str
    conversation_id: int
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def publish(event: ChatRealtimeEvent) -> None:
    """Publish to connected clients when WebSocket layer is active."""
    data = event.to_dict()
    logger.debug('chat.realtime %s conv=%s', event.event_type, event.conversation_id)
    _EVENT_BUFFER.append(data)
    if len(_EVENT_BUFFER) > _MAX_BUFFER:
        del _EVENT_BUFFER[: len(_EVENT_BUFFER) - _MAX_BUFFER]
    # Future: channel_layer.group_send(f'chat_{conversation_id}', ...)


def publish_message_created(conversation_id: int, message_payload: dict[str, Any]) -> None:
    publish(
        ChatRealtimeEvent(
            event_type='message.created',
            conversation_id=conversation_id,
            payload=message_payload,
        )
    )


def publish_typing(conversation_id: int, user_id: int, is_typing: bool) -> None:
    publish(
        ChatRealtimeEvent(
            event_type='typing',
            conversation_id=conversation_id,
            payload={'user_id': user_id, 'is_typing': is_typing},
        )
    )


def publish_read_receipt(conversation_id: int, user_id: int, message_id: int) -> None:
    publish(
        ChatRealtimeEvent(
            event_type='read_receipt',
            conversation_id=conversation_id,
            payload={'user_id': user_id, 'last_read_message_id': message_id},
        )
    )
