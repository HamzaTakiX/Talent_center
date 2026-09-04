"""
Low-level Microsoft Graph HTTP client (client-credentials).

Never logs access tokens or client secrets.
"""

from __future__ import annotations

import logging
import time
from typing import Any, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json

from django.conf import settings

from .exceptions import (
    MicrosoftGraphConfigError,
    MicrosoftGraphError,
    MicrosoftGraphForbidden,
    MicrosoftGraphNotFound,
    MicrosoftGraphUnauthorized,
)

logger = logging.getLogger(__name__)

GRAPH_BASE = 'https://graph.microsoft.com/v1.0'
TOKEN_URL_TEMPLATE = 'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token'


class MicrosoftGraphClient:
    """Application-permission Graph client with cached access tokens."""

    def __init__(self):
        self._token: str | None = None
        self._token_expires_at: float = 0.0

    def config(self) -> dict:
        cfg = getattr(settings, 'MICROSOFT_GRAPH', {}) or {}
        return cfg

    def is_configured(self) -> bool:
        cfg = self.config()
        return bool(
            cfg.get('ENABLED')
            and cfg.get('TENANT_ID')
            and cfg.get('CLIENT_ID')
            and cfg.get('CLIENT_SECRET')
            and cfg.get('ENTERPRISE_APP_OBJECT_ID')
        )

    def require_configured(self) -> dict:
        cfg = self.config()
        if not self.is_configured():
            raise MicrosoftGraphConfigError(
                'Microsoft Graph is not configured. Set MICROSOFT_GRAPH_* and '
                'MICROSOFT_TALENT_CENTER_ENTERPRISE_APP_OBJECT_ID environment variables.',
            )
        return cfg

    def get_access_token(self, *, force_refresh: bool = False) -> str:
        cfg = self.require_configured()
        now = time.time()
        if not force_refresh and self._token and now < (self._token_expires_at - 60):
            return self._token

        token_url = TOKEN_URL_TEMPLATE.format(tenant=cfg['TENANT_ID'])
        body = urlencode({
            'client_id': cfg['CLIENT_ID'],
            'client_secret': cfg['CLIENT_SECRET'],
            'scope': 'https://graph.microsoft.com/.default',
            'grant_type': 'client_credentials',
        }).encode('utf-8')
        req = Request(
            token_url,
            data=body,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            method='POST',
        )
        try:
            with urlopen(req, timeout=20) as resp:
                payload = json.loads(resp.read().decode('utf-8'))
        except HTTPError as exc:
            logger.warning(
                'Microsoft Graph token request failed status=%s',
                getattr(exc, 'code', None),
            )
            raise MicrosoftGraphUnauthorized(
                'Failed to acquire Microsoft Graph access token.',
                status_code=getattr(exc, 'code', 401),
            ) from exc
        except URLError as exc:
            raise MicrosoftGraphError('Unable to reach Microsoft identity platform.') from exc

        token = payload.get('access_token')
        if not token:
            raise MicrosoftGraphUnauthorized('Microsoft identity platform returned no access_token.')

        expires_in = int(payload.get('expires_in') or 3600)
        self._token = token
        self._token_expires_at = now + expires_in
        logger.info(
            'Microsoft Graph access token acquired (expires_in=%ss, tenant=%s, client_id=%s…)',
            expires_in,
            cfg['TENANT_ID'],
            str(cfg['CLIENT_ID'])[:8],
        )
        return token

    def request(
        self,
        method: str,
        path: str,
        *,
        query: dict | None = None,
        json_body: dict | None = None,
        expected: tuple[int, ...] = (200, 201, 204),
    ) -> Any:
        token = self.get_access_token()
        url = path if path.startswith('http') else f'{GRAPH_BASE}{path}'
        if query:
            url = f'{url}?{urlencode(query)}'

        data = None
        headers = {
            'Authorization': f'Bearer {token}',
            'Accept': 'application/json',
        }
        if json_body is not None:
            data = json.dumps(json_body).encode('utf-8')
            headers['Content-Type'] = 'application/json'

        req = Request(url, data=data, headers=headers, method=method.upper())
        try:
            with urlopen(req, timeout=30) as resp:
                status_code = getattr(resp, 'status', 200)
                raw = resp.read()
                if status_code not in expected and status_code not in (200, 201, 204):
                    raise MicrosoftGraphError(
                        f'Unexpected Graph status {status_code}',
                        status_code=status_code,
                    )
                if not raw or status_code == 204:
                    return None
                return json.loads(raw.decode('utf-8'))
        except HTTPError as exc:
            err_body: dict = {}
            try:
                err_body = json.loads(exc.read().decode('utf-8'))
            except Exception:
                pass
            code = exc.code
            message = (
                (err_body.get('error') or {}).get('message')
                if isinstance(err_body.get('error'), dict)
                else err_body.get('error_description')
            ) or f'Microsoft Graph request failed ({code}).'
            logger.warning(
                'Microsoft Graph %s %s failed status=%s code=%s',
                method.upper(),
                path,
                code,
                (err_body.get('error') or {}).get('code') if isinstance(err_body.get('error'), dict) else None,
            )
            if code == 401:
                # One retry with fresh token for expired credentials.
                if method.upper() != 'GET' or True:
                    self._token = None
                raise MicrosoftGraphUnauthorized(message, status_code=401, details=err_body) from exc
            if code == 403:
                raise MicrosoftGraphForbidden(message, status_code=403, details=err_body) from exc
            if code == 404:
                raise MicrosoftGraphNotFound(message, status_code=404, details=err_body) from exc
            raise MicrosoftGraphError(message, status_code=code, details=err_body) from exc
        except URLError as exc:
            raise MicrosoftGraphError('Unable to reach Microsoft Graph.') from exc
