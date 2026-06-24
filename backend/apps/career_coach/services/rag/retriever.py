"""Retrieve relevant context chunks for a user question."""

from __future__ import annotations

import logging

from django.conf import settings

from apps.career_coach.services.rag.vector_store import query_documents

logger = logging.getLogger(__name__)


def retrieve_context(student_id: int, question: str, *, top_k: int | None = None) -> list[str]:
    if not getattr(settings, 'CAREER_COACH_RAG_ENABLED', True):
        return []
    k = top_k or getattr(settings, 'CAREER_COACH_RAG_TOP_K', 8)
    try:
        hits = query_documents(student_id, question, top_k=k)
        return [h['text'] for h in hits if h.get('text')]
    except Exception as exc:
        logger.warning('RAG retrieval failed: %s', exc)
        return []
