"""
History / Audit Trail — unified cross-app event projection.

Coexistence with domain-specific audit tables:
- accounts_et_roles.{Role,Permission,AccountStatus}ChangeLog,
  authentication.SecurityEvent, profile_intelligence.*ActivityLog
  remain in place. They are FAST PATH per-domain logs queried by
  domain dashboards.
- HistoryEvent here is the SLOW PATH unified projection consumed by
  the global "what happened in the system" view. Both are
  append-only and complementary; no app should query both for the
  same view.

Generic pointers (NOT Django GFK):
- `entity_type` (CharField) + `entity_id` (BigIntegerField) form a
  loose pointer to the source object. We deliberately avoid
  ContentType joins to keep inserts cheap — a single index hit per
  insert. Cross-app reads resolve entities via service helpers.
"""

import uuid

from django.conf import settings
from django.db import models
from django.db.models import UniqueConstraint
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import TimestampedModel


# ============================================================================
# 1. HISTORY EVENT — root append-only audit row
# ============================================================================

class HistoryEvent(models.Model):
    """One row per noteworthy cross-app event."""

    class Severity(models.TextChoices):
        DEBUG = 'DEBUG', _('Debug')
        INFO = 'INFO', _('Info')
        WARNING = 'WARNING', _('Warning')
        ERROR = 'ERROR', _('Error')
        CRITICAL = 'CRITICAL', _('Critical')

    event_code = models.SlugField(max_length=128, db_index=True)
    source_app = models.CharField(max_length=64, db_index=True)
    action_code = models.SlugField(
        max_length=64,
        db_index=True,
        help_text=_('Verb of what happened: CREATE / UPDATE / DELETE / APPROVE / ...'),
    )

    entity_type = models.CharField(max_length=64, blank=True, default='', db_index=True)
    entity_id = models.BigIntegerField(null=True, blank=True, db_index=True)

    actor_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='history_events_authored',
    )
    # Denormalised so the audit record survives user deletion.
    actor_email = models.CharField(max_length=255, blank=True, default='')

    severity = models.CharField(
        max_length=16,
        choices=Severity.choices,
        default=Severity.INFO,
        db_index=True,
    )
    payload_json = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    session_id = models.CharField(max_length=128, blank=True, default='', db_index=True)
    correlation_id = models.UUIDField(
        null=True, blank=True, db_index=True,
        help_text=_('Group multiple events from the same logical operation.'),
    )

    occurred_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-occurred_at']
        indexes = [
            models.Index(fields=['source_app', 'event_code']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['actor_user', '-occurred_at']),
            models.Index(fields=['source_app', '-occurred_at']),
            models.Index(fields=['severity', '-occurred_at']),
            models.Index(fields=['correlation_id', 'occurred_at']),
        ]

    def __str__(self) -> str:
        return f'HistoryEvent<{self.source_app}:{self.event_code} @{self.occurred_at:%Y-%m-%d %H:%M}>'


# ============================================================================
# 2. HISTORY EVENT TARGET — multiple entities per event
# ============================================================================

