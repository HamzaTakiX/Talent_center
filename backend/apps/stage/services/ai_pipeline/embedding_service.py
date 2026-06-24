"""OpenAI vector embeddings and cosine similarity."""

from __future__ import annotations

import logging
from typing import Sequence

from django.conf import settings

logger = logging.getLogger(__name__)


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(x * x for x in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return max(0.0, min(1.0, dot / (norm_a * norm_b)))


def generate_embedding(text: str) -> list[float]:
    api_key = getattr(settings, 'OPENAI_API_KEY', '')
    if not api_key:
        raise RuntimeError('OPENAI_API_KEY is not configured')

    normalized = (text or '').strip()
    if not normalized:
        return []

    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError(
            'openai package is not installed. Run: pip install openai'
        ) from exc

    model = getattr(settings, 'OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small')
    client = OpenAI(api_key=api_key)
    response = client.embeddings.create(
        model=model,
        input=normalized[:8000],
    )
    return list(response.data[0].embedding)


def semantic_score_from_vectors(
    student_vector: Sequence[float],
    offer_vector: Sequence[float],
) -> float:
    """Map cosine similarity to a 0–100 score."""
    return round(cosine_similarity(student_vector, offer_vector) * 100, 2)
