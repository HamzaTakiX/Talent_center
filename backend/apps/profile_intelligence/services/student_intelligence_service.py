"""
Student Intelligence Service — centralized scoring engine.

All intelligence scores are computed here from real platform signals
collected by data_signals_collector. This is the single source of truth
for admin dashboards, student detail views, and program analytics.
"""

from __future__ import annotations

from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile

from ..models import StudentProfileIndicator, StudentProfileSnapshot
from .data_signals_collector import StudentSignals, collect_student_signals


def _clamp(value: float, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, int(round(value))))


def _risk_category(score: int) -> str:
    if score >= 75:
        return StudentProfileIndicator.RiskCategory.CRITICAL
    if score >= 50:
        return StudentProfileIndicator.RiskCategory.HIGH
    if score >= 25:
        return StudentProfileIndicator.RiskCategory.MEDIUM
    return StudentProfileIndicator.RiskCategory.LOW


def _engagement_category(score: int) -> str:
    if score >= 66:
        return StudentProfileIndicator.EngagementCategory.HIGHLY_ENGAGED
    if score >= 36:
        return StudentProfileIndicator.EngagementCategory.ACTIVE
    if score >= 11:
        return StudentProfileIndicator.EngagementCategory.LOW
    return StudentProfileIndicator.EngagementCategory.INACTIVE


def _health_index(composite: int) -> str:
    if composite >= 70:
        return StudentProfileIndicator.HealthIndex.HEALTHY
    if composite >= 50:
        return StudentProfileIndicator.HealthIndex.NEEDS_ATTENTION
    if composite >= 30:
        return StudentProfileIndicator.HealthIndex.AT_RISK
    return StudentProfileIndicator.HealthIndex.CRITICAL


def compute_profile_completion_score(signals: StudentSignals) -> int:
    """Measure profile completeness from real field data."""
    checks = [
        (signals.has_personal_info, 12),
        (signals.identity_confirmed, 10),
        (signals.profile_completed, 10),
        (signals.has_academic_info, 12),
        (signals.skills_count > 0, 10),
        (signals.has_languages_section or signals.has_career_objective, 8),
        (signals.has_experience_section, 13),
        (signals.has_projects_section, 10),
        (signals.has_primary_cv, 10),
        (signals.has_certifications_section, 5),
        (
            signals.documents_required == 0
            or (signals.documents_fulfilled >= signals.documents_required),
            10,
        ),
    ]
    total_weight = sum(w for _, w in checks)
    earned = sum(w for ok, w in checks if ok)
    return _clamp((earned / total_weight) * 100) if total_weight else 0


def compute_critical_risk_score(signals: StudentSignals) -> int:
    """Higher score = greater risk of not securing an internship."""
    risk = 0
    breakdown: dict[str, int] = {}

    if signals.cv_count == 0:
        risk += 25
        breakdown['no_cv'] = 25
    elif signals.cv_sections_filled < signals.cv_sections_total * 0.5:
        risk += 15
        breakdown['incomplete_cv'] = 15

    completion = compute_profile_completion_score(signals)
    if completion < 40:
        risk += 20
        breakdown['low_profile_completion'] = 20

    if signals.application_count == 0:
        risk += 15
        breakdown['no_applications'] = 15

    if signals.avg_match_score is not None and signals.avg_match_score < 40:
        risk += 10
        breakdown['low_matching'] = 10

    if signals.simulation_count == 0 and signals.interview_feedback_count == 0:
        risk += 10
        breakdown['no_interview_prep'] = 10

    inactive_days = signals.days_since_last_activity
    if inactive_days is None or inactive_days > 21:
        risk += 15
        breakdown['inactivity'] = 15

    if signals.missing_skills_count >= 3:
        risk += 10
        breakdown['missing_skills'] = 10

    if signals.application_count >= 2:
        rejection_rate = signals.rejected_count / signals.application_count
        if rejection_rate > 0.5:
            risk += 15
            breakdown['repeated_rejections'] = 15

    engagement = compute_engagement_score(signals)
    if engagement < 20:
        risk += 10
        breakdown['low_engagement'] = 10

    signals.raw['risk_breakdown'] = breakdown
    return _clamp(risk)


def compute_engagement_score(signals: StudentSignals) -> int:
    """Measure student participation from real activity."""
    score = 0.0
    score += min(20, signals.login_count_30d * 4)
    score += min(15, signals.offer_view_count_30d * 3)
    score += min(20, signals.application_submit_count_30d * 10)
    score += min(10, signals.saved_offers_count_30d * 5)
    score += min(15, signals.cv_update_count_30d * 8)
    score += min(10, signals.simulation_count * 5)
    score += min(10, signals.career_coach_messages_30d * 2)
    score += min(
        5,
        max(0, signals.documents_fulfilled) * 5
        if signals.documents_required > 0
        else (2 if signals.action_count_30d > 0 else 0),
    )
    score += min(5, signals.chat_activity_30d * 2 + signals.announcement_actions_30d)
    return _clamp(score)


