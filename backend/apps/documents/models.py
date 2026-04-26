"""
Documents Administration domain models.

Owns: document taxonomy, templates, request workflow, generated outputs,
and administrative resources / reservations.
"""

import uuid

from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint, F, Q, UniqueConstraint
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import StudentProfile, TimestampedModel


# ============================================================================
# 1. DOCUMENT TYPE
# ============================================================================

class DocumentType(TimestampedModel):
    """Catalog of document kinds the system can issue or accept."""

    class Category(models.TextChoices):
        ATTESTATION = 'ATTESTATION', _('Attestation')
        CONVENTION = 'CONVENTION', _('Convention')
        CERTIFICATE = 'CERTIFICATE', _('Certificate')
        AUTHORIZATION = 'AUTHORIZATION', _('Authorization')
        REPORT = 'REPORT', _('Report')
        OTHER = 'OTHER', _('Other')

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default='')
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.OTHER,
        db_index=True,
    )
    is_active = models.BooleanField(default=True, db_index=True)
    requires_workflow = models.BooleanField(
        default=True,
        help_text=_('If false, requests are auto-approved.'),
    )
    default_validity_days = models.PositiveIntegerField(null=True, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['code']

    def __str__(self) -> str:
        return f'DocumentType<{self.code}>'


# ============================================================================
# 2. DOCUMENT TYPE RULES
# ============================================================================

class DocumentTypeRule(TimestampedModel):
    """
    Eligibility / validation rule attached to a DocumentType.
    Encoded as a JSON DSL the workflow engine evaluates.
    """

    document_type = models.ForeignKey(
        DocumentType,
        on_delete=models.CASCADE,
        related_name='rules',
    )
    rule_code = models.SlugField(max_length=64)
    rule_definition_json = models.JSONField(default=dict, blank=True)
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['document_type', 'rule_code'],
                name='uniq_rule_per_document_type',
            ),
        ]
        indexes = [
            models.Index(fields=['document_type', 'is_active']),
        ]

    def __str__(self) -> str:
        return f'DocumentTypeRule<{self.document_type_id}:{self.rule_code}>'


# ============================================================================
# 3. DOCUMENT TEMPLATE
# ============================================================================

class DocumentTemplate(TimestampedModel):
    """Reusable template (DOCX/HTML) for generating outputs of a DocumentType."""

    document_type = models.ForeignKey(
        DocumentType,
        on_delete=models.CASCADE,
        related_name='templates',
    )
    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default='')
    language = models.CharField(max_length=8, default='fr', db_index=True)
    file_template = models.FileField(upload_to='documents/templates/')
    placeholders_json = models.JSONField(default=list, blank=True)
    layout_schema = models.JSONField(default=dict, blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['document_type', 'language', '-is_default']
        constraints = [
            UniqueConstraint(
                fields=['document_type', 'language'],
                condition=Q(is_default=True),
                name='uniq_default_template_per_type_lang',
            ),
        ]
        indexes = [
            models.Index(fields=['document_type', 'language']),
        ]

    def __str__(self) -> str:
        return f'DocumentTemplate<{self.code}>'


# ============================================================================
# 4. DOCUMENT REQUEST — workflow root
# ============================================================================

class DocumentRequest(TimestampedModel):
    """A request to issue a document of a given type."""

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        SUBMITTED = 'SUBMITTED', _('Submitted')
        IN_REVIEW = 'IN_REVIEW', _('In review')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
        FULFILLED = 'FULFILLED', _('Fulfilled')
        CANCELLED = 'CANCELLED', _('Cancelled')

    class Priority(models.TextChoices):
        LOW = 'LOW', _('Low')
        NORMAL = 'NORMAL', _('Normal')
        HIGH = 'HIGH', _('High')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    document_type = models.ForeignKey(
        DocumentType,
        on_delete=models.PROTECT,
        related_name='requests',
    )
    template = models.ForeignKey(
        DocumentTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requests',
    )

    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='requested_documents',
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='target_document_requests',
        help_text=_('User the document is about (often = requester, may differ for staff-on-behalf).'),
    )
    target_student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='document_requests',
    )

    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    priority = models.CharField(
        max_length=16,
        choices=Priority.choices,
        default=Priority.NORMAL,
    )
    reason = models.TextField(blank=True, default='')

    submitted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_document_requests',
    )
    rejection_reason = models.TextField(blank=True, default='')
    fulfilled_at = models.DateTimeField(null=True, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['requested_by', '-created_at']),
            models.Index(fields=['target_user', '-created_at']),
            models.Index(fields=['document_type', 'status']),
        ]

    def __str__(self) -> str:
        return f'DocumentRequest<{self.document_type_id} {self.status}>'


