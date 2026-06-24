"""
Program-level analytics — aggregate intelligence scores by cohort.
"""

from __future__ import annotations

from django.db.models import Avg, Count, Q

from apps.accounts_et_roles.models import StudentProfile

from ..models import StudentProfileIndicator


def _cohort_aggregates(qs) -> dict:
    """Compute average scores for a queryset of StudentProfile objects."""
    profile_ids = list(qs.values_list('pk', flat=True))
    if not profile_ids:
        return {
            'student_count': 0,
            'avg_risk_score': 0,
            'avg_engagement_score': 0,
            'avg_employability_score': 0,
            'avg_readiness_score': 0,
            'avg_placement_probability': 0,
            'at_risk_count': 0,
            'critical_risk_count': 0,
            'healthy_count': 0,
        }

    indicators = StudentProfileIndicator.objects.filter(student_profile_id__in=profile_ids)
    agg = indicators.aggregate(
        avg_risk=Avg('risk_score'),
        avg_engagement=Avg('engagement_score'),
        avg_employability=Avg('employability_score'),
        avg_readiness=Avg('internship_readiness_score'),
        avg_placement=Avg('placement_probability'),
    )
    return {
        'student_count': len(profile_ids),
        'avg_risk_score': round(agg['avg_risk'] or 0, 1),
        'avg_engagement_score': round(agg['avg_engagement'] or 0, 1),
        'avg_employability_score': round(agg['avg_employability'] or 0, 1),
        'avg_readiness_score': round(agg['avg_readiness'] or 0, 1),
        'avg_placement_probability': round(agg['avg_placement'] or 0, 1),
        'at_risk_count': indicators.filter(is_at_risk=True).count(),
        'critical_risk_count': indicators.filter(
            risk_category=StudentProfileIndicator.RiskCategory.CRITICAL,
        ).count(),
        'healthy_count': indicators.filter(
            health_index=StudentProfileIndicator.HealthIndex.HEALTHY,
        ).count(),
    }


def program_analytics(*, filiere_id: int | None = None, class_group_id: int | None = None,
                      academic_level_id: int | None = None, academic_sector_id: int | None = None) -> dict:
    """Return cohort analytics, optionally filtered."""
    base_qs = StudentProfile.objects.all()
    if filiere_id:
        base_qs = base_qs.filter(filiere_id=filiere_id)
    if class_group_id:
        base_qs = base_qs.filter(class_group_id=class_group_id)
    if academic_level_id:
        base_qs = base_qs.filter(academic_level_id=academic_level_id)
    if academic_sector_id:
        base_qs = base_qs.filter(academic_sector_id=academic_sector_id)

    overview = _cohort_aggregates(base_qs)

    by_program = []
    for row in (
        base_qs
        .filter(filiere_id__isnull=False)
        .values('filiere_id', 'filiere__name', 'filiere__code')
        .annotate(count=Count('id'))
        .order_by('-count')[:50]
    ):
        cohort_qs = base_qs.filter(filiere_id=row['filiere_id'])
        stats = _cohort_aggregates(cohort_qs)
        stats['filiere_id'] = row['filiere_id']
        stats['filiere_name'] = row['filiere__name'] or row['filiere__code']
        by_program.append(stats)

    by_class = []
    for row in (
        base_qs
        .filter(class_group_id__isnull=False)
        .values('class_group_id', 'class_group__name', 'class_group__code')
        .annotate(count=Count('id'))
        .order_by('-count')[:50]
    ):
        cohort_qs = base_qs.filter(class_group_id=row['class_group_id'])
        stats = _cohort_aggregates(cohort_qs)
        stats['class_group_id'] = row['class_group_id']
        stats['class_group_name'] = row['class_group__name'] or row['class_group__code']
        by_class.append(stats)

    by_level = []
    for row in (
        base_qs
        .filter(academic_level_id__isnull=False)
        .values('academic_level_id', 'academic_level__name', 'academic_level__code')
        .annotate(count=Count('id'))
        .order_by('-count')[:20]
    ):
        cohort_qs = base_qs.filter(academic_level_id=row['academic_level_id'])
        stats = _cohort_aggregates(cohort_qs)
        stats['academic_level_id'] = row['academic_level_id']
        stats['academic_level_name'] = row['academic_level__name'] or row['academic_level__code']
        by_level.append(stats)

    weak_cohorts = sorted(
        [c for c in by_program + by_class if c['student_count'] >= 3],
        key=lambda c: (c['avg_readiness_score'], -c['avg_risk_score']),
    )[:10]

    return {
        'overview': overview,
        'by_program': by_program,
        'by_class': by_class,
        'by_level': by_level,
        'weak_cohorts': weak_cohorts,
    }


def platform_overview() -> dict:
    """Dashboard-level intelligence summary for admin health widget."""
    total = StudentProfile.objects.count()
    indicators = StudentProfileIndicator.objects.all()
    agg = indicators.aggregate(
        avg_health=Avg('health_score'),
        avg_engagement=Avg('engagement_score'),
        avg_risk=Avg('risk_score'),
    )
    at_risk = indicators.filter(is_at_risk=True).count()
    critical = indicators.filter(
        risk_category=StudentProfileIndicator.RiskCategory.CRITICAL,
    ).count()
    healthy = indicators.filter(
        health_index=StudentProfileIndicator.HealthIndex.HEALTHY,
    ).count()

    from apps.accounts_et_roles.models import User
    from django.utils import timezone
    from datetime import timedelta

    active_users = User.objects.filter(
        role=User.RoleChoices.STUDENT,
        last_login__gte=timezone.now() - timedelta(days=30),
    ).count()

    # Risk trend from last 5 daily snapshot aggregates
    from ..models import StudentProfileSnapshot
    from django.db.models.functions import TruncDate

    trend_rows = (
        StudentProfileSnapshot.objects
        .values('snapshot_date')
        .annotate(avg_risk=Avg('risk_score'), avg_engagement=Avg('engagement_score'))
        .order_by('-snapshot_date')[:5]
    )
    risk_trend = [round(r['avg_risk'] or 0, 1) for r in reversed(list(trend_rows))]
    activity_trend = [round(r['avg_engagement'] or 0, 1) for r in reversed(list(trend_rows))]

    health_score = round(agg['avg_health'] or 0)

    return {
        'health_score': health_score,
        'critical_alerts': critical,
        'students_at_risk': at_risk,
        'active_users': active_users,
        'total_students': total,
        'healthy_students': healthy,
        'avg_engagement': round(agg['avg_engagement'] or 0, 1),
        'avg_risk': round(agg['avg_risk'] or 0, 1),
        'risk_trend': risk_trend if risk_trend else [0],
        'activity_trend': activity_trend if activity_trend else [0],
    }
