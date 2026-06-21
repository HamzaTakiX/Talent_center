"""
Stage / Internship domain models.

Responsibility boundary:
- This app owns: internship offers, targeting rules, match scoring,
  applications, application documents, candidate collections, and
  external-link followups.
- CV-related data is NOT duplicated here. Application -> CV linkage
  references `cv_builder.StudentCv` and `cv_builder.CvAiAnalysis`
  via FK. The "cv_analysis_results" concept from the spec is
  fulfilled by `OfferApplication.cv_analysis`.
- Announcements that publicise an offer live in the announcements
  app and reference InternshipOffer via FK — they do NOT recreate it.
"""

import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q, UniqueConstraint
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import StudentProfile, TimestampedModel


# Module-level so that Meta constraints can reference it (nested class
# scope cannot see attributes defined in the enclosing class).
APPLICATION_ACTIVE_STATUSES = (
    'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED',
    'OFFER_ACCEPTED', 'INTERNSHIP_STARTED',
)


# ============================================================================
# 1. INTERNSHIP OFFER — canonical entity
# ============================================================================

class InternshipOffer(TimestampedModel):
    """
    Canonical offer/job posting. Single source of truth for offer data
    across the platform. Other apps (announcements, profile_intelligence,
    notifications) reference this row by FK.
    """

    class OfferType(models.TextChoices):
        PFE = 'PFE', _('PFE (Projet Fin d\'Études)')
        PFA = 'PFA', _('PFA (Projet Fin d\'Année)')
        INTERNSHIP = 'INTERNSHIP', _('Internship')
        ALTERNANCE = 'ALTERNANCE', _('Alternance')
        JOB = 'JOB', _('Job')
        OTHER = 'OTHER', _('Other')

    class CompensationPeriod(models.TextChoices):
        NOT_SPECIFIED = 'NOT_SPECIFIED', _('Not specified')
        MONTHLY = 'MONTHLY', _('Monthly')
        TOTAL = 'TOTAL', _('Total')
        HOURLY = 'HOURLY', _('Hourly')
        DAILY = 'DAILY', _('Daily')

    class EducationLevel(models.TextChoices):
        BAC = 'BAC', _('Baccalaureate')
        BAC_PLUS_2 = 'BAC_PLUS_2', _('Bac+2')
        LICENCE = 'LICENCE', _('Licence')
        MASTER = 'MASTER', _('Master')
        INGENIEUR = 'INGENIEUR', _('Ingénieur')
        DOCTORAT = 'DOCTORAT', _('Doctorat')

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        PENDING_REVIEW = 'PENDING_REVIEW', _('Pending review')
        PUBLISHED = 'PUBLISHED', _('Published')
        OPEN = 'OPEN', _('Open')
        CLOSED = 'CLOSED', _('Closed')
        EXPIRED = 'EXPIRED', _('Expired')
        ARCHIVED = 'ARCHIVED', _('Archived')
        DELETED = 'DELETED', _('Deleted')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    # Identification
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, blank=True, default='', db_index=True)
    description = models.TextField(blank=True, default='')

    # Company — denormalized cache; canonical entity is Company (models_extended)
    company = models.ForeignKey(
        'stage.Company',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='offers',
    )
    company_name = models.CharField(max_length=255, db_index=True)
    company_logo = models.ImageField(upload_to='offers/logos/', null=True, blank=True)
    company_website = models.URLField(max_length=512, blank=True, default='')
    company_description = models.TextField(blank=True, default='')

    # Location
    location_city = models.CharField(max_length=128, blank=True, default='', db_index=True)
    location_country = models.CharField(max_length=128, blank=True, default='')
    is_remote = models.BooleanField(default=False, db_index=True)
    is_hybrid = models.BooleanField(default=False)

    # Type & duration
    offer_type = models.CharField(
        max_length=16,
        choices=OfferType.choices,
        default=OfferType.INTERNSHIP,
        db_index=True,
    )
    duration_months = models.PositiveSmallIntegerField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    application_deadline = models.DateTimeField(null=True, blank=True, db_index=True)

    # Compensation
    compensation_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True,
    )
    compensation_currency = models.CharField(max_length=8, blank=True, default='MAD')
    compensation_period = models.CharField(
        max_length=16,
        choices=CompensationPeriod.choices,
        default=CompensationPeriod.NOT_SPECIFIED,
    )

    # Skills & requirements (JSON for flexibility)
    required_skills = models.JSONField(default=list, blank=True)
    preferred_skills = models.JSONField(default=list, blank=True)
    required_languages = models.JSONField(default=list, blank=True)
    min_education_level = models.CharField(
        max_length=16,
        choices=EducationLevel.choices,
        blank=True,
        default='',
    )

    # Workflow state
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    submitted_for_review_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_offers',
    )

    # Authorship
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_offers',
    )

    # External tracking (for offers scraped/imported from third-party sites)
    external_url = models.URLField(max_length=1024, blank=True, default='')
    external_source = models.CharField(max_length=64, blank=True, default='', db_index=True)
    external_id = models.CharField(max_length=128, blank=True, default='')

    # Counters (denormalized for cheap dashboard reads)
    view_count = models.PositiveIntegerField(default=0)
    application_count = models.PositiveIntegerField(default=0)

    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', '-published_at']),
            models.Index(fields=['offer_type', 'status']),
            models.Index(fields=['company_name', 'status']),
            models.Index(fields=['external_source', 'external_id']),
        ]
        constraints = [
            UniqueConstraint(
                fields=['external_source', 'external_id'],
                condition=~Q(external_id=''),
                name='uniq_external_offer_per_source',
            ),
        ]

    def __str__(self) -> str:
        return f'InternshipOffer<{self.title} @ {self.company_name}>'

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(f'{self.title}-{self.company_name}')[:240]
            self.slug = f'{base}-{self.uuid.hex[:6]}'
        super().save(*args, **kwargs)