# ============================================================================
# 5. DOCUMENT REQUEST FIELDS
# ============================================================================

class DocumentRequestField(TimestampedModel):
    """Submitted form field captured from the requester."""

    class FieldType(models.TextChoices):
        TEXT = 'TEXT', _('Text')
        NUMBER = 'NUMBER', _('Number')
        DATE = 'DATE', _('Date')
        BOOLEAN = 'BOOLEAN', _('Boolean')
        FILE = 'FILE', _('File')
        JSON = 'JSON', _('JSON')

    document_request = models.ForeignKey(
        DocumentRequest,
        on_delete=models.CASCADE,
        related_name='fields',
    )
    field_name = models.SlugField(max_length=128)
    field_label = models.CharField(max_length=255, blank=True, default='')
    field_type = models.CharField(
        max_length=16,
        choices=FieldType.choices,
        default=FieldType.TEXT,
    )
    field_value_json = models.JSONField(default=dict, blank=True)
    is_validated = models.BooleanField(default=False)
    validation_errors_json = models.JSONField(default=list, blank=True)

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['document_request', 'field_name'],
                name='uniq_field_per_request',
            ),
        ]

    def __str__(self) -> str:
        return f'RequestField<{self.document_request_id}:{self.field_name}>'


# ============================================================================
# 6. DOCUMENT ATTACHMENT
# ============================================================================

class DocumentAttachment(TimestampedModel):
    """File attached to a document request (supporting docs, signed copies…)."""

    class AttachmentType(models.TextChoices):
        SUPPORTING = 'SUPPORTING', _('Supporting document')
        VALIDATION = 'VALIDATION', _('Validation document')
        GENERATED = 'GENERATED', _('Generated output')
        OTHER = 'OTHER', _('Other')

    document_request = models.ForeignKey(
        DocumentRequest,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    file = models.FileField(upload_to='documents/attachments/%Y/%m/')
    original_filename = models.CharField(max_length=255, blank=True, default='')
    file_size_bytes = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=128, blank=True, default='')
    attachment_type = models.CharField(
        max_length=16,
        choices=AttachmentType.choices,
        default=AttachmentType.SUPPORTING,
        db_index=True,
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['document_request', 'attachment_type']),
        ]

    def __str__(self) -> str:
        return f'DocumentAttachment<{self.document_request_id} {self.attachment_type}>'


# ============================================================================
# 7. DOCUMENT WORKFLOW — step transitions log
# ============================================================================

