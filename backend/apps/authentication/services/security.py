"""Login-attempt recording, lockout check, security event log."""

from datetime import timedelta
from typing import Optional

from django.conf import settings
from django.utils import timezone

from ..models import LoginAttempt, SecurityEvent
from ..selectors import count_recent_failed_attempts, latest_failed_attempt


def record_attempt(
    *,
    identifier: str,
    ip: Optional[str],
    success: bool,
    provider: str = 'LOCAL',
    failure_reason: str = '',
) -> LoginAttempt:
    return LoginAttempt.objects.create(
        identifier=(identifier or '').lower(),
        ip_address=ip,
        success=success,
        provider=provider,
        failure_reason=failure_reason,
    )


def is_locked(identifier: str, ip: Optional[str] = None) -> bool:
    """
    Sliding-window lockout.

    True if the identifier has >= AUTH_MAX_FAILED_ATTEMPTS failed attempts in
    the last AUTH_FAILED_WINDOW_SECONDS AND the most recent failure is within
    AUTH_LOCKOUT_SECONDS.
    """
    max_attempts = settings.AUTH_MAX_FAILED_ATTEMPTS
    lockout = timedelta(seconds=settings.AUTH_LOCKOUT_SECONDS)

    recent_failures = count_recent_failed_attempts(identifier)
    if recent_failures < max_attempts:
        return False

    last = latest_failed_attempt(identifier)
    if last is None:
        return False
    return (timezone.now() - last.attempted_at) < lockout


def log_event(
    *,
    event_type: str,
    user=None,
    metadata: Optional[dict] = None,
    ip: Optional[str] = None,
) -> SecurityEvent:
    return SecurityEvent.objects.create(
        event_type=event_type,
        user=user,
        metadata=metadata or {},
        ip_address=ip,
    )
