"""
SRF Financial Import Center — batches, audit trail, mapping profiles, rollback snapshots.
"""

from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import TimestampedModel


class FinancialImportBatch(TimestampedModel):
    """A single financial data import job (upload → preview → apply)."""

    class Status(models.TextChoices):
        UPLOADED = 'UPLOADED', _('Uploaded')
        MAPPING = 'MAPPING', _('Mapping')
        VALIDATING = 'VALIDATING', _('Validating')
        PREVIEW_READY = 'PREVIEW_READY', _('Preview ready')
        QUEUED = 'QUEUED', _('Queued')
        PROCESSING = 'PROCESSING', _('Processing')
        COMPLETED = 'COMPLETED', _('Completed')
        PARTIAL = 'PARTIAL', _('Partial')
        FAILED = 'FAILED', _('Failed')
        ROLLED_BACK = 'ROLLED_BACK', _('Rolled back')
        CANCELLED = 'CANCELLED', _('Cancelled')

    class ImportMode(models.TextChoices):
        CREATE_ONLY = 'CREATE_ONLY', _('Create only')
        UPDATE = 'UPDATE', _('Update existing')
        MERGE = 'MERGE', _('Merge')
        DRY_RUN = 'DRY_RUN', _('Dry run / test')

    class FileFormat(models.TextChoices):
        CSV = 'CSV', _('CSV')
        XLSX = 'XLSX', _('Excel')
        JSON = 'JSON', _('JSON')
        OTHER = 'OTHER', _('Other')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.UPLOADED,
        db_index=True,
    )
    import_mode = models.CharField(
        max_length=16,
        choices=ImportMode.choices,
        default=ImportMode.MERGE,
        db_index=True,
    )
    file_format = models.CharField(max_length=8, choices=FileFormat.choices, default=FileFormat.CSV)
    source_filename = models.CharField(max_length=255, blank=True, default='')
    stored_file = models.FileField(
        upload_to='srf/imports/inbox/%Y/%m/',
        null=True,
        blank=True,
    )
    file_size_bytes = models.PositiveIntegerField(default=0)
    file_checksum_sha256 = models.CharField(max_length=64, blank=True, default='')
    academic_year = models.CharField(max_length=16, blank=True, default='', db_index=True)

    total_rows = models.PositiveIntegerField(default=0)
    valid_rows = models.PositiveIntegerField(default=0)
    error_rows = models.PositiveIntegerField(default=0)
    warning_rows = models.PositiveIntegerField(default=0)
    success_rows = models.PositiveIntegerField(default=0)
    skipped_rows = models.PositiveIntegerField(default=0)
    affected_students = models.PositiveIntegerField(default=0)

    column_mapping_json = models.JSONField(default=dict, blank=True)
    preview_json = models.JSONField(default=dict, blank=True)
    validation_json = models.JSONField(default=dict, blank=True)
    errors_json = models.JSONField(default=list, blank=True)
    progress_percent = models.PositiveSmallIntegerField(default=0)
    progress_message = models.CharField(max_length=255, blank=True, default='')

    started_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='srf_import_batches',
    )
    started_at = models.DateTimeField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    client_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True, default='')
    session_key = models.CharField(max_length=64, blank=True, default='')

    rolled_back_at = models.DateTimeField(null=True, blank=True)
    rolled_back_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='srf_import_rollbacks',
    )
    parent_batch = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='retries',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['started_by', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'FinancialImportBatch<{self.uuid} {self.status}>'


class FinancialImportAuditEvent(models.Model):
    """Immutable audit event for financial imports."""

    class Action(models.TextChoices):
        UPLOAD = 'UPLOAD', _('Upload')
        VALIDATE = 'VALIDATE', _('Validate')
        PREVIEW = 'PREVIEW', _('Preview')
        EXECUTE = 'EXECUTE', _('Execute')
        PROGRESS = 'PROGRESS', _('Progress')
        COMPLETE = 'COMPLETE', _('Complete')
        FAIL = 'FAIL', _('Fail')
        ROLLBACK = 'ROLLBACK', _('Rollback')
        RETRY = 'RETRY', _('Retry')
        DELETE_FILE = 'DELETE_FILE', _('Delete file')
        SECURITY_REJECT = 'SECURITY_REJECT', _('Security reject')

    batch = models.ForeignKey(
        FinancialImportBatch,
        on_delete=models.CASCADE,
        related_name='audit_events',
    )
    action = models.CharField(max_length=24, choices=Action.choices, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True, default='')
    message = models.TextField(blank=True, default='')
    payload_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['created_at']
        indexes = [models.Index(fields=['batch', 'created_at'])]

    def __str__(self) -> str:
        return f'ImportAudit<{self.batch_id} {self.action}>'


class FinancialImportMappingProfile(TimestampedModel):
    """Reusable column mapping template."""

    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default='')
    source_system = models.CharField(
        max_length=64,
        blank=True,
        default='',
        help_text=_('e.g. sage, sap, custom_erp'),
    )
    column_mapping_json = models.JSONField(default=dict)
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='srf_import_profiles',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['name']

    def __str__(self) -> str:
        return f'ImportProfile<{self.name}>'


class FinancialImportSnapshot(models.Model):
    """Per-account state before import — used for rollback."""

    batch = models.ForeignKey(
        FinancialImportBatch,
        on_delete=models.CASCADE,
        related_name='snapshots',
    )
    account = models.ForeignKey(
        'srf.FinancialAccount',
        on_delete=models.CASCADE,
        related_name='import_snapshots',
    )
    student_profile_id = models.PositiveIntegerField(db_index=True)
    before_state_json = models.JSONField(default=dict)
    after_state_json = models.JSONField(default=dict, blank=True)
    row_number = models.PositiveIntegerField(default=0)
    applied = models.BooleanField(default=False)
    rolled_back = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['batch', 'applied']),
            models.Index(fields=['account', 'batch']),
        ]

    def __str__(self) -> str:
        return f'ImportSnapshot<{self.batch_id} account={self.account_id}>'
