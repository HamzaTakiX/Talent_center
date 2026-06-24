"""Student internship journey — dashboard, applications, eligibility, readiness."""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal
from typing import Any

from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.stage.models import (
    APPLICATION_ACTIVE_STATUSES,
    ApplicationStatusHistory,
    InternshipOffer,
    OfferApplication,
    StudentOfferMatchScore,
)
from apps.stage.models_extended import Interview
from apps.stage.services.matching_service import compute_match_score, top_matches_for_student
from apps.stage.services.offer_lifecycle import PUBLICLY_VISIBLE_STATUSES, STUDENT_APPLYABLE_STATUSES, is_offer_expired
from apps.stage.services.recommendation_service import get_student_recommendation_feed
from apps.stage.services.targeting_service import student_passes_targeting

PIPELINE_STEPS = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'INTERVIEW',
    'ACCEPTED',
    'OFFER_ACCEPTED',
    'INTERNSHIP_STARTED',
    'INTERNSHIP_COMPLETED',
]

TERMINAL_STATUSES = {'REJECTED', 'WITHDRAWN', 'EXPIRED', 'OFFER_DECLINED'}


def _offer_company_logo_url(offer: InternshipOffer) -> str | None:
    if offer.company_logo:
        return offer.company_logo.url
    meta_logo = (offer.metadata_json or {}).get('company_logo')
    if meta_logo:
        return str(meta_logo)
    company = getattr(offer, 'company', None)
    if company and getattr(company, 'logo', None):
        return company.logo.url
    return None


def _serialize_offer_brief(offer: InternshipOffer, *, match_score: float | None = None) -> dict[str, Any]:
    work_mode = 'remote' if offer.is_remote and not offer.is_hybrid else (
        'hybrid' if offer.is_hybrid else 'onsite'
    )
    return {
        'uuid': str(offer.uuid),
        'title': offer.title,
        'company_name': offer.company_name,
        'company_logo_url': _offer_company_logo_url(offer),
        'location_city': offer.location_city or '',
        'work_mode': work_mode,
        'offer_type': offer.offer_type,
        'application_deadline': offer.application_deadline.isoformat() if offer.application_deadline else None,
        'match_score': match_score,
        'is_remote': offer.is_remote,
        'is_hybrid': offer.is_hybrid,
    }


def _serialize_application(app: OfferApplication) -> dict[str, Any]:
    offer = app.offer
    return {
        'uuid': str(app.uuid),
        'status': app.status,
        'applied_at': app.applied_at.isoformat() if app.applied_at else None,
        'last_status_change_at': app.last_status_change_at.isoformat() if app.last_status_change_at else None,
        'match_score_at_apply': float(app.match_score_at_apply) if app.match_score_at_apply is not None else None,
        'offer': _serialize_offer_brief(offer),
    }


def _academic_profile(student: StudentProfile) -> dict[str, Any]:
    filiere = getattr(student, 'filiere', None)
    level = getattr(student, 'academic_level', None)
    class_group = getattr(student, 'class_group', None)
    internship_type = getattr(student, 'internship_type', None)
    return {
        'program': filiere.name if filiere else (student.program_major or ''),
        'level': level.name if level else '',
        'class_name': class_group.name if class_group else (student.current_class or ''),
        'internship_type': internship_type.name if internship_type else '',
        'internship_type_code': internship_type.code if internship_type else '',
    }


def _profile_completion(student: StudentProfile) -> dict[str, Any]:
    checks = {
        'academic_profile': bool(
            getattr(student, 'filiere_id', None) or student.program_major
        ),
        'skills': bool(getattr(student, 'skills', None)),
        'professional_summary': bool(getattr(student, 'professional_summary', None)),
        'city': bool(getattr(student, 'city', None)),
    }
    done = sum(1 for v in checks.values() if v)
    total = len(checks)
    return {
        'percent': round((done / total) * 100) if total else 0,
        'checks': checks,
        'is_complete': done == total,
    }


def _has_primary_cv(student: StudentProfile) -> bool:
    from apps.cv_builder.models import StudentCv

    return StudentCv.objects.filter(student_profile=student, is_primary=True).exists()


def _latest_cv_analysis_score(student: StudentProfile) -> float | None:
    from apps.cv_builder.models import CvAiAnalysis, StudentCv

    cv = StudentCv.objects.filter(student_profile=student, is_primary=True).first()
    if not cv:
        return None
    analysis = CvAiAnalysis.objects.filter(student_cv=cv).order_by('-created_at').first()
    if not analysis:
        return None
    return float(analysis.score) if analysis.score is not None else None


