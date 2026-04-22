"""
Provider-agnostic authentication pipeline.

`perform_login` is the single entry point; it routes to a provider via the
registry, then runs the rest of the pipeline (session, JWT, audit, lockout)
identically for every provider.
"""

from datetime import datetime, timezone as dt_tz
from typing import Optional

from django.contrib.auth.models import update_last_login
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError

from ..exceptions import AccountLocked
from ..models import LoginSession
from ..providers.registry import get_provider
from ..tokens import TokenPair, decode_refresh, issue_token_pair
from ..utils import get_client_ip
from .security import is_locked, log_event, record_attempt
from .sessions import create_session, revoke_all_sessions
from .users import resolve_or_link_user


def _provider_value(name) -> str:
    return name.value if hasattr(name, 'value') else str(name)


def perform_login(
    *,
    provider_name: str,
    credentials: dict,
    request=None,
    device_name: str = '',
) -> tuple:
    """
    Run the full authentication flow.

    Returns (user, token_pair: TokenPair, session: LoginSession).
    Raises AuthenticationFailed / AccountLocked on failure.
    """
    identifier = (credentials.get('email') or '').strip().lower()
    ip = get_client_ip(request) if request else None

    # 1. Lockout gate (before touching any provider).
    if identifier and is_locked(identifier, ip):
        record_attempt(
            identifier=identifier, ip=ip, success=False,
            provider=provider_name, failure_reason='locked',
        )
        log_event(
            event_type='SUSPICIOUS_LOCKOUT',
            metadata={'identifier': identifier, 'provider': provider_name},
            ip=ip,
        )
        raise AccountLocked('Too many failed attempts. Please try again later.')

    # 2. Delegate to provider.
    provider = get_provider(provider_name)
    try:
        identity = provider.authenticate(credentials, request)
    except AuthenticationFailed as exc:
        record_attempt(
            identifier=identifier, ip=ip, success=False,
            provider=provider_name, failure_reason='invalid_credentials',
        )
        log_event(
            event_type='LOGIN_FAILURE',
            metadata={'provider': provider_name, 'reason': 'invalid_credentials'},
            ip=ip,
        )
        raise exc

    # 3. Resolve (or JIT-create) the local user.
    try:
        user = resolve_or_link_user(identity)
    except AuthenticationFailed as exc:
        record_attempt(
            identifier=identifier or identity.email, ip=ip, success=False,
            provider=provider_name, failure_reason='inactive_account',
        )
        log_event(
            event_type='LOGIN_FAILURE',
            metadata={'provider': provider_name, 'reason': 'inactive_account'},
            ip=ip,
        )
        raise exc

    # 4. Issue tokens + create the session row keyed by the access jti.
    token_pair: TokenPair = issue_token_pair(user)
    session = create_session(
        user=user,
        jti=token_pair.access_jti,
        expires_at=token_pair.access_expires_at,
        request=request,
        device_name=device_name,
    )

    # 5. Audit trail + last_login bookkeeping.
    update_last_login(None, user)
    record_attempt(
        identifier=user.email, ip=ip, success=True, provider=provider_name,
    )
    log_event(
        event_type='LOGIN_SUCCESS',
        user=user,
        metadata={'provider': provider_name, 'session_id': session.id},
        ip=ip,
    )

    return user, token_pair, session


def perform_logout(*, user, session: Optional[LoginSession], request=None) -> None:
    ip = get_client_ip(request) if request else None
    if session and session.revoked_at is None:
        session.revoke()
    log_event(
        event_type='LOGOUT',
        user=user,
        metadata={'session_id': getattr(session, 'id', None)},
        ip=ip,
    )


def perform_logout_all(*, user, request=None) -> int:
    ip = get_client_ip(request) if request else None
    return revoke_all_sessions(user, ip=ip)


def refresh_session(*, raw_refresh: str, request=None) -> tuple:
    """
    Exchange a refresh token for a new access+refresh pair.

    The old session (by access_jti embedded in this refresh's rotation chain)
    is revoked and a new session is created for the new access jti. Returns
    (user, TokenPair, LoginSession).
    """
    ip = get_client_ip(request) if request else None

    try:
        old = decode_refresh(raw_refresh)
    except TokenError as exc:
        raise AuthenticationFailed(str(exc))

    from django.contrib.auth import get_user_model
    User = get_user_model()
    user = User.objects.filter(pk=old['user_id']).first()
    if user is None or getattr(user, 'account_status', 'ACTIVE') != 'ACTIVE':
        raise AuthenticationFailed('Invalid refresh token.')

    # Revoke any sessions still tied to the old refresh's companion access jti.
    old_jti = old.get('jti')
    LoginSession.objects.filter(user=user, jti=old_jti, revoked_at__isnull=True).update(
        revoked_at=datetime.now(tz=dt_tz.utc),
    )

    token_pair = issue_token_pair(user)
    session = create_session(
        user=user,
        jti=token_pair.access_jti,
        expires_at=token_pair.access_expires_at,
        request=request,
    )
    log_event(
        event_type='TOKEN_REFRESHED',
        user=user,
        metadata={'session_id': session.id},
        ip=ip,
    )
    return user, token_pair, session
