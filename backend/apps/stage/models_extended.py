"""
Extended domain models — Company, Interview, Versioning, Webhooks, SLA, Pipeline config.

Imported by models.py so Django discovers all tables.
"""

import hashlib
import uuid

from django.conf import settings
from django.db import models
from django.db.models import UniqueConstraint
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import StudentProfile, TimestampedModel


# ============================================================================
# COMPANY DOMAIN
# ============================================================================

class Company(TimestampedModel):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        VERIFIED = 'VERIFIED', _('Verified')
        PENDING_VERIFICATION = 'PENDING_VERIFICATION', _('Pending verification')
        SUSPENDED = 'SUSPENDED', _('Suspended')
        ARCHIVED = 'ARCHIVED', _('Archived')
        BLACKLISTED = 'BLACKLISTED', _('Blacklisted')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    legal_name = models.CharField(max_length=255, blank=True, default='')
    slug = models.SlugField(max_length=280, blank=True, default='', db_index=True)
    logo = models.ImageField(upload_to='companies/logos/', null=True, blank=True)
    website = models.URLField(max_length=512, blank=True, default='')
    description = models.TextField(blank=True, default='')
    sector = models.CharField(max_length=128, blank=True, default='', db_index=True)
    city = models.CharField(max_length=128, blank=True, default='')
    country = models.CharField(max_length=128, blank=True, default='Maroc')
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.PENDING_VERIFICATION,
        db_index=True,
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_companies',
    )
    blacklisted_at = models.DateTimeField(null=True, blank=True)
    blacklisted_reason = models.TextField(blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['name']
        indexes = [
            models.Index(fields=['status', 'name']),
            models.Index(fields=['sector', 'status']),
        ]

    def __str__(self) -> str:
        return f'Company<{self.name}>'


class CompanyContact(TimestampedModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='contacts')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=32, blank=True, default='')
    job_title = models.CharField(max_length=128, blank=True, default='')
    is_primary = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-is_primary', 'full_name']


class CompanyRelationship(TimestampedModel):
    class RelationshipType(models.TextChoices):
        PARTNER = 'PARTNER', _('Partner')
        PARENT = 'PARENT', _('Parent company')
        SUBSIDIARY = 'SUBSIDIARY', _('Subsidiary')
        CLIENT = 'CLIENT', _('Client')
        SUPPLIER = 'SUPPLIER', _('Supplier')

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='relationships')
    related_company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='inverse_relationships',
    )
    relationship_type = models.CharField(max_length=16, choices=RelationshipType.choices)
    notes = models.TextField(blank=True, default='')

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['company', 'related_company', 'relationship_type'],
                name='uniq_company_relationship',
            ),
        ]


class CompanyInteraction(TimestampedModel):
    class InteractionType(models.TextChoices):
        EMAIL = 'EMAIL', _('Email')
        CALL = 'CALL', _('Call')
        MEETING = 'MEETING', _('Meeting')
        VISIT = 'VISIT', _('Visit')
        OTHER = 'OTHER', _('Other')

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='interactions')
    interaction_type = models.CharField(max_length=16, choices=InteractionType.choices, db_index=True)
    subject = models.CharField(max_length=255, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    occurred_at = models.DateTimeField(db_index=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='company_interactions',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-occurred_at']


class CompanyDocument(TimestampedModel):
    class DocumentType(models.TextChoices):
        CONTRACT = 'CONTRACT', _('Contract')
        PARTNERSHIP = 'PARTNERSHIP', _('Partnership agreement')
        VERIFICATION = 'VERIFICATION', _('Verification document')
        OTHER = 'OTHER', _('Other')

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=16, choices=DocumentType.choices, db_index=True)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='companies/documents/%Y/%m/')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    metadata_json = models.JSONField(default=dict, blank=True)


class CompanyNote(TimestampedModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='company_notes',
    )
    body = models.TextField()
    is_internal = models.BooleanField(default=True, db_index=True)


