"""
Behaviour analysis — derives engagement metrics from the activity log.

Reads StudentProfileActivityLog rows for a student, produces a
StudentProfileBehaviorMetric per source_app, and returns a single
engagement score used by the intelligence engine.
"""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile

from ..models import (
    StudentProfileActivityLog,
    StudentProfileBehaviorMetric,
)


# Engagement is anchored in a 30-day rolling window. Shorter windows
# amplify noise from a single burst of activity; longer ones hide
# students who've already dropped off.
_WINDOW_DAYS = 30


def _classify(actions_count: int) -> str:
    if actions_count == 0:
        return StudentProfileBehaviorMetric.EngagementLevel.INACTIVE
    if actions_count < 5:
        return StudentProfileBehaviorMetric.EngagementLevel.LOW
    if actions_count < 20:
        return StudentProfileBehaviorMetric.EngagementLevel.MEDIUM
    return StudentProfileBehaviorMetric.EngagementLevel.HIGH


def compute_activity_metrics(student_profile: StudentProfile) -> list[StudentProfileBehaviorMetric]:
    """
    Recompute per-app behaviour metrics and persist them.

    Returns the refreshed metric rows.
    """
    since = timezone.now() - timedelta(days=_WINDOW_DAYS)
    rows = (
        StudentProfileActivityLog.objects
        .filter(student_profile=student_profile, created_at__gte=since)
        .values('source_app')
        .annotate(
            total=Count('id'),
            logins=Count('id', filter=Q(activity_type=StudentProfileActivityLog.ActivityType.LOGIN)),
            actions=Count('id', filter=Q(activity_type=StudentProfileActivityLog.ActivityType.ACTION)),
        )
    )

    metrics: list[StudentProfileBehaviorMetric] = []
    for row in rows:
        metric, _ = StudentProfileBehaviorMetric.objects.update_or_create(
            student_profile=student_profile,
            source_app=row['source_app'],
            defaults={
                'login_count': row['logins'],
                'actions_count': row['actions'],
                # average_session_duration is informational for now; real
                # session timing lives in the authentication app.
                'average_session_duration': 0.0,
                'engagement_level': _classify(row['actions'] + row['logins']),
            },
        )
        metrics.append(metric)
    return metrics


def compute_engagement_score(student_profile: StudentProfile) -> int:
    """
    Return an integer 0-100 summarising the student's overall activity.

    Uses a saturating formula so additional events beyond an "active"
    threshold don't keep pushing the score toward an unreasonable 100.
    """
    since = timezone.now() - timedelta(days=_WINDOW_DAYS)
    total = (
        StudentProfileActivityLog.objects
        .filter(student_profile=student_profile, created_at__gte=since)
        .count()
    )
    # 40 events / month is treated as "fully engaged".
    score = min(100, int((total / 40.0) * 100))
    return score
