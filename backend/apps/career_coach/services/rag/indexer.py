"""Index student knowledge into PostgreSQL for RAG retrieval."""

from __future__ import annotations

import logging
from typing import Any

from apps.career_coach.services.rag.vector_store import upsert_documents

logger = logging.getLogger(__name__)


def index_student_context(student_id: int, context: dict[str, Any]) -> int:
    """Convert aggregated context dict into searchable chunks."""
    documents: list[dict[str, Any]] = []

    def add_chunk(chunk_id: str, text: str, source: str, extra: dict | None = None):
        if not text or not text.strip():
            return
        meta = {'source': source, **(extra or {})}
        documents.append({'id': chunk_id, 'text': text.strip(), 'metadata': meta})

    profile = context.get('profile') or {}
    if profile:
        lines = [
            f"Program: {profile.get('program', 'N/A')}",
            f"Class: {profile.get('class', 'N/A')}",
            f"Level: {profile.get('level', 'N/A')}",
            f"Department: {profile.get('department', 'N/A')}",
            f"Specialization: {profile.get('specialization', 'N/A')}",
            f"Skills: {', '.join(profile.get('skills') or []) or 'N/A'}",
            f"Languages: {', '.join(profile.get('languages') or []) or 'N/A'}",
            f"Location: {profile.get('location', 'N/A')}",
            f"Career objective: {profile.get('career_objective', 'N/A')}",
        ]
        add_chunk('profile', '\n'.join(lines), 'profile')

    cv = context.get('cv') or {}
    if cv:
        add_chunk(
            'cv_summary',
            f"CV: {cv.get('title', 'Untitled')}. Score: {cv.get('cv_score', 'N/A')}. "
            f"ATS: {cv.get('ats_score', 'N/A')}. Summary: {cv.get('summary', '')}",
            'cv',
        )
        for i, strength in enumerate(cv.get('strengths') or []):
            add_chunk(f'cv_strength_{i}', f"CV Strength: {strength}", 'cv_analysis')
        for i, weakness in enumerate(cv.get('weaknesses') or []):
            add_chunk(f'cv_weakness_{i}', f"CV Weakness: {weakness}", 'cv_analysis')
        for i, rec in enumerate(cv.get('recommendations') or []):
            add_chunk(f'cv_rec_{i}', f"CV Recommendation: {rec}", 'cv_analysis')

    for i, offer in enumerate(context.get('offers') or []):
        add_chunk(
            f'offer_{offer.get("id", i)}',
            (
                f"Offer: {offer.get('title', 'N/A')} at {offer.get('company', 'N/A')}. "
                f"Match score: {offer.get('match_score', 'N/A')}%. "
                f"Required skills: {', '.join(offer.get('required_skills') or [])}. "
                f"Status: {offer.get('application_status', 'not applied')}."
            ),
            'internship',
            {'offer_id': str(offer.get('id', ''))},
        )

    for i, app in enumerate(context.get('applications') or []):
        add_chunk(
            f'app_{app.get("id", i)}',
            (
                f"Application to {app.get('offer_title', 'N/A')} at {app.get('company', 'N/A')}. "
                f"Status: {app.get('status', 'N/A')}. Match: {app.get('match_score', 'N/A')}%."
            ),
            'application',
        )

    interview = context.get('interview') or {}
    if interview:
        add_chunk(
            'interview',
            (
                f"Interview readiness: {interview.get('readiness', 'N/A')}. "
                f"Weak areas: {', '.join(interview.get('weak_areas') or []) or 'N/A'}. "
                f"Previous scores: {interview.get('previous_scores', 'N/A')}."
            ),
            'interview',
        )

    current_offer = context.get('current_offer')
    if current_offer:
        add_chunk(
            'current_offer',
            (
                f"Current offer context: {current_offer.get('title')} at {current_offer.get('company')}. "
                f"Match score: {current_offer.get('match_score')}%. "
                f"Requirements: {current_offer.get('requirements', '')}. "
                f"Breakdown: {current_offer.get('score_breakdown', '')}."
            ),
            'current_offer',
            {'offer_id': str(current_offer.get('id', ''))},
        )

    try:
        return upsert_documents(student_id, documents)
    except Exception as exc:
        logger.warning('RAG indexing failed for student %s: %s', student_id, exc)
        return 0
