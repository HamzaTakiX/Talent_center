"""Password reset / change flows. LOCAL provider only."""

import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed, ValidationError

from apps.notifications.events.publisher import emit_event

from ..models import PasswordResetRequest
from ..selectors import get_user_by_email
from ..utils import get_client_ip, hash_token
from .security import log_event
from .sessions import revoke_all_sessions

User = get_user_model()


def _is_local(user) -> bool:
    return getattr(user, 'auth_provider', 'LOCAL') == 'LOCAL'


def request_password_reset(*, email: str, request=None) -> None:
    """
    Generate a reset token for the user and email it to them. Always returns
    None regardless of whether the email exists, to prevent enumeration.
    Non-LOCAL users are silently ignored — they have no local password.
    """
    ip = get_client_ip(request) if request else None
    user = get_user_by_email((email or '').strip())
    if user is None or not _is_local(user):
        return

    raw_token = secrets.token_urlsafe(48)
    ttl = timedelta(seconds=settings.PASSWORD_RESET_TOKEN_TTL_SECONDS)

    PasswordResetRequest.objects.create(
        user=user,
        token=hash_token(raw_token),
        expires_at=timezone.now() + ttl,
    )

    reset_url = f'{settings.FRONTEND_RESET_PASSWORD_URL}?token={raw_token}'
    ttl_minutes = settings.PASSWORD_RESET_TOKEN_TTL_SECONDS // 60
    emit_event(
        event_code='student.password.reset',
        source_app='authentication',
        entity_type='user',
        entity_id=user.pk,
        payload={
            'user_id': user.pk,
            'reset_url': reset_url,
            'ttl_minutes': ttl_minutes,
            'title': 'Password reset',
            'body': f'Use this link within {ttl_minutes} minutes to reset your password.',
            'action_url': reset_url,
        },
        actor=None,
        idempotency_key=f'password-reset-{user.pk}-{timezone.now().strftime("%Y%m%d%H")}',
    )
    log_event(
        event_type='PASSWORD_RESET_REQUESTED',
        user=user,
        metadata={},
        ip=ip,
    )


@transaction.atomic
def reset_password(*, token: str, new_password: str, request=None):
    """Consume a reset token and set the new password. Revokes all sessions."""
    ip = get_client_ip(request) if request else None

    record = (
        PasswordResetRequest.objects
        .select_for_update()
        .filter(token=hash_token(token or ''), used_at__isnull=True)
        .first()
    )
    if record is None or not record.is_valid():
        raise ValidationError({'token': ['Invalid or expired reset token.']})

    user = record.user
    if not _is_local(user):
        raise ValidationError({'token': ['Invalid or expired reset token.']})

    user.set_password(new_password)
    user.save(update_fields=['password', 'updated_at'])

    record.used_at = timezone.now()
    record.save(update_fields=['used_at'])

    revoke_all_sessions(user, ip=ip)
    log_event(
        event_type='PASSWORD_RESET_COMPLETED',
        user=user,
        metadata={},
        ip=ip,
    )
    return user


def change_password(
    *,
    user,
    old_password: str,
    new_password: str,
    logout_other_sessions: bool = False,
    current_jti: str | None = None,
    request=None,
):
    """Change password for an authenticated user (LOCAL only)."""
    ip = get_client_ip(request) if request else None
    if not _is_local(user):
        raise ValidationError({'provider': ['Password change is only available for local accounts.']})
    if not user.check_password(old_password):
        raise AuthenticationFailed('Current password is incorrect.')

    user.set_password(new_password)
    user.save(update_fields=['password', 'updated_at'])

    if logout_other_sessions:
        revoke_all_sessions(user, keep_jti=current_jti, ip=ip)

    log_event(
        event_type='PASSWORD_CHANGED',
        user=user,
        metadata={'logout_other_sessions': bool(logout_other_sessions)},
        ip=ip,
    )
    return user
