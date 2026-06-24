"""Main CV Intelligence orchestrator."""

from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from django.db.models import Max

from apps.accounts_et_roles.models import StudentProfile
from apps.cv_builder.models import StudentCv
from apps.cv_intelligence.constants import AnalysisStatus, CvSourceType
from apps.cv_intelligence.models import CvIntelligenceReport, CvStructuredData

from .ai.analyzer import (
    analyze_semantic_profile,
    analyze_swot,
    generate_interview_prep,
    generate_roadmap,
    generate_score_explanations,
)
from .ai.ollama_client import OllamaClient, get_intelligence_config, get_ollama_client
from .cv_hash import compute_cv_hash_from_builder, compute_cv_hash_from_bytes
from .dashboard_builder import build_dashboard_payload
from .extraction.orchestrator import (
    extract_from_builder,
    extract_from_bytes,
    merge_structured_with_profile,
)
from .language.detector import detect_languages, primary_language
from .matching.missing_skills import compute_missing_skills
from .matching.offer_matcher import compute_cv_offer_matches
from .notifications import emit_analysis_notifications
from .scoring.ats_engine import analyze_ats
from .scoring.score_engine import compute_scores

logger = logging.getLogger(__name__)


class AiCircuitBreaker:
    """Disable further Ollama calls after the first failure in a run."""

    def __init__(self, enabled: bool) -> None:
        self.enabled = enabled

    def trip(self) -> None:
        if self.enabled:
            logger.info('CV Intelligence: Ollama circuit breaker tripped — using rule-based for remaining steps')
        self.enabled = False

    def kwargs(self, client: OllamaClient | None) -> dict[str, Any]:
        return {'client': client, 'ai_enabled': self.enabled}


def _trip_if_rule_based(breaker: AiCircuitBreaker, model: str, ai_expected: bool) -> None:
    if ai_expected and model == 'rule-based':
        breaker.trip()


def build_student_context(student: StudentProfile) -> dict[str, Any]:
    user = student.user
    profile = getattr(user, 'profile', None)
    return {
        'full_name': f'{getattr(profile, "first_name", "") or ""} {getattr(profile, "last_name", "") or ""}'.strip(),
        'email': getattr(user, 'email', '') or '',
        'phone': getattr(profile, 'phone', '') or '',
        'filiere': getattr(getattr(student, 'filiere', None), 'name', '') or '',
        'program': getattr(getattr(student, 'class_group', None), 'name', '') or '',
        'academic_level': getattr(getattr(student, 'academic_level', None), 'code', '') or '',
        'internship_type': getattr(getattr(student, 'internship_type', None), 'name', '') or '',
        'career_objective': getattr(student, 'career_objective', '') or '',
        'professional_summary': getattr(student, 'professional_summary', '') or '',
        'city': getattr(student, 'city', '') or '',
        'skills': getattr(student, 'skills', []) or [],
    }


def find_cached_report(student: StudentProfile, cv_hash: str) -> CvIntelligenceReport | None:
    """Return a completed report for the same CV content — no AI re-run."""
    if not cv_hash:
        return None
    return (
        CvIntelligenceReport.objects.filter(
            student_profile=student,
            cv_hash=cv_hash,
            status=AnalysisStatus.COMPLETED,
        )
        .select_related('structured_data')
        .order_by('-analyzed_at')
        .first()
    )


def get_active_report(student: StudentProfile) -> CvIntelligenceReport | None:
    report = (
        CvIntelligenceReport.objects.filter(
            student_profile=student,
            is_active=True,
        )
        .select_related('structured_data')
        .order_by('-analyzed_at')
        .first()
    )
    if report:
        return report
    return (
        CvIntelligenceReport.objects.filter(
            student_profile=student,
            status=AnalysisStatus.COMPLETED,
        )
        .select_related('structured_data')
        .order_by('-analyzed_at')
        .first()
    )


def resolve_analysis_status(
    report: CvIntelligenceReport | None,
    current_cv_hash: str,
) -> str:
    if not report:
        return 'none'
    if report.status in (AnalysisStatus.PENDING, AnalysisStatus.RUNNING):
        return 'processing'
    if report.status == AnalysisStatus.FAILED:
        return 'failed'
    if current_cv_hash and report.cv_hash and current_cv_hash != report.cv_hash:
        return 'outdated'
    return 'up_to_date'


