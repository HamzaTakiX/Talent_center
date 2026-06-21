"""In-app notification channel."""

from __future__ import annotations

from django.utils import timezone

from apps.notifications.models import Notification, NotificationRecipient
from apps.notifications.services.template_service import RenderedNotification


def deliver_in_app(
    *,
    recipient: NotificationRecipient,
    rendered: RenderedNotification,
    event_code: str,
    payload: dict,
) -> Notification:
    notification = Notification.objects.create(
        recipient=recipient.user,
        event=recipient.event,
        notification_type=event_code,
        title=rendered.in_app_title,
        body=rendered.in_app_body,
        action_url=rendered.action_url,
        payload_json=payload,
        is_read=False,
    )
    recipient.status = NotificationRecipient.Status.SENT
    recipient.sent_at = timezone.now()
    recipient.save(update_fields=['status', 'sent_at', 'updated_at'])
    return notification
