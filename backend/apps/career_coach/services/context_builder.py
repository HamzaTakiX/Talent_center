"""Aggregate real student data from all platform sources."""

from __future__ import annotations

import logging
from typing import Any

from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.career_coach.services.context_cache import get_cached_context, set_cached_context
from apps.career_coach.services.context_summaries import build_context_summaries, set_cached_summaries
from apps.cv_builder.models import StudentCv
from apps.cv_intelligence.models import CvIntelligenceReport
from apps.stage.models import InternshipOffer, OfferApplication, StudentOfferMatchScore
from apps.stage.services.matching_service import top_matches_for_student
from apps.stage.services.student_journey_service import get_application_readiness

logger = logging.getLogger(__name__)


def _safe_str(value) -> str:
    return str(value).strip() if value else ''


def _profile_section(student: StudentProfile) -> dict[str, Any]:
    user = student.user
    profile = getattr(user, 'user_profile', None)
    skills = student.skills if isinstance(student.skills, list) else []
    languages: list = []
    if profile:
        langs = getattr(profile, 'languages', None)
        if isinstance(langs, list):
            languages = langs
    return {
        'program': _safe_str(student.program_major or (student.filiere.name if student.filiere else '')),
        'class': _safe_str(student.current_class or (student.class_group.name if student.class_group else '')),
        'level': _safe_str(student.academic_level.name if student.academic_level else ''),
        'department': _safe_str(student.academic_sector.name if student.academic_sector else ''),
        'specialization': _safe_str(student.filiere.name if student.filiere else ''),
        'skills': skills,
        'languages': languages,
        'location': _safe_str(student.city),
        'career_objective': _safe_str(student.career_objective),
        'professional_summary': _safe_str(student.professional_summary),
        'internship_type': _safe_str(student.internship_type.name if student.internship_type else ''),
        'has_applied': student.has_applied,
        'has_internship': student.has_internship,
    }


def _cv_section(student: StudentProfile) -> dict[str, Any]:
    primary_cv = (
        StudentCv.objects.filter(student_profile=student, is_primary=True)
        .order_by('-updated_at')
        .first()
    )
    if not primary_cv:
        primary_cv = StudentCv.objects.filter(student_profile=student).order_by('-updated_at').first()

    report = (
        CvIntelligenceReport.objects.filter(student_profile=student, is_active=True)
        .order_by('-analyzed_at')
        .first()
    )
    if not report:
        report = CvIntelligenceReport.objects.filter(student_profile=student).order_by('-analyzed_at').first()

    section: dict[str, Any] = {
        'title': primary_cv.title if primary_cv else '',
        'file_name': '',
        'has_cv': primary_cv is not None,
        'cv_score': None,
        'ats_score': None,
        'readiness_score': None,
        'summary': '',
        'strengths': [],
        'weaknesses': [],
        'recommendations': [],
        'missing_skills': [],
        'last_analysis': None,
    }

    if primary_cv:
        base_name = _safe_str(primary_cv.title) or _safe_str(primary_cv.slug) or 'CV'
        section['file_name'] = base_name if base_name.lower().endswith('.pdf') else f'{base_name}.pdf'

    if report:
        section['cv_score'] = float(report.global_score) if report.global_score is not None else None
        section['ats_score'] = float(report.ats_score) if report.ats_score is not None else None
        section['readiness_score'] = int(report.readiness_score) if report.readiness_score is not None else None
        section['last_analysis'] = report.analyzed_at.isoformat() if report.analyzed_at else None
        missing = report.missing_skills_json or []
        section['missing_skills'] = missing if isinstance(missing, list) else []
        swot = report.swot_json or {}
        if isinstance(swot, dict):
            section['strengths'] = swot.get('strengths') or []
            section['weaknesses'] = swot.get('weaknesses') or []
        elif isinstance(swot, list):
            section['strengths'] = swot
        roadmap = report.roadmap_json or {}
        if isinstance(roadmap, dict):
            section['recommendations'] = roadmap.get('actions') or roadmap.get('recommendations') or []
        elif isinstance(roadmap, list):
            section['recommendations'] = roadmap
        interview_prep = report.interview_prep_json or {}
        section['interview_prep'] = interview_prep

    if primary_cv:
        from apps.cv_builder.constants import SectionType

        summary_section = primary_cv.sections.filter(section_type=SectionType.SUMMARY).first()
        if summary_section and summary_section.content_json:
            raw = summary_section.content_json
            if isinstance(raw, dict):
                section['summary'] = str(raw.get('text') or raw.get('content') or '')[:2000]
            else:
                section['summary'] = str(raw)[:2000]

    return section


