"""
Activity tracking — the *write-path* of the intelligence layer.

Every observable student action (login, CV edit, meeting created, ...)
is captured here as a single row in StudentProfileActivityLog. Other
services derive metrics, indicators, risks and suggestions from this
log, so its shape must stay stable and self-describing.
"""

from __future__ import annotations

from typing import Any

from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile

from ..models import StudentProfileActivityLog, StudentProfileIndicator


def log_activity(
    *,
    student_profile: StudentProfile,
    activity_type: str,
    source_app: str,
    action_code: str,
    metadata: dict[str, Any] | None = None,
) -> StudentProfileActivityLog:
    """
    Record one activity row and bump the student's last_activity_at
    indicator. Services and signals across apps should funnel through
    this single function.
    """
    entry = StudentProfileActivityLog.objects.create(
        student_profile=student_profile,
        activity_type=activity_type,
        source_app=source_app,
        action_code=action_code,
        metadata_json=metadata or {},
    )
    StudentProfileIndicator.objects.update_or_create(
        student_profile=student_profile,
        defaults={'last_activity_at': timezone.now()},
    )
    return entry


def track_login(
    *,
    student_profile: StudentProfile,
    source_app: str = 'authentication',
    metadata: dict[str, Any] | None = None,
) -> StudentProfileActivityLog:
    """Shortcut used by the auth signal receiver."""
    return log_activity(
        student_profile=student_profile,
        activity_type=StudentProfileActivityLog.ActivityType.LOGIN,
        source_app=source_app,
        action_code='user.login',
        metadata=metadata,
    )


def track_action(
    *,
    student_profile: StudentProfile,
    source_app: str,
    action_code: str,
    metadata: dict[str, Any] | None = None,
) -> StudentProfileActivityLog:
    """Generic entry point for non-login activity from any module."""
    return log_activity(
        student_profile=student_profile,
        activity_type=StudentProfileActivityLog.ActivityType.ACTION,
        source_app=source_app,
        action_code=action_code,
        metadata=metadata,
    )
