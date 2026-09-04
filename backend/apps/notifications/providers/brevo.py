"""Brevo (Sendinblue) transactional email provider.

Only this module and the provider factory may import Brevo-specific details.
Business services must never import this module directly.
"""

from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request

from apps.notifications.providers.base import EmailProvider, EmailResult
from apps.notifications.services.email_config_service import (
    get_provider_credentials,
    get_reply_to_email,
    get_sender_identity,
)

logger = logging.getLogger(__name__)

BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
BREVO_ACCOUNT_URL = 'https://api.brevo.com/v3/account'


class BrevoEmailProvider(EmailProvider):
    name = 'brevo'

    def send_email(
        self,
        *,
        to: str,
        subject: str,
        body_html: str,
        body_text: str = '',
        template_id: str = '',
        metadata: dict | None = None,
        from_email: str = '',
        from_name: str = '',
        reply_to: str = '',
    ) -> EmailResult:
        creds = get_provider_credentials()
        api_key = creds.get('api_key', '')
        if not api_key:
            return EmailResult(success=False, error='Brevo API key not configured')

        sender = get_sender_identity()
        payload = {
            'sender': {
                'email': from_email or sender['email'],
                'name': from_name or sender['name'],
            },
            'to': [{'email': to}],
            'subject': subject,
            'htmlContent': body_html or f'<p>{body_text or subject}</p>',
        }
        if body_text:
            payload['textContent'] = body_text
        reply = reply_to or get_reply_to_email()
        if reply:
            payload['replyTo'] = {'email': reply}
        if metadata:
            payload['headers'] = {
                'X-Mailin-custom': json.dumps({k: str(v) for k, v in metadata.items()}),
            }
        if template_id:
            payload.setdefault('tags', []).append(str(template_id)[:64])

        try:
            response_data, status_code = self._request(
                BREVO_API_URL, api_key, payload, method='POST',
            )
            if 200 <= status_code < 300:
                message_id = ''
                if isinstance(response_data, dict):
                    message_id = str(response_data.get('messageId') or '')
                return EmailResult(
                    success=True,
                    message_id=message_id,
                    raw_response={'status_code': status_code, 'body': response_data},
                )
            error = ''
            if isinstance(response_data, dict):
                error = str(response_data.get('message') or response_data.get('error') or '')
            return EmailResult(
                success=False,
                error=error or f'Brevo API returned status {status_code}',
                raw_response={'status_code': status_code, 'body': response_data},
            )
        except Exception as exc:
            logger.exception('Brevo send failed')
            return EmailResult(success=False, error=str(exc))

    def validate_connection(self) -> EmailResult:
        creds = get_provider_credentials()
        api_key = creds.get('api_key', '')
        if not api_key:
            return EmailResult(success=False, error='Brevo API key is required')
        try:
            response_data, status_code = self._request(
                BREVO_ACCOUNT_URL, api_key, None, method='GET',
            )
            if status_code < 400:
                return EmailResult(
                    success=True,
                    raw_response={'status_code': status_code, 'body': response_data},
                )
            return EmailResult(
                success=False,
                error=f'Brevo API returned status {status_code}',
                raw_response={'status_code': status_code, 'body': response_data},
            )
        except Exception as exc:
            return EmailResult(success=False, error=str(exc))

    def _request(
        self,
        url: str,
        api_key: str,
        payload: dict | None,
        *,
        method: str,
    ) -> tuple[dict | list | str, int]:
        data = None
        headers = {
            'accept': 'application/json',
            'api-key': api_key,
        }
        if payload is not None:
            data = json.dumps(payload).encode('utf-8')
            headers['content-type'] = 'application/json'
        request = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                raw = response.read().decode('utf-8') or '{}'
                try:
                    parsed = json.loads(raw)
                except json.JSONDecodeError:
                    parsed = raw
                return parsed, response.getcode()
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode('utf-8') if exc.fp else ''
            try:
                parsed = json.loads(raw) if raw else {'message': str(exc)}
            except json.JSONDecodeError:
                parsed = {'message': raw or str(exc)}
            return parsed, exc.code