class CompanyStatusHistory(TimestampedModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='status_history')
    previous_status = models.CharField(max_length=24, blank=True, default='')
    new_status = models.CharField(max_length=24, db_index=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    reason = models.TextField(blank=True, default='')
    is_automated = models.BooleanField(default=False)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']


# ============================================================================
# INTERVIEW DOMAIN
# ============================================================================

class Interview(TimestampedModel):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        RESCHEDULED = 'RESCHEDULED', _('Rescheduled')
        IN_PROGRESS = 'IN_PROGRESS', _('In progress')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')
        NO_SHOW = 'NO_SHOW', _('No show')

    class InterviewType(models.TextChoices):
        PHONE = 'PHONE', _('Phone')
        VIDEO = 'VIDEO', _('Video')
        ONSITE = 'ONSITE', _('On-site')
        PANEL = 'PANEL', _('Panel')
        SIMULATOR = 'SIMULATOR', _('Interview simulator')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    application = models.ForeignKey(
        'stage.OfferApplication',
        on_delete=models.CASCADE,
        related_name='interviews',
    )
    interview_type = models.CharField(
        max_length=16,
        choices=InterviewType.choices,
        default=InterviewType.VIDEO,
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True,
    )
    scheduled_at = models.DateTimeField(db_index=True)
    duration_minutes = models.PositiveSmallIntegerField(default=45)
    location = models.CharField(max_length=255, blank=True, default='')
    meeting_url = models.URLField(max_length=1024, blank=True, default='')
    interviewer_name = models.CharField(max_length=255, blank=True, default='')
    scheduled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scheduled_interviews',
    )
    simulator_session_id = models.CharField(
        max_length=128,
        blank=True,
        default='',
        help_text=_('INTEGRATION POINT: Interview Simulator session ID'),
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-scheduled_at']


class InterviewSchedule(TimestampedModel):
    """History of schedule changes for an interview."""

    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='schedule_history')
    previous_scheduled_at = models.DateTimeField(null=True, blank=True)
    new_scheduled_at = models.DateTimeField()
    reason = models.TextField(blank=True, default='')
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )


class InterviewFeedback(TimestampedModel):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='feedbacks')
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='interview_feedbacks',
    )
    overall_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    technical_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    communication_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    strengths = models.TextField(blank=True, default='')
    weaknesses = models.TextField(blank=True, default='')
    recommendation = models.CharField(max_length=32, blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)


class InterviewResult(TimestampedModel):
    class Outcome(models.TextChoices):
        PASS = 'PASS', _('Pass')
        FAIL = 'FAIL', _('Fail')
        PENDING = 'PENDING', _('Pending')
        HOLD = 'HOLD', _('Hold')

    interview = models.OneToOneField(Interview, on_delete=models.CASCADE, related_name='result')
    outcome = models.CharField(max_length=16, choices=Outcome.choices, default=Outcome.PENDING)
    notes = models.TextField(blank=True, default='')
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    decided_at = models.DateTimeField(null=True, blank=True)


