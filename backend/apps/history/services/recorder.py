"""Centralized append-only history event recorder (async-safe, cheap inserts)."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from django.db import transaction
from django.utils import timezone

from apps.authentication.utils import get_client_ip, get_user_agent
from apps.history.models import HistoryEvent, HistoryEventTarget, HistoryMetadata


def _resolve_actor_role(user) -> str:
    if not user or not getattr(user, 'is_authenticated', False):
        return 'SYSTEM'
    return getattr(user, 'role', '') or 'UNKNOWN'


def record_history_event(
    *,
    event_code: str,
    source_app: str,
    action_code: str,
    summary: str,
    actor=None,
    entity_type: str = '',
    entity_id: int | None = None,
    severity: str = HistoryEvent.Severity.INFO,
    payload: Optional[dict[str, Any]] = None,
    request=None,
    ip_address: Optional[str] = None,
    user_agent: str = '',
    session_id: str = '',
    correlation_id: Optional[uuid.UUID] = None,
    targets: Optional[list[dict[str, Any]]] = None,
    metadata: Optional[dict[str, Any]] = None,
    is_automated: bool = False,
    actor_role: str = '',
    visibility_scope: str = 'platform',
    occurred_at: Optional[datetime] = None,
) -> HistoryEvent:
    """
    Record one cross-platform history event.

    Module adapters should call this instead of writing HistoryEvent directly.
    """
    if request is not None:
        ip_address = ip_address or get_client_ip(request)
        user_agent = user_agent or get_user_agent(request)

    actor_user = None if is_automated or actor is None else actor
    if actor_user is not None and not getattr(actor_user, 'is_authenticated', False):
        actor_user = None

    resolved_role = actor_role or (_resolve_actor_role(actor_user) if actor_user else 'SYSTEM')
    actor_email = ''
    if actor_user:
        actor_email = getattr(actor_user, 'email', '') or ''
    elif is_automated:
        actor_email = 'system@talent-center'

    body = dict(payload or {})
    body.setdefault('summary', summary)

    with transaction.atomic():
        event = HistoryEvent.objects.create(
            event_code=event_code,
            source_app=source_app,
            action_code=action_code,
            entity_type=entity_type,
            entity_id=entity_id,
            actor_user=actor_user,
            actor_email=actor_email,
            actor_role=resolved_role,
            severity=severity,
            summary=summary[:512],
            payload_json=body,
            ip_address=ip_address,
            user_agent=(user_agent or '')[:1024],
            session_id=session_id or '',
            correlation_id=correlation_id,
            is_automated=is_automated,
            visibility_scope=visibility_scope,
            occurred_at=occurred_at or timezone.now(),
        )

        for target in targets or []:
            HistoryEventTarget.objects.create(
                event=event,
                target_entity_type=target['entity_type'],
                target_entity_id=int(target['entity_id']),
                target_role=target.get('role', HistoryEventTarget.TargetRole.RELATED),
                description=target.get('description', '')[:255],
                metadata_json=target.get('metadata') or {},
            )

        for key, raw in (metadata or {}).items():
            value, value_type = _coerce_metadata_value(raw)
            HistoryMetadata.objects.create(
                event=event,
                key=str(key)[:64],
                value=value,
                value_type=value_type,
            )

    return event


def _coerce_metadata_value(raw: Any) -> tuple[str, str]:
    if isinstance(raw, bool):
        return ('true' if raw else 'false', HistoryMetadata.ValueType.BOOLEAN)
    if isinstance(raw, int):
        return (str(raw), HistoryMetadata.ValueType.INTEGER)
    if isinstance(raw, float):
        return (str(raw), HistoryMetadata.ValueType.FLOAT)
    if isinstance(raw, dict) or isinstance(raw, list):
        import json

        return (json.dumps(raw, default=str), HistoryMetadata.ValueType.JSON)
    return (str(raw), HistoryMetadata.ValueType.STRING)
