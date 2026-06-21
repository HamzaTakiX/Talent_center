"""Notification queue management."""

from __future__ import annotations

from datetime import timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.notifications.constants import MAX_DELIVERY_ATTEMPTS, RETRY_DELAYS_SECONDS
from apps.notifications.models import NotificationDeliveryLog, NotificationRecipient


QUEUE_STATUSES = (
    NotificationRecipient.Status.PENDING,
    NotificationRecipient.Status.QUEUED,
    NotificationRecipient.Status.RETRY_SCHEDULED,
)


def enqueue_recipient(recipient: NotificationRecipient) -> NotificationRecipient:
    recipient.status = NotificationRecipient.Status.QUEUED
    recipient.save(update_fields=['status', 'updated_at'])
    return recipient


def claim_batch(*, batch_size: int = 50) -> list[NotificationRecipient]:
    now = timezone.now()
    with transaction.atomic():
        qs = (
            NotificationRecipient.objects
            .select_for_update(skip_locked=True)
            .filter(
                Q(status__in=QUEUE_STATUSES)
                & (
                    Q(next_retry_at__isnull=True)
                    | Q(next_retry_at__lte=now)
                )
            )
            .exclude(delivery_channel=NotificationRecipient.Channel.IN_APP)
            .order_by('created_at')[:batch_size]
        )
        recipients = list(qs)
        for recipient in recipients:
            recipient.status = NotificationRecipient.Status.PROCESSING
            recipient.attempts += 1
            recipient.save(update_fields=['status', 'attempts', 'updated_at'])
    return recipients


def mark_sent(
    recipient: NotificationRecipient,
    *,
    provider: str,
    provider_message_id: str = '',
    latency_ms: int | None = None,
) -> None:
    now = timezone.now()
    recipient.status = NotificationRecipient.Status.SENT
    recipient.provider = provider
    recipient.provider_message_id = provider_message_id
    recipient.sent_at = now
    recipient.last_error = ''
    recipient.save(update_fields=[
        'status', 'provider', 'provider_message_id', 'sent_at', 'last_error', 'updated_at',
    ])
    _log_delivery(recipient, status=NotificationRecipient.Status.SENT, latency_ms=latency_ms)


def mark_failed(recipient: NotificationRecipient, *, error: str, latency_ms: int | None = None) -> None:
    attempt_index = recipient.attempts - 1
    if recipient.attempts < MAX_DELIVERY_ATTEMPTS and attempt_index < len(RETRY_DELAYS_SECONDS):
        delay = RETRY_DELAYS_SECONDS[attempt_index]
        recipient.status = NotificationRecipient.Status.RETRY_SCHEDULED
        recipient.next_retry_at = timezone.now() + timedelta(seconds=delay)
    else:
        recipient.status = NotificationRecipient.Status.FAILED
    recipient.last_error = (error or '')[:2000]
    recipient.save(update_fields=['status', 'next_retry_at', 'last_error', 'updated_at'])
    _log_delivery(
        recipient,
        status=recipient.status,
        error_message=error,
        latency_ms=latency_ms,
    )


def mark_suppressed(recipient: NotificationRecipient, reason: str) -> None:
    recipient.status = NotificationRecipient.Status.SUPPRESSED
    recipient.last_error = reason[:500]
    recipient.save(update_fields=['status', 'last_error', 'updated_at'])


def _log_delivery(
    recipient: NotificationRecipient,
    *,
    status: str,
    error_message: str = '',
    latency_ms: int | None = None,
) -> None:
    NotificationDeliveryLog.objects.create(
        recipient=recipient,
        event=recipient.event,
        user=recipient.user,
        channel=recipient.delivery_channel,
        template_code=recipient.template_code,
        provider=recipient.provider,
        status=status,
        attempt_number=recipient.attempts,
        error_message=error_message,
        latency_ms=latency_ms,
    )
