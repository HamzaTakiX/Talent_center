"""
Notifications domain models.

Pipeline:
- Producers (any app) raise a NotificationEvent describing what happened.
- A fan-out service expands it into NotificationRecipient rows, one per
  (user, channel) target.
- For in-app delivery, a Notification row is also created so the user
  has a stable, queryable feed.
- NotificationPreference governs per-user opt-in/out per channel.
- NotificationReminder schedules deferred re-pings for the same
  notification (e.g. payment due in 3 days, again 1 day before).
"""

from django.conf import settings
from django.db import models
from django.db.models import UniqueConstraint
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import TimestampedModel


# ============================================================================
# 1. NOTIFICATION EVENT — abstract trigger
# ============================================================================

class NotificationEvent(models.Model):
    """
    Append-only record of a triggering event in the system.

    `entity_type` + `entity_id` form a generic pointer back to the
    source object (no Django GFK — we keep inserts cheap and avoid
    contenttype joins on the hot path).
    """

    event_code = models.SlugField(max_length=128, db_index=True)
    source_app = models.CharField(max_length=64, db_index=True)
    entity_type = models.CharField(max_length=64, blank=True, default='', db_index=True)
    entity_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    payload_json = models.JSONField(default=dict, blank=True)
    triggered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='triggered_notification_events',
    )
    triggered_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-triggered_at']
        indexes = [
            models.Index(fields=['source_app', 'event_code']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['event_code', '-triggered_at']),
        ]

    def __str__(self) -> str:
        return f'NotifEvent<{self.source_app}:{self.event_code}>'


# ============================================================================
# 2. NOTIFICATION RECIPIENT — fan-out per (user, channel)
# ============================================================================

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
        SENT = 'SENT', _('Sent')
        FAILED = 'FAILED', _('Failed')
        SUPPRESSED = 'SUPPRESSED', _('Suppressed')

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
    delivery_channel = models.CharField(
        max_length=16,
        choices=Channel.choices,
        db_index=True,
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    last_error = models.TextField(blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)

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
        ]

    def __str__(self) -> str:
        return f'Recipient<{self.event_id}:{self.user_id}:{self.delivery_channel}>'


# ============================================================================
# 3. NOTIFICATION — user-facing in-app record
# ============================================================================

class Notification(TimestampedModel):
    """
    In-app notification visible in the user's feed.

    Lives independently from NotificationRecipient: a NotificationRecipient
    row tracks one delivery channel attempt; Notification is the persistent
    UX object. They're linked by `event` + `recipient`.
    """

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    event = models.ForeignKey(
        NotificationEvent,
        on_delete=models.SET_NULL,
        null=True, blank=True,
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


# ============================================================================
# 4. NOTIFICATION PREFERENCE
# ============================================================================

class NotificationPreference(TimestampedModel):
    """Per-user opt-in/out per (notification_type, channel)."""

    class Frequency(models.TextChoices):
        REALTIME = 'REALTIME', _('Realtime')
        DAILY_DIGEST = 'DAILY_DIGEST', _('Daily digest')
        WEEKLY_DIGEST = 'WEEKLY_DIGEST', _('Weekly digest')
        NEVER = 'NEVER', _('Never')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
    )
    notification_type = models.SlugField(max_length=128, db_index=True)
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
                fields=['user', 'notification_type', 'channel'],
                name='uniq_preference_per_user_type_channel',
            ),
        ]
        indexes = [
            models.Index(fields=['user', 'is_enabled']),
        ]

    def __str__(self) -> str:
        return f'NotifPref<{self.user_id}:{self.notification_type}:{self.channel}>'


# ============================================================================
# 5. NOTIFICATION REMINDER
# ============================================================================

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