def compute_employability_score(signals: StudentSignals) -> int:
    """Measure employability from CV quality, skills, and interview data."""
    components: list[tuple[float, float]] = []

    cv_quality = (
        signals.cv_intel_global_score
        or signals.cv_score
        or (50 if signals.has_primary_cv else 0)
    )
    components.append((cv_quality, 0.30))

    ats = signals.cv_intel_ats_score or (cv_quality * 0.9 if cv_quality else 0)
    components.append((ats, 0.15))

    skills = signals.cv_intel_skills_score or min(100, signals.skills_count * 12)
    components.append((skills, 0.15))

    certs = 100 if signals.has_certifications_section else 0
    components.append((certs, 0.05))

    langs = 100 if signals.has_languages_section else 0
    components.append((langs, 0.05))

    projects = 100 if signals.has_projects_section else 0
    components.append((projects, 0.10))

    exp = (
        signals.cv_intel_experience_score
        or (80 if signals.has_experience_section else 20)
    )
    components.append((exp, 0.10))

    academic = 100 if signals.has_academic_info else 30
    components.append((academic, 0.05))

    interview_perf = (
        signals.avg_overall_interview_score
        or signals.avg_simulation_score
        or (40 if signals.simulation_count > 0 else 0)
    )
    if interview_perf and interview_perf <= 10:
        interview_perf *= 10  # normalize 0-10 scale to 0-100
    components.append((interview_perf or 0, 0.05))

    total_weight = sum(w for _, w in components)
    blended = sum(v * w for v, w in components) / total_weight if total_weight else 0
    return _clamp(blended)


def compute_interview_readiness_score(signals: StudentSignals) -> int:
    """Measure readiness for interviews."""
    sim_component = min(30, signals.simulation_count * 10)

    comm = signals.avg_communication_score or signals.avg_simulation_score or 0
    if comm and comm <= 10:
        comm *= 10
    tech = signals.avg_technical_score or comm
    if tech and tech <= 10:
        tech *= 10

    comm_component = min(25, (comm / 100) * 25) if comm else min(10, signals.simulation_count * 3)
    tech_component = min(25, (tech / 100) * 25) if tech else min(10, signals.simulation_count * 3)

    improvement = 0
    if signals.cv_score_delta and signals.cv_score_delta > 0:
        improvement = min(10, signals.cv_score_delta)
    elif signals.simulation_count >= 3:
        improvement = 8

    confidence = min(10, signals.simulation_count * 3 + signals.interview_feedback_count * 2)

    return _clamp(sim_component + comm_component + tech_component + improvement + confidence)


def compute_internship_readiness_score(
    signals: StudentSignals,
    *,
    profile_completion: int,
    interview_readiness: int,
) -> int:
    """Determine if the student is ready to apply."""
    cv_completion = (
        _clamp((signals.cv_sections_filled / max(signals.cv_sections_total, 1)) * 100)
        if signals.has_primary_cv
        else 0
    )

    doc_ratio = 100
    if signals.documents_required > 0:
        doc_ratio = _clamp(
            (signals.documents_fulfilled / signals.documents_required) * 100,
        )

    skills_component = min(100, signals.avg_match_score or signals.max_match_score or 0)
    if skills_component <= 0 and signals.skills_count > 0:
        skills_component = min(60, signals.skills_count * 10)

    return _clamp(
        0.25 * profile_completion
        + 0.25 * cv_completion
        + 0.15 * doc_ratio
        + 0.20 * skills_component
        + 0.15 * interview_readiness,
    )


