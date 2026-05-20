"""Operational intelligence aggregates for the history center."""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from apps.history.models import HistoryEvent
from apps.history.services.visibility import filter_events_for_user


def build_dashboard(user, queryset=None) -> dict:
    if queryset is not None:
        base = queryset
    else:
        base = filter_events_for_user(HistoryEvent.objects.all(), user)
    now = timezone.now()
    last_24h = now - timedelta(hours=24)
    last_7d = now - timedelta(days=7)

    total = base.count()
    critical_24h = base.filter(
        severity__in=[HistoryEvent.Severity.ERROR, HistoryEvent.Severity.CRITICAL],
        occurred_at__gte=last_24h,
    ).count()
    automated_7d = base.filter(is_automated=True, occurred_at__gte=last_7d).count()
    active_actors_7d = (
        base.filter(occurred_at__gte=last_7d, actor_user__isnull=False)
        .values('actor_user')
        .distinct()
        .count()
    )

    by_module = list(
        base.filter(occurred_at__gte=last_7d)
        .values('source_app')
        .annotate(count=Count('id'))
        .order_by('-count')[:12]
    )

    by_severity = list(
        base.filter(occurred_at__gte=last_7d)
        .values('severity')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    by_action = list(
        base.filter(occurred_at__gte=last_7d)
        .values('action_code')
        .annotate(count=Count('id'))
        .order_by('-count')[:10]
    )

    module_stats = _module_kpi_stats(base)

    return {
        'summary': {
            'total_events': total,
            'critical_last_24h': critical_24h,
            'automated_last_7d': automated_7d,
            'active_actors_7d': active_actors_7d,
        },
        'by_module': by_module,
        'by_severity': by_severity,
        'by_action': by_action,
        'module_stats': module_stats,
        'activity_trend': _activity_trend(base, days=14),
    }


def build_insights(user) -> list[dict]:
    """Lightweight operational insights (rule-based BI)."""
    base = filter_events_for_user(HistoryEvent.objects.all(), user)
    now = timezone.now()
    last_24h = now - timedelta(hours=24)
    prev_24h = now - timedelta(hours=48)

    recent = base.filter(occurred_at__gte=last_24h).count()
    previous = base.filter(occurred_at__gte=prev_24h, occurred_at__lt=last_24h).count()

    insights: list[dict] = []

    if previous and recent > previous * 1.8:
        insights.append({
            'code': 'activity_spike',
            'severity': 'warning',
            'title_key': 'auditCenter.insights.activitySpike',
            'detail_key': 'auditCenter.insights.activitySpikeDetail',
            'metadata': {'recent': recent, 'previous': previous},
        })

    failed = base.filter(
        severity__in=[HistoryEvent.Severity.ERROR, HistoryEvent.Severity.CRITICAL],
        occurred_at__gte=last_24h,
    ).count()
    if failed >= 5:
        insights.append({
            'code': 'critical_cluster',
            'severity': 'critical',
            'title_key': 'auditCenter.insights.criticalCluster',
            'detail_key': 'auditCenter.insights.criticalClusterDetail',
            'metadata': {'count': failed},
        })

    top_module = (
        base.filter(occurred_at__gte=last_24h)
        .values('source_app')
        .annotate(c=Count('id'))
        .order_by('-c')
        .first()
    )
    if top_module and top_module['c'] > 50:
        insights.append({
            'code': 'module_hotspot',
            'severity': 'info',
            'title_key': 'auditCenter.insights.moduleHotspot',
            'detail_key': 'auditCenter.insights.moduleHotspotDetail',
            'metadata': {'module': top_module['source_app'], 'count': top_module['c']},
        })

    stalled = base.filter(
        action_code__in=['PENDING', 'SUBMIT', 'REVIEW'],
        occurred_at__lt=now - timedelta(days=7),
        occurred_at__gte=now - timedelta(days=30),
    ).count()
    if stalled >= 10:
        insights.append({
            'code': 'stalled_workflows',
            'severity': 'warning',
            'title_key': 'auditCenter.insights.stalledWorkflows',
            'detail_key': 'auditCenter.insights.stalledWorkflowsDetail',
            'metadata': {'count': stalled},
        })

    return insights


def _activity_trend(qs, *, days: int) -> list[dict]:
    since = timezone.now() - timedelta(days=days)
    rows = (
        qs.filter(occurred_at__gte=since)
        .annotate(day=TruncDate('occurred_at'))
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )
    return [{'date': r['day'].isoformat(), 'count': r['count']} for r in rows]


def _module_kpi_stats(qs) -> list[dict]:
    mapping = {
        'auth': 'students',
        'students': 'students',
        'stage': 'internship_offers',
        'internship': 'internship_offers',
        'announcements': 'announcements',
        'documents': 'documents',
        'srf': 'srf',
        'encadrant': 'encadrants',
        'meetings': 'meetings',
        'reports': 'reports',
        'chat': 'chat',
        'tasks': 'tasks',
        'notifications': 'chat',
        'smart_assignment': 'applications',
    }
    counts: dict[str, int] = {}
    for row in qs.values('source_app').annotate(c=Count('id')):
        key = mapping.get(row['source_app'], 'total_actions')
        counts[key] = counts.get(key, 0) + row['c']

    counts['total_actions'] = qs.count()
    return [{'key': k, 'value': v} for k, v in sorted(counts.items(), key=lambda x: -x[1])]