# ============================================================================
# 2. TARGETING RULES — who sees the offer
# ============================================================================

class OfferTargetingRule(TimestampedModel):
    """
    Audience filter applied when listing/recommending an offer.

    Multiple rules combine with AND on rule_type and OR within a rule_type.
    Engines treat `value_json` as the rule's payload, e.g.:
      { "filiere_codes": ["ING-INFO", "ING-DATA"] }
    """

    class RuleType(models.TextChoices):
        FILIERE = 'FILIERE', _('Filière')
        CLASS_GROUP = 'CLASS_GROUP', _('Class group')
        LEVEL = 'LEVEL', _('Education level')
        INTERNSHIP_TYPE = 'INTERNSHIP_TYPE', _('Internship type')
        SKILL = 'SKILL', _('Skill')
        LANGUAGE = 'LANGUAGE', _('Language')
        AVAILABILITY = 'AVAILABILITY', _('Availability')
        LOCATION = 'LOCATION', _('Location')
        CUSTOM = 'CUSTOM', _('Custom')

    offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.CASCADE,
        related_name='targeting_rules',
    )
    rule_type = models.CharField(
        max_length=32,
        choices=RuleType.choices,
        db_index=True,
    )
    value_json = models.JSONField(default=dict, blank=True)
    is_inclusive = models.BooleanField(
        default=True,
        help_text=_('True = must match (whitelist). False = must NOT match (blacklist).'),
    )
    priority = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['priority', 'rule_type']
        indexes = [
            models.Index(fields=['offer', 'rule_type']),
            models.Index(fields=['offer', 'is_active']),
        ]

    def __str__(self) -> str:
        return f'TargetingRule<{self.offer_id} {self.rule_type}>'


# ============================================================================
# 3. MATCH SCORE — per (student, offer) computed score
# ============================================================================

class StudentOfferMatchScore(TimestampedModel):
    """
    Computed compatibility score between a student and an offer.

    Refreshed by the matching engine periodically. Stored to allow
    cheap "top N offers for student" / "top N students for offer"
    queries without recomputation.
    """

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='offer_match_scores',
    )
    offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.CASCADE,
        related_name='match_scores',
    )
    score = models.DecimalField(
        max_digits=5, decimal_places=2,
        help_text=_('0.00 - 100.00'),
    )
    score_breakdown = models.JSONField(default=dict, blank=True)
    is_recommended = models.BooleanField(default=False, db_index=True)
    computed_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-score', '-computed_at']
        constraints = [
            UniqueConstraint(
                fields=['student_profile', 'offer'],
                name='uniq_match_score_per_student_offer',
            ),
        ]
        indexes = [
            models.Index(fields=['student_profile', '-score']),
            models.Index(fields=['offer', '-score']),
            models.Index(fields=['is_recommended', '-score']),
        ]

    def __str__(self) -> str:
        return f'MatchScore<{self.student_profile_id}/{self.offer_id} = {self.score}>'


# ============================================================================
# 4. OFFER APPLICATION — student applies
# ============================================================================

