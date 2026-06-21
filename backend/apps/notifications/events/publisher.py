"""Public event publisher — sole entry point for business modules."""

from __future__ import annotations

from typing import Any

from django.db import transaction

from apps.notifications.constants import EventStatus, Priority
from apps.notifications.events.registry import get_default_config, get_event_config
from apps.notifications.events.schemas import EventValidationError, validate_payload
from apps.notifications.models import NotificationEvent
from apps.notifications.services.notification_engine import get_notification_engine
from apps.notifications.services.security_service import check_idempotency, record_idempotency


def emit_event(
    *,
    event_code: str,
    source_app: str,
    entity_type: str = '',
    entity_id: int | None = None,
    payload: dict[str, Any] | None = None,
    actor=None,
    idempotency_key: str | None = None,
    priority: str | None = None,
) -> NotificationEvent:
    """
    Emit a domain event into the notification center.

    Business modules must use this function instead of sending emails directly.
    """
    existing = check_idempotency(idempotency_key)
    if existing:
        return existing

    validated_payload = validate_payload(event_code, payload or {})
    config = get_event_config(event_code) or get_default_config(event_code)

    with transaction.atomic():
        event = NotificationEvent.objects.create(
            event_code=event_code,
            source_app=source_app,
            entity_type=entity_type,
            entity_id=entity_id,
            payload_json=validated_payload,
            triggered_by=actor,
            idempotency_key=idempotency_key,
            priority=priority or config.priority or Priority.NORMAL,
            status=EventStatus.RECEIVED,
        )
        record_idempotency(idempotency_key, event)
        get_notification_engine().process_event(event)
    return event
