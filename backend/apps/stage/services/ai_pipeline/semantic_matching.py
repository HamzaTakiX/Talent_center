"""Semantic score lookup for the rule-based matching engine."""

from __future__ import annotations

from decimal import Decimal

from apps.accounts_et_roles.models import StudentProfile
from apps.stage.models import InternshipOffer
from apps.stage.models_extended import SemanticEmbedding
from apps.stage.services.ai_pipeline.embedding_service import semantic_score_from_vectors


def get_semantic_match_score(
    student: StudentProfile,
    offer: InternshipOffer,
    *,
    student_emb: SemanticEmbedding | None = None,
    offer_emb: SemanticEmbedding | None = None,
) -> tuple[Decimal | None, dict]:
    if student_emb is None:
        student_emb = SemanticEmbedding.objects.filter(
            entity_type=SemanticEmbedding.EntityType.STUDENT,
            entity_id=student.pk,
        ).first()
    if offer_emb is None:
        offer_emb = SemanticEmbedding.objects.filter(
            entity_type=SemanticEmbedding.EntityType.OFFER,
            entity_id=offer.pk,
        ).first()
    if not student_emb or not offer_emb:
        return None, {'reason': 'Semantic embeddings not available', 'score': 0}

    score = Decimal(str(semantic_score_from_vectors(
        student_emb.vector_json or [],
        offer_emb.vector_json or [],
    )))
    return score, {
        'reason': f'Semantic similarity ({student_emb.embedding_model})',
        'score': float(score),
        'dimensions': student_emb.dimensions,
    }
