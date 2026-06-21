"""
Notifications domain models.

Pipeline:
- Producers (any app) raise a NotificationEvent describing what happened.
- NotificationEngine expands it into NotificationRecipient rows per (user, channel).
- Channel handlers deliver asynchronously via the queue worker.
"""

from django.conf import settings
from django.db import models
from django.db.models import UniqueConstraint
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import TimestampedModel
from apps.notifications.constants import Category, EventStatus, Priority


class NotificationEvent(models.Model):
    """Append-only record of a triggering event in the system."""

    event_code = models.SlugField(max_length=128, db_index=True)
    source_app = models.CharField(max_length=64, db_index=True)
    entity_type = models.CharField(max_length=64, blank=True, default='', db_index=True)
    entity_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    payload_json = models.JSONField(default=dict, blank=True)
    triggered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='triggered_notification_events',
    )
    triggered_at = models.DateTimeField(auto_now_add=True, db_index=True)
    idempotency_key = models.CharField(max_length=128, null=True, blank=True, unique=True)
    priority = models.CharField(
        max_length=16,
        choices=Priority.choices,
        default=Priority.NORMAL,
        db_index=True,
    )
    status = models.CharField(
        max_length=16,
        choices=EventStatus.choices,
        default=EventStatus.RECEIVED,
        db_index=True,
    )
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-triggered_at']
        indexes = [
            models.Index(fields=['source_app', 'event_code']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['event_code', '-triggered_at']),
            models.Index(fields=['status', '-triggered_at']),
        ]

    def __str__(self) -> str:
        return f'NotifEvent<{self.source_app}:{self.event_code}>'


class NotificationRecipient(TimestampedModel):
    """One delivery attempt per (event, user, channel)."""

    class Channel(models.TextChoices):
        IN_APP = 'IN_APP', _('In-app')
        EMAIL = 'EMAIL', _('Email')
        SMS = 'SMS', _('SMS')
        PUSH = 'PUSH', _('Push notification')

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        QUEUED = 'QUEUED', _('Queued')
        PROCESSING = 'PROCESSING', _('Processing')
        SENT = 'SENT', _('Sent')
        DELIVERED = 'DELIVERED', _('Delivered')
        OPENED = 'OPENED', _('Opened')
        CLICKED = 'CLICKED', _('Clicked')
        FAILED = 'FAILED', _('Failed')
        RETRY_SCHEDULED = 'RETRY_SCHEDULED', _('Retry scheduled')
        CANCELLED = 'CANCELLED', _('Cancelled')
        SUPPRESSED = 'SUPPRESSED', _('Suppressed')
        BOUNCED = 'BOUNCED', _('Bounced')

    event = models.ForeignKey(
        NotificationEvent,
        on_delete=models.CASCADE,
        related_name='recipients',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_deliveries',
    )
    delivery_channel = models.CharField(max_length=16, choices=Channel.choices, db_index=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    template_code = models.CharField(max_length=128, blank=True, default='')
    language = models.CharField(max_length=8, blank=True, default='en')
    provider = models.CharField(max_length=64, blank=True, default='')
    provider_message_id = models.CharField(max_length=255, blank=True, default='')
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    next_retry_at = models.DateTimeField(null=True, blank=True, db_index=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    last_error = models.TextField(blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)
    digest_batch = models.ForeignKey(
        'NotificationDigestBatch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recipients',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        constraints = [
            UniqueConstraint(
                fields=['event', 'user', 'delivery_channel'],
                name='uniq_recipient_per_event_user_channel',
            ),
        ]
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['status', 'next_retry_at']),
        ]

    def __str__(self) -> str:
        return f'Recipient<{self.event_id}:{self.user_id}:{self.delivery_channel}>'


class Notification(TimestampedModel):
    """In-app notification visible in the user's feed."""

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    event = models.ForeignKey(
        NotificationEvent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='in_app_notifications',
    )
    notification_type = models.SlugField(max_length=128, db_index=True)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=64, blank=True, default='')
    action_url = models.CharField(max_length=512, blank=True, default='')
    payload_json = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    is_archived = models.BooleanField(default=False, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['notification_type', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'Notification<{self.recipient_id}:{self.notification_type}>'


class NotificationPreference(TimestampedModel):
    """Per-user opt-in/out per (category, channel)."""

    class Frequency(models.TextChoices):
        REALTIME = 'REALTIME', _('Realtime')
        DAILY_DIGEST = 'DAILY_DIGEST', _('Daily digest')
        WEEKLY_DIGEST = 'WEEKLY_DIGEST', _('Weekly digest')
        MONTHLY_DIGEST = 'MONTHLY_DIGEST', _('Monthly digest')
        NEVER = 'NEVER', _('Never')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
    )
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.SYSTEM,
        db_index=True,
    )
    notification_type = models.SlugField(max_length=128, blank=True, default='', db_index=True)
    channel = models.CharField(
        max_length=16,
        choices=NotificationRecipient.Channel.choices,
        db_index=True,
    )
    is_enabled = models.BooleanField(default=True)
    frequency = models.CharField(
        max_length=16,
        choices=Frequency.choices,
        default=Frequency.REALTIME,
    )

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['user', 'category', 'channel'],
                name='uniq_preference_per_user_category_channel',
            ),
        ]
        indexes = [
            models.Index(fields=['user', 'is_enabled']),
        ]

    def __str__(self) -> str:
        return f'NotifPref<{self.user_id}:{self.category}:{self.channel}>'


