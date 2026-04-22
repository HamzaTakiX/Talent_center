"""
Selectors — read-side query helpers.

Views call these so complex filter composition stays testable and
so the advanced search endpoint can be reused from other callers
(CLI, internal jobs) without duplicating ORM logic.
"""

from __future__ import annotations

from django.db.models import QuerySet

from apps.accounts_et_roles.models import StudentProfile

from .models import StudentProfileIndicator, StudentProfileRisk


def search_students(filters: dict) -> QuerySet[StudentProfile]:
    """
    Compose a StudentProfile queryset from a filter dict validated by
    SearchFilterSerializer.
    """
    qs = StudentProfile.objects.select_related('indicator')

    if 'is_at_risk' in filters:
        qs = qs.filter(indicator__is_at_risk=filters['is_at_risk'])
    if 'min_engagement_score' in filters:
        qs = qs.filter(indicator__engagement_score__gte=filters['min_engagement_score'])
    if 'max_engagement_score' in filters:
        qs = qs.filter(indicator__engagement_score__lte=filters['max_engagement_score'])
    if 'min_risk_score' in filters:
        qs = qs.filter(indicator__risk_score__gte=filters['min_risk_score'])
    if 'risk_type' in filters:
        qs = qs.filter(
            risks__risk_type=filters['risk_type'],
            risks__is_active=True,
        ).distinct()
    if 'source_app' in filters:
        qs = qs.filter(
            activity_logs__source_app=filters['source_app'],
        ).distinct()
    return qs
