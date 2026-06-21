"""Platform email administration models (Super Admin configurable)."""

from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.accounts_et_roles.models import TimestampedModel
from apps.notifications.constants import Category


class PlatformEmailSettings(TimestampedModel):
    """Singleton platform-wide email settings."""

    class Language(models.TextChoices):
        FR = 'fr', 'French'
        EN = 'en', 'English'

    platform_email_enabled = models.BooleanField(default=True)
    default_sender_name = models.CharField(max_length=255, default='Digital Talent Center')
    default_sender_email = models.EmailField(default='noreply@talent-center.ma')
    reply_to_email = models.EmailField(blank=True, default='')
    default_language = models.CharField(
        max_length=8,
        choices=Language.choices,
        default=Language.FR,
    )
    rate_limit_email_per_hour = models.PositiveIntegerField(default=20)
    rate_limit_global_per_minute = models.PositiveIntegerField(default=100)
    max_retry_attempts = models.PositiveSmallIntegerField(default=5)
    queue_max_size = models.PositiveIntegerField(default=10000)
    digest_schedule = models.CharField(max_length=64, default='0 8 * * *')
    bounce_handling_enabled = models.BooleanField(default=True)
    unsubscribe_rules_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        verbose_name = 'Platform email settings'
        verbose_name_plural = 'Platform email settings'

    def __str__(self) -> str:
        return 'PlatformEmailSettings'

    @classmethod
    def get_solo(cls) -> PlatformEmailSettings:
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class EmailProviderConfig(TimestampedModel):
    """Active email provider configuration."""

    class Provider(models.TextChoices):
        MOCK = 'mock', 'Mock (development)'
        SENDGRID = 'sendgrid', 'SendGrid'
        SES = 'ses', 'Amazon SES'
        MAILGUN = 'mailgun', 'Mailgun'
        SMTP = 'smtp', 'SMTP'

    class Status(models.TextChoices):
        DISCONNECTED = 'disconnected', 'Disconnected'
        CONNECTED = 'connected', 'Connected'
        CONNECTION_ERROR = 'connection_error', 'Connection error'

    provider = models.CharField(
        max_length=32,
        choices=Provider.choices,
        default=Provider.MOCK,
    )
    api_key = models.CharField(max_length=512, blank=True, default='')
    domain = models.CharField(max_length=255, blank=True, default='')
    region = models.CharField(max_length=64, blank=True, default='')
    endpoint = models.CharField(max_length=512, blank=True, default='')
    smtp_host = models.CharField(max_length=255, blank=True, default='')
    smtp_port = models.PositiveIntegerField(null=True, blank=True)
    smtp_user = models.CharField(max_length=255, blank=True, default='')
    smtp_password = models.CharField(max_length=255, blank=True, default='')
    smtp_use_tls = models.BooleanField(default=True)
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.DISCONNECTED,
    )
    is_active = models.BooleanField(default=True)
    last_validated_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True, default='')

    class Meta(TimestampedModel.Meta):
        verbose_name = 'Email provider config'
        verbose_name_plural = 'Email provider configs'

    def __str__(self) -> str:
        return f'EmailProvider<{self.provider}:{self.status}>'

    @classmethod
    def get_solo(cls) -> EmailProviderConfig:
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class EmailSenderIdentity(TimestampedModel):
    """Sender email identity per module."""

    class Module(models.TextChoices):
        GENERAL = 'general', 'General'
        OFFERS = 'offers', 'Internship offers'
        APPLICATIONS = 'applications', 'Applications'
        DOCUMENTS = 'documents', 'Documents'
        ANNOUNCEMENTS = 'announcements', 'Announcements'
        CHAT = 'chat', 'Chat'
        SRF = 'srf', 'SRF'
        CV_ANALYSIS = 'cv_analysis', 'CV analysis'
        INTERVIEW_SIMULATOR = 'interview_simulator', 'Interview simulator'
        SYSTEM = 'system', 'System'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        PENDING = 'pending', 'Pending verification'
        INACTIVE = 'inactive', 'Inactive'

    display_name = models.CharField(max_length=255)
    email_address = models.EmailField()
    module = models.CharField(max_length=32, choices=Module.choices, db_index=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    is_default = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    class Meta(TimestampedModel.Meta):
        ordering = ['module', 'display_name']
        indexes = [
            models.Index(fields=['module', 'status']),
        ]

    def __str__(self) -> str:
        return f'{self.display_name} <{self.email_address}>'


class EmailCategoryConfig(TimestampedModel):
    """Platform-level notification category toggles."""

    category = models.CharField(max_length=32, choices=Category.choices, unique=True)
    label = models.CharField(max_length=128)
    email_enabled = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)
    digest_enabled = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta(TimestampedModel.Meta):
        ordering = ['sort_order', 'category']
        verbose_name = 'Email category config'
        verbose_name_plural = 'Email category configs'

    def __str__(self) -> str:
        return f'CategoryConfig<{self.category}>'


class EmailSystemAuditLog(models.Model):
    """Audit trail for email system configuration changes."""

    class ChangeType(models.TextChoices):
        GENERAL = 'general', 'General settings'
        PROVIDER = 'provider', 'Provider'
        SENDER = 'sender', 'Sender identity'
        CATEGORY = 'category', 'Category'
        TEMPLATE = 'template', 'Template'
        ADVANCED = 'advanced', 'Advanced settings'

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='email_system_audit_logs',
    )
    changed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    change_type = models.CharField(max_length=16, choices=ChangeType.choices, db_index=True)
    field_name = models.CharField(max_length=128)
    old_value = models.TextField(blank=True, default='')
    new_value = models.TextField(blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['change_type', '-changed_at']),
        ]

    def __str__(self) -> str:
        return f'EmailAudit<{self.change_type}:{self.field_name}>'