class OfferApplication(TimestampedModel):
    """
    Student application to an offer. The single source of truth for
    application state. Linked to a CV snapshot and (optionally) an
    AI analysis result, both living in cv_builder.
    """

    class Status(models.TextChoices):
        SUBMITTED = 'SUBMITTED', _('Submitted')
        UNDER_REVIEW = 'UNDER_REVIEW', _('Under review')
        SHORTLISTED = 'SHORTLISTED', _('Shortlisted')
        INTERVIEW = 'INTERVIEW', _('Interview scheduled')
        ACCEPTED = 'ACCEPTED', _('Accepted')
        REJECTED = 'REJECTED', _('Rejected')
        WITHDRAWN = 'WITHDRAWN', _('Withdrawn')
        EXPIRED = 'EXPIRED', _('Expired')
        OFFER_ACCEPTED = 'OFFER_ACCEPTED', _('Offer accepted')
        OFFER_DECLINED = 'OFFER_DECLINED', _('Offer declined')
        INTERNSHIP_STARTED = 'INTERNSHIP_STARTED', _('Internship started')
        INTERNSHIP_COMPLETED = 'INTERNSHIP_COMPLETED', _('Internship completed')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.CASCADE,
        related_name='applications',
    )
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='offer_applications',
    )

    # Snapshot of the CV used for the application.
    student_cv = models.ForeignKey(
        'cv_builder.StudentCv',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications',
    )
    # Optional pointer to the AI analysis result (= cv_analysis_results in the spec).
    cv_analysis = models.ForeignKey(
        'cv_builder.CvAiAnalysis',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications',
    )

    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.SUBMITTED,
        db_index=True,
    )
    cover_letter = models.TextField(blank=True, default='')

    # Score snapshot at submission time (so the computed score on
    # StudentOfferMatchScore can drift without rewriting history).
    match_score_at_apply = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
    )

    applied_at = models.DateTimeField(auto_now_add=True, db_index=True)
    last_status_change_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    withdrawn_at = models.DateTimeField(null=True, blank=True)

    reviewer_notes = models.TextField(blank=True, default='')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications',
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-applied_at']
        constraints = [
            # Allow re-applying after rejection/withdrawal/expiry, but
            # at most one active application per (student, offer).
            UniqueConstraint(
                fields=['student_profile', 'offer'],
                condition=Q(status__in=APPLICATION_ACTIVE_STATUSES),
                name='uniq_active_application_per_student_offer',
            ),
        ]
        indexes = [
            models.Index(fields=['student_profile', '-applied_at']),
            models.Index(fields=['offer', 'status']),
            models.Index(fields=['status', '-applied_at']),
        ]

    def __str__(self) -> str:
        return f'OfferApplication<{self.student_profile_id}->{self.offer_id} {self.status}>'


# ============================================================================
# 5. APPLICATION DOCUMENTS — extra files attached to an application
# ============================================================================

class ApplicationDocument(TimestampedModel):
    """
    File attached to an application beyond the CV (transcript,
    recommendation letter, portfolio sample…). The CV itself is
    referenced via `OfferApplication.student_cv` — not duplicated here.
    """

    class DocumentType(models.TextChoices):
        COVER_LETTER = 'COVER_LETTER', _('Cover letter')
        TRANSCRIPT = 'TRANSCRIPT', _('Transcript')
        RECOMMENDATION = 'RECOMMENDATION', _('Recommendation letter')
        PORTFOLIO = 'PORTFOLIO', _('Portfolio')
        CERTIFICATE = 'CERTIFICATE', _('Certificate')
        OTHER = 'OTHER', _('Other')

    application = models.ForeignKey(
        OfferApplication,
        on_delete=models.CASCADE,
        related_name='documents',
    )
    document_type = models.CharField(
        max_length=32,
        choices=DocumentType.choices,
        db_index=True,
    )
    file = models.FileField(upload_to='applications/documents/%Y/%m/')
    original_filename = models.CharField(max_length=255, blank=True, default='')
    file_size_bytes = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=128, blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['document_type', '-created_at']
        indexes = [
            models.Index(fields=['application', 'document_type']),
        ]

    def __str__(self) -> str:
        return f'ApplicationDocument<{self.application_id} {self.document_type}>'


# ============================================================================
# 6. CANDIDATE COLLECTIONS — recruiter "saved candidates" lists
# ============================================================================

