"""
Profile Intelligence Engine — the orchestrator.

Everything dashboards and the API depend on is assembled here:
- behaviour metrics are recomputed
- risks are re-detected
- suggestions are regenerated
- state machine is advanced
- three headline scores are persisted onto StudentProfileIndicator
- a daily snapshot is rolled up

No app talks to these sub-services directly from the outside; callers
use this engine so the order of operations is guaranteed.
"""

from __future__ import annotations

from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile

from ..models import (
    StudentProfileActivityLog,
    StudentProfileContext,
    StudentProfileIndicator,
    StudentProfileModuleData,
    StudentProfileSnapshot,
)
from . import (
    behavior_analysis_service,
    risk_detection_service,
    state_machine_service,
    suggestion_engine,
)


# Completion of the *core* student profile — separate from per-module
# completion (CV, internship prefs, etc.) which live in their own apps.
_COMPLETION_FIELDS = (
    'identity_confirmed',
    'profile_completed',
    'career_objective',
    'availability',
    'city',
    'skills',
    'linkedin_url',
)


def _completion_rate(student_profile: StudentProfile) -> int:
    filled = 0
    for field in _COMPLETION_FIELDS:
        value = getattr(student_profile, field, None)
        if isinstance(value, bool):
            filled += 1 if value else 0
        elif isinstance(value, (list, tuple, dict)):
            filled += 1 if len(value) > 0 else 0
        elif value:
            filled += 1
    return int((filled / len(_COMPLETION_FIELDS)) * 100)


def _last_activity_at(student_profile: StudentProfile):
    return (
        StudentProfileActivityLog.objects
        .filter(student_profile=student_profile)
        .order_by('-created_at')
        .values_list('created_at', flat=True)
        .first()
    )


def _risk_score(student_profile: StudentProfile) -> int:
    """Weight active risks by level into a 0-100 risk score."""
    weights = {
        'LOW': 10,
        'MEDIUM': 25,
        'HIGH': 50,
        'CRITICAL': 80,
    }
    total = 0
    for risk in student_profile.risks.filter(is_active=True):
        total += weights.get(risk.risk_level, 0)
    return min(100, total)


def _health_score(*, completion: int, engagement: int, risk: int) -> int:
    """
    Blend the three signals into a single 0-100 "profile health".
    Weights mirror how stakeholders reason about students:
      completion > engagement, and risk is a strong penalty.
    """
    base = int(0.5 * completion + 0.5 * engagement)
    return max(0, min(100, base - int(risk * 0.4)))


@transaction.atomic
def aggregate_profile_data(student_profile: StudentProfile) -> StudentProfileIndicator:
    """
    Single-student full recompute. Writes StudentProfileIndicator and
    returns it. Everything else (metrics, risks, suggestions, state
    transitions) is refreshed as a side-effect.
    """
    # Metrics -> risks -> suggestions -> state. Order matters, since
    # each step consumes what the previous one produced.
    behavior_analysis_service.compute_activity_metrics(student_profile)
    engagement = behavior_analysis_service.compute_engagement_score(student_profile)
    risk_detection_service.detect_risk(student_profile)
    suggestion_engine.generate_suggestions(student_profile)
    state_machine_service.update_profile_state(student_profile)

    completion = _completion_rate(student_profile)
    risk = _risk_score(student_profile)
    health = _health_score(completion=completion, engagement=engagement, risk=risk)

    indicator, _ = StudentProfileIndicator.objects.update_or_create(
        student_profile=student_profile,
        defaults={
            'health_score': health,
            'engagement_score': engagement,
            'risk_score': risk,
            'last_activity_at': _last_activity_at(student_profile),
            'is_at_risk': risk >= 50,
        },
    )

    # Daily snapshot is idempotent thanks to the unique constraint.
    StudentProfileSnapshot.objects.update_or_create(
        student_profile=student_profile,
        snapshot_date=timezone.now().date(),
        defaults={
            'completion_rate': completion,
            'engagement_score': engagement,
            'risk_score': risk,
        },
    )
    return indicator


def compute_global_profile_view(student_profile: StudentProfile) -> dict[str, Any]:
    """
    Read-path helper. Returns a dict assembled from already-persisted
    state (no recompute). Use aggregate_profile_data() first if the
    caller needs guaranteed freshness.
    """
    indicator = getattr(student_profile, 'indicator', None)
    contexts = StudentProfileContext.objects.filter(
        student_profile=student_profile,
        status=StudentProfileContext.Status.ACTIVE,
    )
    module_rows = (
        StudentProfileModuleData.objects
        .filter(student_profile=student_profile)
        .select_related('module')
    )
    open_suggestions = student_profile.suggestions.filter(is_completed=False)
    active_risks = student_profile.risks.filter(is_active=True)
    recent_activity = (
        StudentProfileActivityLog.objects
        .filter(student_profile=student_profile)
        .order_by('-created_at')[:20]
    )

    return {
        'student_profile_id': student_profile.pk,
        'indicator': indicator,
        'completion_rate': _completion_rate(student_profile),
        'contexts': list(contexts),
        'modules': [
            {
                'code': row.module.module_code,
                'name': row.module.module_name,
                'summary': row.summary_json,
                'metrics': row.metrics_json,
                'last_updated_at': row.last_updated_at,
            }
            for row in module_rows
        ],
        'suggestions': list(open_suggestions),
        'risks': list(active_risks),
        'recent_activity': list(recent_activity),
    }
