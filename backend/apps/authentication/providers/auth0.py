"""
Auth0 provider — validates access tokens issued by Auth0 (SPA / OIDC).
"""

import json
from urllib.request import urlopen

import jwt
from django.conf import settings
from jwt import PyJWKClient
from rest_framework.exceptions import AuthenticationFailed

from .base import AuthProvider, ProviderIdentity, ProviderName
from .registry import register


def _jwks_client() -> PyJWKClient:
    domain = settings.AUTH_PROVIDERS['AUTH0']['DOMAIN'].rstrip('/')
    if domain.startswith('https://'):
        jwks_url = f'{domain}/.well-known/jwks.json'
    else:
        jwks_url = f'https://{domain}/.well-known/jwks.json'
    return PyJWKClient(jwks_url)


def _decode_auth0_token(token: str) -> dict:
    cfg = settings.AUTH_PROVIDERS['AUTH0']
    domain = cfg['DOMAIN'].rstrip('/')
    issuer = domain if domain.startswith('https://') else f'https://{domain}/'
    if not issuer.endswith('/'):
        issuer = f'{issuer}/'

    signing_key = _jwks_client().get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=['RS256'],
        audience=cfg.get('CLIENT_ID') or cfg.get('AUDIENCE') or None,
        issuer=issuer,
        options={'verify_aud': bool(cfg.get('CLIENT_ID') or cfg.get('AUDIENCE'))},
    )


@register
class Auth0Provider(AuthProvider):
    name = ProviderName.AUTH0

    def authenticate(self, credentials: dict, request) -> ProviderIdentity:
        access_token = (
            credentials.get('access_token')
            or credentials.get('id_token')
            or ''
        ).strip()
        if not access_token:
            raise AuthenticationFailed('Auth0 access token is required.')

        try:
            claims = _decode_auth0_token(access_token)
        except Exception as exc:
            raise AuthenticationFailed('Invalid Auth0 token.') from exc

        sub = claims.get('sub') or ''
        email = (claims.get('email') or '').strip().lower()
        if not sub or not email:
            raise AuthenticationFailed('Auth0 token is missing required claims.')

        return ProviderIdentity(
            provider=ProviderName.AUTH0,
            provider_user_id=sub,
            email=email,
            email_verified=bool(claims.get('email_verified', False)),
            raw_claims=claims,
        )

    def begin_login(self, request) -> str:
        cfg = self.config()
        domain = cfg['DOMAIN'].rstrip('/')
        base = domain if domain.startswith('https://') else f'https://{domain}'
        import secrets
        state = secrets.token_urlsafe(32)
        request.session['auth0_state'] = state
        from urllib.parse import urlencode
        params = urlencode({
            'response_type': 'code',
            'client_id': cfg['CLIENT_ID'],
            'redirect_uri': cfg['REDIRECT_URI'],
            'scope': 'openid profile email',
            'state': state,
        })
        return f'{base}/authorize?{params}'

    def handle_callback(self, request) -> ProviderIdentity:
        code = request.GET.get('code') or request.data.get('code')
        if not code:
            raise AuthenticationFailed('Authorization code is required.')
        cfg = self.config()
        domain = cfg['DOMAIN'].rstrip('/')
        token_url = (
            f'{domain}/oauth/token'
            if domain.startswith('https://')
            else f'https://{domain}/oauth/token'
        )
        import urllib.parse
        import urllib.request
        body = urllib.parse.urlencode({
            'grant_type': 'authorization_code',
            'client_id': cfg['CLIENT_ID'],
            'client_secret': cfg['CLIENT_SECRET'],
            'code': code,
            'redirect_uri': cfg['REDIRECT_URI'],
        }).encode()
        req = urllib.request.Request(
            token_url,
            data=body,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            payload = json.loads(resp.read().decode())
        access_token = payload.get('access_token') or payload.get('id_token')
        return self.authenticate({'access_token': access_token}, request)
