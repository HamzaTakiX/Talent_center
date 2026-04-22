"""
Auth provider contract.

Every provider (local, Auth0, Microsoft, future SSO) implements this ABC.
The rest of the auth pipeline — JWT issuance, session tracking, audit logs,
lockout — is provider-agnostic and only depends on `ProviderIdentity`.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, ClassVar

from django.conf import settings


class ProviderName(str, Enum):
    LOCAL = 'LOCAL'
    AUTH0 = 'AUTH0'
    MICROSOFT = 'MICROSOFT'
    SSO = 'SSO'


@dataclass
class ProviderIdentity:
    """Normalized user info returned by any provider after successful authn."""

    provider: ProviderName
    provider_user_id: str          # empty string for LOCAL
    email: str
    email_verified: bool = False
    raw_claims: dict[str, Any] = field(default_factory=dict)


class AuthProvider(ABC):
    """Base class every provider must subclass."""

    name: ClassVar[ProviderName]

    @classmethod
    def config(cls) -> dict[str, Any]:
        return settings.AUTH_PROVIDERS.get(cls.name.value, {})

    @classmethod
    def is_enabled(cls) -> bool:
        return bool(cls.config().get('ENABLED', False))

    @classmethod
    def jit_provision_enabled(cls) -> bool:
        return bool(cls.config().get('JIT_PROVISION', False))

    @abstractmethod
    def authenticate(self, credentials: dict, request) -> ProviderIdentity:
        """
        Verify credentials against this provider and return a ProviderIdentity.

        Raises rest_framework.exceptions.AuthenticationFailed on failure. The
        shape of `credentials` is provider-specific: `{email, password}` for
        local, `{code, state}` or `{id_token}` for OIDC providers.
        """

    def begin_login(self, request) -> str:
        """
        Return the URL the caller should be redirected to (OAuth/OIDC
        authorization endpoint). Not used by the local provider.
        """
        raise NotImplementedError(f'{self.name.value} does not support redirect login.')

    def handle_callback(self, request) -> ProviderIdentity:
        """
        Process a redirect callback (authorization code, state, etc.) and
        return a ProviderIdentity. Not used by the local provider.
        """
        raise NotImplementedError(f'{self.name.value} does not support redirect login.')
