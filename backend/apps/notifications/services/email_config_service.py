"""Runtime email configuration — DB first, env fallback."""

from __future__ import annotations

from typing import Any

from django.conf import settings
from django.utils import timezone

from apps.notifications.constants import Category
from apps.notifications.models_email_config import (
    EmailCategoryConfig,
    EmailProviderConfig,
    EmailSenderIdentity,
    EmailSystemAuditLog,
    PlatformEmailSettings,
)

SENSITIVE_FIELDS = frozenset({'api_key', 'smtp_password'})

DEFAULT_SENDERS = [
    ('Digital Talent Center', 'noreply@talent-center.ma', EmailSenderIdentity.Module.GENERAL, True),
    ('Support ESCA', 'support@talent-center.ma', EmailSenderIdentity.Module.SYSTEM, False),
    ('Stages ESCA', 'internships@talent-center.ma', EmailSenderIdentity.Module.OFFERS, False),
    ('Documents ESCA', 'documents@talent-center.ma', EmailSenderIdentity.Module.DOCUMENTS, False),
    ('Finance SRF', 'finance@talent-center.ma', EmailSenderIdentity.Module.SRF, False),
]

CATEGORY_LABELS = {
    Category.OFFERS: 'Internship offers',
    Category.APPLICATIONS: 'Applications',
    Category.DOCUMENTS: 'Documents',
    Category.ANNOUNCEMENTS: 'Announcements',
    Category.CHAT: 'Chat',
    Category.SRF: 'SRF',
    Category.CV_ANALYSIS: 'CV analysis',
    Category.INTERVIEW_SIMULATOR: 'Interview simulator',
    Category.SYSTEM: 'System notifications',
    Category.SUPERVISION: 'Supervision',
}


def mask_secret(value: str, visible: int = 4) -> str:
    if not value:
        return ''
    if len(value) <= visible:
        return '*' * len(value)
    return f"{'*' * (len(value) - visible)}{value[-visible:]}"


def get_platform_settings() -> PlatformEmailSettings:
    obj = PlatformEmailSettings.get_solo()
    if obj.default_sender_name == 'Digital Talent Center' and not obj.default_sender_email:
        obj.default_sender_email = getattr(settings, 'SENDGRID_FROM_EMAIL', settings.DEFAULT_FROM_EMAIL)
    return obj


def is_platform_email_enabled() -> bool:
    platform = get_platform_settings()
    if not platform.platform_email_enabled:
        return False
    return getattr(settings, 'NOTIFICATIONS_EMAIL_ENABLED', True)


def get_default_language() -> str:
    return get_platform_settings().default_language or getattr(
        settings, 'NOTIFICATION_DEFAULT_LANGUAGE', 'en',
    )


def get_rate_limits() -> tuple[int, int]:
    platform = get_platform_settings()
    email_limit = platform.rate_limit_email_per_hour or getattr(
        settings, 'NOTIFICATION_RATE_LIMIT_EMAIL_PER_HOUR', 20,
    )
    global_limit = platform.rate_limit_global_per_minute or getattr(
        settings, 'NOTIFICATION_RATE_LIMIT_GLOBAL_PER_MINUTE', 100,
    )
    return email_limit, global_limit


def get_provider_config() -> EmailProviderConfig:
    return EmailProviderConfig.get_solo()


def get_active_provider_name() -> str:
    cfg = get_provider_config()
    if cfg.is_active and cfg.provider:
        return cfg.provider.lower()
    return getattr(settings, 'NOTIFICATION_EMAIL_PROVIDER', 'mock').lower()


def get_provider_credentials() -> dict[str, Any]:
    cfg = get_provider_config()
    provider_name = get_active_provider_name()
    env_api_key = ''
    if provider_name == 'brevo':
        env_api_key = getattr(settings, 'BREVO_API_KEY', '') or getattr(settings, 'SENDGRID_API_KEY', '')
    elif provider_name == 'sendgrid':
        env_api_key = getattr(settings, 'SENDGRID_API_KEY', '')
    else:
        env_api_key = getattr(settings, 'BREVO_API_KEY', '') or getattr(settings, 'SENDGRID_API_KEY', '')
    return {
        'provider': provider_name,
        'api_key': cfg.api_key or env_api_key,
        'domain': cfg.domain,
        'region': cfg.region,
        'endpoint': cfg.endpoint,
        'smtp_host': cfg.smtp_host or getattr(settings, 'EMAIL_HOST', ''),
        'smtp_port': cfg.smtp_port or getattr(settings, 'EMAIL_PORT', 587),
        'smtp_user': cfg.smtp_user or getattr(settings, 'EMAIL_HOST_USER', ''),
        'smtp_password': cfg.smtp_password or getattr(settings, 'EMAIL_HOST_PASSWORD', ''),
        'smtp_use_tls': cfg.smtp_use_tls,
        'status': cfg.status,
    }


def get_sender_identity(*, module: str | None = None, category: str | None = None) -> dict[str, str]:
    module_key = module or _category_to_module(category)
    identity = (
        EmailSenderIdentity.objects
        .filter(module=module_key, status=EmailSenderIdentity.Status.ACTIVE)
        .order_by('-is_default', 'id')
        .first()
    )
    if identity:
        return {
            'email': identity.email_address,
            'name': identity.display_name,
        }
    default_identity = EmailSenderIdentity.objects.filter(is_default=True).first()
    if default_identity:
        return {
            'email': default_identity.email_address,
            'name': default_identity.display_name,
        }
    platform = get_platform_settings()
    return {
        'email': platform.default_sender_email or getattr(
            settings, 'SENDGRID_FROM_EMAIL', settings.DEFAULT_FROM_EMAIL,
        ),
        'name': platform.default_sender_name or getattr(
            settings, 'SENDGRID_FROM_NAME', 'Digital Talent Center',
        ),
    }


