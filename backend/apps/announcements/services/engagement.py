"""Record student views, clicks, and sync announcement engagement counters."""

from __future__ import annotations

from django.db.models import F

from apps.accounts_et_roles.models import StudentProfile
from apps.announcements.models import Announcement, StudentAnnouncementAction
from apps.announcements.services.recommendation import upsert_recommendation_score


def _refresh_recommendation(student: StudentProfile, announcement: Announcement) -> None:
    upsert_recommendation_score(student, announcement)


def record_student_announcement_view(
    student: StudentProfile,
    announcement: Announcement,
) -> bool:
    """Record the first view for a student. Returns True when newly recorded."""
    already_viewed = StudentAnnouncementAction.objects.filter(
        student_profile=student,
        announcement=announcement,
        action_type=StudentAnnouncementAction.ActionType.VIEW,
    ).exists()
    if already_viewed:
        return False

    StudentAnnouncementAction.objects.create(
        student_profile=student,
        announcement=announcement,
        action_type=StudentAnnouncementAction.ActionType.VIEW,
    )
    Announcement.objects.filter(pk=announcement.pk).update(
        view_count=F('view_count') + 1,
    )
    _refresh_recommendation(student, announcement)
    return True


def record_student_announcement_click(
    student: StudentProfile,
    announcement: Announcement,
    *,
    metadata: dict | None = None,
) -> None:
    StudentAnnouncementAction.objects.create(
        student_profile=student,
        announcement=announcement,
        action_type=StudentAnnouncementAction.ActionType.CLICK,
        metadata_json=metadata or {},
    )
    Announcement.objects.filter(pk=announcement.pk).update(
        click_count=F('click_count') + 1,
    )
    _refresh_recommendation(student, announcement)
