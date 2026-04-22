"""
Generic SSO provider — STUB.

Placeholder for a future SAML 2.0 or institution-specific OIDC integration
(e.g. Shibboleth, campus IdP). Implementation will depend on whether the
chosen standard is SAML (use python3-saml) or OIDC (reuse the Auth0 pattern
with a different discovery document).

Required env vars (mapped into settings.AUTH_PROVIDERS['SSO']):
    SSO_ENABLED         -> ENABLED
    SSO_METADATA_URL    -> METADATA_URL   (SAML IdP metadata XML, or OIDC discovery)
    SSO_JIT             -> JIT_PROVISION
"""

from .base import AuthProvider, ProviderIdentity, ProviderName
from .registry import register


@register
class GenericSSOProvider(AuthProvider):
    name = ProviderName.SSO

    def authenticate(self, credentials: dict, request) -> ProviderIdentity:
        raise NotImplementedError(
            'GenericSSOProvider.authenticate is not implemented yet. '
            'Wire SAML assertion consumption or OIDC discovery here.'
        )

    def begin_login(self, request) -> str:
        raise NotImplementedError(
            'GenericSSOProvider.begin_login is not implemented yet.'
        )

    def handle_callback(self, request) -> ProviderIdentity:
        raise NotImplementedError(
            'GenericSSOProvider.handle_callback is not implemented yet.'
        )
