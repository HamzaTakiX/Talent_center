"""Mock email provider for development and tests."""

from __future__ import annotations

import logging

from apps.notifications.providers.base import EmailProvider, EmailResult

logger = logging.getLogger(__name__)


class MockEmailProvider(EmailProvider):
    name = 'mock'

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
        logger.info('MockEmail to=%s subject=%s', to, subject)
        return EmailResult(success=True, message_id=f'mock-{to}-{subject[:20]}')
