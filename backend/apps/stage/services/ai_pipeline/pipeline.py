"""Orchestrate PyMuPDF → GPT-4o Mini → embeddings → profile sync."""

from __future__ import annotations

import logging
from typing import Any

from django.conf import settings

from apps.accounts_et_roles.models import StudentProfile
from apps.stage.models import InternshipOffer
from apps.stage.models_extended import SemanticEmbedding

from .cv_structuring import structure_cv_text
from .embedding_service import generate_embedding
from .pdf_extractor import extract_text_from_pdf
from .profile_text import offer_profile_text, parsed_cv_text, student_profile_text

logger = logging.getLogger(__name__)


def _ai_enabled() -> bool:
    return bool(getattr(settings, 'OPENAI_API_KEY', ''))


def parse_cv_bytes(file_bytes: bytes, filename: str) -> dict[str, Any]:
    lower = (filename or '').lower()
    if lower.endswith('.pdf'):
        raw_text = extract_text_from_pdf(file_bytes)
    else:
        raw_text = file_bytes.decode('utf-8', errors='ignore')

    if not raw_text.strip():
        return {'skills': [], 'filename': filename, 'error': 'empty_document'}

    if not _ai_enabled():
        return {'skills': [], 'filename': filename, 'raw_text': raw_text[:500], 'mock': True}

    parsed = structure_cv_text(raw_text)
    parsed['filename'] = filename
    parsed['raw_text_length'] = len(raw_text)
    return parsed


def upsert_embedding(
    *,
    entity_type: str,
    entity_id: int,
    source_text: str,
    model_name: str = '',
) -> SemanticEmbedding | None:
    if not _ai_enabled() or not source_text.strip():
        return None

    model = model_name or getattr(settings, 'OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small')
    vector = generate_embedding(source_text)
    if not vector:
        return None

    obj, _ = SemanticEmbedding.objects.update_or_create(
        entity_type=entity_type,
        entity_id=entity_id,
        defaults={
            'embedding_model': model,
            'source_text_hash': SemanticEmbedding.hash_text(source_text),
            'vector_json': vector,
            'dimensions': len(vector),
        },
    )
    return obj


def sync_student_from_parsed_cv(student: StudentProfile, parsed: dict[str, Any]) -> StudentProfile:
    if parsed.get('professional_summary'):
        student.professional_summary = parsed['professional_summary']
    if parsed.get('career_objective'):
        student.career_objective = parsed['career_objective']
    if parsed.get('skills'):
        existing = set(str(s).lower() for s in (student.skills or []))
        merged = list(student.skills or [])
        for skill in parsed['skills']:
            if skill.lower() not in existing:
                merged.append(skill)
        student.skills = merged
    student.save(update_fields=[
        'professional_summary', 'career_objective', 'skills',
    ])
    return student


def index_student_profile(student: StudentProfile, *, parsed_cv: dict | None = None) -> SemanticEmbedding | None:
    text_parts = []
    if parsed_cv:
        cv_text = parsed_cv_text(parsed_cv)
        if cv_text:
            text_parts.append(cv_text)
    profile_text = student_profile_text(student)
    if profile_text:
        text_parts.append(profile_text)
    combined = '\n\n'.join(text_parts).strip()
    return upsert_embedding(
        entity_type=SemanticEmbedding.EntityType.STUDENT,
        entity_id=student.pk,
        source_text=combined,
    )


def index_offer(offer: InternshipOffer) -> SemanticEmbedding | None:
    return upsert_embedding(
        entity_type=SemanticEmbedding.EntityType.OFFER,
        entity_id=offer.pk,
        source_text=offer_profile_text(offer),
    )


def process_cv_upload(student: StudentProfile, file_bytes: bytes, filename: str) -> dict[str, Any]:
    """Full pipeline: extract → structure → sync profile → embed."""
    try:
        parsed = parse_cv_bytes(file_bytes, filename)
        if parsed.get('mock') or parsed.get('error'):
            return parsed
        sync_student_from_parsed_cv(student, parsed)
        index_student_profile(student, parsed_cv=parsed)
        from apps.stage.services.matching_service import recalculate_matches_for_student
        recalculate_matches_for_student(student, trigger='PROFILE_UPDATED')
        return parsed
    except Exception:
        logger.exception('CV AI pipeline failed for student %s', student.pk)
        return {'skills': [], 'filename': filename, 'error': 'pipeline_failed'}


def process_offer_publish(offer: InternshipOffer) -> SemanticEmbedding | None:
    try:
        return index_offer(offer)
    except Exception:
        logger.exception('Offer embedding failed for offer %s', offer.pk)
        return None
