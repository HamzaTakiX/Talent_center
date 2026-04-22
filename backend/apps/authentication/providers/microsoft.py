"""
Microsoft / Azure AD provider — STUB.

When implementing (Microsoft Identity Platform v2.0):
    1. begin_login(request):
         - Authorize endpoint:
           https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/authorize
         - Params: client_id, response_type=code, redirect_uri, response_mode=query,
                   scope="openid profile email offline_access", state={csrf}.
    2. handle_callback(request):
         - Validate `state`.
         - POST to https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token
           with grant_type=authorization_code, code, client_id, client_secret,
           redirect_uri.
         - Validate id_token signature against
           https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys.
         - Extract `oid` (stable user id) or `sub`, `email`, `preferred_username`.
         - Return ProviderIdentity(provider=MICROSOFT, provider_user_id=oid, ...).

Required env vars (mapped into settings.AUTH_PROVIDERS['MICROSOFT']):
    MS_ENABLED          -> ENABLED
    MS_TENANT_ID        -> TENANT_ID
    MS_CLIENT_ID        -> CLIENT_ID
    MS_CLIENT_SECRET    -> CLIENT_SECRET
    MS_REDIRECT_URI     -> REDIRECT_URI
    MS_JIT              -> JIT_PROVISION
"""

from .base import AuthProvider, ProviderIdentity, ProviderName
from .registry import register


@register
class MicrosoftProvider(AuthProvider):
    name = ProviderName.MICROSOFT

    def authenticate(self, credentials: dict, request) -> ProviderIdentity:
        raise NotImplementedError(
            'MicrosoftProvider.authenticate is not implemented yet. '
            'Wire Microsoft Identity Platform OIDC here.'
        )

    def begin_login(self, request) -> str:
        raise NotImplementedError(
            'MicrosoftProvider.begin_login is not implemented yet. '
            'Return the Microsoft /oauth2/v2.0/authorize redirect URL here.'
        )

    def handle_callback(self, request) -> ProviderIdentity:
        raise NotImplementedError(
            'MicrosoftProvider.handle_callback is not implemented yet.'
        )
