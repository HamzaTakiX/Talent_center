"""Audit logging for SRF operations configuration."""

from __future__ import annotations

from typing import Any, Optional

from apps.srf.config_models import SrfConfigAuditLog


def log_config_change(
    *,
    action: str,
    entity_type: str,
    entity_id: str = '',
    actor=None,
    ip_address: Optional[str] = None,
    user_agent: str = '',
    message: str = '',
    before: Optional[dict[str, Any]] = None,
    after: Optional[dict[str, Any]] = None,
) -> SrfConfigAuditLog:
    return SrfConfigAuditLog.objects.create(
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else '',
        actor=actor,
        ip_address=ip_address,
        user_agent=(user_agent or '')[:512],
        message=message,
        before_json=before or {},
        after_json=after or {},
    )


def get_client_meta(request) -> dict[str, Any]:
    ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
    if not ip:
        ip = request.META.get('REMOTE_ADDR')
    return {
        'ip_address': ip or None,
        'user_agent': request.META.get('HTTP_USER_AGENT', ''),
    }
