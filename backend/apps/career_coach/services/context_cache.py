"""Cache aggregated student context to avoid rebuilding on every request."""

from __future__ import annotations

import hashlib
import json
import logging

from django.core.cache import cache

logger = logging.getLogger(__name__)

_CONTEXT_TTL = 300  # 5 minutes
_INDEX_TTL = 600


def _cache_key(student_id: int, suffix: str = 'context') -> str:
    return f'career_coach:{suffix}:{student_id}'


def get_cached_context(student_id: int) -> dict | None:
    return cache.get(_cache_key(student_id))


def set_cached_context(student_id: int, context: dict) -> None:
    cache.set(_cache_key(student_id), context, _CONTEXT_TTL)


def get_cached_summaries(student_id: int) -> dict | None:
    return cache.get(_cache_key(student_id, 'summaries'))


def set_cached_summaries(student_id: int, summaries: dict) -> None:
    cache.set(_cache_key(student_id, 'summaries'), summaries, _CONTEXT_TTL)


def invalidate_context(student_id: int) -> None:
    cache.delete(_cache_key(student_id))
    cache.delete(_cache_key(student_id, 'summaries'))
    cache.delete(_cache_key(student_id, 'indexed_hash'))


def get_index_hash(context: dict) -> str:
    payload = json.dumps(context, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode()).hexdigest()


def is_context_indexed(student_id: int, context_hash: str) -> bool:
    return cache.get(_cache_key(student_id, 'indexed_hash')) == context_hash


def mark_context_indexed(student_id: int, context_hash: str) -> None:
    cache.set(_cache_key(student_id, 'indexed_hash'), context_hash, _INDEX_TTL)
