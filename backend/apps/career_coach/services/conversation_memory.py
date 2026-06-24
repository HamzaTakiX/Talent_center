"""Conversation memory — recent messages + summary of older turns."""

from __future__ import annotations

import uuid

from django.core.cache import cache

from apps.career_coach.models import AiConversation
from apps.career_coach.services.message_intent import is_career_relevant_message

_MEMORY_TTL = 3600
_RECENT_LIMIT = 8


def _memory_cache_key(session_id: uuid.UUID) -> str:
    return f'career_coach:memory:{session_id}'


def build_conversation_memory_summary(
    user,
    session_id: uuid.UUID,
    *,
    exclude_recent: int = _RECENT_LIMIT,
) -> str:
    """Rule-based summary of older messages (no LLM call)."""
    messages = list(
        AiConversation.objects.filter(
            user=user,
            session_id=session_id,
            role__in=(AiConversation.Role.USER, AiConversation.Role.ASSISTANT),
        )
        .order_by('created_at')
        .only('role', 'message', 'mode', 'created_at'),
    )
    if len(messages) <= exclude_recent:
        return ''

    older = messages[:-exclude_recent]
    topics: list[str] = []
    for msg in older:
        if msg.role != AiConversation.Role.USER:
            continue
        if not is_career_relevant_message(msg.message, msg.mode):
            continue
        snippet = msg.message.strip().replace('\n', ' ')
        if len(snippet) > 100:
            snippet = f'{snippet[:100]}…'
        if snippet:
            topics.append(snippet)

    if not topics:
        return ''

    unique = list(dict.fromkeys(topics))
    return 'Earlier in this conversation, the student asked about: ' + '; '.join(unique[-5:])


def get_cached_memory_summary(user, session_id: uuid.UUID) -> str:
    cached = cache.get(_memory_cache_key(session_id))
    if isinstance(cached, str):
        return cached
    summary = build_conversation_memory_summary(user, session_id)
    if summary:
        cache.set(_memory_cache_key(session_id), summary, _MEMORY_TTL)
    return summary


def invalidate_memory_summary(session_id: uuid.UUID) -> None:
    cache.delete(_memory_cache_key(session_id))


def get_recent_history(
    user,
    session_id: uuid.UUID,
    limit: int = _RECENT_LIMIT,
) -> list[AiConversation]:
    return list(
        AiConversation.objects.filter(user=user, session_id=session_id)
        .order_by('-created_at')[:limit][::-1]
    )
