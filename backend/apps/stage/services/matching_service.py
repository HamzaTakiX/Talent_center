"""
Offer ↔ Student matching engine.

Score generation (0–100):
- Skills overlap (required 40%, preferred 20%)
- Program / internship type alignment (20%)
- Education level fit (10%)
- Location / mobility preferences (10%)

Each dimension produces a MatchReason entry explaining the contribution.
"""

from __future__ import annotations

import re
from decimal import Decimal
from typing import Any, Optional

from django.db.models import QuerySet

from apps.accounts_et_roles.models import StudentProfile
from apps.stage.models import InternshipOffer, MatchingHistory, OfferTargetingRule, StudentOfferMatchScore

# Weight configuration
WEIGHTS = {
    'required_skills': Decimal('40'),
    'preferred_skills': Decimal('20'),
    'internship_type': Decimal('20'),
    'education_level': Decimal('10'),
    'location': Decimal('10'),
}

# When vector embeddings exist, blend rule-based score with semantic score.
SEMANTIC_BLEND_WEIGHT = Decimal('0.30')

EDUCATION_RANK = {
    '': 0,
    'BAC': 1,
    'BAC_PLUS_2': 2,
    'LICENCE': 3,
    'MASTER': 4,
    'INGENIEUR': 5,
    'DOCTORAT': 6,
}


def _normalize_skills(skills: list) -> set[str]:
    return {str(s).strip().lower() for s in (skills or []) if str(s).strip()}


def _score_skills(required: set[str], candidate: set[str], weight: Decimal) -> tuple[Decimal, dict]:
    if not required:
        return weight, {'reason': 'No required skills specified', 'matched': [], 'score': float(weight)}
    matched = required & candidate
    ratio = Decimal(len(matched)) / Decimal(len(required))
    points = (ratio * weight).quantize(Decimal('0.01'))
    return points, {
        'reason': f'Matched {len(matched)}/{len(required)} required skills',
        'matched': sorted(matched),
        'score': float(points),
        'weight': float(weight),
    }


def _normalize_type_token(value: str) -> str:
    return re.sub(r'[\s_\-]+', '', (value or '').strip().lower())


def offer_matches_student_internship_type(student: StudentProfile, offer: InternshipOffer) -> bool:
    """True when the offer targets the same internship type as the student."""
    student_type = getattr(student, 'internship_type', None)
    if not student_type:
        return False

    student_tokens = {
        _normalize_type_token(student_type.code),
        _normalize_type_token(student_type.name),
    }
    student_tokens.discard('')

    offer_token = _normalize_type_token(offer.offer_type or '')
    if offer_token:
        if offer_token in student_tokens:
            return True
        if any(
            token and (token in offer_token or offer_token in token)
            for token in student_tokens
        ):
            return True

    internship_rules = offer.targeting_rules.filter(
        is_active=True,
        rule_type=OfferTargetingRule.RuleType.INTERNSHIP_TYPE,
    )
    if internship_rules.exists():
        from apps.stage.services.targeting_service import _student_matches_rule

        return any(_student_matches_rule(student, rule) for rule in internship_rules)

    type_pts, _ = _score_internship_type(student, offer)
    return type_pts >= WEIGHTS['internship_type']


def _score_internship_type(student: StudentProfile, offer: InternshipOffer) -> tuple[Decimal, dict]:
    weight = WEIGHTS['internship_type']
    student_type = getattr(student, 'internship_type', None)
    if not student_type:
        return Decimal('0'), {'reason': 'Student internship type unknown', 'score': 0}
    offer_type_map = {
        InternshipOffer.OfferType.PFE: ['pfe', 'fin etudes', 'fin d\'études'],
        InternshipOffer.OfferType.PFA: ['pfa', 'fin annee'],
        InternshipOffer.OfferType.INTERNSHIP: ['stage', 'internship'],
        InternshipOffer.OfferType.ALTERNANCE: ['alternance'],
    }
    keywords = offer_type_map.get(offer.offer_type, [])
    type_name = (student_type.name or '').lower()
    type_code = (student_type.code or '').lower()
    if any(k in type_name or k in type_code for k in keywords):
        return weight, {'reason': f'Internship type aligned ({student_type.name})', 'score': float(weight)}
    return Decimal('5'), {'reason': 'Partial internship type alignment', 'score': 5}


