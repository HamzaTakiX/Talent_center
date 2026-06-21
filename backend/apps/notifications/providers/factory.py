"""Provider factory."""

from __future__ import annotations

from apps.notifications.providers.base import EmailProvider
from apps.notifications.providers.mock import MockEmailProvider
from apps.notifications.providers.sendgrid import SendGridEmailProvider
from apps.notifications.providers.smtp import SmtpEmailProvider
from apps.notifications.services.email_config_service import get_active_provider_name


def get_email_provider() -> EmailProvider:
    provider_name = get_active_provider_name()
    if provider_name == 'sendgrid':
        return SendGridEmailProvider()
    if provider_name == 'smtp':
        return SmtpEmailProvider()
    return MockEmailProvider()