class DocumentWorkflow(TimestampedModel):
    """Append-only workflow step entry for a document request."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        IN_PROGRESS = 'IN_PROGRESS', _('In progress')
        COMPLETED = 'COMPLETED', _('Completed')
        SKIPPED = 'SKIPPED', _('Skipped')
        FAILED = 'FAILED', _('Failed')

    class Decision(models.TextChoices):
        APPROVE = 'APPROVE', _('Approve')
        REJECT = 'REJECT', _('Reject')
        REQUEST_CHANGES = 'REQUEST_CHANGES', _('Request changes')
        FORWARD = 'FORWARD', _('Forward')
        NONE = '', _('None')

    document_request = models.ForeignKey(
        DocumentRequest,
        on_delete=models.CASCADE,
        related_name='workflow_steps',
    )
    step_code = models.SlugField(max_length=64)
    step_label = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    decision = models.CharField(
        max_length=24,
        choices=Decision.choices,
        blank=True,
        default=Decision.NONE,
    )
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    performed_at = models.DateTimeField(null=True, blank=True, db_index=True)
    notes = models.TextField(blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['document_request', 'created_at']
        indexes = [
            models.Index(fields=['document_request', 'status']),
        ]

    def __str__(self) -> str:
        return f'WorkflowStep<{self.document_request_id}:{self.step_code} {self.status}>'


# ============================================================================
# 8. DOCUMENT OUTPUT — generated file
# ============================================================================

class DocumentOutput(TimestampedModel):
    """Generated artifact (PDF/DOCX/HTML) produced from a request + template."""

    class Format(models.TextChoices):
        PDF = 'PDF', _('PDF')
        DOCX = 'DOCX', _('DOCX')
        HTML = 'HTML', _('HTML')

    document_request = models.ForeignKey(
        DocumentRequest,
        on_delete=models.CASCADE,
        related_name='outputs',
    )
    file = models.FileField(upload_to='documents/outputs/%Y/%m/')
    format = models.CharField(
        max_length=8,
        choices=Format.choices,
        default=Format.PDF,
    )
    sha256_hash = models.CharField(max_length=64, unique=True)
    generated_at = models.DateTimeField(auto_now_add=True, db_index=True)
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    is_signed = models.BooleanField(default=False)
    signature_metadata_json = models.JSONField(default=dict, blank=True)
    download_count = models.PositiveIntegerField(default=0)

    class Meta(TimestampedModel.Meta):
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['document_request', '-generated_at']),
        ]

    def __str__(self) -> str:
        return f'DocumentOutput<{self.document_request_id} {self.format}>'


# ============================================================================
# 9. ADMINISTRATIVE RESOURCE — rooms, equipment...
# ============================================================================

class AdministrativeResource(TimestampedModel):
    """Reservable physical or virtual resource (room, equipment, vehicle)."""

    class ResourceType(models.TextChoices):
        ROOM = 'ROOM', _('Room')
        EQUIPMENT = 'EQUIPMENT', _('Equipment')
        VEHICLE = 'VEHICLE', _('Vehicle')
        OTHER = 'OTHER', _('Other')

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    resource_type = models.CharField(
        max_length=16,
        choices=ResourceType.choices,
        default=ResourceType.ROOM,
        db_index=True,
    )
    location = models.CharField(max_length=255, blank=True, default='')
    capacity = models.PositiveSmallIntegerField(default=0)
    is_bookable = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['code']

    def __str__(self) -> str:
        return f'Resource<{self.code}>'


# ============================================================================
# 10. RESERVATION RULE
# ============================================================================

class ReservationRule(TimestampedModel):
    """Constraint applied when reserving a resource."""

    class RuleType(models.TextChoices):
        ROLE_REQUIRED = 'ROLE_REQUIRED', _('Role required')
        MAX_DURATION = 'MAX_DURATION', _('Max duration')
        ADVANCE_NOTICE = 'ADVANCE_NOTICE', _('Advance notice')
        BLACKOUT = 'BLACKOUT', _('Blackout window')
        APPROVAL_REQUIRED = 'APPROVAL_REQUIRED', _('Approval required')

    resource = models.ForeignKey(
        AdministrativeResource,
        on_delete=models.CASCADE,
        related_name='rules',
    )
    rule_type = models.CharField(
        max_length=24,
        choices=RuleType.choices,
        db_index=True,
    )
    rule_definition_json = models.JSONField(default=dict, blank=True)
    description = models.CharField(max_length=255, blank=True, default='')
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        indexes = [
            models.Index(fields=['resource', 'is_active']),
        ]

    def __str__(self) -> str:
        return f'ReservationRule<{self.resource_id}:{self.rule_type}>'


# ============================================================================
# 11. RESERVATION
# ============================================================================

class Reservation(TimestampedModel):
    """A booking of a resource by a user."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
        CANCELLED = 'CANCELLED', _('Cancelled')
        CHECKED_IN = 'CHECKED_IN', _('Checked in')
        COMPLETED = 'COMPLETED', _('Completed')
        NO_SHOW = 'NO_SHOW', _('No-show')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    resource = models.ForeignKey(
        AdministrativeResource,
        on_delete=models.PROTECT,
        related_name='reservations',
    )
    reserved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='reservations_made',
    )
    reserved_for_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservations_for_me',
    )
    title = models.CharField(max_length=255)
    purpose = models.TextField(blank=True, default='')
    start_at = models.DateTimeField(db_index=True)
    end_at = models.DateTimeField(db_index=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservations_approved',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-start_at']
        constraints = [
            CheckConstraint(
                check=Q(end_at__gt=F('start_at')),
                name='reservation_end_after_start',
            ),
        ]
        indexes = [
            models.Index(fields=['resource', 'start_at', 'end_at']),
            models.Index(fields=['reserved_by', '-start_at']),
            models.Index(fields=['status', '-start_at']),
        ]

    def __str__(self) -> str:
        return f'Reservation<{self.resource_id} {self.start_at:%Y-%m-%d %H:%M}>'
