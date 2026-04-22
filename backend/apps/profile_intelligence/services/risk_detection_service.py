"""
Risk detection — derives StudentProfileRisk entries from signals.

Each rule is a small predicate over the activity log and derived
metrics. Rules are additive: detecting a new risk doesn't clear
unrelated ones. A risk is resolved by setting is_active=False
when the underlying condition no longer holds.
"""

from __future__ import annotations

from datetime import timedelta

from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile

from ..models import (
    StudentProfileActivityLog,
    StudentProfileIndicator,
    StudentProfileRisk,
)


_INACTIVITY_DAYS = 21           # no login in 3 weeks -> risk
_STALE_PROFILE_DAYS = 60        # profile untouched for ~2 months -> risk


def _upsert_risk(
    *,
    student_profile: StudentProfile,
    risk_type: str,
    risk_level: str,
    details: dict | None = None,
) -> StudentProfileRisk:
    risk, created = StudentProfileRisk.objects.get_or_create(
        student_profile=student_profile,
        risk_type=risk_type,
        is_active=True,
        defaults={
            'risk_level': risk_level,
            'details_json': details or {},
        },
    )
    if not created:
        risk.risk_level = risk_level
        risk.details_json = details or {}
        risk.resolved_at = None
        risk.save(update_fields=['risk_level', 'details_json', 'resolved_at', 'updated_at'])
    return risk


def _resolve_risk(student_profile: StudentProfile, risk_type: str) -> None:
    StudentProfileRisk.objects.filter(
        student_profile=student_profile,
        risk_type=risk_type,
        is_active=True,
    ).update(
        is_active=False,
        resolved_at=timezone.now(),
    )


def detect_risk(student_profile: StudentProfile) -> list[StudentProfileRisk]:
    """
    Run every rule for a single student. Returns the set of risks
    currently active for that student after the pass.
    """
    now = timezone.now()

    # --- Rule: inactivity ---
    last_activity = (
        StudentProfileActivityLog.objects
        .filter(student_profile=student_profile)
        .order_by('-created_at')
        .values_list('created_at', flat=True)
        .first()
    )
    if last_activity is None or (now - last_activity) > timedelta(days=_INACTIVITY_DAYS):
        level = (
            StudentProfileRisk.RiskLevel.HIGH
            if last_activity is None
            else StudentProfileRisk.RiskLevel.MEDIUM
        )
        _upsert_risk(
            student_profile=student_profile,
            risk_type='inactivity',
            risk_level=level,
            details={
                'last_activity_at': last_activity.isoformat() if last_activity else None,
                'threshold_days': _INACTIVITY_DAYS,
            },
        )
    else:
        _resolve_risk(student_profile, 'inactivity')

    # --- Rule: profile incomplete ---
    if not student_profile.profile_completed:
        age_days = (now - student_profile.created_at).days
        if age_days > _STALE_PROFILE_DAYS:
            _upsert_risk(
                student_profile=student_profile,
                risk_type='profile_incomplete',
                risk_level=StudentProfileRisk.RiskLevel.MEDIUM,
                details={'profile_age_days': age_days},
            )
    else:
        _resolve_risk(student_profile, 'profile_incomplete')

    # --- Rule: no CV linked ---
    if not getattr(student_profile, 'cvs', None) or not student_profile.cvs.exists():
        _upsert_risk(
            student_profile=student_profile,
            risk_type='missing_cv',
            risk_level=StudentProfileRisk.RiskLevel.LOW,
            details={},
        )
    else:
        _resolve_risk(student_profile, 'missing_cv')

    active = list(
        StudentProfileRisk.objects
        .filter(student_profile=student_profile, is_active=True)
    )

    # Propagate "is_at_risk" to indicator so dashboards don't need a join.
    StudentProfileIndicator.objects.update_or_create(
        student_profile=student_profile,
        defaults={'is_at_risk': any(
            r.risk_level in (
                StudentProfileRisk.RiskLevel.HIGH,
                StudentProfileRisk.RiskLevel.CRITICAL,
            )
            for r in active
        )},
    )
    return active


def flag_at_risk_students() -> int:
    """
    Batch entrypoint — run detect_risk for every student and return
    the number of students flagged as at-risk after the pass.
    """
    flagged = 0
    for student in StudentProfile.objects.all().iterator():
        risks = detect_risk(student)
        if any(
            r.risk_level in (
                StudentProfileRisk.RiskLevel.HIGH,
                StudentProfileRisk.RiskLevel.CRITICAL,
            )
            for r in risks
        ):
            flagged += 1
    return flagged
