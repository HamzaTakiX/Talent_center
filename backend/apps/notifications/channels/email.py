"""Email notification channel."""

from __future__ import annotations

import time

from django.conf import settings

from apps.notifications.models import NotificationProviderHealth, NotificationRecipient
from apps.notifications.providers.factory import get_email_provider
from apps.notifications.services.queue_service import mark_failed, mark_sent
from apps.notifications.services.email_config_service import (
    get_sender_identity,
    is_platform_email_enabled,
)
from apps.notifications.services.template_service import RenderedNotification


def deliver_email(*, recipient: NotificationRecipient, rendered: RenderedNotification) -> bool:
    if not is_platform_email_enabled():
        mark_failed(recipient, error='Email notifications disabled')
        return False

    provider = get_email_provider()
    event_category = getattr(recipient.event, 'payload_json', {}).get('category', '')
    template = recipient.template_code
    sender = get_sender_identity(category=event_category or template.split('.')[0] if template else None)
    start = time.monotonic()
    result = provider.send_email(
        to=recipient.user.email,
        subject=rendered.subject,
        body_html=rendered.body_html,
        body_text=rendered.body_text,
        template_id=recipient.template_code,
        metadata={'recipient_id': recipient.pk, 'event_id': recipient.event_id},
        from_email=sender['email'],
        from_name=sender['name'],
    )
    latency_ms = int((time.monotonic() - start) * 1000)

    _update_provider_health(provider.name, result.success)

    if result.success:
        mark_sent(
            recipient,
            provider=provider.name,
            provider_message_id=result.message_id,
            latency_ms=latency_ms,
        )
        return True

    mark_failed(recipient, error=result.error or 'Email delivery failed', latency_ms=latency_ms)
    return False


def _update_provider_health(provider_name: str, success: bool) -> None:
    from django.utils import timezone

    health, _ = NotificationProviderHealth.objects.get_or_create(
        provider=provider_name,
        channel=NotificationRecipient.Channel.EMAIL,
    )
    now = timezone.now()
    if success:
        health.last_success_at = now
        health.consecutive_failures = 0
        health.is_healthy = True
    else:
        health.last_failure_at = now
        health.consecutive_failures += 1
        health.is_healthy = health.consecutive_failures < 5
    health.save()
