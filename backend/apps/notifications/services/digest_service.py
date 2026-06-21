"""Digest notification aggregation."""

from __future__ import annotations

from collections import defaultdict
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.notifications.events.publisher import emit_event
from apps.notifications.models import NotificationDigestBatch, NotificationPreference, NotificationRecipient

User = get_user_model()


def buffer_for_digest(recipient: NotificationRecipient, frequency: str) -> None:
    """Attach a pending recipient to an open digest batch."""
    now = timezone.now()
    if frequency == NotificationPreference.Frequency.DAILY_DIGEST:
        batch_freq = NotificationDigestBatch.Frequency.DAILY
        period_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif frequency == NotificationPreference.Frequency.WEEKLY_DIGEST:
        batch_freq = NotificationDigestBatch.Frequency.WEEKLY
        period_start = now - timedelta(days=now.weekday())
        period_start = period_start.replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        batch_freq = NotificationDigestBatch.Frequency.MONTHLY
        period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    batch, _ = NotificationDigestBatch.objects.get_or_create(
        user=recipient.user,
        frequency=batch_freq,
        period_start=period_start,
        defaults={'period_end': now, 'status': NotificationDigestBatch.Status.PENDING},
    )
    recipient.digest_batch = batch
    recipient.status = NotificationRecipient.Status.PENDING
    recipient.save(update_fields=['digest_batch', 'status', 'updated_at'])

    summary = batch.summary_json or {}
    category = (recipient.event.payload_json or {}).get('category', 'general')
    summary[category] = summary.get(category, 0) + 1
    batch.summary_json = summary
    batch.period_end = now
    batch.save(update_fields=['summary_json', 'period_end', 'updated_at'])


def send_digests_for_frequency(frequency: str) -> int:
    """Send pending digest batches for a frequency."""
    batches = NotificationDigestBatch.objects.filter(
        frequency=frequency,
        status=NotificationDigestBatch.Status.PENDING,
    ).select_related('user')
    sent = 0
    for batch in batches:
        summary = batch.summary_json or {}
        if not summary:
            batch.status = NotificationDigestBatch.Status.SENT
            batch.sent_at = timezone.now()
            batch.save(update_fields=['status', 'sent_at', 'updated_at'])
            continue
        event_code = {
            NotificationDigestBatch.Frequency.DAILY: 'notification.digest.daily',
            NotificationDigestBatch.Frequency.WEEKLY: 'notification.digest.weekly',
            NotificationDigestBatch.Frequency.MONTHLY: 'notification.digest.monthly',
        }[batch.frequency]
        emit_event(
            event_code=event_code,
            source_app='notifications',
            entity_type='user',
            entity_id=batch.user_id,
            payload={
                'user_id': batch.user_id,
                'title': f'Your {batch.frequency.lower()} summary',
                'body': _format_summary(summary),
                'summary': summary,
            },
        )
        batch.status = NotificationDigestBatch.Status.SENT
        batch.sent_at = timezone.now()
        batch.save(update_fields=['status', 'sent_at', 'updated_at'])
        sent += 1
    return sent


def _format_summary(summary: dict) -> str:
    parts = [f'{count} update(s) in {category}' for category, count in summary.items()]
    return '; '.join(parts) if parts else 'No updates'
