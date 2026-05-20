"""
Module adapters — thin wrappers so domain apps emit unified history events.

Import and call from signals, services, or views when business state changes.
"""

from __future__ import annotations

from typing import Any, Optional

from apps.history.models import HistoryEvent
from apps.history.services.recorder import record_history_event

SOURCE_APPS = {
    'auth': 'auth',
    'students': 'students',
    'admins': 'admins',
    'internship': 'stage',
    'announcements': 'announcements',
    'documents': 'documents',
    'srf': 'srf',
    'encadrant': 'encadrant',
    'meetings': 'meetings',
    'reports': 'reports',
    'tasks': 'tasks',
    'chat': 'chat',
    'notifications': 'notifications',
    'smart_assignment': 'smart_assignment',
}


def emit_domain_event(
    *,
    module: str,
    action: str,
    event_code: str,
    summary: str,
    actor=None,
    entity_type: str = '',
    entity_id: int | None = None,
    old_values: Optional[dict[str, Any]] = None,
    new_values: Optional[dict[str, Any]] = None,
    details: Optional[dict[str, Any]] = None,
    severity: str = HistoryEvent.Severity.INFO,
    is_automated: bool = False,
    visibility_scope: str = 'platform',
    metadata: Optional[dict[str, Any]] = None,
    request=None,
    targets: Optional[list[dict[str, Any]]] = None,
) -> HistoryEvent:
    source_app = SOURCE_APPS.get(module, module)
    payload: dict[str, Any] = {}
    if old_values:
        payload['old_values'] = old_values
    if new_values:
        payload['new_values'] = new_values
    if details:
        payload['details'] = details

    return record_history_event(
        event_code=event_code,
        source_app=source_app,
        action_code=action.upper(),
        summary=summary,
        actor=actor,
        entity_type=entity_type,
        entity_id=entity_id,
        severity=severity,
        payload=payload,
        request=request,
        is_automated=is_automated,
        visibility_scope=visibility_scope,
        metadata=metadata,
        targets=targets,
    )