def get_reply_to_email() -> str:
    platform = get_platform_settings()
    return platform.reply_to_email or platform.default_sender_email


def is_category_channel_enabled(category: str, channel: str) -> bool:
    cfg = EmailCategoryConfig.objects.filter(category=category).first()
    if not cfg:
        return True
    if channel == 'EMAIL':
        return cfg.email_enabled
    if channel == 'IN_APP':
        return cfg.in_app_enabled
    return True


def is_category_digest_enabled(category: str) -> bool:
    cfg = EmailCategoryConfig.objects.filter(category=category).first()
    if not cfg:
        return getattr(settings, 'NOTIFICATIONS_DIGEST_ENABLED', True)
    return cfg.digest_enabled


def log_email_audit(
    *,
    user,
    change_type: str,
    field_name: str,
    old_value: str = '',
    new_value: str = '',
    metadata: dict | None = None,
) -> None:
    old_display = mask_secret(old_value) if field_name in SENSITIVE_FIELDS else old_value
    new_display = mask_secret(new_value) if field_name in SENSITIVE_FIELDS else new_value
    EmailSystemAuditLog.objects.create(
        changed_by=user if user and user.is_authenticated else None,
        change_type=change_type,
        field_name=field_name,
        old_value=old_display[:2000],
        new_value=new_display[:2000],
        metadata_json=metadata or {},
    )


def track_field_changes(
    *,
    user,
    instance,
    validated_data: dict,
    change_type: str,
    sensitive_fields: frozenset[str] | None = None,
) -> None:
    sensitive = sensitive_fields or SENSITIVE_FIELDS
    for field, new_val in validated_data.items():
        old_val = getattr(instance, field)
        if field in sensitive and new_val and old_val and new_val == old_val:
            continue
        old_str = '' if old_val is None else str(old_val)
        new_str = '' if new_val is None else str(new_val)
        if old_str != new_str:
            log_email_audit(
                user=user,
                change_type=change_type,
                field_name=field,
                old_value=old_str,
                new_value=new_str,
            )


def seed_email_system_defaults() -> None:
    platform = PlatformEmailSettings.get_solo()
    if not platform.default_sender_email:
        platform.default_sender_email = getattr(
            settings, 'SENDGRID_FROM_EMAIL', 'noreply@talent-center.ma',
        )
        platform.default_sender_name = getattr(settings, 'SENDGRID_FROM_NAME', 'Digital Talent Center')
        platform.save()

    provider = EmailProviderConfig.get_solo()
    env_provider = getattr(settings, 'NOTIFICATION_EMAIL_PROVIDER', 'mock').lower()
    if provider.provider == EmailProviderConfig.Provider.MOCK and env_provider != 'mock':
        provider.provider = env_provider
    if not provider.api_key:
        provider.api_key = getattr(settings, 'SENDGRID_API_KEY', '')
    if provider.api_key or provider.provider == EmailProviderConfig.Provider.MOCK:
        provider.status = EmailProviderConfig.Status.CONNECTED
    provider.save()

    for sort_order, (cat, _) in enumerate(Category.choices):
        EmailCategoryConfig.objects.get_or_create(
            category=cat,
            defaults={
                'label': CATEGORY_LABELS.get(cat, cat.replace('_', ' ').title()),
                'sort_order': sort_order,
            },
        )

    if not EmailSenderIdentity.objects.exists():
        for display_name, email, module, is_default in DEFAULT_SENDERS:
            EmailSenderIdentity.objects.create(
                display_name=display_name,
                email_address=email,
                module=module,
                is_default=is_default,
                is_verified=True,
                status=EmailSenderIdentity.Status.ACTIVE,
            )


def _category_to_module(category: str | None) -> str:
    mapping = {
        Category.OFFERS: EmailSenderIdentity.Module.OFFERS,
        Category.APPLICATIONS: EmailSenderIdentity.Module.APPLICATIONS,
        Category.DOCUMENTS: EmailSenderIdentity.Module.DOCUMENTS,
        Category.ANNOUNCEMENTS: EmailSenderIdentity.Module.ANNOUNCEMENTS,
        Category.CHAT: EmailSenderIdentity.Module.CHAT,
        Category.SRF: EmailSenderIdentity.Module.SRF,
        Category.CV_ANALYSIS: EmailSenderIdentity.Module.CV_ANALYSIS,
        Category.INTERVIEW_SIMULATOR: EmailSenderIdentity.Module.INTERVIEW_SIMULATOR,
        Category.SYSTEM: EmailSenderIdentity.Module.SYSTEM,
        Category.SUPERVISION: EmailSenderIdentity.Module.SYSTEM,
    }
    if not category:
        return EmailSenderIdentity.Module.GENERAL
    return mapping.get(category, EmailSenderIdentity.Module.GENERAL)


def mark_provider_validated(*, success: bool, error: str = '') -> EmailProviderConfig:
    cfg = get_provider_config()
    cfg.last_validated_at = timezone.now()
    if success:
        cfg.status = EmailProviderConfig.Status.CONNECTED
        cfg.last_error = ''
    else:
        cfg.status = EmailProviderConfig.Status.CONNECTION_ERROR
        cfg.last_error = error[:2000]
    cfg.save()
    return cfg