def _offers_section(student: StudentProfile, limit: int = 15) -> list[dict[str, Any]]:
    matches = top_matches_for_student(student, limit=limit)
    if not matches:
        return []

    offer_ids = [match.offer_id for match in matches]
    apps_by_offer = {
        app.offer_id: app
        for app in OfferApplication.objects.filter(
            student_profile=student,
            offer_id__in=offer_ids,
        ).only('offer_id', 'status')
    }

    results = []
    for match in matches:
        offer = match.offer
        app = apps_by_offer.get(offer.id)
        results.append({
            'id': str(offer.uuid),
            'title': offer.title,
            'company': offer.company.name if offer.company else '',
            'match_score': float(match.score),
            'score_breakdown': match.score_breakdown or {},
            'required_skills': offer.required_skills or [],
            'application_status': app.status if app else 'not_applied',
            'is_recommended': match.is_recommended,
        })
    return results


def _applications_section(student: StudentProfile) -> list[dict[str, Any]]:
    apps = (
        OfferApplication.objects.filter(student_profile=student)
        .select_related('offer', 'offer__company')
        .order_by('-created_at')[:20]
    )
    offer_ids = [app.offer_id for app in apps]
    scores_by_offer = {
        row.offer_id: row
        for row in StudentOfferMatchScore.objects.filter(
            student_profile=student,
            offer_id__in=offer_ids,
        ).only('offer_id', 'score')
    }

    results = []
    for app in apps:
        match = scores_by_offer.get(app.offer_id)
        results.append({
            'id': str(app.uuid),
            'offer_title': app.offer.title,
            'company': app.offer.company.name if app.offer.company else '',
            'status': app.status,
            'match_score': float(match.score) if match else None,
            'submitted_at': app.created_at.isoformat() if app.created_at else None,
        })
    return results


def _interview_section(student: StudentProfile, cv_section: dict) -> dict[str, Any]:
    prep = cv_section.get('interview_prep') or {}
    weak_areas: list = []
    scores: list = []
    tips: list = []

    if isinstance(prep, dict):
        weak_areas = prep.get('weak_areas') or prep.get('focus_areas') or []
        scores = prep.get('scores') or prep.get('previous_scores') or []
        tips = prep.get('tips') or []
    elif isinstance(prep, list):
        tips = prep

    return {
        'readiness': cv_section.get('cv_score'),
        'weak_areas': weak_areas if isinstance(weak_areas, list) else [],
        'previous_scores': scores if isinstance(scores, list) else [],
        'tips': tips if isinstance(tips, list) else [],
    }


def _current_offer_section(student: StudentProfile, offer_uuid: str | None) -> dict[str, Any] | None:
    if not offer_uuid:
        return None
    try:
        offer = InternshipOffer.objects.select_related('company').get(uuid=offer_uuid)
    except InternshipOffer.DoesNotExist:
        return None

    match = StudentOfferMatchScore.objects.filter(student_profile=student, offer=offer).first()
    readiness = get_application_readiness(student, offer)
    return {
        'id': str(offer.uuid),
        'title': offer.title,
        'company': offer.company.name if offer.company else '',
        'match_score': float(match.score) if match else readiness.get('match_score'),
        'score_breakdown': match.score_breakdown if match else readiness.get('breakdown', {}),
        'requirements': ', '.join(offer.required_skills or []),
        'description': (offer.description or '')[:1500],
        'missing_skills': readiness.get('missing_skills') or [],
        'can_apply': readiness.get('can_apply', False),
    }


def build_student_context(
    student: StudentProfile,
    *,
    offer_uuid: str | None = None,
    use_cache: bool = True,
) -> dict[str, Any]:
    if use_cache:
        cached = get_cached_context(student.pk)
        if cached and not offer_uuid:
            return cached

    cv_section = _cv_section(student)
    context = {
        'student_id': student.pk,
        'profile': _profile_section(student),
        'cv': cv_section,
        'offers': _offers_section(student),
        'applications': _applications_section(student),
        'interview': _interview_section(student, cv_section),
        'current_offer': _current_offer_section(student, offer_uuid),
        'built_at': timezone.now().isoformat(),
    }

    if not offer_uuid:
        set_cached_context(student.pk, context)
        set_cached_summaries(student.pk, build_context_summaries(context))
    return context


def _application_goal_progress(status: str) -> int:
    return {
        'SUBMITTED': 28,
        'UNDER_REVIEW': 48,
        'SHORTLISTED': 68,
        'INTERVIEW': 82,
        'ACCEPTED': 95,
        'OFFER_ACCEPTED': 100,
    }.get(status, 40)


def _extract_label(item) -> str:
    if isinstance(item, dict):
        for key in ('label', 'title', 'name', 'skill', 'action', 'text'):
            if item.get(key):
                return str(item[key]).strip()
        return ''
    return str(item).strip()


