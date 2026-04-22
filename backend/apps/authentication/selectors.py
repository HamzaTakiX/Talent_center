
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import LoginAttempt, LoginSession

User = get_user_model()


def get_user_by_email(email: str):
    return User.objects.filter(email__iexact=email).first()


def get_active_sessions(user) -> list[LoginSession]:
    now = timezone.now()
    return list(
        user.sessions.filter(revoked_at__isnull=True, expires_at__gt=now)
        .order_by('-created_at')
    )


def get_session_by_jti(jti: str) -> LoginSession | None:
    return LoginSession.objects.filter(jti=jti).first()


def count_recent_failed_attempts(identifier: str, ip: str | None = None) -> int:
    window = timedelta(seconds=settings.AUTH_FAILED_WINDOW_SECONDS)
    since = timezone.now() - window
    qs = LoginAttempt.objects.filter(
        identifier=identifier.lower(),
        success=False,
        attempted_at__gte=since,
    )
    if ip:
        qs = qs.filter(ip_address=ip)
    return qs.count()


def latest_failed_attempt(identifier: str) -> LoginAttempt | None:
    return (
        LoginAttempt.objects.filter(identifier=identifier.lower(), success=False)
        .order_by('-attempted_at')
        .first()
    )
