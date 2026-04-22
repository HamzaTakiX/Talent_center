"""
Profile state machine — resolves a single, human-readable "state"
for a student profile (NEW, ONBOARDING, ACTIVE, AT_RISK, DORMANT...).

The state is a pure function of other signals, so it's derived rather
than stored on StudentProfile. Every transition is appended to
StudentProfileStateTransition for history/audit.
"""

from __future__ import annotations

from datetime import timedelta

from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile

from ..models import (
    StudentProfileActivityLog,
    StudentProfileIndicator,
    StudentProfileRisk,
    StudentProfileStateTransition,
)


_DORMANT_DAYS = 60
_AT_RISK_DAYS = 21


def _resolve_state(student_profile: StudentProfile) -> str:
    """Compute the current state from profile + activity + risks."""
    last_activity = (
        StudentProfileActivityLog.objects
        .filter(student_profile=student_profile)
        .order_by('-created_at')
        .values_list('created_at', flat=True)
        .first()
    )

    if last_activity is None:
        return StudentProfileStateTransition.State.NEW

    age = timezone.now() - last_activity
    if age > timedelta(days=_DORMANT_DAYS):
        return StudentProfileStateTransition.State.DORMANT

    has_critical_risk = StudentProfileRisk.objects.filter(
        student_profile=student_profile,
        is_active=True,
        risk_level__in=[
            StudentProfileRisk.RiskLevel.HIGH,
            StudentProfileRisk.RiskLevel.CRITICAL,
        ],
    ).exists()
    if has_critical_risk or age > timedelta(days=_AT_RISK_DAYS):
        return StudentProfileStateTransition.State.AT_RISK

    if not student_profile.profile_completed:
        return StudentProfileStateTransition.State.ONBOARDING

    indicator = getattr(student_profile, 'indicator', None)
    if indicator and indicator.engagement_score >= 70:
        return StudentProfileStateTransition.State.ENGAGED
    return StudentProfileStateTransition.State.ACTIVE


def _previous_state(student_profile: StudentProfile) -> str:
    last = (
        StudentProfileStateTransition.objects
        .filter(student_profile=student_profile)
        .order_by('-transitioned_at')
        .values_list('to_state', flat=True)
        .first()
    )
    return last or ''


def update_profile_state(
    student_profile: StudentProfile,
    *,
    trigger_type: str = StudentProfileStateTransition.TriggerType.SYSTEM,
    reason: str = '',
) -> StudentProfileStateTransition | None:
    """
    Compute the new state, and if it differs from the last one, record
    the transition. Returns the new transition row, or None if no
    change occurred.
    """
    previous = _previous_state(student_profile)
    new_state = _resolve_state(student_profile)
    if previous == new_state:
        return None
    return StudentProfileStateTransition.objects.create(
        student_profile=student_profile,
        from_state=previous,
        to_state=new_state,
        trigger_type=trigger_type,
        reason=reason,
    )


def handle_transitions() -> int:
    """
    Sweep every student and record any state transitions. Intended
    to be called from a scheduled task. Returns the number of
    transitions recorded.
    """
    count = 0
    for student in StudentProfile.objects.all().iterator():
        transition = update_profile_state(
            student,
            trigger_type=StudentProfileStateTransition.TriggerType.SCHEDULED,
            reason='batch state refresh',
        )
        if transition is not None:
            count += 1
    # Surface last transition timestamp onto indicator where relevant.
    StudentProfileIndicator.objects.filter(last_activity_at__isnull=True).update(
        last_activity_at=timezone.now(),
    )
    return count
