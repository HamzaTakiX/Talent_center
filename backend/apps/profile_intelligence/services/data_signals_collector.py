"""
Collect real platform signals for a student — single read-path used by
StudentIntelligenceService. All scores are derived from this payload.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import timedelta
from typing import Any

from django.db.models import Avg, Count, Max, Q
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile

from ..models import StudentProfileActivityLog, StudentProfileSnapshot


_WINDOW_DAYS = 30


@dataclass
class StudentSignals:
    """Normalized signal bundle for one student."""

    student_profile_id: int
    # Profile
    identity_confirmed: bool = False
    profile_completed: bool = False
    has_personal_info: bool = False
    has_academic_info: bool = False
    skills_count: int = 0
    has_career_objective: bool = False
    has_availability: bool = False
    has_city: bool = False
    # CV
    cv_count: int = 0
    has_primary_cv: bool = False
    cv_status: str = ''
    cv_score: int | None = None
    cv_sections_filled: int = 0
    cv_sections_total: int = 8
    has_experience_section: bool = False
    has_projects_section: bool = False
    has_languages_section: bool = False
    has_certifications_section: bool = False
    # CV intelligence
    cv_intel_global_score: int | None = None
    cv_intel_ats_score: int | None = None
    cv_intel_skills_score: int | None = None
    cv_intel_experience_score: int | None = None
    cv_intel_readiness_score: int | None = None
    missing_skills_count: int = 0
    cv_score_delta: int | None = None
    # Applications & matching
    application_count: int = 0
    rejected_count: int = 0
    accepted_count: int = 0
    avg_match_score: float | None = None
    max_match_score: float | None = None
    # Interviews
    interview_feedback_count: int = 0
    avg_communication_score: float | None = None
    avg_technical_score: float | None = None
    avg_overall_interview_score: float | None = None
    simulation_count: int = 0
    avg_simulation_score: float | None = None
    # Engagement activity (30-day window)
    login_count_30d: int = 0
    action_count_30d: int = 0
    offer_view_count_30d: int = 0
    application_submit_count_30d: int = 0
    cv_update_count_30d: int = 0
    career_coach_messages_30d: int = 0
    announcement_actions_30d: int = 0
    saved_offers_count_30d: int = 0
    chat_activity_30d: int = 0
    # Documents
    documents_fulfilled: int = 0
    documents_required: int = 0
    # Temporal
    days_since_last_activity: int | None = None
    days_since_last_login: int | None = None
    # Historical (for career progress)
    prior_cv_score: int | None = None
    prior_avg_match_score: float | None = None
    prior_engagement_score: int | None = None
    skills_growth: int = 0
    # Academic grouping (for program analytics passthrough)
    filiere_id: int | None = None
    class_group_id: int | None = None
    academic_level_id: int | None = None
    academic_sector_id: int | None = None
    raw: dict[str, Any] = field(default_factory=dict)


def _section_has_content(section) -> bool:
    content = section.content_json if hasattr(section, 'content_json') else {}
    if not content:
        return False
    if isinstance(content, dict):
        items = content.get('items') or content.get('entries') or []
        if items:
            return True
        return any(v for k, v in content.items() if k not in ('title', 'label') and v)
    if isinstance(content, list):
        return len(content) > 0
    return bool(content)


def collect_student_signals(student_profile: StudentProfile) -> StudentSignals:
    """Gather all measurable platform data for one student."""
    user = student_profile.user
    profile = getattr(user, 'profile', None)
    now = timezone.now()
    since = now - timedelta(days=_WINDOW_DAYS)

    signals = StudentSignals(student_profile_id=student_profile.pk)

    # --- Profile fields ---
    signals.identity_confirmed = student_profile.identity_confirmed
    signals.profile_completed = student_profile.profile_completed
    signals.has_personal_info = bool(
        profile
        and (profile.first_name or profile.last_name)
        and user.email
    )
    signals.has_academic_info = bool(
        student_profile.filiere_id
        or student_profile.program_major
        or student_profile.class_group_id
    )
    skills = student_profile.skills or []
    signals.skills_count = len(skills) if isinstance(skills, list) else 0
    signals.has_career_objective = bool(student_profile.career_objective)
    signals.has_availability = bool(student_profile.availability)
    signals.has_city = bool(student_profile.city)
    signals.filiere_id = student_profile.filiere_id
    signals.class_group_id = student_profile.class_group_id
    signals.academic_level_id = student_profile.academic_level_id
    signals.academic_sector_id = student_profile.academic_sector_id

    # --- CV data ---
    cvs = list(student_profile.cvs.prefetch_related('sections').all())
    signals.cv_count = len(cvs)
    primary_cv = next((cv for cv in cvs if cv.is_primary), cvs[0] if cvs else None)
    signals.has_primary_cv = primary_cv is not None
    if primary_cv:
        signals.cv_status = primary_cv.status or ''
        signals.cv_score = primary_cv.current_score
        sections = list(primary_cv.sections.all())
        key_types = {'experience', 'projects', 'languages', 'certifications',
                     'education', 'skills', 'summary', 'contact'}
        filled = sum(1 for s in sections if _section_has_content(s))
        signals.cv_sections_filled = filled
        signals.cv_sections_total = max(len(key_types), 1)
        type_set = {s.section_type for s in sections if _section_has_content(s)}
        signals.has_experience_section = 'experience' in type_set
        signals.has_projects_section = 'projects' in type_set
        signals.has_languages_section = 'languages' in type_set
        signals.has_certifications_section = 'certifications' in type_set

    # --- CV intelligence ---
    latest_report = (
        student_profile.cv_intelligence_reports
        .filter(status='COMPLETED', is_active=True)
        .order_by('-analyzed_at')
        .first()
    )
    if latest_report:
        signals.cv_intel_global_score = latest_report.global_score
        signals.cv_intel_ats_score = latest_report.ats_score
        signals.cv_intel_skills_score = latest_report.skills_score
        signals.cv_intel_experience_score = latest_report.experience_score
        signals.cv_intel_readiness_score = latest_report.readiness_score
        missing = latest_report.missing_skills_json or []
        signals.missing_skills_count = len(missing) if isinstance(missing, list) else 0
        if latest_report.previous_report_id:
            signals.cv_score_delta = latest_report.score_delta

    # --- Applications & matching ---
    apps_qs = student_profile.offer_applications.all()
    signals.application_count = apps_qs.count()
    signals.rejected_count = apps_qs.filter(status='REJECTED').count()
    signals.accepted_count = apps_qs.filter(
        status__in=['ACCEPTED', 'OFFER_ACCEPTED', 'INTERNSHIP_STARTED', 'INTERNSHIP_COMPLETED'],
    ).count()

    match_agg = student_profile.offer_match_scores.aggregate(
        avg=Avg('score'),
        max_score=Max('score'),
    )
    signals.avg_match_score = float(match_agg['avg']) if match_agg['avg'] is not None else None
    signals.max_match_score = float(match_agg['max_score']) if match_agg['max_score'] is not None else None

    # --- Real interviews (stage) ---
    try:
        from apps.stage.models_extended import InterviewFeedback

        feedback_qs = InterviewFeedback.objects.filter(
            interview__application__student_profile=student_profile,
        )
        signals.interview_feedback_count = feedback_qs.count()
        fb_agg = feedback_qs.aggregate(
            comm=Avg('communication_score'),
            tech=Avg('technical_score'),
            overall=Avg('overall_score'),
        )
        signals.avg_communication_score = (
            float(fb_agg['comm']) if fb_agg['comm'] is not None else None
        )
        signals.avg_technical_score = (
            float(fb_agg['tech']) if fb_agg['tech'] is not None else None
        )
        signals.avg_overall_interview_score = (
            float(fb_agg['overall']) if fb_agg['overall'] is not None else None
        )
    except Exception:
        pass

    # --- Activity log (30-day window) ---
    activity_qs = StudentProfileActivityLog.objects.filter(
        student_profile=student_profile,
        created_at__gte=since,
    )
    signals.login_count_30d = activity_qs.filter(
        activity_type=StudentProfileActivityLog.ActivityType.LOGIN,
    ).count()
    signals.action_count_30d = activity_qs.filter(
        activity_type=StudentProfileActivityLog.ActivityType.ACTION,
    ).count()

    signals.offer_view_count_30d = activity_qs.filter(
        action_code__in=['offer.view', 'offer.viewed', 'internship.offer.view'],
    ).count()
    signals.application_submit_count_30d = activity_qs.filter(
        action_code__in=['application.submitted', 'application.submit'],
    ).count()
    signals.cv_update_count_30d = activity_qs.filter(
        action_code__startswith='cv.',
    ).count()
    signals.career_coach_messages_30d = activity_qs.filter(
        source_app='career_coach',
    ).count()
    signals.announcement_actions_30d = activity_qs.filter(
        source_app='announcements',
    ).count()
    signals.saved_offers_count_30d = activity_qs.filter(
        action_code__in=['offer.saved', 'offer.bookmark', 'offer.save'],
    ).count()
    signals.chat_activity_30d = activity_qs.filter(
        source_app='chat',
    ).count()

    sim_qs = activity_qs.filter(
        Q(action_code__startswith='interview.')
        | Q(action_code__contains='simulation'),
    )
    signals.simulation_count = sim_qs.count()
    sim_scores = [
        float(m.get('score', 0))
        for m in sim_qs.values_list('metadata_json', flat=True)
        if isinstance(m, dict) and m.get('score') is not None
    ]
    if sim_scores:
        signals.avg_simulation_score = sum(sim_scores) / len(sim_scores)

    # --- Announcement engagement (direct model) ---
    try:
        from apps.announcements.models import StudentAnnouncementAction

        ann_count = StudentAnnouncementAction.objects.filter(
            student_profile=student_profile,
            created_at__gte=since,
        ).count()
        signals.announcement_actions_30d = max(signals.announcement_actions_30d, ann_count)
        save_count = StudentAnnouncementAction.objects.filter(
            student_profile=student_profile,
            action_type='SAVE',
            created_at__gte=since,
        ).count()
        signals.saved_offers_count_30d = max(signals.saved_offers_count_30d, save_count)
        view_count = StudentAnnouncementAction.objects.filter(
            student_profile=student_profile,
            action_type='VIEW',
            created_at__gte=since,
        ).count()
        signals.offer_view_count_30d = max(signals.offer_view_count_30d, view_count)
    except Exception:
        pass

    # --- Career coach (direct model) ---
    try:
        from apps.career_coach.models import AiConversation

        coach_count = AiConversation.objects.filter(
            user=user,
            role='user',
            created_at__gte=since,
        ).count()
        signals.career_coach_messages_30d = max(signals.career_coach_messages_30d, coach_count)
    except Exception:
        pass

    # --- Documents ---
    try:
        from apps.documents.models import DocumentRequest

        doc_qs = DocumentRequest.objects.filter(target_student_profile=student_profile)
        signals.documents_required = doc_qs.count()
        signals.documents_fulfilled = doc_qs.filter(status='FULFILLED').count()
    except Exception:
        pass

    # --- Temporal ---
    last_activity = (
        StudentProfileActivityLog.objects
        .filter(student_profile=student_profile)
        .order_by('-created_at')
        .values_list('created_at', flat=True)
        .first()
    )
    if last_activity:
        signals.days_since_last_activity = (now - last_activity).days
    if user.last_login:
        signals.days_since_last_login = (now - user.last_login).days

    # --- Historical snapshots for career progress ---
    old_snapshot = (
        StudentProfileSnapshot.objects
        .filter(student_profile=student_profile)
        .order_by('-snapshot_date')
        .first()
    )
    if old_snapshot:
        signals.prior_engagement_score = old_snapshot.engagement_score
        signals.prior_cv_score = old_snapshot.employability_score

    # Skills growth: compare current count to snapshot breakdown if stored
    if old_snapshot and isinstance(old_snapshot, StudentProfileSnapshot):
        prior_snap = (
            StudentProfileSnapshot.objects
            .filter(student_profile=student_profile)
            .order_by('-snapshot_date')[1:2]
            .first()
        )
        if prior_snap:
            signals.prior_avg_match_score = None  # filled from matching history if available

    return signals
