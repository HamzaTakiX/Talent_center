"""
Auth0 provider — validates access tokens issued by Auth0 (SPA / OIDC).
"""

import json
import logging
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import jwt
from django.conf import settings
from jwt import PyJWKClient
from rest_framework.exceptions import AuthenticationFailed

from .base import AuthProvider, ProviderIdentity, ProviderName
from .registry import register

logger = logging.getLogger(__name__)


def _auth0_base_url() -> str:
    domain = settings.AUTH_PROVIDERS['AUTH0']['DOMAIN'].rstrip('/')
    return domain if domain.startswith('https://') else f'https://{domain}'


def _auth0_issuer() -> str:
    issuer = f'{_auth0_base_url()}/'
    return issuer if issuer.endswith('/') else f'{issuer}/'


def _jwks_client() -> PyJWKClient:
    return PyJWKClient(f'{_auth0_base_url()}/.well-known/jwks.json')


def _is_jwt(token: str) -> bool:
    parts = token.split('.')
    return len(parts) == 3 and all(parts)


def _safe_token_diagnostics(token: str) -> dict:
    """Log-safe JWT metadata — never includes the raw token."""
    diag: dict = {'is_jwt': _is_jwt(token)}
    if not _is_jwt(token):
        return diag
    try:
        header = jwt.get_unverified_header(token)
        payload = jwt.decode(token, options={'verify_signature': False})
        diag.update({
            'header_alg': header.get('alg'),
            'header_kid': header.get('kid'),
            'iss': payload.get('iss'),
            'aud': payload.get('aud'),
            'claim_keys': sorted(payload.keys()),
        })
    except Exception as exc:
        diag['decode_error'] = type(exc).__name__
    return diag


def _decode_auth0_jwt(token: str) -> dict:
    cfg = settings.AUTH_PROVIDERS['AUTH0']
    audience = cfg.get('CLIENT_ID') or cfg.get('AUDIENCE') or None
    signing_key = _jwks_client().get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=['RS256'],
        audience=audience,
        issuer=_auth0_issuer(),
        options={'verify_aud': bool(audience)},
    )


def _fetch_auth0_userinfo(access_token: str) -> dict:
    """Validate an opaque (or API-scoped) access token via Auth0 /userinfo."""
    url = f'{_auth0_base_url()}/userinfo'
    req = Request(
        url,
        headers={'Authorization': f'Bearer {access_token}'},
        method='GET',
    )
    try:
        with urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as exc:
        raise AuthenticationFailed('Invalid Auth0 token.') from exc


def _resolve_auth0_claims(token: str) -> dict:
    """
    Resolve Auth0 identity claims from a token sent by the SPA.

    The SPA (no custom API audience) receives an opaque access_token plus a
    signed id_token. We prefer a verifiable JWT (id_token or API access token);
    otherwise we validate the opaque access_token against /userinfo.
    """
    cfg = settings.AUTH_PROVIDERS['AUTH0']
    jwt_error: Exception | None = None

    if _is_jwt(token):
        try:
            claims = _decode_auth0_jwt(token)
            if claims.get('sub') and claims.get('email'):
                return claims
            logger.info(
                'Auth0 JWT decoded but missing sub/email; falling back to userinfo. diagnostics=%s configured_audience=%s',
                _safe_token_diagnostics(token),
                bool(cfg.get('CLIENT_ID') or cfg.get('AUDIENCE')),
            )
        except Exception as exc:
            jwt_error = exc
            logger.info(
                'Auth0 JWT verification failed; falling back to userinfo. diagnostics=%s error=%s: %s configured_issuer=%s',
                _safe_token_diagnostics(token),
                type(exc).__name__,
                exc,
                _auth0_issuer(),
            )

    try:
        return _fetch_auth0_userinfo(token)
    except AuthenticationFailed:
        raise
    except Exception as exc:
        logger.warning(
            'Auth0 userinfo validation failed. diagnostics=%s jwt_error=%s userinfo_error=%s: %s',
            _safe_token_diagnostics(token),
            f'{type(jwt_error).__name__}: {jwt_error}' if jwt_error else None,
            type(exc).__name__,
            exc,
        )
        if jwt_error is not None:
            raise AuthenticationFailed('Invalid Auth0 token.') from jwt_error
        raise AuthenticationFailed('Invalid Auth0 token.') from exc


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
            claims = _resolve_auth0_claims(access_token)
        except AuthenticationFailed:
            raise
        except Exception as exc:
            logger.warning(
                'Auth0 token resolution failed unexpectedly. diagnostics=%s error=%s: %s',
                _safe_token_diagnostics(access_token),
                type(exc).__name__,
                exc,
            )
            raise AuthenticationFailed('Invalid Auth0 token.') from exc

        sub = claims.get('sub') or ''
        email = (claims.get('email') or '').strip().lower()
        if not sub or not email:
            logger.warning(
                'Auth0 claims missing sub/email after resolution. claim_keys=%s',
                sorted(claims.keys()),
            )
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
        base = _auth0_base_url()
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
        token_url = f'{_auth0_base_url()}/oauth/token'
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
