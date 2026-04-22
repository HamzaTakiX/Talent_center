"""
Auth0 provider — STUB.

When implementing, the pipeline will be:
    1. begin_login(request):
         - Build URL: https://{AUTH0_DOMAIN}/authorize?
               response_type=code&client_id={AUTH0_CLIENT_ID}
               &redirect_uri={AUTH0_REDIRECT_URI}&scope=openid email profile
               &state={csrf_token}
         - Store `state` in request.session for CSRF.
    2. handle_callback(request):
         - Validate `state` against request.session.
         - POST to https://{AUTH0_DOMAIN}/oauth/token with
           grant_type=authorization_code, code, client_id, client_secret,
           redirect_uri.
         - Fetch JWKS from https://{AUTH0_DOMAIN}/.well-known/jwks.json and
           validate the id_token (alg=RS256, iss, aud, exp, nbf).
         - Extract `sub`, `email`, `email_verified` from id_token claims.
         - Return ProviderIdentity(provider=AUTH0, provider_user_id=sub, ...).
    3. authenticate(credentials, request) can accept {'id_token': ...} or
       {'code': ..., 'state': ...} depending on frontend flow choice.

Required env vars (mapped into settings.AUTH_PROVIDERS['AUTH0']):
    AUTH0_ENABLED         -> ENABLED
    AUTH0_DOMAIN          -> DOMAIN
    AUTH0_CLIENT_ID       -> CLIENT_ID
    AUTH0_CLIENT_SECRET   -> CLIENT_SECRET
    AUTH0_REDIRECT_URI    -> REDIRECT_URI
    AUTH0_JIT             -> JIT_PROVISION
"""

from .base import AuthProvider, ProviderIdentity, ProviderName
from .registry import register


@register
class Auth0Provider(AuthProvider):
    name = ProviderName.AUTH0

    def authenticate(self, credentials: dict, request) -> ProviderIdentity:
        raise NotImplementedError(
            'Auth0Provider.authenticate is not implemented yet. '
            'Wire the OIDC code-exchange or id_token validation here.'
        )

    def begin_login(self, request) -> str:
        raise NotImplementedError(
            'Auth0Provider.begin_login is not implemented yet. '
            'Return the Auth0 /authorize redirect URL here.'
        )

    def handle_callback(self, request) -> ProviderIdentity:
        raise NotImplementedError(
            'Auth0Provider.handle_callback is not implemented yet. '
            'Exchange the code for tokens, validate the id_token, and '
            'return a ProviderIdentity.'
        )
