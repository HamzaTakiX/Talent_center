"""Offer recommendation engine — student-side feeds with AI placeholder hooks."""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.services.internship_resolver import ensure_student_internship_synced
from apps.stage.models import InternshipOffer, OfferApplication, StudentOfferMatchScore
from apps.stage.models_extended import OfferRecommendation
from apps.stage.services.matching_service import (
    compute_match_score,
    offer_matches_student_internship_type,
)
from apps.stage.services.offer_lifecycle import PUBLICLY_VISIBLE_STATUSES, STUDENT_APPLYABLE_STATUSES

RECOMMENDATION_LIMIT = 20
FALLBACK_MIN_MATCH_SCORE = 50


def _offer_company_logo_url(offer: InternshipOffer) -> str | None:
    if offer.company_logo:
        return offer.company_logo.url
    meta_logo = (offer.metadata_json or {}).get('company_logo')
    if isinstance(meta_logo, str) and meta_logo.strip():
        return meta_logo.strip()
    return None


def _serialize_recommendation_entry(offer: InternshipOffer, **fields) -> dict:
    return {
        'offer_uuid': str(offer.uuid),
        'offer_title': offer.title,
        'company_name': offer.company_name,
        'company_logo_url': _offer_company_logo_url(offer),
        'location_city': offer.location_city or '',
        'location_country': offer.location_country or '',
        'offer_type': offer.offer_type or '',
        'required_skills': list(offer.required_skills or [])[:3],
        **fields,
    }


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


def _collect_scored_offers(
    student: StudentProfile,
    *,
    limit: int = 100,
) -> list[tuple[InternshipOffer, float, list]]:
    """Return visible offers with match scores, highest first."""
    scored: list[tuple[InternshipOffer, float, list]] = []
    seen_offer_ids: set[int] = set()

    match_rows = (
        StudentOfferMatchScore.objects.filter(
            student_profile=student,
            offer__status__in=PUBLICLY_VISIBLE_STATUSES,
        )
        .select_related('offer')
        .prefetch_related('offer__targeting_rules')
        .order_by('-score')[:limit]
    )
    for row in match_rows:
        scored.append((row.offer, float(row.score), []))
        seen_offer_ids.add(row.offer_id)

    if len(scored) < limit:
        remaining = limit - len(scored)
        offers = (
            InternshipOffer.objects.filter(status__in=PUBLICLY_VISIBLE_STATUSES)
            .exclude(pk__in=seen_offer_ids)
            .prefetch_related('targeting_rules')
            .order_by('-published_at', '-updated_at')[:remaining]
        )
        for offer in offers:
            score, reasons, _ = compute_match_score(student, offer)
            score_value = float(score)
            if score_value <= 0:
                continue
            scored.append((offer, score_value, reasons if isinstance(reasons, list) else []))

    scored.sort(key=lambda item: -item[1])
    return scored


def build_recommended_offers_feed(student: StudentProfile) -> list[dict]:
    """
    Recommended offers for the student portal:
    1. Same internship type as the student, sorted by match score.
    2. If none, offers with match score > 50%, sorted by score.
    """
    ensure_student_internship_synced(student)
    student = StudentProfile.objects.select_related('internship_type').get(pk=student.pk)

    scored_offers = _collect_scored_offers(student)
    same_type = [
        item for item in scored_offers
        if offer_matches_student_internship_type(student, item[0])
    ]

    if same_type:
        selected = same_type[:RECOMMENDATION_LIMIT]
    else:
        selected = [
            item for item in scored_offers
            if item[1] > FALLBACK_MIN_MATCH_SCORE
        ][:RECOMMENDATION_LIMIT]

    return [
        _serialize_recommendation_entry(
            offer,
            recommendation_type=OfferRecommendation.RecommendationType.FOR_YOU,
            score=score,
            reasons=reasons,
        )
        for offer, score, reasons in selected
    ]


def generate_for_you(student: StudentProfile) -> list[OfferRecommendation]:
    results = []
    for entry in build_recommended_offers_feed(student):
        offer = InternshipOffer.objects.get(uuid=entry['offer_uuid'])
        results.append(_upsert_recommendation(
            student,
            offer,
            OfferRecommendation.RecommendationType.FOR_YOU,
            Decimal(str(entry['score'])),
            entry.get('reasons', []),
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
    """Fallback when personalized recommendations are requested before scores exist."""
    return build_recommended_offers_feed(student)[:limit]


def get_student_recommendation_feed(student: StudentProfile, rec_type: str | None = None) -> list[dict]:
    if rec_type is None:
        return build_recommended_offers_feed(student)

    qs = OfferRecommendation.objects.filter(
        student_profile=student,
        is_dismissed=False,
        expires_at__gte=timezone.now(),
    ).select_related('offer')
    qs = qs.filter(recommendation_type=rec_type)
    return [
        _serialize_recommendation_entry(
            r.offer,
            recommendation_type=r.recommendation_type,
            score=float(r.score),
            reasons=r.reasons_json,
        )
        for r in qs.order_by('-score')[:RECOMMENDATION_LIMIT]
    ]