class NotificationReminder(TimestampedModel):
    """Deferred follow-up ping for an existing notification."""

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        SENT = 'SENT', _('Sent')
        CANCELLED = 'CANCELLED', _('Cancelled')

    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='reminders',
    )
    remind_at = models.DateTimeField(db_index=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True,
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['remind_at']
        indexes = [
            models.Index(fields=['status', 'remind_at']),
            models.Index(fields=['notification', 'status']),
        ]

    def __str__(self) -> str:
        return f'Reminder<{self.notification_id} {self.remind_at:%Y-%m-%d %H:%M}>'


class NotificationTemplate(TimestampedModel):
    """Template metadata — content lives in DB translations + HTML files."""

    code = models.SlugField(max_length=128, unique=True)
    channel = models.CharField(max_length=16, choices=NotificationRecipient.Channel.choices)
    category = models.CharField(max_length=32, choices=Category.choices, db_index=True)
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    html_file = models.CharField(max_length=255, blank=True, default='')
    default_action_url = models.CharField(max_length=512, blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['code']

    def __str__(self) -> str:
        return f'Template<{self.code}:{self.channel}>'


class NotificationTemplateTranslation(TimestampedModel):
    """Localized template content."""

    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.CASCADE,
        related_name='translations',
    )
    language = models.CharField(max_length=8, db_index=True)
    subject_template = models.TextField()
    body_html_template = models.TextField(blank=True, default='')
    body_text_template = models.TextField(blank=True, default='')
    in_app_title_template = models.TextField(blank=True, default='')
    in_app_body_template = models.TextField(blank=True, default='')

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(fields=['template', 'language'], name='uniq_template_language'),
        ]

    def __str__(self) -> str:
        return f'Translation<{self.template.code}:{self.language}>'


class NotificationDeliveryLog(models.Model):
    """Immutable audit trail per delivery attempt."""

    recipient = models.ForeignKey(
        NotificationRecipient,
        on_delete=models.CASCADE,
        related_name='delivery_logs',
    )
    event = models.ForeignKey(
        NotificationEvent,
        on_delete=models.CASCADE,
        related_name='delivery_logs',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_delivery_logs',
    )
    channel = models.CharField(max_length=16)
    template_code = models.CharField(max_length=128, blank=True, default='')
    provider = models.CharField(max_length=64, blank=True, default='')
    status = models.CharField(max_length=16)
    attempt_number = models.PositiveSmallIntegerField(default=1)
    error_message = models.TextField(blank=True, default='')
    provider_response_json = models.JSONField(default=dict, blank=True)
    latency_ms = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['channel', 'status', '-created_at']),
            models.Index(fields=['template_code', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'DeliveryLog<{self.recipient_id}:{self.status}>'


class NotificationDigestBatch(TimestampedModel):
    """Aggregated digest delivery batch."""

    class Frequency(models.TextChoices):
        DAILY = 'DAILY', _('Daily')
        WEEKLY = 'WEEKLY', _('Weekly')
        MONTHLY = 'MONTHLY', _('Monthly')

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        SENT = 'SENT', _('Sent')
        FAILED = 'FAILED', _('Failed')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_digest_batches',
    )
    frequency = models.CharField(max_length=16, choices=Frequency.choices)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    summary_json = models.JSONField(default=dict, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-period_end']
        indexes = [
            models.Index(fields=['user', 'frequency', '-period_end']),
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'Digest<{self.user_id}:{self.frequency}>'


class NotificationEventDedup(models.Model):
    """Idempotency guard for event emission."""

    idempotency_key = models.CharField(max_length=128, unique=True, db_index=True)
    event = models.ForeignKey(
        NotificationEvent,
        on_delete=models.CASCADE,
        related_name='dedup_records',
    )
    expires_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f'Dedup<{self.idempotency_key}>'


class NotificationRateLimit(TimestampedModel):
    """Rate limiting counters."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notification_rate_limits',
    )
    channel = models.CharField(max_length=16)
    template_code = models.CharField(max_length=128, blank=True, default='')
    window_start = models.DateTimeField(db_index=True)
    count = models.PositiveIntegerField(default=0)
    limit_value = models.PositiveIntegerField(default=20)

    class Meta(TimestampedModel.Meta):
        indexes = [
            models.Index(fields=['user', 'channel', 'window_start']),
            models.Index(fields=['channel', 'template_code', 'window_start']),
        ]

    def __str__(self) -> str:
        return f'RateLimit<{self.user_id}:{self.channel}:{self.count}>'


class NotificationProviderHealth(TimestampedModel):
    """Provider health monitoring."""

    provider = models.CharField(max_length=64, db_index=True)
    channel = models.CharField(max_length=16)
    last_success_at = models.DateTimeField(null=True, blank=True)
    last_failure_at = models.DateTimeField(null=True, blank=True)
    consecutive_failures = models.PositiveIntegerField(default=0)
    is_healthy = models.BooleanField(default=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(fields=['provider', 'channel'], name='uniq_provider_channel_health'),
        ]

    def __str__(self) -> str:
        return f'ProviderHealth<{self.provider}:{self.channel}>'