def compute_career_progress_score(signals: StudentSignals) -> int:
    """Track long-term growth from historical data."""
    progress = 40  # baseline for active students with any data

    if signals.cv_score_delta is not None:
        if signals.cv_score_delta > 0:
            progress += min(30, signals.cv_score_delta * 2)
        elif signals.cv_score_delta < 0:
            progress -= min(15, abs(signals.cv_score_delta))

    if signals.prior_engagement_score is not None:
        current_eng = compute_engagement_score(signals)
        delta = current_eng - signals.prior_engagement_score
        progress += min(15, max(-10, delta // 2))

    if signals.avg_match_score and signals.prior_avg_match_score:
        match_delta = signals.avg_match_score - signals.prior_avg_match_score
        progress += min(15, max(-10, int(match_delta // 2)))
    elif signals.avg_match_score and signals.avg_match_score >= 60:
        progress += 10

    if signals.has_certifications_section:
        progress += 10

    if signals.skills_growth > 0:
        progress += min(10, signals.skills_growth * 3)

    if signals.accepted_count > 0:
        progress += 15

    return _clamp(progress)


def compute_placement_probability(
    signals: StudentSignals,
    *,
    employability: int,
    readiness: int,
    engagement: int,
) -> int:
    """Estimate internship acquisition probability."""
    match_component = signals.avg_match_score or signals.max_match_score or 0
    app_component = min(100, signals.application_count * 15)
    interview_component = (
        (signals.avg_overall_interview_score or 0) * 10
        if signals.avg_overall_interview_score and signals.avg_overall_interview_score <= 10
        else (signals.avg_overall_interview_score or signals.avg_simulation_score or 0)
    )
    cv_component = signals.cv_intel_global_score or signals.cv_score or 0

    raw = (
        0.25 * match_component
        + 0.15 * app_component
        + 0.20 * interview_component
        + 0.15 * cv_component
        + 0.15 * employability
        + 0.10 * readiness
    )

    # Engagement acts as a multiplier — inactive students are less likely to convert
    engagement_factor = 0.7 + (engagement / 100) * 0.3
    return _clamp(raw * engagement_factor)


def compute_health_score(
    *,
    risk: int,
    engagement: int,
    employability: int,
    readiness: int,
    progress: int,
) -> int:
    """Composite health score (inverse risk weighted with positive signals)."""
    positive = (
        0.25 * engagement
        + 0.25 * employability
        + 0.25 * readiness
        + 0.15 * progress
        + 0.10 * max(0, 100 - risk)
    )
    penalty = risk * 0.35
    return _clamp(positive - penalty)


def compute_all_scores(signals: StudentSignals) -> dict[str, Any]:
    """Run the full scoring pipeline and return all dimensions."""
    profile_completion = compute_profile_completion_score(signals)
    engagement = compute_engagement_score(signals)
    risk = compute_critical_risk_score(signals)
    employability = compute_employability_score(signals)
    interview_readiness = compute_interview_readiness_score(signals)
    readiness = compute_internship_readiness_score(
        signals,
        profile_completion=profile_completion,
        interview_readiness=interview_readiness,
    )
    progress = compute_career_progress_score(signals)
    placement = compute_placement_probability(
        signals,
        employability=employability,
        readiness=readiness,
        engagement=engagement,
    )
    health = compute_health_score(
        risk=risk,
        engagement=engagement,
        employability=employability,
        readiness=readiness,
        progress=progress,
    )

    return {
        'profile_completion_score': profile_completion,
        'engagement_score': engagement,
        'engagement_category': _engagement_category(engagement),
        'risk_score': risk,
        'risk_category': _risk_category(risk),
        'employability_score': employability,
        'internship_readiness_score': readiness,
        'interview_readiness_score': interview_readiness,
        'career_progress_score': progress,
        'placement_probability': placement,
        'health_score': health,
        'health_index': _health_index(health),
        'is_at_risk': risk >= 50 or _health_index(health) in (
            StudentProfileIndicator.HealthIndex.AT_RISK,
            StudentProfileIndicator.HealthIndex.CRITICAL,
        ),
        'score_breakdown_json': {
            'risk_factors': signals.raw.get('risk_breakdown', {}),
            'signals_summary': {
                'cv_count': signals.cv_count,
                'application_count': signals.application_count,
                'simulation_count': signals.simulation_count,
                'login_count_30d': signals.login_count_30d,
                'avg_match_score': signals.avg_match_score,
            },
        },
    }


@transaction.atomic
def recompute_student_intelligence(student_profile: StudentProfile) -> StudentProfileIndicator:
    """
    Main entry point: collect signals, compute scores, persist results.
    Called by engine, signals, and background jobs.
    """
    from . import behavior_analysis_service, risk_detection_service, state_machine_service, suggestion_engine

    # Refresh legacy subsystems (activity metrics, risks, suggestions, state)
    behavior_analysis_service.compute_activity_metrics(student_profile)
    risk_detection_service.detect_risk(student_profile)
    suggestion_engine.generate_suggestions(student_profile)
    state_machine_service.update_profile_state(student_profile)

    signals = collect_student_signals(student_profile)
    scores = compute_all_scores(signals)
    now = timezone.now()

    previous = StudentProfileIndicator.objects.filter(
        student_profile=student_profile,
    ).first()

    from ..models import StudentProfileActivityLog

    last_activity = (
        StudentProfileActivityLog.objects
        .filter(student_profile=student_profile)
        .order_by('-created_at')
        .values_list('created_at', flat=True)
        .first()
    )

    indicator, _ = StudentProfileIndicator.objects.update_or_create(
        student_profile=student_profile,
        defaults={
            **scores,
            'last_activity_at': last_activity,
            'computed_at': now,
        },
    )

    StudentProfileSnapshot.objects.update_or_create(
        student_profile=student_profile,
        snapshot_date=now.date(),
        defaults={
            'completion_rate': scores['profile_completion_score'],
            'engagement_score': scores['engagement_score'],
            'risk_score': scores['risk_score'],
            'employability_score': scores['employability_score'],
            'internship_readiness_score': scores['internship_readiness_score'],
            'interview_readiness_score': scores['interview_readiness_score'],
            'career_progress_score': scores['career_progress_score'],
            'placement_probability': scores['placement_probability'],
            'health_index': scores['health_index'],
        },
    )

    from .intelligence_alert_service import check_and_emit_alerts
    check_and_emit_alerts(student_profile, indicator, previous=previous)

    return indicator


def recompute_students_batch(student_ids: list[int] | None = None) -> int:
    """Batch recompute for cron/Celery. Returns count processed."""
    qs = StudentProfile.objects.all()
    if student_ids:
        qs = qs.filter(pk__in=student_ids)
    count = 0
    for student in qs.iterator(chunk_size=100):
        recompute_student_intelligence(student)
        count += 1
    return count