def _score_education(student: StudentProfile, offer: InternshipOffer) -> tuple[Decimal, dict]:
    weight = WEIGHTS['education_level']
    min_level = offer.min_education_level or ''
    student_level = ''
    if student.academic_level:
        student_level = getattr(student.academic_level, 'code', '') or ''
    student_rank = EDUCATION_RANK.get(student_level.upper()[:10], 3)
    required_rank = EDUCATION_RANK.get(min_level, 0)
    if not required_rank:
        return weight, {'reason': 'No minimum education specified', 'score': float(weight)}
    if student_rank >= required_rank:
        return weight, {'reason': 'Education level meets requirement', 'score': float(weight)}
    gap = required_rank - student_rank
    partial = max(Decimal('0'), weight - Decimal(gap * 3))
    return partial, {'reason': f'Education gap: {gap} level(s)', 'score': float(partial)}


_RELOCATION_MOBILITY = frozenset({'national', 'international', 'high'})


def _student_mobility_tokens(student: StudentProfile) -> set[str]:
    raw = getattr(student, 'mobility', None) or []
    if isinstance(raw, str):
        parts = [p.strip() for p in raw.split(',') if p.strip()]
    elif isinstance(raw, list):
        parts = [str(p).strip() for p in raw if str(p).strip()]
    else:
        parts = []
    return {p.lower().replace(' ', '_').replace('-', '_') for p in parts}


def _score_location(student: StudentProfile, offer: InternshipOffer) -> tuple[Decimal, dict]:
    weight = WEIGHTS['location']
    if offer.is_remote:
        return weight, {'reason': 'Remote offer — full location score', 'score': float(weight)}
    mobility = _student_mobility_tokens(student)
    city = (offer.location_city or '').lower()
    student_city = (getattr(student, 'city', '') or '').lower()
    if city and student_city and city == student_city:
        return weight, {'reason': f'Same city: {offer.location_city}', 'score': float(weight)}
    if mobility & _RELOCATION_MOBILITY:
        return (weight * Decimal('0.8')).quantize(Decimal('0.01')), {
            'reason': 'Student mobility supports relocation',
            'score': float(weight * Decimal('0.8')),
        }
    return Decimal('3'), {'reason': 'Location mismatch', 'score': 3}


def _passes_targeting(student: StudentProfile, offer: InternshipOffer) -> bool:
    rules = offer.targeting_rules.filter(is_active=True)
    if not rules.exists():
        return True
    for rule in rules:
        payload = rule.value_json or {}
        if rule.rule_type == OfferTargetingRule.RuleType.LEVEL:
            codes = payload.get('level_codes', [])
            level_code = getattr(getattr(student, 'academic_level', None), 'code', '')
            match = level_code in codes
            if rule.is_inclusive and not match:
                return False
            if not rule.is_inclusive and match:
                return False
    return True


