"""
Central audit API — single entry point for all platform history events.

Usage:
    from apps.history.audit import audit

    audit.emit(
        module='students',
        action='CREATE',
        event_code='student.created',
        summary='Student account created',
        actor=request.user,
        entity_type='student_profile',
        entity_id=profile.id,
        metadata={'user_id': user.id},
    )
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from apps.history.context import get_current_request
from apps.history.models import HistoryEvent
from apps.history.services.adapters import emit_domain_event

logger = logging.getLogger(__name__)


class AuditFacade:
    """Safe wrapper — audit failures never break business transactions."""

    def emit(
        self,
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
    ) -> HistoryEvent | None:
        req = request if request is not None else get_current_request()
        try:
            return emit_domain_event(
                module=module,
                action=action,
                event_code=event_code,
                summary=summary,
                actor=actor,
                entity_type=entity_type,
                entity_id=entity_id,
                old_values=old_values,
                new_values=new_values,
                details=details,
                severity=severity,
                is_automated=is_automated,
                visibility_scope=visibility_scope,
                metadata=metadata,
                request=req,
                targets=targets,
            )
        except Exception:
            logger.exception('Failed to record history event %s', event_code)
            return None

    def track_change(
        self,
        *,
        module: str,
        event_code: str,
        summary: str,
        actor=None,
        entity_type: str = '',
        entity_id: int | None = None,
        field: str = '',
        old_value: Any = None,
        new_value: Any = None,
        action: str = 'UPDATE',
        **kwargs,
    ) -> HistoryEvent | None:
        old_values = {field: old_value} if field else {}
        new_values = {field: new_value} if field else {}
        if field and old_value != new_value and not summary.endswith('.'):
            summary = f'{summary}: {field} {old_value!s} → {new_value!s}'
        return self.emit(
            module=module,
            action=action,
            event_code=event_code,
            summary=summary,
            actor=actor,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values or None,
            new_values=new_values or None,
            **kwargs,
        )


audit = AuditFacade()