class InterviewStatusHistory(TimestampedModel):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='status_history')
    previous_status = models.CharField(max_length=16, blank=True, default='')
    new_status = models.CharField(max_length=16, db_index=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    reason = models.TextField(blank=True, default='')


# ============================================================================
# OFFER VERSIONING
# ============================================================================

class OfferVersion(TimestampedModel):
    offer = models.ForeignKey(
        'stage.InternshipOffer',
        on_delete=models.CASCADE,
        related_name='versions',
    )
    version_number = models.PositiveIntegerField(db_index=True)
    snapshot_json = models.JSONField(default=dict)
    change_summary = models.TextField(blank=True, default='')
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    is_current = models.BooleanField(default=True, db_index=True)
    restored_from_version = models.PositiveIntegerField(null=True, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-version_number']
        constraints = [
            UniqueConstraint(fields=['offer', 'version_number'], name='uniq_offer_version_number'),
        ]


class OfferContentHistory(TimestampedModel):
    """Field-level change log for offer content (complements OfferStatusHistory)."""

    offer = models.ForeignKey(
        'stage.InternshipOffer',
        on_delete=models.CASCADE,
        related_name='content_history',
    )
    field_name = models.CharField(max_length=64, db_index=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    version_number = models.PositiveIntegerField(null=True, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']


# ============================================================================
# WEBHOOK ARCHITECTURE
# ============================================================================

class WebhookSubscription(TimestampedModel):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    name = models.CharField(max_length=255)
    target_url = models.URLField(max_length=1024)
    secret = models.CharField(max_length=128, blank=True, default='')
    event_types = models.JSONField(default=list, help_text=_('List of event codes to subscribe'))
    is_active = models.BooleanField(default=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='webhook_subscriptions',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']


class WebhookEvent(TimestampedModel):
    event_code = models.CharField(max_length=64, db_index=True)
    entity_type = models.CharField(max_length=64, blank=True, default='')
    entity_id = models.CharField(max_length=64, blank=True, default='')
    payload_json = models.JSONField(default=dict)
    source_app = models.CharField(max_length=32, default='stage', db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']


class WebhookDelivery(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        SENT = 'SENT', _('Sent')
        FAILED = 'FAILED', _('Failed')
        RETRYING = 'RETRYING', _('Retrying')

    event = models.ForeignKey(WebhookEvent, on_delete=models.CASCADE, related_name='deliveries')
    subscription = models.ForeignKey(
        WebhookSubscription,
        on_delete=models.CASCADE,
        related_name='deliveries',
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING, db_index=True)
    attempt_count = models.PositiveSmallIntegerField(default=0)
    response_status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True, default='')
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    next_retry_at = models.DateTimeField(null=True, blank=True, db_index=True)


class WebhookLog(TimestampedModel):
    delivery = models.ForeignKey(WebhookDelivery, on_delete=models.CASCADE, related_name='logs')
    level = models.CharField(max_length=16, default='INFO')
    message = models.TextField()


class WebhookRetry(TimestampedModel):
    delivery = models.ForeignKey(WebhookDelivery, on_delete=models.CASCADE, related_name='retries')
    scheduled_at = models.DateTimeField(db_index=True)
    executed_at = models.DateTimeField(null=True, blank=True)
    success = models.BooleanField(default=False)
    error_message = models.TextField(blank=True, default='')


# ============================================================================
# SLA & ESCALATION
# ============================================================================

class SlaRule(TimestampedModel):
    class EntityType(models.TextChoices):
        APPLICATION = 'APPLICATION', _('Application')
        CONVERSATION = 'CONVERSATION', _('Conversation')
        INTERVIEW = 'INTERVIEW', _('Interview')
        OFFER_REVIEW = 'OFFER_REVIEW', _('Offer review')

    code = models.CharField(max_length=64, unique=True)
    entity_type = models.CharField(max_length=24, choices=EntityType.choices, db_index=True)
    threshold_hours = models.PositiveIntegerField(default=24)
    escalation_level = models.PositiveSmallIntegerField(default=1)
    notify_supervisor = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, db_index=True)
    description = models.TextField(blank=True, default='')

    class Meta(TimestampedModel.Meta):
        ordering = ['entity_type', 'threshold_hours']


class SlaViolation(TimestampedModel):
    class Status(models.TextChoices):
        OPEN = 'OPEN', _('Open')
        ACKNOWLEDGED = 'ACKNOWLEDGED', _('Acknowledged')
        RESOLVED = 'RESOLVED', _('Resolved')
        ESCALATED = 'ESCALATED', _('Escalated')

    rule = models.ForeignKey(SlaRule, on_delete=models.CASCADE, related_name='violations')
    entity_type = models.CharField(max_length=24, db_index=True)
    entity_id = models.CharField(max_length=64, db_index=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.OPEN, db_index=True)
    detected_at = models.DateTimeField(auto_now_add=True, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    escalated_at = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sla_violations',
    )
    metadata_json = models.JSONField(default=dict, blank=True)


# ============================================================================
# MATCHING CONFIG & RECOMMENDATIONS
# ============================================================================

class SemanticEmbedding(TimestampedModel):
    """Vector embedding for semantic matching (student profile or offer)."""

    class EntityType(models.TextChoices):
        STUDENT = 'STUDENT', _('Student profile')
        OFFER = 'OFFER', _('Internship offer')

    entity_type = models.CharField(max_length=16, choices=EntityType.choices, db_index=True)
    entity_id = models.PositiveIntegerField(db_index=True)
    embedding_model = models.CharField(max_length=64, default='text-embedding-3-small')
    source_text_hash = models.CharField(max_length=64, blank=True, default='')
    vector_json = models.JSONField(default=list)
    dimensions = models.PositiveSmallIntegerField(default=0)

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['entity_type', 'entity_id'],
                name='uniq_semantic_embedding_entity',
            ),
        ]
        indexes = [
            models.Index(fields=['entity_type', 'entity_id']),
        ]

    @staticmethod
    def hash_text(text: str) -> str:
        return hashlib.sha256((text or '').encode('utf-8')).hexdigest()

    def __str__(self) -> str:
        return f'SemanticEmbedding<{self.entity_type}:{self.entity_id}>'


class MatchingWeightConfig(TimestampedModel):
    name = models.CharField(max_length=128, default='default')
    weights_json = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']


class OfferRecommendation(TimestampedModel):
    class RecommendationType(models.TextChoices):
        FOR_YOU = 'FOR_YOU', _('Recommended for you')
        TRENDING = 'TRENDING', _('Trending')
        RECENT = 'RECENT', _('Recently published')
        URGENT = 'URGENT', _('Urgent opportunity')
        PROFILE = 'PROFILE', _('Based on profile')
        APPLICATIONS = 'APPLICATIONS', _('Based on applications')
        SIMILAR_STUDENTS = 'SIMILAR_STUDENTS', _('Similar students')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='offer_recommendations',
    )
    offer = models.ForeignKey(
        'stage.InternshipOffer',
        on_delete=models.CASCADE,
        related_name='recommendations',
    )
    recommendation_type = models.CharField(max_length=24, choices=RecommendationType.choices, db_index=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    reasons_json = models.JSONField(default=list, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    is_dismissed = models.BooleanField(default=False, db_index=True)

    class Meta(TimestampedModel.Meta):
        indexes = [
            models.Index(fields=['student_profile', 'recommendation_type', '-score']),
        ]


# ============================================================================
# PIPELINE CONFIG
# ============================================================================

class PipelineColumn(TimestampedModel):
    code = models.SlugField(max_length=32, unique=True)
    label = models.CharField(max_length=128)
    application_statuses = models.JSONField(default=list)
    sort_order = models.PositiveSmallIntegerField(default=0, db_index=True)
    is_terminal = models.BooleanField(default=False)
    color = models.CharField(max_length=16, blank=True, default='')

    class Meta(TimestampedModel.Meta):
        ordering = ['sort_order']
