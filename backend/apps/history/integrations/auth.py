"""Mirror authentication SecurityEvent into global history."""

from __future__ import annotations

from apps.history.audit import audit
from apps.history.models import HistoryEvent

_AUTH_EVENT_MAP = {
    'LOGIN_SUCCESS': ('auth.login.success', 'User signed in', HistoryEvent.Severity.INFO),
    'LOGIN_FAILED': ('auth.login.failed', 'Failed login attempt', HistoryEvent.Severity.WARNING),
    'LOGOUT': ('auth.logout', 'User signed out', HistoryEvent.Severity.INFO),
    'PASSWORD_RESET_REQUESTED': ('auth.password.reset_requested', 'Password reset requested', HistoryEvent.Severity.INFO),
    'PASSWORD_RESET_COMPLETED': ('auth.password.reset_completed', 'Password reset completed', HistoryEvent.Severity.INFO),
    'PASSWORD_CHANGED': ('auth.password.changed', 'Password changed', HistoryEvent.Severity.INFO),
    'ACCOUNT_ACTIVATED': ('auth.account.activated', 'Account activated', HistoryEvent.Severity.INFO),
    'ACCOUNT_LOCKED': ('auth.account.locked', 'Account locked', HistoryEvent.Severity.CRITICAL),
    'SESSION_REVOKED': ('auth.session.revoked', 'Session revoked', HistoryEvent.Severity.WARNING),
}


def mirror_security_event(security_event, *, ip: str | None = None) -> None:
    event_type = getattr(security_event, 'event_type', '') or ''
    mapping = _AUTH_EVENT_MAP.get(event_type)
    if not mapping:
        code = f'auth.{event_type.lower()}'
        summary = event_type.replace('_', ' ').title()
        severity = HistoryEvent.Severity.INFO
    else:
        code, summary, severity = mapping

    user = getattr(security_event, 'user', None)
    meta = dict(getattr(security_event, 'metadata', None) or {})
    if ip:
        meta['ip_address'] = ip

    audit.emit(
        module='auth',
        action='LOGIN' if 'LOGIN' in event_type else 'UPDATE',
        event_code=code,
        summary=summary,
        actor=user,
        entity_type='user',
        entity_id=user.pk if user else None,
        severity=severity,
        metadata=meta,
        details=meta,
    )
