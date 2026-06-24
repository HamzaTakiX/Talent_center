"""Audit bridge between Notification Center and the History module."""

from __future__ import annotations

from apps.history.models import HistoryEvent
from apps.history.services.recorder import record_history_event
from apps.notifications.models import Notification


def record_notification_created(notification: Notification) -> None:
    record_history_event(
        event_code='notification.created',
        source_app='notifications',
        action_code='NOTIFICATION_CREATED',
        summary=f'Notification created: {notification.title[:200]}',
        entity_type='notification',
        entity_id=notification.pk,
        is_automated=True,
        visibility_scope='user',
        targets=[
            {
                'entity_type': 'user',
                'entity_id': notification.recipient_id,
                'role': 'PRIMARY',
            },
        ],
        payload={
            'notification_type': notification.notification_type,
            'title': notification.title,
            'action_url': notification.action_url,
        },
    )


def record_notification_read(notification: Notification, *, actor) -> None:
    record_history_event(
        event_code='notification.read',
        source_app='notifications',
        action_code='NOTIFICATION_READ',
        summary=f'Notification read: {notification.title[:200]}',
        actor=actor,
        entity_type='notification',
        entity_id=notification.pk,
        severity=HistoryEvent.Severity.INFO,
        visibility_scope='user',
        targets=[
            {
                'entity_type': 'user',
                'entity_id': notification.recipient_id,
                'role': 'PRIMARY',
            },
        ],
        payload={'notification_type': notification.notification_type},
    )


def record_notification_archived(notification: Notification, *, actor) -> None:
    record_history_event(
        event_code='notification.archived',
        source_app='notifications',
        action_code='NOTIFICATION_ARCHIVED',
        summary=f'Notification archived: {notification.title[:200]}',
        actor=actor,
        entity_type='notification',
        entity_id=notification.pk,
        visibility_scope='user',
        targets=[
            {
                'entity_type': 'user',
                'entity_id': notification.recipient_id,
                'role': 'PRIMARY',
            },
        ],
    )


def record_notification_clicked(notification: Notification, *, actor) -> None:
    record_history_event(
        event_code='notification.clicked',
        source_app='notifications',
        action_code='NOTIFICATION_CLICKED',
        summary=f'Notification clicked: {notification.title[:200]}',
        actor=actor,
        entity_type='notification',
        entity_id=notification.pk,
        visibility_scope='user',
        payload={'action_url': notification.action_url},
        targets=[
            {
                'entity_type': 'user',
                'entity_id': notification.recipient_id,
                'role': 'PRIMARY',
            },
        ],
    )
