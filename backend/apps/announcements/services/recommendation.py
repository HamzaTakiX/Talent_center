"""Recommendation scoring engine foundation."""

from __future__ import annotations

from decimal import Decimal

from django.db.models import Avg, Count
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.announcements.models import (
    Announcement,
    RecommendationScore,
    StudentAnnouncementAction,
    StudentAnnouncementPreference,
)
from apps.announcements.services.targeting import announcement_visible_to_student

WEIGHT_VISIBILITY = Decimal('0.15')
WEIGHT_COMPETENCE = Decimal('0.35')
WEIGHT_PREFERENCE = Decimal('0.20')
WEIGHT_ENGAGEMENT = Decimal('0.20')
WEIGHT_URGENCY = Decimal('0.15')
WEIGHT_INSTITUTIONAL = Decimal('0.10')


def _visibility_score(student: StudentProfile, announcement: Announcement) -> Decimal:
    """Baseline score when the announcement is visible to the student (no program/class boost)."""
    if not announcement_visible_to_student(announcement, student):
        return Decimal('0')
    return Decimal('50')


def _competence_interests_score(student: StudentProfile, announcement: Announcement) -> Decimal:
    """Match student skills/interests with announcement requirements.

    Program and class targeting are intentionally excluded from recommendations.
    TODO: compare student.skills / research_interests with announcement required_skills, etc.
    """
    return Decimal('0')


def _preference_score(student: StudentProfile, announcement: Announcement) -> Decimal:
    pref = StudentAnnouncementPreference.objects.filter(
        student_profile=student,
        announcement_type=announcement.announcement_type,
    ).first()
    if not pref:
        return Decimal('50')
    if pref.is_banned and not announcement.overrides_ban:
        return Decimal('0')
    if pref.is_muted and not announcement.overrides_mute:
        return Decimal('10')
    if pref.is_favorite:
        return Decimal('90')
    return Decimal('50')


def _engagement_score(student: StudentProfile, announcement: Announcement) -> Decimal:
    actions = StudentAnnouncementAction.objects.filter(
        student_profile=student,
        announcement=announcement,
    )
    if not actions.exists():
        return Decimal('40')
    types = set(actions.values_list('action_type', flat=True))
    score = Decimal('40')
    if StudentAnnouncementAction.ActionType.SAVE in types:
        score += Decimal('25')
    if StudentAnnouncementAction.ActionType.CLICK in types:
        score += Decimal('15')
    if StudentAnnouncementAction.ActionType.DISMISS in types:
        score -= Decimal('30')
    return max(Decimal('0'), min(score, Decimal('100')))


def _urgency_score(announcement: Announcement) -> Decimal:
    mapping = {
        Announcement.Priority.NORMAL: Decimal('40'),
        Announcement.Priority.IMPORTANT: Decimal('60'),
        Announcement.Priority.URGENT: Decimal('80'),
        Announcement.Priority.PINNED: Decimal('90'),
        Announcement.Priority.INSTITUTIONAL_CRITICAL: Decimal('100'),
    }
    score = mapping.get(announcement.priority, Decimal('40'))
    if announcement.is_pinned:
        score = min(score + Decimal('10'), Decimal('100'))
    if announcement.application_deadline:
        days = (announcement.application_deadline - timezone.now()).days
        if days <= 3:
            score = min(score + Decimal('15'), Decimal('100'))
    return score


def _institutional_score(announcement: Announcement) -> Decimal:
    at = announcement.announcement_type
    weight = Decimal(str(at.recommendation_weight or 1))
    boost = Decimal(str(at.recommendation_boost or 0))
    base = Decimal('50') * weight + boost
    return min(base, Decimal('100'))


def compute_recommendation_score(
    student: StudentProfile,
    announcement: Announcement,
) -> tuple[Decimal, dict]:
    visibility = _visibility_score(student, announcement)
    competence = _competence_interests_score(student, announcement)
    pref = _preference_score(student, announcement)
    engagement = _engagement_score(student, announcement)
    urgency = _urgency_score(announcement)
    institutional = _institutional_score(announcement)

    total = (
        visibility * WEIGHT_VISIBILITY
        + competence * WEIGHT_COMPETENCE
        + pref * WEIGHT_PREFERENCE
        + engagement * WEIGHT_ENGAGEMENT
        + urgency * WEIGHT_URGENCY
        + institutional * WEIGHT_INSTITUTIONAL
    )
    total = min(total, Decimal('100'))
    breakdown = {
        'visibility': float(visibility),
        'competence_interests': float(competence),
        'preference': float(pref),
        'engagement': float(engagement),
        'urgency': float(urgency),
        'institutional': float(institutional),
    }
    return total, breakdown


def upsert_recommendation_score(
    student: StudentProfile,
    announcement: Announcement,
) -> RecommendationScore:
    score, breakdown = compute_recommendation_score(student, announcement)
    competence = Decimal(str(breakdown.get('competence_interests', 0)))
    is_recommended = competence > Decimal('0') and score >= Decimal('55')
    obj, _ = RecommendationScore.objects.update_or_create(
        student_profile=student,
        announcement=announcement,
        defaults={
            'score': score,
            'score_breakdown': breakdown,
            'is_recommended': is_recommended,
        },
    )
    return obj


def recompute_scores_for_announcement(announcement: Announcement, limit: int = 500) -> int:
    students = StudentProfile.objects.all()[:limit]
    count = 0
    for student in students:
        if announcement_visible_to_student(announcement, student):
            upsert_recommendation_score(student, announcement)
            count += 1
    return count


def get_student_feed(
    student: StudentProfile,
    *,
    limit: int = 20,
) -> list[dict]:
    """Student API feed — ranked recommendations (future student frontend)."""
    scores = (
        RecommendationScore.objects.filter(
            student_profile=student,
            is_recommended=True,
            announcement__status=Announcement.Status.PUBLISHED,
        )
        .select_related('announcement', 'announcement__announcement_type')
        .order_by('-score')[:limit]
    )
    return [
        {
            'announcementId': str(s.announcement.uuid),
            'score': float(s.score),
            'breakdown': s.score_breakdown,
        }
        for s in scores
    ]
