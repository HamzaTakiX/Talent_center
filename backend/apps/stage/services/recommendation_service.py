"""Offer recommendation engine — student-side feeds with AI placeholder hooks."""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.db.models import Count
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.stage.models import InternshipOffer, OfferApplication, StudentOfferMatchScore
from apps.stage.models_extended import OfferRecommendation
from apps.stage.services.matching_service import compute_match_score, top_matches_for_student
from apps.stage.services.offer_lifecycle import PUBLICLY_VISIBLE_STATUSES, STUDENT_APPLYABLE_STATUSES

RECOMMENDATION_LIMIT = 20


def _upsert_recommendation(
    student: StudentProfile,
    offer: InternshipOffer,
    rec_type: str,
    score: Decimal,
    reasons: list,
) -> OfferRecommendation:
    obj, _ = OfferRecommendation.objects.update_or_create(
        student_profile=student,
        offer=offer,
        recommendation_type=rec_type,
        defaults={
            'score': score,
            'reasons_json': reasons,
            'expires_at': timezone.now() + timedelta(days=7),
            'is_dismissed': False,
        },
    )
    return obj


def generate_for_you(student: StudentProfile) -> list[OfferRecommendation]:
    scores = top_matches_for_student(student, limit=RECOMMENDATION_LIMIT)
    results = []
    for ms in scores:
        results.append(_upsert_recommendation(
            student, ms.offer, OfferRecommendation.RecommendationType.FOR_YOU,
            ms.score, ms.score_breakdown.get('required_skills', {}).get('matched', []),
        ))
    return results


def generate_trending() -> list[OfferRecommendation]:
    offers = (
        InternshipOffer.objects.filter(status__in=STUDENT_APPLYABLE_STATUSES)
        .order_by('-application_count', '-view_count')[:10]
    )
    # Stored without student — use profile-agnostic trending via metadata
    return list(offers)


def generate_recently_published(student: StudentProfile) -> list[OfferRecommendation]:
    since = timezone.now() - timedelta(days=14)
    offers = InternshipOffer.objects.filter(
        status__in=STUDENT_APPLYABLE_STATUSES,
        published_at__gte=since,
    ).order_by('-published_at')[:RECOMMENDATION_LIMIT]
    results = []
    for offer in offers:
        score, reasons, _ = compute_match_score(student, offer)
        results.append(_upsert_recommendation(
            student, offer, OfferRecommendation.RecommendationType.RECENT, score, reasons,
        ))
    return results


def generate_urgent(student: StudentProfile) -> list[OfferRecommendation]:
    window = timezone.now() + timedelta(days=7)
    offers = InternshipOffer.objects.filter(
        status__in=STUDENT_APPLYABLE_STATUSES,
        application_deadline__lte=window,
        application_deadline__gte=timezone.now(),
    ).order_by('application_deadline')[:RECOMMENDATION_LIMIT]
    results = []
    for offer in offers:
        score, reasons, _ = compute_match_score(student, offer)
        results.append(_upsert_recommendation(
            student, offer, OfferRecommendation.RecommendationType.URGENT, score, reasons,
        ))
    return results


def generate_based_on_applications(student: StudentProfile) -> list[OfferRecommendation]:
    applied_offer_ids = OfferApplication.objects.filter(
        student_profile=student,
    ).values_list('offer_id', flat=True)
    if not applied_offer_ids:
        return []
    sample = InternshipOffer.objects.filter(pk__in=applied_offer_ids).first()
    if not sample:
        return []
    similar = InternshipOffer.objects.filter(
        status__in=STUDENT_APPLYABLE_STATUSES,
        offer_type=sample.offer_type,
        company_name__icontains=sample.company_name.split()[0] if sample.company_name else '',
    ).exclude(pk__in=applied_offer_ids)[:10]
    results = []
    for offer in similar:
        score, reasons, _ = compute_match_score(student, offer)
        results.append(_upsert_recommendation(
            student, offer, OfferRecommendation.RecommendationType.APPLICATIONS, score, reasons,
        ))
    return results


def generate_all_recommendations(student: StudentProfile) -> dict:
    """
    INTEGRATION POINT: enrich with AIRecommendationProvider for semantic ranking.
    """
    return {
        'forYou': [r.pk for r in generate_for_you(student)],
        'recent': [r.pk for r in generate_recently_published(student)],
        'urgent': [r.pk for r in generate_urgent(student)],
        'basedOnApplications': [r.pk for r in generate_based_on_applications(student)],
    }


def _visible_offers_fallback(student: StudentProfile, limit: int = RECOMMENDATION_LIMIT) -> list[dict]:
    """Return published/open offers when no personalized recommendations exist yet."""
    offers = InternshipOffer.objects.filter(
        status__in=PUBLICLY_VISIBLE_STATUSES,
    ).order_by('-published_at', '-updated_at')[:limit]
    results = []
    for offer in offers:
        score, reasons, _ = compute_match_score(student, offer)
        results.append({
            'recommendation_type': OfferRecommendation.RecommendationType.RECENT,
            'score': float(score),
            'reasons': reasons if isinstance(reasons, list) else [],
            'offer_uuid': str(offer.uuid),
            'offer_title': offer.title,
            'company_name': offer.company_name,
        })
    return results


def get_student_recommendation_feed(student: StudentProfile, rec_type: str | None = None) -> list[dict]:
    qs = OfferRecommendation.objects.filter(
        student_profile=student,
        is_dismissed=False,
        expires_at__gte=timezone.now(),
    ).select_related('offer')
    if rec_type:
        qs = qs.filter(recommendation_type=rec_type)
    feed = [
        {
            'recommendation_type': r.recommendation_type,
            'score': float(r.score),
            'reasons': r.reasons_json,
            'offer_uuid': str(r.offer.uuid),
            'offer_title': r.offer.title,
            'company_name': r.offer.company_name,
        }
        for r in qs.order_by('-score')[:RECOMMENDATION_LIMIT]
    ]
    if not feed and rec_type is None:
        return _visible_offers_fallback(student)
    return feed
