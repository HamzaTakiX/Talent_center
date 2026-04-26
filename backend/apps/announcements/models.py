"""
Announcements domain models.

Responsibility boundary:
- This app owns: announcement taxonomy, announcement entities, targeting,
  attachments, recommendation scoring, student actions, and per-student
  preferences.
- Internship offers are NOT owned here. AnnouncementOfferLink references
  the canonical `stage.InternshipOffer` via FK (replaces the spec's
  duplicated "internship_offers" entry under announcements).
"""

import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q, UniqueConstraint
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import Role, StudentProfile, TimestampedModel


# ============================================================================
# 1. ANNOUNCEMENT TYPE — taxonomy
# ============================================================================

class AnnouncementType(TimestampedModel):
    """Declarative taxonomy entry (event, news, internship, scholarship…)."""

    class DefaultPriority(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=64, blank=True, default='')
    color = models.CharField(max_length=16, blank=True, default='')
    default_priority = models.CharField(
        max_length=16,
        choices=DefaultPriority.choices,
        default=DefaultPriority.MEDIUM,
    )
    is_active = models.BooleanField(default=True, db_index=True)
    is_system = models.BooleanField(default=False)

    class Meta(TimestampedModel.Meta):
        ordering = ['code']

    def __str__(self) -> str:
        return f'AnnouncementType<{self.code}>'


# ============================================================================
# 2. ANNOUNCEMENT — root entity
# ============================================================================

class Announcement(TimestampedModel):
    """Root publishable announcement."""

    class Priority(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        URGENT = 'URGENT', _('Urgent')

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        PUBLISHED = 'PUBLISHED', _('Published')
        ARCHIVED = 'ARCHIVED', _('Archived')
        EXPIRED = 'EXPIRED', _('Expired')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, blank=True, default='', db_index=True)
    body = models.TextField()
    summary = models.CharField(max_length=512, blank=True, default='')

    announcement_type = models.ForeignKey(
        AnnouncementType,
        on_delete=models.PROTECT,
        related_name='announcements',
    )
    priority = models.CharField(
        max_length=16,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )

    publish_at = models.DateTimeField(null=True, blank=True, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_announcements',
    )
    is_pinned = models.BooleanField(default=False, db_index=True)
    allow_comments = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-is_pinned', '-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', '-published_at']),
            models.Index(fields=['announcement_type', 'status']),
            models.Index(fields=['is_pinned', '-published_at']),
        ]

    def __str__(self) -> str:
        return f'Announcement<{self.title}>'

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:240]
            self.slug = f'{base}-{self.uuid.hex[:6]}'
        super().save(*args, **kwargs)


# ============================================================================
# 3. ANNOUNCEMENT TARGET — audience filters
# ============================================================================

class AnnouncementTarget(TimestampedModel):
    """
    Audience filter applied when listing announcements for a student.
    Multiple targets combine with AND across target_type, OR within.
    """

    class TargetType(models.TextChoices):
        ALL = 'ALL', _('All users')
        FILIERE = 'FILIERE', _('Filière')
        CLASS_GROUP = 'CLASS_GROUP', _('Class group')
        ROLE = 'ROLE', _('Role')
        USER = 'USER', _('Specific user')
        LEVEL = 'LEVEL', _('Education level')
        CUSTOM = 'CUSTOM', _('Custom')

    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name='targets',
    )
    target_type = models.CharField(
        max_length=32,
        choices=TargetType.choices,
        db_index=True,
    )
    filiere = models.ForeignKey(
        'admin_management.Filiere',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='announcement_targets',
    )
    class_group = models.ForeignKey(
        'admin_management.ClassGroup',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='announcement_targets',
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='announcement_targets',
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='direct_announcement_targets',
    )
    value_json = models.JSONField(default=dict, blank=True)
    is_inclusive = models.BooleanField(default=True)

    class Meta(TimestampedModel.Meta):
        indexes = [
            models.Index(fields=['announcement', 'target_type']),
        ]

    def __str__(self) -> str:
        return f'Target<{self.announcement_id} {self.target_type}>'