def get_application_readiness(student: StudentProfile, offer: InternshipOffer) -> dict[str, Any]:
    """Checklist before applying — CV, profile, eligibility."""
    rules = list(offer.targeting_rules.filter(is_active=True))
    eligible = student_passes_targeting(student, rules)
    score, reasons, breakdown = compute_match_score(student, offer)
    has_cv = _has_primary_cv(student)
    profile = _profile_completion(student)

    checklist = [
        {
            'key': 'cv',
            'label_key': 'cv_uploaded',
            'done': has_cv,
            'action': 'upload_cv',
        },
        {
            'key': 'profile',
            'label_key': 'profile_completed',
            'done': profile['is_complete'],
            'action': 'complete_profile',
        },
        {
            'key': 'eligibility',
            'label_key': 'academic_eligible',
            'done': eligible and score > 0,
            'action': 'view_eligibility',
        },
    ]

    missing_skills: list[str] = []
    req = breakdown.get('required_skills', {})
    if isinstance(req, dict):
        required = set(str(s).lower() for s in (offer.required_skills or []))
        matched = set(str(s).lower() for s in req.get('matched', []))
        missing_skills = sorted(required - matched)

    can_apply = has_cv and profile['is_complete'] and eligible and score > 0
    offer_applyable = offer.status in STUDENT_APPLYABLE_STATUSES and not is_offer_expired(offer)
    has_external_url = bool((offer.external_url or '').strip())
    external_tracking_available = (
        has_external_url
        and offer.status in PUBLICLY_VISIBLE_STATUSES
        and not is_offer_expired(offer)
    )

    existing = OfferApplication.objects.filter(
        offer=offer,
        student_profile=student,
        status__in=APPLICATION_ACTIVE_STATUSES,
    ).first()

    return {
        'can_apply': can_apply and offer_applyable and not existing,
        'already_applied': bool(existing),
        'offer_applyable': offer_applyable,
        'external_tracking_available': external_tracking_available and not existing,
        'offer_status': offer.status,
        'application_status': existing.status if existing else None,
        'checklist': checklist,
        'match_score': float(score),
        'match_reasons': reasons,
        'missing_skills': missing_skills,
        'academic_profile': _academic_profile(student),
        'profile_completion': profile,
        'cv_score': _latest_cv_analysis_score(student),
    }


def list_student_applications(
    student: StudentProfile,
    *,
    active_only: bool = False,
) -> list[dict[str, Any]]:
    qs = OfferApplication.objects.filter(student_profile=student).select_related('offer')
    if active_only:
        qs = qs.filter(status__in=APPLICATION_ACTIVE_STATUSES)
    return [_serialize_application(app) for app in qs.order_by('-applied_at')]


def get_application_timeline(application: OfferApplication) -> list[dict[str, Any]]:
    history = ApplicationStatusHistory.objects.filter(
        application=application,
    ).order_by('created_at')
    events = [
        {
            'status': row.new_status,
            'previous_status': row.previous_status,
            'at': row.created_at.isoformat(),
            'reason': row.reason,
            'is_automated': row.is_automated,
        }
        for row in history
    ]
    if not events:
        events = [{
            'status': application.status,
            'previous_status': '',
            'at': application.applied_at.isoformat() if application.applied_at else None,
            'reason': 'Application submitted',
            'is_automated': False,
        }]
    return events


def get_student_interviews(student: StudentProfile, *, upcoming_only: bool = True) -> list[dict[str, Any]]:
    qs = Interview.objects.filter(
        application__student_profile=student,
    ).select_related('application__offer').exclude(status=Interview.Status.CANCELLED)
    if upcoming_only:
        qs = qs.filter(
            scheduled_at__gte=timezone.now(),
            status__in=[Interview.Status.SCHEDULED, Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED],
        )
    return [
        {
            'uuid': str(i.uuid),
            'status': i.status,
            'scheduled_at': i.scheduled_at.isoformat(),
            'interview_type': i.interview_type,
            'location': i.location,
            'meeting_url': i.meeting_url,
            'offer_uuid': str(i.application.offer.uuid),
            'offer_title': i.application.offer.title,
            'company_name': i.application.offer.company_name,
            'application_uuid': str(i.application.uuid),
            'application_status': i.application.status,
        }
        for i in qs.order_by('scheduled_at')[:20]
    ]


