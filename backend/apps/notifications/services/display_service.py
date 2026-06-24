"""Helpers for notification display metadata."""

from __future__ import annotations

from apps.notifications.constants import Category, NotificationDisplayType, Priority
from apps.notifications.events.registry import get_event_config
from apps.notifications.models import Notification


SUCCESS_PREFIXES = (
    'internship.application.accepted',
    'internship.internship.completed',
    'documents.approved',
    'srf.approved',
    'report.approved',
    'student.activated',
    'cv.analysis.completed',
    'interview.simulation.completed',
)

WARNING_PREFIXES = (
    'internship.offer.expiring',
    'internship.offer.deadline_reminder',
    'documents.',
    'srf.risk',
    'srf.installment',
    'report.escalated',
    'chat.unread',
)

ERROR_PREFIXES = (
    'internship.application.rejected',
    'documents.rejected',
    'srf.rejected',
)

ACTION_REQUIRED_CODES = {
    'internship.application.submitted',
    'internship.application.status_changed',
    'documents.uploaded',
    'srf.submitted',
    'srf.payment.submitted',
    'report.submitted',
    'report.escalated',
    'chat.urgent',
}


def derive_display_type(notification: Notification) -> str:
    code = notification.notification_type or ''
    if code in ACTION_REQUIRED_CODES and notification.action_url:
        return NotificationDisplayType.ACTION_REQUIRED
    if code.startswith('student.') or code.startswith('notification.digest'):
        return NotificationDisplayType.SYSTEM
    if any(code.startswith(prefix) for prefix in SUCCESS_PREFIXES):
        return NotificationDisplayType.SUCCESS
    if any(code.startswith(prefix) for prefix in ERROR_PREFIXES):
        return NotificationDisplayType.ERROR
    if any(code.startswith(prefix) for prefix in WARNING_PREFIXES):
        return NotificationDisplayType.WARNING
    return NotificationDisplayType.INFO


def derive_category(notification: Notification) -> str:
    event = notification.event
    if event:
        config = get_event_config(event.event_code)
        if config:
            return config.category
        return Category.SYSTEM
    payload = notification.payload_json or {}
    return payload.get('category') or Category.SYSTEM


def derive_priority(notification: Notification) -> str:
    event = notification.event
    if event and event.priority:
        return event.priority
    config = get_event_config(notification.notification_type or '')
    if config:
        return config.priority
    return Priority.NORMAL


def derive_source_module(notification: Notification) -> str:
    event = notification.event
    if event and event.source_app:
        return event.source_app
    payload = notification.payload_json or {}
    return payload.get('source_app') or 'system'


def requires_action(notification: Notification) -> bool:
    if not notification.action_url:
        return False
    display = derive_display_type(notification)
    if display == NotificationDisplayType.ACTION_REQUIRED:
        return True
    priority = derive_priority(notification)
    return priority in {Priority.HIGH, Priority.URGENT} and not notification.is_read
