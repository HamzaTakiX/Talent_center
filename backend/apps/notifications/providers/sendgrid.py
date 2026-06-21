"""SendGrid email provider."""

from __future__ import annotations

import logging

from apps.notifications.providers.base import EmailProvider, EmailResult
from apps.notifications.services.email_config_service import (
    get_provider_credentials,
    get_reply_to_email,
    get_sender_identity,
)

logger = logging.getLogger(__name__)


class SendGridEmailProvider(EmailProvider):
    name = 'sendgrid'

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
            return EmailResult(success=False, error='SendGrid API key not configured')

        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Content, Email, Mail, To
        except ImportError:
            return EmailResult(success=False, error='sendgrid package not installed')

        sender = get_sender_identity()
        from_email_obj = Email(
            from_email or sender['email'],
            from_name or sender['name'],
        )
        message = Mail(
            from_email=from_email_obj,
            to_emails=To(to),
            subject=subject,
            plain_text_content=Content('text/plain', body_text or subject),
            html_content=Content('text/html', body_html),
        )
        reply = reply_to or get_reply_to_email()
        if reply:
            message.reply_to = Email(reply)
        try:
            client = SendGridAPIClient(api_key)
            response = client.send(message)
            message_id = response.headers.get('X-Message-Id', '') if response.headers else ''
            return EmailResult(
                success=200 <= response.status_code < 300,
                message_id=message_id,
                raw_response={'status_code': response.status_code},
            )
        except Exception as exc:
            logger.exception('SendGrid send failed')
            return EmailResult(success=False, error=str(exc))

    def validate_connection(self) -> EmailResult:
        creds = get_provider_credentials()
        api_key = creds.get('api_key', '')
        if not api_key:
            return EmailResult(success=False, error='SendGrid API key is required')
        try:
            from sendgrid import SendGridAPIClient
            client = SendGridAPIClient(api_key)
            response = client.client.api_keys.get()
            if response.status_code < 400:
                return EmailResult(success=True, raw_response={'status_code': response.status_code})
            return EmailResult(success=False, error=f'API returned status {response.status_code}')
        except Exception as exc:
            return EmailResult(success=False, error=str(exc))
