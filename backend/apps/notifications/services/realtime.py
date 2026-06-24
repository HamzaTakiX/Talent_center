"""Push in-app notification events to connected WebSocket clients."""

from __future__ import annotations

import logging
import threading

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from apps.notifications.api.serializers import NotificationSerializer
from apps.notifications.models import Notification

logger = logging.getLogger(__name__)


def _user_group(user_id: int) -> str:
    return f'notifications_user_{user_id}'


def _group_send_sync(channel_layer, group: str, message: dict) -> None:
    try:
        async_to_sync(channel_layer.group_send)(group, message)
    except RuntimeError:
        def _deliver() -> None:
            try:
                async_to_sync(channel_layer.group_send)(group, message)
            except Exception:
                logger.exception('Failed to push notification WebSocket event to %s', group)

        threading.Thread(
            target=_deliver,
            daemon=True,
            name='notification-realtime-send',
        ).start()
    except Exception:
        logger.exception('Failed to push notification WebSocket event to %s', group)


def _group_send(group: str, message: dict) -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    _group_send_sync(channel_layer, group, message)


def push_notification_created(notification: Notification) -> None:
    data = NotificationSerializer(notification).data
    _group_send(
        _user_group(notification.recipient_id),
        {'type': 'notification.new', 'payload': {'notification': data}},
    )
    push_unread_count(notification.recipient_id)


def push_notification_read(*, user_id: int, notification_id: int) -> None:
    _group_send(
        _user_group(user_id),
        {
            'type': 'notification.read',
            'payload': {'notification_id': notification_id},
        },
    )
    push_unread_count(user_id)


def push_unread_count(user_id: int) -> None:
    count = Notification.objects.filter(
        recipient_id=user_id,
        is_read=False,
        is_archived=False,
    ).count()
    _group_send(
        _user_group(user_id),
        {
            'type': 'notification.unread_count',
            'payload': {'count': count},
        },
    )