def _build_action_items(
    student: StudentProfile,
    applications: list[OfferApplication],
    interviews: list[dict],
) -> list[dict[str, Any]]:
    actions: list[dict[str, Any]] = []
    profile = _profile_completion(student)
    if not profile['is_complete']:
        actions.append({
            'type': 'complete_profile',
            'priority': 'high',
            'title_key': 'action_complete_profile',
            'href': '/complete-profile',
        })
    if not _has_primary_cv(student):
        actions.append({
            'type': 'upload_cv',
            'priority': 'high',
            'title_key': 'action_upload_cv',
            'href': '/cv-editor',
        })

    for app in applications:
        if app.status == 'INTERVIEW':
            actions.append({
                'type': 'prepare_interview',
                'priority': 'high',
                'title_key': 'action_prepare_interview',
                'href': '/student/internship-offers/interview-simulator',
                'offer_uuid': str(app.offer.uuid),
                'offer_title': app.offer.title,
            })
        elif app.status in ('SHORTLISTED', 'UNDER_REVIEW'):
            actions.append({
                'type': 'track_application',
                'priority': 'medium',
                'title_key': 'action_track_application',
                'href': f'/student/internship-offers/applications/{app.uuid}',
                'offer_title': app.offer.title,
            })

    for interview in interviews[:3]:
        actions.append({
            'type': 'upcoming_interview',
            'priority': 'high',
            'title_key': 'action_upcoming_interview',
            'href': '/student/internship-offers/interview-simulator',
            'offer_title': interview['offer_title'],
            'scheduled_at': interview['scheduled_at'],
        })

    return actions[:8]


def _eligible_offers_queryset(student: StudentProfile):
    offers = InternshipOffer.objects.filter(
        status__in=PUBLICLY_VISIBLE_STATUSES,
    ).prefetch_related('targeting_rules').order_by('-updated_at')
    eligible = []
    for offer in offers[:200]:
        rules = list(offer.targeting_rules.filter(is_active=True))
        if student_passes_targeting(student, rules):
            score, _, _ = compute_match_score(student, offer)
            eligible.append((offer, float(score)))
    return eligible


def build_offers_feed(student: StudentProfile) -> dict[str, Any]:
    """Sections: recommended, eligible, recent, closing_soon, popular."""
    match_map = {
        ms.offer_id: float(ms.score)
        for ms in StudentOfferMatchScore.objects.filter(student_profile=student).select_related('offer')
    }

    recommended_raw = get_student_recommendation_feed(student)
    recommended = [
        {
            **_serialize_offer_brief(
                InternshipOffer.objects.get(uuid=item['offer_uuid']),
                match_score=item['score'],
            ),
            'reasons': item.get('reasons', []),
        }
        for item in recommended_raw
        if InternshipOffer.objects.filter(uuid=item['offer_uuid']).exists()
    ]

    eligible_pairs = _eligible_offers_queryset(student)
    eligible = [
        _serialize_offer_brief(offer, match_score=score)
        for offer, score in sorted(eligible_pairs, key=lambda x: -x[1])[:12]
    ]

    since = timezone.now() - timedelta(days=14)
    recent_offers = InternshipOffer.objects.filter(
        status__in=STUDENT_APPLYABLE_STATUSES,
        published_at__gte=since,
    ).order_by('-published_at')[:8]
    recent = []
    for offer in recent_offers:
        rules = list(offer.targeting_rules.filter(is_active=True))
        if student_passes_targeting(student, rules):
            score = match_map.get(offer.pk) or float(compute_match_score(student, offer)[0])
            if score > 0:
                recent.append(_serialize_offer_brief(offer, match_score=score))

    window = timezone.now() + timedelta(days=14)
    closing = InternshipOffer.objects.filter(
        status__in=STUDENT_APPLYABLE_STATUSES,
        application_deadline__lte=window,
        application_deadline__gte=timezone.now(),
    ).order_by('application_deadline')[:8]
    closing_soon = []
    for offer in closing:
        rules = list(offer.targeting_rules.filter(is_active=True))
        if student_passes_targeting(student, rules):
            score = match_map.get(offer.pk) or float(compute_match_score(student, offer)[0])
            if score > 0:
                closing_soon.append(_serialize_offer_brief(offer, match_score=score))

    popular_offers = InternshipOffer.objects.filter(
        status__in=STUDENT_APPLYABLE_STATUSES,
    ).order_by('-application_count', '-view_count')[:8]
    popular = []
    for offer in popular_offers:
        rules = list(offer.targeting_rules.filter(is_active=True))
        if student_passes_targeting(student, rules):
            score = match_map.get(offer.pk) or float(compute_match_score(student, offer)[0])
            if score > 0:
                popular.append(_serialize_offer_brief(offer, match_score=score))

    applied_offer_ids = set(
        OfferApplication.objects.filter(student_profile=student).values_list('offer_id', flat=True)
    )
    app_status_by_offer = {
        app.offer_id: app.status
        for app in OfferApplication.objects.filter(student_profile=student).select_related('offer')
    }

    def attach_application_status(items: list[dict]) -> list[dict]:
        for item in items:
            offer = InternshipOffer.objects.filter(uuid=item['uuid']).first()
            if offer:
                item['application_status'] = app_status_by_offer.get(offer.pk)
                item['has_applied'] = offer.pk in applied_offer_ids
        return items

    return {
        'recommended': attach_application_status(recommended),
        'eligible': attach_application_status(eligible),
        'recent': attach_application_status(recent),
        'closing_soon': attach_application_status(closing_soon),
        'popular': attach_application_status(popular),
    }


