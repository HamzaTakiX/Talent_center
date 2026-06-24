"""BGE-M3 embeddings via Ollama (budget = 0 DH)."""

from __future__ import annotations

import logging

from django.core.cache import cache

from apps.career_coach.services.ai.factory import get_ai_provider

logger = logging.getLogger(__name__)

_EMBED_CACHE_TTL = 3600


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    provider = get_ai_provider()
    results: list[list[float]] = []
    uncached: list[tuple[int, str]] = []

    for idx, text in enumerate(texts):
        key = f'career_coach:embed:{hash(text)}'
        cached = cache.get(key)
        if cached is not None:
            results.append(cached)
        else:
            results.append([])
            uncached.append((idx, text))

    if uncached:
        try:
            vectors = provider.embed([t for _, t in uncached])
            for (idx, text), vector in zip(uncached, vectors):
                results[idx] = vector
                cache.set(f'career_coach:embed:{hash(text)}', vector, _EMBED_CACHE_TTL)
        except Exception as exc:
            logger.warning('BGE-M3 embedding via Ollama failed: %s', exc)
            raise

    return results