class CandidateCollection(TimestampedModel):
    """
    Curated list of candidates owned by a recruiter / staff member.
    Can be private (default) or shared inside the org.
    """

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    linked_offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='candidate_collections',
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='candidate_collections',
    )
    is_shared = models.BooleanField(default=False, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['owner', '-updated_at']),
        ]

    def __str__(self) -> str:
        return f'CandidateCollection<{self.name} owner={self.owner_id}>'


class CandidateCollectionItem(TimestampedModel):
    """A student membership in a CandidateCollection."""

    collection = models.ForeignKey(
        CandidateCollection,
        on_delete=models.CASCADE,
        related_name='items',
    )
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='collection_memberships',
    )
    notes = models.TextField(blank=True, default='')
    priority = models.PositiveSmallIntegerField(default=0)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    added_at = models.DateTimeField(auto_now_add=True, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-priority', '-added_at']
        constraints = [
            UniqueConstraint(
                fields=['collection', 'student_profile'],
                name='uniq_student_per_collection',
            ),
        ]
        indexes = [
            models.Index(fields=['collection', '-priority']),
            models.Index(fields=['student_profile', '-added_at']),
        ]

    def __str__(self) -> str:
        return f'CollectionItem<{self.collection_id}:{self.student_profile_id}>'


# ============================================================================
# 7. EXTERNAL LINK FOLLOWUPS — clicks/redirects on offer external URLs
# ============================================================================

class ExternalLinkFollowup(models.Model):
    """
    Append-only audit row for every external-URL click/redirect.

    High-volume table — only the fields needed for analytics are
    indexed. Use periodic aggregation jobs to roll up into reporting.
    """

    class EventType(models.TextChoices):
        CLICK = 'CLICK', _('Click')
        REDIRECT = 'REDIRECT', _('Redirect')
        EXTERNAL_APPLY = 'EXTERNAL_APPLY', _('External apply')

    offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.CASCADE,
        related_name='external_followups',
    )
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='external_link_followups',
    )
    event_type = models.CharField(
        max_length=24,
        choices=EventType.choices,
        default=EventType.CLICK,
        db_index=True,
    )
    target_url = models.URLField(max_length=1024)
    referrer = models.URLField(max_length=1024, blank=True, default='')
    user_agent = models.TextField(blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['offer', '-created_at']),
            models.Index(fields=['student_profile', '-created_at']),
            models.Index(fields=['event_type', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'ExternalFollowup<{self.offer_id} {self.event_type}>'


# ============================================================================
# 8. OFFER STATUS HISTORY — workflow audit trail
# ============================================================================

class OfferStatusHistory(TimestampedModel):
    """Append-only row for every offer status transition."""

    offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.CASCADE,
        related_name='status_history',
    )
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
    is_automated = models.BooleanField(default=False, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['offer', '-created_at']),
            models.Index(fields=['new_status', '-created_at']),
        ]


# ============================================================================
# 9. APPLICATION STATUS HISTORY — candidate workflow audit trail
# ============================================================================

class ApplicationStatusHistory(TimestampedModel):
    """Append-only row for every application status transition."""

    application = models.ForeignKey(
        OfferApplication,
        on_delete=models.CASCADE,
        related_name='status_history',
    )
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
    is_automated = models.BooleanField(default=False, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['application', '-created_at']),
            models.Index(fields=['new_status', '-created_at']),
        ]


# ============================================================================
# 10. OFFER IMPORT — jobs, history, extracted preview
# ============================================================================

