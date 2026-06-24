"""Production OpenAI providers for CV parsing, semantic search, and AI matching."""

from __future__ import annotations

from typing import Any

from django.conf import settings

from apps.stage.integrations import (
    AIMatchingProvider,
    CVParsingProvider,
    SemanticSearchProvider,
)
from apps.stage.models import InternshipOffer
from apps.stage.models_extended import SemanticEmbedding
from apps.stage.services.ai_pipeline.embedding_service import (
    cosine_similarity,
    semantic_score_from_vectors,
)
from apps.stage.services.ai_pipeline.pipeline import parse_cv_bytes
from apps.stage.services.offer_lifecycle import STUDENT_APPLYABLE_STATUSES


class OpenAICVParsingProvider(CVParsingProvider):
    name = 'openai'

    def parse_cv(self, file_bytes: bytes, filename: str) -> dict[str, Any]:
        return parse_cv_bytes(file_bytes, filename)


class OpenAISemanticSearchProvider(SemanticSearchProvider):
    name = 'openai'

    def search_offers(self, query: str, limit: int = 20) -> list[dict]:
        if not getattr(settings, 'OPENAI_API_KEY', '') or not query.strip():
            return []

        from apps.stage.services.ai_pipeline.embedding_service import generate_embedding

        query_vector = generate_embedding(query)
        if not query_vector:
            return []

        offer_ids = (
            InternshipOffer.objects.filter(status__in=STUDENT_APPLYABLE_STATUSES)
            .values_list('pk', flat=True)[:500]
        )
        embeddings = SemanticEmbedding.objects.filter(
            entity_type=SemanticEmbedding.EntityType.OFFER,
            entity_id__in=offer_ids,
        )
        scored: list[tuple[float, SemanticEmbedding]] = []
        for emb in embeddings:
            sim = cosine_similarity(query_vector, emb.vector_json or [])
            scored.append((sim, emb))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for sim, emb in scored[:limit]:
            try:
                offer = InternshipOffer.objects.get(pk=emb.entity_id)
            except InternshipOffer.DoesNotExist:
                continue
            results.append({
                'offer_uuid': str(offer.uuid),
                'title': offer.title,
                'company_name': offer.company_name,
                'semantic_score': round(sim * 100, 2),
            })
        return results


class OpenAIMatchingProvider(AIMatchingProvider):
    name = 'openai'

    def score_semantic_fit(self, student_profile: dict, offer: dict) -> float:
        student_id = student_profile.get('id') or student_profile.get('student_profile_id')
        offer_id = offer.get('id') or offer.get('offer_id')
        if not student_id or not offer_id:
            return 0.0

        student_emb = SemanticEmbedding.objects.filter(
            entity_type=SemanticEmbedding.EntityType.STUDENT,
            entity_id=student_id,
        ).first()
        offer_emb = SemanticEmbedding.objects.filter(
            entity_type=SemanticEmbedding.EntityType.OFFER,
            entity_id=offer_id,
        ).first()
        if not student_emb or not offer_emb:
            return 0.0
        return semantic_score_from_vectors(
            student_emb.vector_json or [],
            offer_emb.vector_json or [],
        )
