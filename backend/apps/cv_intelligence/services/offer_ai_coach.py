"""Offer-specific AI coach: CV/profile comparison and interview simulation."""

from __future__ import annotations

import logging
import uuid
from typing import Any

from apps.accounts_et_roles.models import StudentProfile
from apps.cv_intelligence.services.ai.analyzer import (
    evaluate_interview_answer,
    generate_offer_comparison,
    generate_offer_interview_questions,
)
from apps.cv_intelligence.services.orchestrator import build_student_context, get_active_report
from apps.cv_intelligence.services.matching.offer_matcher import compute_cv_offer_match
from apps.stage.models import InternshipOffer
from apps.stage.services.student_journey_service import get_match_for_offer

logger = logging.getLogger(__name__)


def _serialize_offer_context(offer: InternshipOffer) -> dict[str, Any]:
    meta = offer.metadata_json or {}
    return {
        'uuid': str(offer.uuid),
        'title': offer.title,
        'company': offer.company_name,
        'description': (offer.description or '')[:3000],
        'required_skills': offer.required_skills or [],
        'preferred_skills': offer.preferred_skills or [],
        'required_languages': offer.required_languages or [],
        'location': offer.location_city or '',
        'is_remote': offer.is_remote,
        'offer_type': offer.offer_type,
        'min_education_level': offer.min_education_level or '',
        'duration_months': offer.duration_months,
        'responsibilities': meta.get('responsibilities') or meta.get('missions') or '',
        'requirements': meta.get('requirements') or meta.get('profile') or '',
    }


def _build_rule_based_recommendations(
    *,
    missing_skills: list[str],
    profile_match: dict[str, Any],
    cv_match: dict[str, Any] | None,
) -> list[str]:
    recs: list[str] = []
    if missing_skills:
        recs.append(
            f'Mettez en avant ou acquérez : {", ".join(missing_skills[:4])}.',
        )
    if cv_match and cv_match.get('breakdown', {}).get('experience', 0) < 50:
        recs.append(
            'Ajoutez des projets ou stages pertinents dans votre CV pour renforcer votre expérience.',
        )
    if not profile_match.get('is_eligible'):
        recs.append(
            'Vérifiez votre éligibilité académique (filière, niveau, type de stage).',
        )
    if cv_match and cv_match.get('breakdown', {}).get('languages', 100) < 70:
        recs.append('Précisez vos niveaux de langues sur le CV et dans votre profil.')
    recs.append('Personnalisez votre lettre de motivation en citant la mission et l\'entreprise.')
    return recs[:6]


def build_offer_comparison(
    student: StudentProfile,
    offer: InternshipOffer,
    *,
    lang: str = 'fr',
) -> dict[str, Any]:
    """Compare student CV + profile against a specific internship offer."""
    profile_match = get_match_for_offer(student, offer)
    profile_percent = int(round(profile_match.get('score') or 0))

    report = get_active_report(student)
    structured: dict[str, Any] = {}
    if report and getattr(report, 'structured_data', None):
        structured = report.structured_data.structured_json or {}

    has_cv = bool(structured)
    cv_match: dict[str, Any] | None = None
    cv_percent = 0

    if has_cv:
        cv_match = compute_cv_offer_match(student, structured, offer)
        cv_percent = cv_match.get('matchPercent') or 0

    if has_cv and cv_percent:
        overall = int(round((profile_percent * 0.35) + (cv_percent * 0.65)))
    else:
        overall = profile_percent

    matched_skills = list(cv_match.get('matchedSkills') or []) if cv_match else []
    missing_skills = list(cv_match.get('missingSkills') or []) if cv_match else []
    if not missing_skills:
        missing_skills = list(profile_match.get('missing_skills') or [])

    student_context = build_student_context(student)
    offer_context = _serialize_offer_context(offer)

    ai_result, provider = generate_offer_comparison(
        student_context=student_context,
        structured=structured,
        offer=offer_context,
        profile_match=profile_match,
        cv_match=cv_match,
        lang=lang,
    )

    strengths = ai_result.get('strengths') or []
    gaps = ai_result.get('gaps') or []
    recommendations = ai_result.get('recommendations') or []
    summary = ai_result.get('summary') or ''

    if not strengths and matched_skills:
        strengths = [f'Compétence alignée : {s}' for s in matched_skills[:5]]
    if not gaps and missing_skills:
        gaps = [f'Compétence à développer : {s}' for s in missing_skills[:5]]
    if not recommendations:
        recommendations = _build_rule_based_recommendations(
            missing_skills=missing_skills,
            profile_match=profile_match,
            cv_match=cv_match,
        )
    if not summary:
        if cv_match and cv_match.get('explanation'):
            summary = cv_match['explanation']
        elif profile_match.get('reasons'):
            summary = ' · '.join(
                r.get('reason', '') for r in profile_match['reasons'][:3] if r.get('reason')
            )

    breakdown = (cv_match or {}).get('breakdown') or profile_match.get('breakdown') or {}

    return {
        'offer_uuid': str(offer.uuid),
        'offer_title': offer.title,
        'company': offer.company_name,
        'overall_match_percent': overall,
        'profile_match_percent': profile_percent,
        'cv_match_percent': cv_percent,
        'has_cv_analysis': has_cv,
        'is_eligible': profile_match.get('is_eligible', False),
        'summary': summary,
        'strengths': strengths[:6],
        'gaps': gaps[:6],
        'recommendations': recommendations[:6],
        'matched_skills': matched_skills[:12],
        'missing_skills': missing_skills[:12],
        'breakdown': breakdown,
        'provider': provider,
    }


def start_offer_interview_session(
    student: StudentProfile,
    offer: InternshipOffer,
    *,
    lang: str = 'fr',
    question_count: int = 5,
) -> dict[str, Any]:
    """Generate interview questions tailored to the offer."""
    report = get_active_report(student)
    structured: dict[str, Any] = {}
    if report and getattr(report, 'structured_data', None):
        structured = report.structured_data.structured_json or {}

    student_context = build_student_context(student)
    offer_context = _serialize_offer_context(offer)

    questions, provider = generate_offer_interview_questions(
        student_context=student_context,
        structured=structured,
        offer=offer_context,
        lang=lang,
        question_count=question_count,
    )

    session_id = str(uuid.uuid4())
    return {
        'session_id': session_id,
        'offer_uuid': str(offer.uuid),
        'offer_title': offer.title,
        'company': offer.company_name,
        'questions': questions,
        'total_questions': len(questions),
        'provider': provider,
    }


def evaluate_offer_interview_answer(
    student: StudentProfile,
    offer: InternshipOffer,
    *,
    question: dict[str, Any],
    answer: str,
    lang: str = 'fr',
) -> dict[str, Any]:
    """Evaluate a student's answer to an offer-specific interview question."""
    report = get_active_report(student)
    structured: dict[str, Any] = {}
    if report and getattr(report, 'structured_data', None):
        structured = report.structured_data.structured_json or {}

    student_context = build_student_context(student)
    offer_context = _serialize_offer_context(offer)

    feedback, provider = evaluate_interview_answer(
        student_context=student_context,
        structured=structured,
        offer=offer_context,
        question=question,
        answer=answer,
        lang=lang,
    )

    return {
        'question_id': question.get('id'),
        'feedback': feedback,
        'provider': provider,
    }
