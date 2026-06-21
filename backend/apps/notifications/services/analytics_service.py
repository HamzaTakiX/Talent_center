"""Notification analytics service."""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from apps.notifications.models import (
    NotificationDeliveryLog,
    NotificationEvent,
    NotificationProviderHealth,
    NotificationRecipient,
    NotificationTemplate,
)


def get_overview_metrics(*, days: int = 30) -> dict:
    since = timezone.now() - timedelta(days=days)
    logs = NotificationDeliveryLog.objects.filter(created_at__gte=since)
    status_counts = dict(
        logs.values('status').annotate(count=Count('id')).values_list('status', 'count')
    )
    total = sum(status_counts.values()) or 1
    sent = status_counts.get(NotificationRecipient.Status.SENT, 0)
    failed = status_counts.get(NotificationRecipient.Status.FAILED, 0)
    return {
        'period_days': days,
        'sent': sent,
        'delivered': status_counts.get(NotificationRecipient.Status.DELIVERED, 0),
        'opened': status_counts.get(NotificationRecipient.Status.OPENED, 0),
        'clicked': status_counts.get(NotificationRecipient.Status.CLICKED, 0),
        'failed': failed,
        'suppressed': status_counts.get(NotificationRecipient.Status.SUPPRESSED, 0),
        'delivery_success_rate': round((sent / total) * 100, 2),
        'total_attempts': total,
    }


def get_top_templates(*, limit: int = 10, days: int = 30) -> list[dict]:
    since = timezone.now() - timedelta(days=days)
    rows = (
        NotificationDeliveryLog.objects
        .filter(created_at__gte=since)
        .exclude(template_code='')
        .values('template_code')
        .annotate(count=Count('id'))
        .order_by('-count')[:limit]
    )
    return list(rows)


def get_provider_health() -> list[dict]:
    return [
        {
            'provider': h.provider,
            'channel': h.channel,
            'is_healthy': h.is_healthy,
            'consecutive_failures': h.consecutive_failures,
            'last_success_at': h.last_success_at,
            'last_failure_at': h.last_failure_at,
        }
        for h in NotificationProviderHealth.objects.all()
    ]


def get_queue_stats() -> dict:
    pending = NotificationRecipient.objects.filter(
        status__in=[
            NotificationRecipient.Status.PENDING,
            NotificationRecipient.Status.QUEUED,
            NotificationRecipient.Status.RETRY_SCHEDULED,
        ]
    ).count()
    failed = NotificationRecipient.objects.filter(status=NotificationRecipient.Status.FAILED).count()
    processing = NotificationRecipient.objects.filter(status=NotificationRecipient.Status.PROCESSING).count()
    return {'pending': pending, 'failed': failed, 'processing': processing}


def get_recent_events(*, limit: int = 50) -> list[dict]:
    events = NotificationEvent.objects.order_by('-triggered_at')[:limit]
    return [
        {
            'id': e.pk,
            'event_code': e.event_code,
            'source_app': e.source_app,
            'status': e.status,
            'priority': e.priority,
            'triggered_at': e.triggered_at,
        }
        for e in events
    ]