def run_cv_intelligence_analysis(
    *,
    student: StudentProfile,
    source_type: str,
    builder_payload: dict[str, Any] | None = None,
    file_bytes: bytes | None = None,
    filename: str = '',
    student_cv: StudentCv | None = None,
    lang: str | None = None,
    persist: bool = True,
    emit_notifications: bool = True,
    force: bool = False,
) -> CvIntelligenceReport:
    """Run the full CV Intelligence pipeline."""
    config = get_intelligence_config()
    provider = config.get('provider', 'rule-based')

    if source_type == CvSourceType.BUILDER and builder_payload:
        cv_hash = compute_cv_hash_from_builder(builder_payload)
        structured, raw_text, meta = extract_from_builder(builder_payload)
    elif file_bytes:
        cv_hash = compute_cv_hash_from_bytes(file_bytes)
        structured, raw_text, meta = extract_from_bytes(file_bytes, filename)
        source_type = meta.get('source_type', CvSourceType.PDF)
    else:
        raise ValueError('No CV source provided')

    if not force:
        cached = find_cached_report(student, cv_hash)
        if cached:
            if not cached.is_active:
                CvIntelligenceReport.objects.filter(
                    student_profile=student, is_active=True,
                ).update(is_active=False)
                cached.is_active = True
                cached.save(update_fields=['is_active', 'updated_at'])
            return cached

    structured = merge_structured_with_profile(structured, student)
    languages = detect_languages(raw_text)
    response_lang = lang or primary_language(raw_text)

    ats_analysis = analyze_ats(structured, raw_text)
    student_context = build_student_context(student)
    scores = compute_scores(structured, ats_analysis, student_context)

    ai_available = bool(config.get('ai_available'))
    light_ai = bool(getattr(settings, 'CV_INTELLIGENCE_LIGHT_AI', True))
    ai_client = None
    if ai_available:
        ai_client = get_ollama_client()
        ai_client.warm_model()

    breaker = AiCircuitBreaker(ai_available)

    # Offer matching is CPU/DB bound — run in background while Ollama steps execute serially.
    with ThreadPoolExecutor(max_workers=1) as pool:
        matches_future = pool.submit(compute_cv_offer_matches, student, structured)

        semantic_profile, semantic_model = analyze_semantic_profile(
            structured, student_context, languages, response_lang,
            **breaker.kwargs(ai_client),
        )
        _trip_if_rule_based(breaker, semantic_model, ai_available)

        swot, swot_model = analyze_swot(
            structured, student_context, languages, response_lang,
            **breaker.kwargs(ai_client),
        )
        _trip_if_rule_based(breaker, swot_model, ai_available)

        if light_ai:
            score_explanations, _ = generate_score_explanations(
                structured, scores, ats_analysis, response_lang,
                ai_enabled=False,
            )
        else:
            score_explanations, score_model = generate_score_explanations(
                structured, scores, ats_analysis, response_lang,
                **breaker.kwargs(ai_client),
            )
            _trip_if_rule_based(breaker, score_model, ai_available)

        matches = matches_future.result()

    missing_skills, recommended_skills = compute_missing_skills(student, structured, matches)

    if light_ai:
        roadmap, _ = generate_roadmap(
            structured, swot, scores, response_lang,
            ai_enabled=False,
        )
        interview_prep, interview_model = generate_interview_prep(
            structured, semantic_profile, matches, response_lang,
            ai_enabled=False,
        )
    else:
        roadmap, roadmap_model = generate_roadmap(
            structured, swot, scores, response_lang,
            **breaker.kwargs(ai_client),
        )
        _trip_if_rule_based(breaker, roadmap_model, ai_available)

        interview_prep, interview_model = generate_interview_prep(
            structured, semantic_profile, matches, response_lang,
            **breaker.kwargs(ai_client),
        )
        _trip_if_rule_based(breaker, interview_model, ai_available)

    previous_report = (
        CvIntelligenceReport.objects.filter(student_profile=student)
        .order_by('-analyzed_at')
        .first()
    )
    previous_scores = None
    if previous_report:
        previous_scores = {
            'global': previous_report.global_score,
            'skills': previous_report.skills_score,
            'experience': previous_report.experience_score,
            'education': previous_report.education_score,
            'formatting': previous_report.formatting_score,
            'ats': previous_report.ats_score,
            'readiness': previous_report.readiness_score,
        }

    ai_model = semantic_model if semantic_model != 'rule-based' else (swot_model if swot_model != 'rule-based' else '')

    next_version = (
        CvIntelligenceReport.objects.filter(student_profile=student).aggregate(
            max_version=Max('version'),
        )['max_version']
        or 0
    ) + 1

    with transaction.atomic():
        CvIntelligenceReport.objects.filter(
            student_profile=student, is_active=True,
        ).update(is_active=False)

        structured_data = CvStructuredData.objects.create(
            student_profile=student,
            student_cv=student_cv,
            source_type=source_type,
            source_filename=filename,
            raw_text=raw_text[:50000],
            detected_languages=languages,
            structured_json=structured,
            extraction_metadata=meta,
        )

        report = CvIntelligenceReport.objects.create(
            student_profile=student,
            student_cv=student_cv,
            structured_data=structured_data,
            previous_report=previous_report,
            source_type=source_type,
            status=AnalysisStatus.COMPLETED,
            provider=provider if config.get('ai_available') else 'rule-based',
            ai_model=ai_model,
            detected_languages=languages,
            cv_hash=cv_hash,
            version=next_version,
            is_active=True,
            global_score=scores['global'],
            skills_score=scores['skills'],
            experience_score=scores['experience'],
            education_score=scores['education'],
            formatting_score=scores['formatting'],
            ats_score=scores['ats'],
            readiness_score=scores['readiness'],
            potential_score=scores['potential'],
            semantic_profile_json=semantic_profile,
            swot_json=swot,
            ats_analysis_json=ats_analysis,
            score_explanations_json=score_explanations,
            internship_matches_json=matches,
            missing_skills_json=missing_skills,
            recommended_skills_json=recommended_skills,
            roadmap_json=roadmap,
            interview_prep_json=interview_prep,
            raw_response_json={
                'config': config,
                'languages': languages,
                'semantic_model': semantic_model,
                'swot_model': swot_model,
                'interview_model': interview_model,
            },
        )

        dashboard = build_dashboard_payload(
            structured=structured,
            scores=scores,
            swot=swot,
            ats_analysis=ats_analysis,
            matches=matches,
            missing_skills=missing_skills,
            recommended_skills=recommended_skills,
            roadmap=roadmap,
            interview_prep=interview_prep,
            score_explanations=score_explanations,
            student_context=student_context,
            provider=report.provider,
            detected_languages=languages,
            report_uuid=str(report.uuid),
            previous_scores=previous_scores,
            cv_hash=cv_hash,
            version=next_version,
            analyzed_at=timezone.now(),
        )
        report.dashboard_json = dashboard
        report.save(update_fields=['dashboard_json', 'updated_at'])

        if student_cv:
            student_cv.current_score = scores['global']
            student_cv.last_analyzed_at = timezone.now()
            student_cv.save(update_fields=['current_score', 'last_analyzed_at', 'updated_at'])

    if emit_notifications:
        try:
            emit_analysis_notifications(
                report=report,
                student_profile=student,
                matches=matches,
                missing_skills=missing_skills,
                interview_prep=interview_prep,
                score_delta=report.score_delta,
            )
        except Exception as exc:
            logger.warning('CV intelligence notifications failed: %s', exc)

    return report


def compare_reports(current: CvIntelligenceReport, previous: CvIntelligenceReport) -> dict[str, Any]:
    return {
        'current': {
            'uuid': str(current.uuid),
            'analyzed_at': current.analyzed_at.isoformat(),
            'global_score': current.global_score,
            'skills': current.skills_score,
            'detected_skills': (current.structured_data.structured_json or {}).get('skills', []) if current.structured_data else [],
            'semantic_profile': current.semantic_profile_json,
        },
        'previous': {
            'uuid': str(previous.uuid),
            'analyzed_at': previous.analyzed_at.isoformat(),
            'global_score': previous.global_score,
            'skills': previous.skills_score,
            'detected_skills': (previous.structured_data.structured_json or {}).get('skills', []) if previous.structured_data else [],
            'semantic_profile': previous.semantic_profile_json,
        },
        'evolution': {
            'score_delta': current.global_score - previous.global_score,
            'skills_delta': current.skills_score - previous.skills_score,
            'new_skills': list(set(
                (current.structured_data.structured_json or {}).get('skills', []) if current.structured_data else []
            ) - set(
                (previous.structured_data.structured_json or {}).get('skills', []) if previous.structured_data else []
            )),
        },
    }
