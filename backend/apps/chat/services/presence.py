"""Online presence tracking backed by Redis when available."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)

_PRESENCE: dict[int, dict[str, Any]] = {}
_PRESENCE_TTL_SECONDS = 120


def _redis_client():
    url = getattr(settings, 'REDIS_URL', '') or ''
    if not url:
        return None
    try:
        import redis

        return redis.from_url(url, decode_responses=True)
    except Exception:
        return None


def mark_online(user_id: int) -> None:
    now = datetime.now(timezone.utc).isoformat()
    client = _redis_client()
    key = f'chat:presence:{user_id}'
    payload = {'online': True, 'last_seen': now, 'typing_conversation_id': None}
    if client:
        try:
            client.hset(key, mapping=payload)
            client.expire(key, _PRESENCE_TTL_SECONDS)
        except Exception:
            logger.debug('presence redis mark_online failed user=%s', user_id)
    _PRESENCE[user_id] = payload
    _broadcast_presence(user_id, payload)


def mark_offline(user_id: int) -> None:
    now = datetime.now(timezone.utc).isoformat()
    client = _redis_client()
    key = f'chat:presence:{user_id}'
    payload = {'online': False, 'last_seen': now, 'typing_conversation_id': None}
    if client:
        try:
            client.hset(key, mapping={k: str(v) if v is not None else '' for k, v in payload.items()})
            client.expire(key, _PRESENCE_TTL_SECONDS * 4)
        except Exception:
            logger.debug('presence redis mark_offline failed user=%s', user_id)
    _PRESENCE[user_id] = payload
    _broadcast_presence(user_id, payload)


def touch_presence(user_id: int) -> None:
    mark_online(user_id)


def set_typing(user_id: int, conversation_id: int | None, is_typing: bool) -> None:
    state = get_presence(user_id)
    state['typing_conversation_id'] = conversation_id if is_typing else None
    client = _redis_client()
    key = f'chat:presence:{user_id}'
    if client:
        try:
            client.hset(
                key,
                mapping={
                    'online': '1',
                    'last_seen': state.get('last_seen') or datetime.now(timezone.utc).isoformat(),
                    'typing_conversation_id': str(conversation_id or ''),
                },
            )
            client.expire(key, _PRESENCE_TTL_SECONDS)
        except Exception:
            pass
    _PRESENCE[user_id] = state


def get_presence(user_id: int) -> dict[str, Any]:
    client = _redis_client()
    key = f'chat:presence:{user_id}'
    if client:
        try:
            raw = client.hgetall(key)
            if raw:
                return {
                    'online': raw.get('online') in {'1', 'True', 'true', True},
                    'last_seen': raw.get('last_seen'),
                    'typing_conversation_id': int(raw['typing_conversation_id'])
                    if raw.get('typing_conversation_id', '').isdigit()
                    else None,
                }
        except Exception:
            pass
    return _PRESENCE.get(
        user_id,
        {'online': False, 'last_seen': None, 'typing_conversation_id': None},
    )


def _broadcast_presence(user_id: int, payload: dict[str, Any]) -> None:
    try:
        from .realtime import publish_presence

        publish_presence(user_id, payload)
    except Exception:
        pass
