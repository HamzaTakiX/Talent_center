"""Rate limiting and deduplication."""

from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from apps.notifications.models import NotificationEvent, NotificationEventDedup, NotificationRateLimit
from apps.notifications.services.email_config_service import get_rate_limits


def check_idempotency(idempotency_key: str | None) -> NotificationEvent | None:
    if not idempotency_key:
        return None
    dedup = (
        NotificationEventDedup.objects
        .select_related('event')
        .filter(idempotency_key=idempotency_key, expires_at__gt=timezone.now())
        .first()
    )
    return dedup.event if dedup else None


def record_idempotency(idempotency_key: str, event: NotificationEvent, ttl_hours: int = 24) -> None:
    if not idempotency_key:
        return
    NotificationEventDedup.objects.create(
        idempotency_key=idempotency_key,
        event=event,
        expires_at=timezone.now() + timedelta(hours=ttl_hours),
    )


def check_rate_limit(*, user, channel: str, template_code: str = '') -> tuple[bool, str]:
    now = timezone.now()
    window_start = now.replace(minute=0, second=0, microsecond=0)

    if channel == 'EMAIL':
        email_limit, _ = get_rate_limits()
        limit = email_limit
        counter, _ = NotificationRateLimit.objects.get_or_create(
            user=user,
            channel=channel,
            template_code='',
            window_start=window_start,
            defaults={'limit_value': limit},
        )
        if counter.count >= counter.limit_value:
            return False, 'Hourly email rate limit exceeded'
        counter.count += 1
        counter.save(update_fields=['count', 'updated_at'])

    if template_code:
        template_window = now - timedelta(hours=1)
        recent = NotificationRateLimit.objects.filter(
            user=user,
            channel=channel,
            template_code=template_code,
            window_start__gte=template_window,
        ).first()
        if recent and recent.count >= 1:
            return False, f'Throttled duplicate template {template_code}'
        NotificationRateLimit.objects.create(
            user=user,
            channel=channel,
            template_code=template_code,
            window_start=now,
            count=1,
            limit_value=1,
        )

    return True, ''


def cleanup_expired_dedup() -> int:
    deleted, _ = NotificationEventDedup.objects.filter(expires_at__lte=timezone.now()).delete()
    return deleted
