"""Webhook architecture — event emission, delivery queue, retry (no real HTTP)."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from django.utils import timezone

from apps.stage.models_extended import (
    WebhookDelivery,
    WebhookEvent,
    WebhookLog,
    WebhookRetry,
    WebhookSubscription,
)

SUPPORTED_WEBHOOK_EVENTS = [
    'internship.offer.published',
    'internship.offer.updated',
    'internship.offer.archived',
    'internship.application.submitted',
    'internship.application.status_changed',
    'internship.interview.scheduled',
    'internship.interview.completed',
    'internship.company.verified',
    'internship.collection.shared',
    'internship.import.completed',
]


def emit_webhook_event(
    event_code: str,
    entity_type: str,
    entity_id: int | str,
    payload: dict[str, Any] | None = None,
) -> WebhookEvent | None:
    """Create event and queue deliveries for matching subscriptions."""
    event = WebhookEvent.objects.create(
        event_code=event_code,
        entity_type=entity_type,
        entity_id=str(entity_id),
        payload_json=payload or {},
        source_app='stage',
    )
    subs = WebhookSubscription.objects.filter(is_active=True)
    for sub in subs:
        types = sub.event_types or []
        if types and event_code not in types:
            continue
        WebhookDelivery.objects.create(
            event=event,
            subscription=sub,
            status=WebhookDelivery.Status.PENDING,
            next_retry_at=timezone.now(),
        )
    return event


def process_pending_webhook_deliveries(*, limit: int = 50) -> dict:
    """
    INTEGRATION POINT: Replace mock delivery with signed HTTP POST to subscription.target_url.
    """
    deliveries = WebhookDelivery.objects.filter(
        status__in=[WebhookDelivery.Status.PENDING, WebhookDelivery.Status.RETRYING],
        next_retry_at__lte=timezone.now(),
    ).select_related('event', 'subscription')[:limit]

    sent = failed = 0
    for delivery in deliveries:
        delivery.attempt_count += 1
        delivery.last_attempt_at = timezone.now()
        # Mock success — real impl uses requests/httpx + HMAC signature
        delivery.status = WebhookDelivery.Status.SENT
        delivery.response_status_code = 200
        delivery.response_body = '{"mock": true}'
        delivery.save()
        WebhookLog.objects.create(
            delivery=delivery,
            level='INFO',
            message=f'Mock delivery sent to {delivery.subscription.target_url}',
        )
        sent += 1
    return {'processed': sent + failed, 'sent': sent, 'failed': failed}


def schedule_webhook_retry(delivery: WebhookDelivery, error: str = '') -> WebhookRetry:
    delay_hours = min(2 ** delivery.attempt_count, 24)
    retry_at = timezone.now() + timedelta(hours=delay_hours)
    delivery.status = WebhookDelivery.Status.RETRYING
    delivery.next_retry_at = retry_at
    delivery.save(update_fields=['status', 'next_retry_at', 'updated_at'])
    return WebhookRetry.objects.create(
        delivery=delivery,
        scheduled_at=retry_at,
        success=False,
        error_message=error,
    )
