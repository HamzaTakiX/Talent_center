"""SMTP email provider."""

from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from apps.notifications.providers.base import EmailProvider, EmailResult
from apps.notifications.services.email_config_service import get_provider_credentials, get_reply_to_email

logger = logging.getLogger(__name__)


class SmtpEmailProvider(EmailProvider):
    name = 'smtp'

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
        host = creds.get('smtp_host', '')
        port = int(creds.get('smtp_port') or 587)
        user = creds.get('smtp_user', '')
        password = creds.get('smtp_password', '')
        use_tls = creds.get('smtp_use_tls', True)

        if not host:
            return EmailResult(success=False, error='SMTP host not configured')

        sender_email = from_email or user or 'noreply@talent-center.ma'
        sender_name = from_name or 'Digital Talent Center'
        reply = reply_to or get_reply_to_email()

        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f'{sender_name} <{sender_email}>' if sender_name else sender_email
        msg['To'] = to
        if reply:
            msg['Reply-To'] = reply

        msg.attach(MIMEText(body_text or subject, 'plain', 'utf-8'))
        msg.attach(MIMEText(body_html, 'html', 'utf-8'))

        try:
            with smtplib.SMTP(host, port, timeout=15) as server:
                if use_tls:
                    server.starttls()
                if user and password:
                    server.login(user, password)
                server.sendmail(sender_email, [to], msg.as_string())
            return EmailResult(success=True, message_id=f'smtp-{to}')
        except Exception as exc:
            logger.exception('SMTP send failed')
            return EmailResult(success=False, error=str(exc))

    def validate_connection(self) -> EmailResult:
        creds = get_provider_credentials()
        host = creds.get('smtp_host', '')
        port = int(creds.get('smtp_port') or 587)
        user = creds.get('smtp_user', '')
        password = creds.get('smtp_password', '')
        use_tls = creds.get('smtp_use_tls', True)
        if not host:
            return EmailResult(success=False, error='SMTP host is required')
        try:
            with smtplib.SMTP(host, port, timeout=15) as server:
                if use_tls:
                    server.starttls()
                if user and password:
                    server.login(user, password)
            return EmailResult(success=True)
        except Exception as exc:
            return EmailResult(success=False, error=str(exc))