class HistoryEventTarget(models.Model):
    """
    Additional entities involved in an event beyond the primary subject.

    Example: a "transfer" event has SUBJECT=student, BEFORE=class_A,
    AFTER=class_B — three target rows on one HistoryEvent.
    """

    class TargetRole(models.TextChoices):
        SUBJECT = 'SUBJECT', _('Subject')
        OBJECT = 'OBJECT', _('Object')
        RELATED = 'RELATED', _('Related')
        BEFORE = 'BEFORE', _('Before state')
        AFTER = 'AFTER', _('After state')

    event = models.ForeignKey(
        HistoryEvent,
        on_delete=models.CASCADE,
        related_name='targets',
    )
    target_entity_type = models.CharField(max_length=64, db_index=True)
    target_entity_id = models.BigIntegerField(db_index=True)
    target_role = models.CharField(
        max_length=16,
        choices=TargetRole.choices,
        default=TargetRole.RELATED,
        db_index=True,
    )
    description = models.CharField(max_length=255, blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['event', 'target_role']
        indexes = [
            models.Index(fields=['target_entity_type', 'target_entity_id']),
            models.Index(fields=['event', 'target_role']),
        ]

    def __str__(self) -> str:
        return f'EventTarget<{self.event_id}:{self.target_role} {self.target_entity_type}#{self.target_entity_id}>'


# ============================================================================
# 3. HISTORY METADATA — searchable KV side-data
# ============================================================================

class HistoryMetadata(models.Model):
    """
    Indexed key/value pairs attached to an event.

    Coexists with `HistoryEvent.payload_json` on purpose:
    - payload_json stores the full event body (cheap to write, expensive
      to filter on at query time).
    - HistoryMetadata stores the FEW keys you want to filter or
      group by (e.g. tenant_id, request_id, document_type) with a
      proper index. Service helpers populate both.
    """

    class ValueType(models.TextChoices):
        STRING = 'STRING', _('String')
        INTEGER = 'INTEGER', _('Integer')
        FLOAT = 'FLOAT', _('Float')
        BOOLEAN = 'BOOLEAN', _('Boolean')
        JSON = 'JSON', _('JSON')
        DATE = 'DATE', _('Date')

    event = models.ForeignKey(
        HistoryEvent,
        on_delete=models.CASCADE,
        related_name='metadata_entries',
    )
    key = models.SlugField(max_length=64, db_index=True)
    value = models.TextField(blank=True, default='')
    value_type = models.CharField(
        max_length=16,
        choices=ValueType.choices,
        default=ValueType.STRING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['event', 'key']
        constraints = [
            UniqueConstraint(
                fields=['event', 'key'],
                name='uniq_metadata_key_per_event',
            ),
        ]
        indexes = [
            models.Index(fields=['key', 'value']),
        ]

    def __str__(self) -> str:
        return f'Metadata<{self.event_id}:{self.key}>'


# ============================================================================
# 4. HISTORY EXPORT LOG
# ============================================================================

class HistoryExportLog(TimestampedModel):
    """Audit row for every history-data export (compliance, GDPR…)."""

    class ExportType(models.TextChoices):
        CSV = 'CSV', _('CSV')
        JSON = 'JSON', _('JSON')
        XML = 'XML', _('XML')
        PDF = 'PDF', _('PDF')
        GDPR_REQUEST = 'GDPR_REQUEST', _('GDPR request')

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        RUNNING = 'RUNNING', _('Running')
        COMPLETED = 'COMPLETED', _('Completed')
        FAILED = 'FAILED', _('Failed')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    export_type = models.CharField(
        max_length=16,
        choices=ExportType.choices,
        db_index=True,
    )
    filters_json = models.JSONField(default=dict, blank=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='history_exports',
    )
    record_count = models.PositiveIntegerField(default=0)
    file = models.FileField(upload_to='history/exports/%Y/%m/', null=True, blank=True)
    file_size_bytes = models.BigIntegerField(default=0)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, default='')

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['requested_by', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'Export<{self.export_type} {self.status} {self.record_count} rows>'


# ============================================================================
# 5. HISTORY FILTER SAVED — user-saved searches
# ============================================================================

class HistoryFilterSaved(TimestampedModel):
    """User-saved filter / saved search for the history view."""

    name = models.CharField(max_length=128)
    description = models.CharField(max_length=255, blank=True, default='')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_history_filters',
    )
    filters_json = models.JSONField(default=dict, blank=True)
    is_shared = models.BooleanField(default=False, db_index=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    use_count = models.PositiveIntegerField(default=0)

    class Meta(TimestampedModel.Meta):
        ordering = ['-last_used_at', '-updated_at']
        constraints = [
            UniqueConstraint(
                fields=['owner', 'name'],
                name='uniq_filter_name_per_owner',
            ),
        ]
        indexes = [
            models.Index(fields=['owner', '-last_used_at']),
            models.Index(fields=['is_shared', '-updated_at']),
        ]

    def __str__(self) -> str:
        return f'HistoryFilter<{self.owner_id}:{self.name}>'


# ============================================================================
# 6. HISTORY RETENTION RULE
# ============================================================================

class HistoryRetentionRule(TimestampedModel):
    """
    Declarative rule for purging or anonymising old history.

    A nightly job evaluates all active rules and acts on events older
    than `retention_days`. Empty `entity_type` / `source_app` /
    `event_code` strings mean "any" (broad rule); set them to scope.
    """

    class ActionOnExpiry(models.TextChoices):
        DELETE = 'DELETE', _('Delete')
        ANONYMIZE = 'ANONYMIZE', _('Anonymize')
        ARCHIVE = 'ARCHIVE', _('Archive')

    rule_code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default='')

    # Empty = match any.
    entity_type = models.CharField(max_length=64, blank=True, default='', db_index=True)
    source_app = models.CharField(max_length=64, blank=True, default='', db_index=True)
    event_code = models.CharField(max_length=128, blank=True, default='', db_index=True)

    retention_days = models.PositiveIntegerField()
    action_on_expiry = models.CharField(
        max_length=16,
        choices=ActionOnExpiry.choices,
        default=ActionOnExpiry.DELETE,
    )
    is_active = models.BooleanField(default=True, db_index=True)
    last_run_at = models.DateTimeField(null=True, blank=True)
    next_run_at = models.DateTimeField(null=True, blank=True, db_index=True)
    last_affected_count = models.PositiveIntegerField(default=0)

    class Meta(TimestampedModel.Meta):
        ordering = ['rule_code']
        indexes = [
            models.Index(fields=['is_active', 'next_run_at']),
        ]

    def __str__(self) -> str:
        return f'RetentionRule<{self.rule_code} {self.retention_days}d {self.action_on_expiry}>'