def build_journey_dashboard(student: StudentProfile) -> dict[str, Any]:
    applications_qs = OfferApplication.objects.filter(
        student_profile=student,
    ).select_related('offer').order_by('-last_status_change_at', '-applied_at')

    active_apps = [app for app in applications_qs if app.status in APPLICATION_ACTIVE_STATUSES]
    interviews = get_student_interviews(student, upcoming_only=True)

    recent_updates = []
    for app in applications_qs[:10]:
        last = ApplicationStatusHistory.objects.filter(application=app).order_by('-created_at').first()
        recent_updates.append({
            'application_uuid': str(app.uuid),
            'offer_title': app.offer.title,
            'company_name': app.offer.company_name,
            'status': app.status,
            'previous_status': last.previous_status if last else '',
            'changed_at': (last.created_at if last else app.applied_at).isoformat(),
        })

    deadlines = []
    applied_ids = set(app.offer_id for app in applications_qs)
    for app in active_apps:
        offer = app.offer
        if offer.application_deadline:
            deadlines.append({
                'offer_uuid': str(offer.uuid),
                'offer_title': offer.title,
                'company_name': offer.company_name,
                'deadline': offer.application_deadline.isoformat(),
                'application_uuid': str(app.uuid),
                'type': 'application_follow_up',
            })
    urgent_offers = InternshipOffer.objects.filter(
        status__in=STUDENT_APPLYABLE_STATUSES,
        application_deadline__gte=timezone.now(),
        application_deadline__lte=timezone.now() + timedelta(days=7),
    ).exclude(pk__in=applied_ids).order_by('application_deadline')[:5]
    for offer in urgent_offers:
        rules = list(offer.targeting_rules.filter(is_active=True))
        if student_passes_targeting(student, rules):
            score, _, _ = compute_match_score(student, offer)
            if score > 0:
                deadlines.append({
                    'offer_uuid': str(offer.uuid),
                    'offer_title': offer.title,
                    'company_name': offer.company_name,
                    'deadline': offer.application_deadline.isoformat(),
                    'type': 'offer_expiring',
                    'match_score': float(score),
                })

    deadlines.sort(key=lambda d: d['deadline'])

    total = applications_qs.count()
    interviews_count = OfferApplication.objects.filter(
        student_profile=student,
        status__in=['INTERVIEW', 'ACCEPTED', 'OFFER_ACCEPTED'],
    ).count()
    accepted = applications_qs.filter(
        status__in=['ACCEPTED', 'OFFER_ACCEPTED', 'INTERNSHIP_STARTED', 'INTERNSHIP_COMPLETED'],
    ).count()
    rejected = applications_qs.filter(status='REJECTED').count()

    return {
        'academic_profile': _academic_profile(student),
        'profile_completion': _profile_completion(student),
        'cv_score': _latest_cv_analysis_score(student),
        'applications_in_progress': [_serialize_application(app) for app in active_apps[:8]],
        'upcoming_deadlines': deadlines[:8],
        'interviews_scheduled': interviews,
        'recent_status_updates': recent_updates[:6],
        'action_items': _build_action_items(student, active_apps, interviews),
        'analytics': {
            'applications_sent': total,
            'interviews_obtained': interviews_count,
            'offers_accepted': accepted,
            'success_rate': round((accepted / total) * 100) if total else 0,
            'rejected': rejected,
        },
        'pipeline_steps': PIPELINE_STEPS,
    }


def get_match_for_offer(student: StudentProfile, offer: InternshipOffer) -> dict[str, Any]:
    score, reasons, breakdown = compute_match_score(student, offer)
    rules = list(offer.targeting_rules.filter(is_active=True))
    eligible = student_passes_targeting(student, rules)

    missing_skills: list[str] = []
    req = breakdown.get('required_skills', {})
    if isinstance(req, dict):
        required = set(str(s).lower() for s in (offer.required_skills or []))
        matched = set(str(s).lower() for s in req.get('matched', []))
        missing_skills = sorted(required - matched)

    return {
        'offer_uuid': str(offer.uuid),
        'score': float(score),
        'is_eligible': eligible and score > 0,
        'reasons': reasons,
        'breakdown': breakdown,
        'missing_skills': missing_skills,
        'academic_profile': _academic_profile(student),
    }