def _build_focus_areas(ctx: dict[str, Any], cv: dict[str, Any], student: StudentProfile) -> list[dict[str, str]]:
    seen: set[str] = set()
    areas: list[dict[str, str]] = []

    def add(area_id: str, label: str) -> None:
        clean = label.strip()
        if not clean:
            return
        key = clean.lower()
        if key in seen:
            return
        seen.add(key)
        areas.append({'id': area_id[:40], 'label': clean})

    for idx, item in enumerate(cv.get('missing_skills') or []):
        add(f'missing-{idx}', _extract_label(item))

    for idx, item in enumerate(cv.get('weaknesses') or []):
        add(f'weakness-{idx}', _extract_label(item))

    for idx, item in enumerate(cv.get('recommendations') or []):
        add(f'rec-{idx}', _extract_label(item))

    interview = ctx.get('interview') or {}
    for idx, item in enumerate(interview.get('weak_areas') or []):
        add(f'interview-{idx}', _extract_label(item))

    top_match = ctx['offers'][0] if ctx.get('offers') else None
    if top_match and top_match.get('application_status') == 'not_applied':
        try:
            offer = InternshipOffer.objects.get(uuid=top_match['id'])
            readiness = get_application_readiness(student, offer)
            for idx, skill in enumerate(readiness.get('missing_skills') or []):
                add(f'offer-skill-{idx}', str(skill))
        except InternshipOffer.DoesNotExist:
            pass

    if not areas and top_match:
        add('top-match', f"Postuler : {top_match['title']}")

    return areas[:5]


def _build_active_goals(ctx: dict[str, Any], cv: dict[str, Any]) -> list[dict[str, Any]]:
    goals: list[dict[str, Any]] = []
    cv_score = cv.get('cv_score')

    if cv_score is not None and cv_score < 85:
        goals.append({
            'id': 'improve_cv',
            'label': 'student.internshipOffers.careerCoach.context.goals.improveCv',
            'progress': max(8, min(100, int(cv_score))),
        })

    pending_apps = [
        a for a in ctx['applications']
        if a['status'] in ('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW')
    ]
    if pending_apps:
        progress = max(_application_goal_progress(a['status']) for a in pending_apps)
        goals.append({
            'id': 'follow_up',
            'label': 'student.internshipOffers.careerCoach.context.goals.followUp',
            'progress': progress,
        })

    top_match = ctx['offers'][0] if ctx.get('offers') else None
    if top_match and top_match.get('application_status') == 'not_applied':
        goals.append({
            'id': f"apply-{top_match['id'][:8]}",
            'label': f"{top_match['title']}",
            'progress': max(12, min(100, int(top_match.get('match_score') or 0))),
        })

    interview = ctx.get('interview') or {}
    if interview.get('weak_areas'):
        goals.append({
            'id': 'practice_interview',
            'label': 'student.internshipOffers.careerCoach.context.goals.practice',
            'progress': max(20, min(100, int(cv_score or 50))),
        })

    return goals[:4]


def _compute_readiness_percent(cv: dict[str, Any]) -> int:
    if cv.get('readiness_score') is not None:
        return int(cv['readiness_score'])
    parts = [v for v in (cv.get('cv_score'), cv.get('ats_score')) if v is not None]
    if not parts:
        return 0
    return int(round(sum(parts) / len(parts)))


def build_context_panel(student: StudentProfile, *, use_cache_only: bool = False) -> dict[str, Any]:
    """UI-friendly context summary for the sidebar."""
    if use_cache_only:
        cached = get_cached_context(student.pk)
        if not cached:
            return {
                'cv_file_name': '',
                'has_cv': False,
                'has_analysis': False,
                'cv_score': 0,
                'ats_score': 0,
                'last_analysis': '',
                'readiness_percent': 0,
                'focus_areas': [],
                'active_goals': [],
                'personalized_subtitle': 'Ask me about CV, internships, interviews and career strategy',
            }
        ctx = cached
    else:
        ctx = build_student_context(student)
    cv = ctx['cv']
    focus_areas = _build_focus_areas(ctx, cv, student)
    goals = _build_active_goals(ctx, cv)
    readiness = _compute_readiness_percent(cv)
    has_analysis = cv.get('last_analysis') is not None and (
        cv.get('cv_score') is not None or cv.get('ats_score') is not None
    )

    last_analysis = ''
    if cv.get('last_analysis'):
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(cv['last_analysis'].replace('Z', '+00:00'))
            last_analysis = dt.strftime('%d %b %Y')
        except (ValueError, TypeError):
            last_analysis = cv['last_analysis'][:10]

    return {
        'cv_file_name': cv.get('file_name') or cv.get('title') or '',
        'has_cv': bool(cv.get('has_cv')),
        'has_analysis': has_analysis,
        'cv_score': int(cv['cv_score']) if cv.get('cv_score') is not None else 0,
        'ats_score': int(cv['ats_score']) if cv.get('ats_score') is not None else 0,
        'last_analysis': last_analysis,
        'readiness_percent': readiness,
        'focus_areas': focus_areas,
        'active_goals': goals,
        'personalized_subtitle': _personalized_subtitle(ctx),
    }


def _personalized_subtitle(ctx: dict) -> str:
    profile = ctx.get('profile') or {}
    name_parts = []
    if profile.get('program'):
        name_parts.append(profile['program'])
    if profile.get('class'):
        name_parts.append(profile['class'])
    prefix = ' · '.join(name_parts) if name_parts else 'Your profile'
    top = ctx['offers'][0] if ctx.get('offers') else None
    if top:
        return f"{prefix} — top match: {top['title']} ({int(top['match_score'])}%)"
    return f"{prefix} — ask me about CV, internships, interviews and career strategy"
