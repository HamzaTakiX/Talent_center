"""PostgreSQL vector store for career coach RAG."""

from __future__ import annotations

import logging
import math
import re
from typing import Any

from apps.career_coach.models import RagChunk

logger = logging.getLogger(__name__)


def _cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    dot = sum(a * b for a, b in zip(left, right))
    norm_left = math.sqrt(sum(a * a for a in left))
    norm_right = math.sqrt(sum(b * b for b in right))
    if norm_left == 0 or norm_right == 0:
        return 0.0
    return dot / (norm_left * norm_right)


def _lexical_score(query: str, text: str) -> float:
    tokens = set(re.findall(r'\w+', query.lower()))
    if not tokens:
        return 0.0
    haystack = set(re.findall(r'\w+', text.lower()))
    if not haystack:
        return 0.0
    return len(tokens & haystack) / len(tokens)


def _embed_or_empty(texts: list[str]) -> list[list[float]]:
    try:
        from apps.career_coach.services.rag.embeddings import embed_texts
        return embed_texts(texts)
    except Exception as exc:
        logger.warning('Embedding failed, falling back to lexical ranking: %s', exc)
        return [[] for _ in texts]


def upsert_documents(
    student_id: int,
    documents: list[dict[str, Any]],
) -> int:
    """Upsert context chunks. Each doc: {id, text, metadata}."""
    if not documents:
        return 0

    texts = [d['text'] for d in documents]
    embeddings = _embed_or_empty(texts)

    for doc, vector in zip(documents, embeddings):
        RagChunk.objects.update_or_create(
            student_id=student_id,
            chunk_id=str(doc['id']),
            defaults={
                'text': doc['text'],
                'metadata': {**doc.get('metadata', {}), 'student_id': student_id},
                'embedding': vector or [],
            },
        )
    return len(documents)


def query_documents(student_id: int, query: str, *, top_k: int = 8) -> list[dict[str, Any]]:
    chunks = list(RagChunk.objects.filter(student_id=student_id))
    if not chunks:
        return []

    query_embedding: list[float] = []
    embedded = _embed_or_empty([query])
    if embedded and embedded[0]:
        query_embedding = embedded[0]

    scored: list[tuple[float, RagChunk]] = []
    use_vectors = bool(query_embedding) and any(c.embedding for c in chunks)
    for chunk in chunks:
        if use_vectors and chunk.embedding:
            score = _cosine_similarity(query_embedding, chunk.embedding)
        else:
            score = _lexical_score(query, chunk.text)
        scored.append((score, chunk))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [
        {
            'text': chunk.text,
            'metadata': chunk.metadata or {},
            'distance': 1 - score,
        }
        for score, chunk in scored[:top_k]
        if chunk.text
    ]
