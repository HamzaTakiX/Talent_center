"""Resolve a ProviderIdentity to a local User (with optional JIT provisioning)."""

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.exceptions import AuthenticationFailed

from ..providers.base import ProviderIdentity, ProviderName
from ..providers.registry import get_provider
from .security import log_event

User = get_user_model()


def _ensure_active(user) -> None:
    if getattr(user, 'account_status', 'ACTIVE') != 'ACTIVE' or not user.is_active:
        raise AuthenticationFailed('Account is not active.')


@transaction.atomic
def resolve_or_link_user(identity: ProviderIdentity):
    """
    Return the User corresponding to an authenticated ProviderIdentity.

    - LOCAL: look up by email; user must already exist.
    - Remote: look up by (auth_provider, provider_user_id). If absent, try to
      link an existing user by verified email. If still absent and the provider
      allows JIT provisioning, create a new user with an unusable password.
    """
    if identity.provider == ProviderName.LOCAL:
        user = User.objects.filter(email__iexact=identity.email).first()
        if user is None:
            raise AuthenticationFailed('Invalid credentials')
        _ensure_active(user)
        return user

    provider_value = identity.provider.value

    # 1. Exact (provider, subject) match.
    user = User.objects.filter(
        auth_provider=provider_value,
        provider_user_id=identity.provider_user_id,
    ).first()
    if user is not None:
        _ensure_active(user)
        return user

    # 2. Link by verified email.
    if identity.email_verified and identity.email:
        user = User.objects.filter(email__iexact=identity.email).first()
        if user is not None:
            user.auth_provider = provider_value
            user.provider_user_id = identity.provider_user_id
            user.save(update_fields=['auth_provider', 'provider_user_id', 'updated_at'])
            log_event(
                event_type='PROVIDER_LINKED',
                user=user,
                metadata={'provider': provider_value, 'reason': 'email_match'},
            )
            _ensure_active(user)
            return user

    # 3. Just-in-time provision if the provider allows it.
    provider_cls = get_provider(provider_value).__class__
    if provider_cls.jit_provision_enabled() and identity.email:
        user = User.objects.create(
            email=identity.email.lower(),
            auth_provider=provider_value,
            provider_user_id=identity.provider_user_id,
            account_status='ACTIVE',
            is_active=True,
        )
        user.set_unusable_password()
        user.save(update_fields=['password'])
        log_event(
            event_type='PROVIDER_LINKED',
            user=user,
            metadata={'provider': provider_value, 'reason': 'jit_provisioned'},
        )
        return user

    raise AuthenticationFailed('No matching account for this identity.')
