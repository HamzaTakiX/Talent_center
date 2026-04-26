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
        PUBLISHED = 'PUBLISHED', _('Published')
        CLOSED = 'CLOSED', _('Closed')
        EXPIRED = 'EXPIRED', _('Expired')
        ARCHIVED = 'ARCHIVED', _('Archived')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    # Identification
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, blank=True, default='', db_index=True)
    description = models.TextField(blank=True, default='')

    # Company
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
    closed_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)

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
        max_length=16,
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
