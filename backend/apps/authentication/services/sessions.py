"""Session lifecycle: create, list, revoke one, revoke all."""

from typing import Optional

from django.http import Http404
from django.utils import timezone

from ..models import LoginSession
from ..selectors import get_active_sessions
from ..utils import get_client_ip, get_user_agent
from .security import log_event


def create_session(
    *,
    user,
    jti: str,
    expires_at,
    request=None,
    device_name: str = '',
) -> LoginSession:
    return LoginSession.objects.create(
        user=user,
        jti=jti,
        ip_address=get_client_ip(request) if request else None,
        user_agent=get_user_agent(request) if request else '',
        device_name=device_name or '',
        expires_at=expires_at,
    )


def list_active_sessions(user) -> list[LoginSession]:
    return get_active_sessions(user)


def revoke_session(user, session_id: int, *, ip: Optional[str] = None) -> LoginSession:
    session = LoginSession.objects.filter(pk=session_id, user=user).first()
    if session is None:
        raise Http404('Session not found.')
    if session.revoked_at is None:
        session.revoke()
        log_event(
            event_type='SESSION_REVOKED',
            user=user,
            metadata={'session_id': session.id, 'jti': session.jti},
            ip=ip,
        )
    return session


def revoke_all_sessions(user, *, keep_jti: Optional[str] = None, ip: Optional[str] = None) -> int:
    qs = user.sessions.filter(revoked_at__isnull=True)
    if keep_jti:
        qs = qs.exclude(jti=keep_jti)
    count = qs.update(revoked_at=timezone.now())
    log_event(
        event_type='LOGOUT_ALL',
        user=user,
        metadata={'revoked_count': count, 'kept_jti': keep_jti},
        ip=ip,
    )
    return count
