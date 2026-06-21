"""Queue worker — processes async channel deliveries."""

from __future__ import annotations

from apps.notifications.channels.email import deliver_email
from apps.notifications.models import NotificationRecipient
from apps.notifications.services.queue_service import claim_batch
from apps.notifications.services.template_service import RenderedNotification


def process_notification_batch(*, batch_size: int = 50) -> dict:
    recipients = claim_batch(batch_size=batch_size)
    stats = {'processed': 0, 'sent': 0, 'failed': 0}

    for recipient in recipients:
        stats['processed'] += 1
        metadata = recipient.metadata_json or {}
        rendered = RenderedNotification(
            subject=metadata.get('rendered_subject', ''),
            body_html=metadata.get('rendered_body_html', ''),
            body_text=metadata.get('rendered_body_text', ''),
            in_app_title=metadata.get('rendered_subject', ''),
            in_app_body=metadata.get('rendered_body_text', ''),
            action_url=metadata.get('action_url', ''),
        )

        if recipient.delivery_channel == NotificationRecipient.Channel.EMAIL:
            ok = deliver_email(recipient=recipient, rendered=rendered)
            if ok:
                stats['sent'] += 1
            else:
                stats['failed'] += 1
        else:
            stats['failed'] += 1

    return stats