class OfferImportJob(TimestampedModel):
    """Async import job triggered by URL paste or batch import."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        VALIDATING = 'VALIDATING', _('Validating URL')
        EXTRACTING = 'EXTRACTING', _('Extracting data')
        PREVIEW_READY = 'PREVIEW_READY', _('Preview ready')
        AWAITING_ADMIN = 'AWAITING_ADMIN', _('Awaiting admin validation')
        PUBLISHING = 'PUBLISHING', _('Publishing')
        COMPLETED = 'COMPLETED', _('Completed')
        FAILED = 'FAILED', _('Failed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    class Platform(models.TextChoices):
        LINKEDIN = 'LINKEDIN', _('LinkedIn')
        INDEED = 'INDEED', _('Indeed')
        REKRUTE = 'REKRUTE', _('Rekrute')
        EMPLOI_MA = 'EMPLOI_MA', _('Emploi.ma')
        NOVOJOB = 'NOVOJOB', _('Novojob')
        COMPANY_WEBSITE = 'COMPANY_WEBSITE', _('Company website')
        UNKNOWN = 'UNKNOWN', _('Unknown')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    source_url = models.URLField(max_length=1024)
    detected_platform = models.CharField(
        max_length=32,
        choices=Platform.choices,
        default=Platform.UNKNOWN,
        db_index=True,
    )
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    initiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='offer_import_jobs',
    )
    extracted_data = models.JSONField(default=dict, blank=True)
    normalized_data = models.JSONField(default=dict, blank=True)
    validation_errors = models.JSONField(default=list, blank=True)
    duplicate_offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='duplicate_import_jobs',
    )
    resulting_offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='import_jobs',
    )
    error_message = models.TextField(blank=True, default='')
    completed_at = models.DateTimeField(null=True, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['detected_platform', '-created_at']),
        ]


class OfferImportHistory(TimestampedModel):
    """Immutable log entry for each step of an import workflow."""

    class Step(models.TextChoices):
        URL_VALIDATED = 'URL_VALIDATED', _('URL validated')
        PLATFORM_DETECTED = 'PLATFORM_DETECTED', _('Platform detected')
        DATA_EXTRACTED = 'DATA_EXTRACTED', _('Data extracted')
        DATA_NORMALIZED = 'DATA_NORMALIZED', _('Data normalized')
        PREVIEW_GENERATED = 'PREVIEW_GENERATED', _('Preview generated')
        ADMIN_APPROVED = 'ADMIN_APPROVED', _('Admin approved')
        ADMIN_REJECTED = 'ADMIN_REJECTED', _('Admin rejected')
        OFFER_PUBLISHED = 'OFFER_PUBLISHED', _('Offer published')
        FAILED = 'FAILED', _('Failed')

    job = models.ForeignKey(
        OfferImportJob,
        on_delete=models.CASCADE,
        related_name='history',
    )
    step = models.CharField(max_length=32, choices=Step.choices, db_index=True)
    message = models.TextField(blank=True, default='')
    payload_json = models.JSONField(default=dict, blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['created_at']


# ============================================================================
# 11. MATCHING HISTORY — score recalculation audit
# ============================================================================

class MatchingHistory(TimestampedModel):
    """Audit trail when match scores are computed or refreshed."""

    class Trigger(models.TextChoices):
        MANUAL = 'MANUAL', _('Manual')
        SCHEDULED = 'SCHEDULED', _('Scheduled job')
        OFFER_PUBLISHED = 'OFFER_PUBLISHED', _('Offer published')
        PROFILE_UPDATED = 'PROFILE_UPDATED', _('Student profile updated')
        APPLICATION = 'APPLICATION', _('Application submitted')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='matching_history',
        null=True,
        blank=True,
    )
    offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.CASCADE,
        related_name='matching_history',
        null=True,
        blank=True,
    )
    previous_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    new_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    match_reasons = models.JSONField(default=list, blank=True)
    trigger = models.CharField(max_length=24, choices=Trigger.choices, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student_profile', '-created_at']),
            models.Index(fields=['offer', '-created_at']),
            models.Index(fields=['trigger', '-created_at']),
        ]


# ============================================================================
# 12. ANALYTICS SNAPSHOTS — periodic rollups
# ============================================================================

class OfferAnalyticsSnapshot(TimestampedModel):
    """Point-in-time analytics snapshot generated by scheduled jobs."""

    snapshot_date = models.DateField(db_index=True)
    period = models.CharField(max_length=16, default='daily', db_index=True)
    metrics_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-snapshot_date']
        constraints = [
            UniqueConstraint(
                fields=['snapshot_date', 'period'],
                name='uniq_offer_analytics_snapshot',
            ),
        ]


# Extended domain models (Company, Interview, Webhooks, SLA, Versioning, Pipeline)
from apps.stage.models_extended import (  # noqa: E402, F401
    Company,
    CompanyContact,
    CompanyDocument,
    CompanyInteraction,
    CompanyNote,
    CompanyRelationship,
    CompanyStatusHistory,
    Interview,
    InterviewFeedback,
    InterviewResult,
    InterviewSchedule,
    InterviewStatusHistory,
    MatchingWeightConfig,
    OfferContentHistory,
    OfferRecommendation,
    OfferVersion,
    PipelineColumn,
    SlaRule,
    SlaViolation,
    WebhookDelivery,
    WebhookEvent,
    WebhookLog,
    WebhookRetry,
    WebhookSubscription,
)
