"""Immutable audit logging for financial imports."""

from __future__ import annotations

from typing import Any, Optional

from apps.srf.import_models import FinancialImportAuditEvent, FinancialImportBatch


def log_import_event(
    batch: FinancialImportBatch,
    action: str,
    *,
    actor=None,
    ip_address: Optional[str] = None,
    user_agent: str = '',
    message: str = '',
    payload: Optional[dict[str, Any]] = None,
) -> FinancialImportAuditEvent:
    return FinancialImportAuditEvent.objects.create(
        batch=batch,
        action=action,
        actor=actor,
        ip_address=ip_address,
        user_agent=(user_agent or '')[:512],
        message=message,
        payload_json=payload or {},
    )


def get_client_meta(request) -> dict[str, Any]:
    ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
    if not ip:
        ip = request.META.get('REMOTE_ADDR')
    return {
        'ip_address': ip or None,
        'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        'session_key': getattr(request.session, 'session_key', '') or '',
    }
