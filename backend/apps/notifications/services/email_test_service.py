"""Provider validation and test email helpers."""

from __future__ import annotations

from apps.notifications.providers.factory import get_email_provider
from apps.notifications.providers.smtp import SmtpEmailProvider
from apps.notifications.providers.sendgrid import SendGridEmailProvider
from apps.notifications.services.email_config_service import (
    get_provider_config,
    get_sender_identity,
    mark_provider_validated,
)


def validate_provider_connection() -> tuple[bool, str, dict]:
    cfg = get_provider_config()
    provider_name = cfg.provider

    if provider_name == 'mock':
        mark_provider_validated(success=True)
        return True, 'Mock provider ready', {'provider': 'mock'}

    provider = get_email_provider()
    if hasattr(provider, 'validate_connection'):
        result = provider.validate_connection()
        mark_provider_validated(success=result.success, error=result.error)
        if result.success:
            return True, 'Connection validated', result.raw_response or {}
        return False, result.error or 'Validation failed', result.raw_response or {}

    if provider_name == 'sendgrid' and isinstance(provider, SendGridEmailProvider):
        result = provider.validate_connection()
        mark_provider_validated(success=result.success, error=result.error)
        return result.success, result.error or 'OK', result.raw_response or {}

    if provider_name == 'smtp' and isinstance(provider, SmtpEmailProvider):
        result = provider.validate_connection()
        mark_provider_validated(success=result.success, error=result.error)
        return result.success, result.error or 'OK', result.raw_response or {}

    mark_provider_validated(success=False, error=f'Provider {provider_name} validation not implemented')
    return False, f'Validation not available for {provider_name}', {}


def send_test_email(
    *,
    to: str,
    subject: str,
    body_html: str,
    body_text: str = '',
) -> tuple[bool, str, dict]:
    provider = get_email_provider()
    sender = get_sender_identity()
    result = provider.send_email(
        to=to,
        subject=subject,
        body_html=body_html,
        body_text=body_text or subject,
        from_email=sender['email'],
        from_name=sender['name'],
    )
    response = {
        'provider': provider.name,
        'message_id': result.message_id,
        'raw_response': result.raw_response,
    }
    if result.success:
        return True, 'Test email sent', response
    return False, result.error or 'Send failed', response