# ============================================================================
# 4. ANNOUNCEMENT ATTACHMENT
# ============================================================================

class AnnouncementAttachment(TimestampedModel):
    """File attached to an announcement (image, PDF, etc.)."""

    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    file = models.FileField(upload_to='announcements/%Y/%m/')
    original_filename = models.CharField(max_length=255, blank=True, default='')
    file_size_bytes = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=128, blank=True, default='')

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['announcement']),
        ]

    def __str__(self) -> str:
        return f'Attachment<{self.announcement_id} {self.original_filename}>'


# ============================================================================
# 5. ANNOUNCEMENT-OFFER LINK — bridge to stage.InternshipOffer
# ============================================================================

class AnnouncementOfferLink(TimestampedModel):
    """
    Bridge between an Announcement and a canonical InternshipOffer.

    Replaces the spec's duplicated "internship_offers" entry under
    announcements: an announcement publicising an offer simply links
    here, no offer fields are duplicated.
    """

    announcement = models.OneToOneField(
        Announcement,
        on_delete=models.CASCADE,
        related_name='offer_link',
    )
    offer = models.ForeignKey(
        'stage.InternshipOffer',
        on_delete=models.CASCADE,
        related_name='announcement_links',
    )

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['announcement', 'offer'],
                name='uniq_announcement_offer_link',
            ),
        ]
        indexes = [
            models.Index(fields=['offer', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'AnnOfferLink<{self.announcement_id}->{self.offer_id}>'


# ============================================================================
# 6. STUDENT ACTIONS — view / click / save / dismiss tracking
# ============================================================================

class StudentAnnouncementAction(models.Model):
    """Append-only audit of a student's interactions with an announcement."""

    class ActionType(models.TextChoices):
        VIEW = 'VIEW', _('View')
        CLICK = 'CLICK', _('Click')
        SAVE = 'SAVE', _('Save')
        DISMISS = 'DISMISS', _('Dismiss')
        SHARE = 'SHARE', _('Share')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='announcement_actions',
    )
    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name='student_actions',
    )
    action_type = models.CharField(
        max_length=16,
        choices=ActionType.choices,
        db_index=True,
    )
    metadata_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student_profile', '-created_at']),
            models.Index(fields=['announcement', 'action_type']),
        ]

    def __str__(self) -> str:
        return f'StudentAction<{self.student_profile_id}/{self.announcement_id} {self.action_type}>'


# ============================================================================
# 7. RECOMMENDATION SCORE — per (student, announcement) match
# ============================================================================

class RecommendationScore(TimestampedModel):
    """Computed match score between a student and an announcement."""

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='announcement_recommendations',
    )
    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name='recommendation_scores',
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
                fields=['student_profile', 'announcement'],
                name='uniq_recommendation_per_student_announcement',
            ),
        ]
        indexes = [
            models.Index(fields=['student_profile', '-score']),
            models.Index(fields=['announcement', '-score']),
        ]

    def __str__(self) -> str:
        return f'Reco<{self.student_profile_id}/{self.announcement_id}={self.score}>'


# ============================================================================
# 8. STUDENT PREFERENCES — per type opt-in/opt-out
# ============================================================================

class StudentAnnouncementPreference(TimestampedModel):
    """Per-student visibility/notification prefs by announcement type."""

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='announcement_preferences',
    )
    announcement_type = models.ForeignKey(
        AnnouncementType,
        on_delete=models.CASCADE,
        related_name='student_preferences',
    )
    notify_via_email = models.BooleanField(default=True)
    notify_via_in_app = models.BooleanField(default=True)
    is_muted = models.BooleanField(default=False, db_index=True)

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['student_profile', 'announcement_type'],
                name='uniq_preference_per_student_type',
            ),
        ]

    def __str__(self) -> str:
        return f'Pref<{self.student_profile_id}/{self.announcement_type_id}>'