def compute_match_score(
    student: StudentProfile,
    offer: InternshipOffer,
) -> tuple[Decimal, list[dict[str, Any]], dict[str, Any]]:
    if not _passes_targeting(student, offer):
        return Decimal('0'), [{'reason': 'Excluded by targeting rules', 'score': 0}], {}

    candidate_skills = _normalize_skills(getattr(student, 'skills', []) or [])
    required = _normalize_skills(offer.required_skills)
    preferred = _normalize_skills(offer.preferred_skills)

    breakdown: dict[str, Any] = {}
    reasons: list[dict[str, Any]] = []
    total = Decimal('0')

    req_pts, req_reason = _score_skills(required, candidate_skills, WEIGHTS['required_skills'])
    total += req_pts
    breakdown['required_skills'] = req_reason
    reasons.append({'dimension': 'required_skills', **req_reason})

    pref_pts, pref_reason = _score_skills(preferred, candidate_skills, WEIGHTS['preferred_skills'])
    total += pref_pts
    breakdown['preferred_skills'] = pref_reason
    reasons.append({'dimension': 'preferred_skills', **pref_reason})

    type_pts, type_reason = _score_internship_type(student, offer)
    total += type_pts
    breakdown['internship_type'] = type_reason
    reasons.append({'dimension': 'internship_type', **type_reason})

    edu_pts, edu_reason = _score_education(student, offer)
    total += edu_pts
    breakdown['education_level'] = edu_reason
    reasons.append({'dimension': 'education_level', **edu_reason})

    loc_pts, loc_reason = _score_location(student, offer)
    total += loc_pts
    breakdown['location'] = loc_reason
    reasons.append({'dimension': 'location', **loc_reason})

    from apps.stage.services.ai_pipeline.semantic_matching import get_semantic_match_score

    semantic_score, semantic_reason = get_semantic_match_score(student, offer)
    if semantic_score is not None:
        breakdown['semantic'] = semantic_reason
        reasons.append({'dimension': 'semantic', **semantic_reason})
        rule_weight = Decimal('1') - SEMANTIC_BLEND_WEIGHT
        total = (total * rule_weight + semantic_score * SEMANTIC_BLEND_WEIGHT).quantize(Decimal('0.01'))

    total = min(total, Decimal('100')).quantize(Decimal('0.01'))
    return total, reasons, breakdown


def persist_match_score(
    student: StudentProfile,
    offer: InternshipOffer,
    *,
    trigger: str = MatchingHistory.Trigger.MANUAL,
    previous: StudentOfferMatchScore | None = None,
) -> StudentOfferMatchScore:
    score, reasons, breakdown = compute_match_score(student, offer)
    obj, _ = StudentOfferMatchScore.objects.update_or_create(
        student_profile=student,
        offer=offer,
        defaults={
            'score': score,
            'score_breakdown': breakdown,
            'is_recommended': score >= Decimal('70'),
        },
    )
    MatchingHistory.objects.create(
        student_profile=student,
        offer=offer,
        previous_score=previous.score if previous else None,
        new_score=score,
        match_reasons=reasons,
        trigger=trigger,
    )
    return obj


def get_match_score(student: StudentProfile, offer: InternshipOffer) -> Decimal | None:
    existing = StudentOfferMatchScore.objects.filter(
        student_profile=student,
        offer=offer,
    ).first()
    if existing:
        return existing.score
    obj = persist_match_score(student, offer, trigger=MatchingHistory.Trigger.APPLICATION)
    return obj.score


def recalculate_matches_for_offer(
    offer: InternshipOffer,
    *,
    trigger: str = MatchingHistory.Trigger.OFFER_PUBLISHED,
    students: QuerySet[StudentProfile] | None = None,
) -> int:
    from apps.accounts_et_roles.models import User

    qs = students or StudentProfile.objects.filter(
        user__is_active=True,
        user__role=User.RoleChoices.STUDENT,
    )
    count = 0
    for student in qs.select_related('internship_type', 'academic_level')[:5000]:
        previous = StudentOfferMatchScore.objects.filter(student_profile=student, offer=offer).first()
        persist_match_score(student, offer, trigger=trigger, previous=previous)
        count += 1
    return count


def recalculate_matches_for_student(
    student: StudentProfile,
    *,
    trigger: str = MatchingHistory.Trigger.PROFILE_UPDATED,
) -> int:
    offers = InternshipOffer.objects.filter(
        status__in=[InternshipOffer.Status.OPEN, InternshipOffer.Status.PUBLISHED],
    )
    count = 0
    for offer in offers[:500]:
        previous = StudentOfferMatchScore.objects.filter(student_profile=student, offer=offer).first()
        persist_match_score(student, offer, trigger=trigger, previous=previous)
        count += 1
    return count


def top_matches_for_student(student: StudentProfile, limit: int = 10) -> list[StudentOfferMatchScore]:
    return list(
        StudentOfferMatchScore.objects.filter(student_profile=student)
        .select_related('offer')
        .order_by('-score')[:limit]
    )


def top_matches_for_offer(offer: InternshipOffer, limit: int = 10) -> list[StudentOfferMatchScore]:
    return list(
        StudentOfferMatchScore.objects.filter(offer=offer)
        .select_related('student_profile')
        .order_by('-score')[:limit]
    )
