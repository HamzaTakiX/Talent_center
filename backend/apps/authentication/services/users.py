"""Resolve a ProviderIdentity to a local User (with optional JIT provisioning)."""

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.exceptions import AuthenticationFailed

from apps.accounts_et_roles.models import StudentProfile, UserProfile

from ..providers.base import ProviderIdentity, ProviderName
from ..providers.registry import get_provider
from .first_login import (
    complete_first_admin_sso_login,
    complete_first_sso_login,
    complete_first_supervisor_sso_login,
)
from .platform_access import can_access_platform, platform_access_denial_reason
from .security import log_event

User = get_user_model()


def _ensure_sso_allowed(user, *, provider_value: str) -> None:
    if provider_value in (
        User.AuthProvider.AUTH0,
        User.AuthProvider.MICROSOFT,
        User.AuthProvider.SSO,
    ) and not user.sso_enabled:
        raise AuthenticationFailed(
            'SSO access has not been authorized for this account. Contact a super administrator.',
        )


def _ensure_platform_access(user) -> None:
    if not can_access_platform(user):
        raise AuthenticationFailed(platform_access_denial_reason(user))


@transaction.atomic
def resolve_or_link_user(identity: ProviderIdentity, *, after_sso: bool = False):
    """
    Return the User corresponding to an authenticated ProviderIdentity.

    - LOCAL: look up by email; user must already exist.
    - Remote: look up by (auth_provider, provider_user_id). Link by email if verified.
      JIT creates PENDING student without platform access until admin authorizes.
    """
    if identity.provider == ProviderName.LOCAL:
        user = User.objects.filter(email__iexact=identity.email).first()
        if user is None:
            raise AuthenticationFailed('Invalid credentials')
        _ensure_platform_access(user)
        return user

    provider_value = identity.provider.value

    user = User.objects.filter(
        auth_provider=provider_value,
        provider_user_id=identity.provider_user_id,
    ).first()
    if user is not None:
        _ensure_sso_allowed(user, provider_value=provider_value)
        _ensure_platform_access(user)
        if after_sso and user.role == User.RoleChoices.STUDENT:
            complete_first_sso_login(user=user)
        elif after_sso and user.role == User.RoleChoices.ADMIN:
            complete_first_admin_sso_login(user=user, identity=identity)
        elif after_sso and user.role == User.RoleChoices.SUPERVISOR:
            complete_first_supervisor_sso_login(user=user, identity=identity)
        return user

    if identity.email_verified and identity.email:
        user = User.objects.filter(email__iexact=identity.email).first()
        if user is not None:
            user.auth_provider = provider_value
            user.provider_user_id = identity.provider_user_id
            if not user.sso_enabled and provider_value in (
                User.AuthProvider.AUTH0,
                User.AuthProvider.MICROSOFT,
                User.AuthProvider.SSO,
            ):
                user.sso_enabled = True
            user.save(update_fields=[
                'auth_provider', 'provider_user_id', 'sso_enabled', 'updated_at',
            ])
            log_event(
                event_type='PROVIDER_LINKED',
                user=user,
                metadata={'provider': provider_value, 'reason': 'email_match'},
            )
            _ensure_sso_allowed(user, provider_value=provider_value)
            _ensure_platform_access(user)
            if after_sso and user.role == User.RoleChoices.STUDENT:
                complete_first_sso_login(user=user)
            elif after_sso and user.role == User.RoleChoices.ADMIN:
                complete_first_admin_sso_login(user=user, identity=identity)
            elif after_sso and user.role == User.RoleChoices.SUPERVISOR:
                complete_first_supervisor_sso_login(user=user, identity=identity)
            return user

    provider_cls = get_provider(provider_value).__class__
    if provider_cls.jit_provision_enabled() and identity.email:
        user = User.objects.create(
            email=identity.email.lower(),
            role=User.RoleChoices.STUDENT,
            auth_provider=provider_value,
            provider_user_id=identity.provider_user_id,
            account_status=User.AccountStatus.PENDING,
            platform_access_granted=False,
            sso_enabled=True,
            is_active=True,
        )
        user.set_unusable_password()
        user.save(update_fields=['password'])
        UserProfile.objects.create(user=user)
        StudentProfile.objects.create(user=user)
        log_event(
            event_type='PROVIDER_LINKED',
            user=user,
            metadata={'provider': provider_value, 'reason': 'jit_provisioned'},
        )
        raise AuthenticationFailed(platform_access_denial_reason(user))

    raise AuthenticationFailed('No matching account for this identity.')
