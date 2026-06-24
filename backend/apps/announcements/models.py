"""
Announcements domain models — intelligent communication & internship platform.
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
    """Declarative taxonomy entry with recommendation & preference behavior."""

    class DefaultPriority(models.TextChoices):
        NORMAL = 'NORMAL', _('Normal')
        IMPORTANT = 'IMPORTANT', _('Important')
        URGENT = 'URGENT', _('Urgent')
        PINNED = 'PINNED', _('Pinned')
        INSTITUTIONAL_CRITICAL = 'INSTITUTIONAL_CRITICAL', _('Institutional Critical')

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    name_i18n = models.JSONField(default=dict, blank=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=64, blank=True, default='')
    color = models.CharField(max_length=16, blank=True, default='')
    default_priority = models.CharField(
        max_length=32,
        choices=DefaultPriority.choices,
        default=DefaultPriority.NORMAL,
    )
    is_active = models.BooleanField(default=True, db_index=True)
    is_system = models.BooleanField(default=False)
    is_mutable = models.BooleanField(
        default=True,
        help_text=_('Students can mute this type when True.'),
    )
    is_bannable = models.BooleanField(
        default=True,
        help_text=_('Students can ban this type when True.'),
    )
    is_internship_related = models.BooleanField(default=False, db_index=True)
    recommendation_weight = models.DecimalField(
        max_digits=4, decimal_places=2, default=1.0,
    )
    recommendation_boost = models.DecimalField(
        max_digits=4, decimal_places=2, default=0.0,
    )
    stage_relation = models.ForeignKey(
        'admin_management.InternshipType',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcement_types',
    )
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta(TimestampedModel.Meta):
        ordering = ['sort_order', 'code']

    def __str__(self) -> str:
        return f'AnnouncementType<{self.code}>'


# ============================================================================
# 2. ANNOUNCEMENT — root entity
# ============================================================================

class Announcement(TimestampedModel):
    """Root publishable announcement."""

    class Priority(models.TextChoices):
        NORMAL = 'NORMAL', _('Normal')
        IMPORTANT = 'IMPORTANT', _('Important')
        URGENT = 'URGENT', _('Urgent')
        PINNED = 'PINNED', _('Pinned')
        INSTITUTIONAL_CRITICAL = 'INSTITUTIONAL_CRITICAL', _('Institutional Critical')

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        PUBLISHED = 'PUBLISHED', _('Published')
        EXPIRED = 'EXPIRED', _('Expired')
        ARCHIVED = 'ARCHIVED', _('Archived')
        HIDDEN = 'HIDDEN', _('Hidden')

    class TargetScope(models.TextChoices):
        ALL_STUDENTS = 'ALL_STUDENTS', _('All students')
        TARGETED = 'TARGETED', _('Targeted audience')
        CUSTOM = 'CUSTOM', _('Custom rules')

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, blank=True, default='', db_index=True)
    summary = models.CharField(max_length=512, blank=True, default='')
    body = models.TextField(blank=True, default='')

    announcement_type = models.ForeignKey(
        AnnouncementType,
        on_delete=models.PROTECT,
        related_name='announcements',
    )
    priority = models.CharField(
        max_length=32,
        choices=Priority.choices,
        default=Priority.NORMAL,
        db_index=True,
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    target_scope = models.CharField(
        max_length=32,
        choices=TargetScope.choices,
        default=TargetScope.ALL_STUDENTS,
        db_index=True,
    )

    publish_start_at = models.DateTimeField(null=True, blank=True, db_index=True)
    publish_end_at = models.DateTimeField(null=True, blank=True, db_index=True)
    application_deadline = models.DateTimeField(null=True, blank=True, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)

    company_name = models.CharField(max_length=255, blank=True, default='')
    external_link = models.URLField(max_length=1024, blank=True, default='')
    cover_image = models.ImageField(
        upload_to='announcements/covers/%Y/%m/',
        null=True,
        blank=True,
    )
    tags = models.JSONField(default=list, blank=True)
    visibility_rules = models.JSONField(default=dict, blank=True)
    recommendation_metadata = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_announcements',
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_announcements',
    )
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posted_announcements',
    )

    is_pinned = models.BooleanField(default=False, db_index=True)
    allow_comments = models.BooleanField(default=False)
    overrides_mute = models.BooleanField(default=False)
    overrides_ban = models.BooleanField(default=False)

    view_count = models.PositiveIntegerField(default=0)
    click_count = models.PositiveIntegerField(default=0)
    save_count = models.PositiveIntegerField(default=0)
    dismiss_count = models.PositiveIntegerField(default=0)
    metadata_json = models.JSONField(default=dict, blank=True)

    # Legacy aliases kept for migration compatibility
    publish_at = models.DateTimeField(null=True, blank=True, db_index=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-is_pinned', '-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', '-published_at']),
            models.Index(fields=['announcement_type', 'status']),
            models.Index(fields=['is_pinned', '-published_at']),
            models.Index(fields=['priority', 'status']),
            models.Index(fields=['publish_start_at', 'publish_end_at']),
        ]

    def __str__(self) -> str:
        return f'Announcement<{self.title}>'

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:240]
            self.slug = f'{base}-{self.uuid.hex[:6]}'
        if self.publish_start_at and not self.publish_at:
            self.publish_at = self.publish_start_at
        if self.publish_end_at and not self.expires_at:
            self.expires_at = self.publish_end_at
        super().save(*args, **kwargs)

    @property
    def is_internship_offer(self) -> bool:
        return hasattr(self, 'internship_details') and self.internship_details_id is not None


# ============================================================================
# 3. INTERNSHIP DETAILS — specialized announcement extension
# ============================================================================

class AnnouncementInternshipDetails(TimestampedModel):
    """Internship-specific metadata for internship offer announcements."""

    class WorkMode(models.TextChoices):
        ON_SITE = 'ON_SITE', _('On-site')
        REMOTE = 'REMOTE', _('Remote')
        HYBRID = 'HYBRID', _('Hybrid')

    class OfferStatus(models.TextChoices):
        OPEN = 'OPEN', _('Open')
        CLOSING_SOON = 'CLOSING_SOON', _('Closing soon')
        CLOSED = 'CLOSED', _('Closed')
        FILLED = 'FILLED', _('Filled')

    announcement = models.OneToOneField(
        Announcement,
        on_delete=models.CASCADE,
        related_name='internship_details',
    )
    internship_type = models.ForeignKey(
        'admin_management.InternshipType',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcement_internships',
    )
    internship_type_code = models.CharField(max_length=64, blank=True, default='')
    duration = models.CharField(max_length=128, blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='')
    work_mode = models.CharField(
        max_length=16,
        choices=WorkMode.choices,
        default=WorkMode.ON_SITE,
    )
    required_skills = models.JSONField(default=list, blank=True)
    technologies = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)
    recruiter_name = models.CharField(max_length=255, blank=True, default='')
    recruiter_email = models.EmailField(blank=True, default='')
    company_sector = models.CharField(max_length=128, blank=True, default='')
    internship_start_date = models.DateField(null=True, blank=True)
    internship_end_date = models.DateField(null=True, blank=True)
    compensation = models.CharField(max_length=255, blank=True, default='')
    offer_status = models.CharField(
        max_length=16,
        choices=OfferStatus.choices,
        default=OfferStatus.OPEN,
        db_index=True,
    )
    linked_offer = models.ForeignKey(
        'stage.InternshipOffer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcement_internship_details',
    )

    class Meta(TimestampedModel.Meta):
        pass

    def __str__(self) -> str:
        return f'InternshipDetails<{self.announcement_id}>'


# ============================================================================
# 4. ANNOUNCEMENT TARGET — audience filters
# ============================================================================

class AnnouncementTarget(TimestampedModel):
    """Audience filter; multiple targets OR within type, AND across types."""

    class TargetType(models.TextChoices):
        ALL = 'ALL', _('All users')
        FILIERE = 'FILIERE', _('Program / Filière')
        CLASS_GROUP = 'CLASS_GROUP', _('Class group')
        ACADEMIC_LEVEL = 'ACADEMIC_LEVEL', _('Academic level')
        ACADEMIC_YEAR = 'ACADEMIC_YEAR', _('Academic year')
        ACADEMIC_SECTOR = 'ACADEMIC_SECTOR', _('Specialization / sector')
        INTERNSHIP_TYPE = 'INTERNSHIP_TYPE', _('Internship type')
        INTERNSHIP_SEEKING = 'INTERNSHIP_SEEKING', _('Students seeking internship')
        ROLE = 'ROLE', _('Role')
        USER = 'USER', _('Specific user')
        LEVEL = 'LEVEL', _('Education level (legacy)')
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
    academic_level = models.ForeignKey(
        'admin_management.AcademicLevel',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='announcement_targets',
    )
    academic_year = models.ForeignKey(
        'admin_management.AcademicYear',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='announcement_targets',
    )
    academic_sector = models.ForeignKey(
        'admin_management.AcademicSector',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='announcement_targets',
    )
    internship_type = models.ForeignKey(
        'admin_management.InternshipType',
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
# 5. ATTACHMENTS
# ============================================================================

class AnnouncementAttachment(TimestampedModel):
    """File or external link attached to an announcement."""

    class AttachmentKind(models.TextChoices):
        FILE = 'FILE', _('File')
        IMAGE = 'IMAGE', _('Image')
        PDF = 'PDF', _('PDF')
        DOCUMENT = 'DOCUMENT', _('Document')
        EXTERNAL_LINK = 'EXTERNAL_LINK', _('External link')

    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    kind = models.CharField(
        max_length=16,
        choices=AttachmentKind.choices,
        default=AttachmentKind.FILE,
    )
    file = models.FileField(upload_to='announcements/%Y/%m/', null=True, blank=True)
    external_url = models.URLField(max_length=1024, blank=True, default='')
    original_filename = models.CharField(max_length=255, blank=True, default='')
    file_size_bytes = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=128, blank=True, default='')
    label = models.CharField(max_length=255, blank=True, default='')
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta(TimestampedModel.Meta):
        ordering = ['sort_order', '-created_at']
        indexes = [models.Index(fields=['announcement'])]

    def __str__(self) -> str:
        return f'Attachment<{self.announcement_id} {self.original_filename}>'


# ============================================================================
# 6. OFFER LINK (bridge to stage.InternshipOffer)
# ============================================================================

class AnnouncementOfferLink(TimestampedModel):
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

    def __str__(self) -> str:
        return f'AnnOfferLink<{self.announcement_id}->{self.offer_id}>'


# ============================================================================
# 7. PUBLICATION AUDIT LOG
# ============================================================================

class AnnouncementPublicationLog(models.Model):
    """Append-only publication / status change history."""

    class Action(models.TextChoices):
        CREATED = 'CREATED', _('Created')
        UPDATED = 'UPDATED', _('Updated')
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        SCHEDULE_MODIFIED = 'SCHEDULE_MODIFIED', _('Schedule modified')
        SCHEDULE_CANCELLED = 'SCHEDULE_CANCELLED', _('Schedule cancelled')
        PUBLISHED = 'PUBLISHED', _('Published')
        AUTO_PUBLISHED = 'AUTO_PUBLISHED', _('Auto published')
        UNPUBLISHED = 'UNPUBLISHED', _('Unpublished')
        ARCHIVED = 'ARCHIVED', _('Archived')
        UNARCHIVED = 'UNARCHIVED', _('Unarchived')
        EXPIRED = 'EXPIRED', _('Expired')
        HIDDEN = 'HIDDEN', _('Hidden')
        DUPLICATED = 'DUPLICATED', _('Duplicated')

    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name='publication_logs',
    )
    action = models.CharField(max_length=20, choices=Action.choices, db_index=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    previous_status = models.CharField(max_length=16, blank=True, default='')
    new_status = models.CharField(max_length=16, blank=True, default='')
    note = models.TextField(blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'PubLog<{self.announcement_id} {self.action}>'


# ============================================================================
# 8. STUDENT ACTIONS
# ============================================================================

class StudentAnnouncementAction(models.Model):
    class ActionType(models.TextChoices):
        VIEW = 'VIEW', _('View')
        CLICK = 'CLICK', _('Click')
        SAVE = 'SAVE', _('Save')
        DISMISS = 'DISMISS', _('Dismiss')
        SHARE = 'SHARE', _('Share')
        FOLLOW = 'FOLLOW', _('Follow')
        UNFOLLOW = 'UNFOLLOW', _('Unfollow')
        READ_TIME = 'READ_TIME', _('Read time')

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


# ============================================================================
# 9. STUDENT BOOKMARKS (save / follow)
# ============================================================================

class StudentAnnouncementBookmark(TimestampedModel):
    class BookmarkType(models.TextChoices):
        SAVE = 'SAVE', _('Saved')
        FAVORITE = 'FAVORITE', _('Favorite')
        FOLLOW = 'FOLLOW', _('Following')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='announcement_bookmarks',
    )
    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name='bookmarks',
    )
    bookmark_type = models.CharField(
        max_length=16,
        choices=BookmarkType.choices,
        default=BookmarkType.SAVE,
    )

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['student_profile', 'announcement', 'bookmark_type'],
                name='uniq_student_announcement_bookmark',
            ),
        ]


# ============================================================================
# 10. RECOMMENDATION SCORE
# ============================================================================

class RecommendationScore(TimestampedModel):
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
    score = models.DecimalField(max_digits=5, decimal_places=2)
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


# ============================================================================
# 11. STUDENT PREFERENCES (mute / ban / favorite per type)
# ============================================================================

class StudentAnnouncementPreference(TimestampedModel):
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
    is_banned = models.BooleanField(default=False, db_index=True)
    is_favorite = models.BooleanField(default=False, db_index=True)

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['student_profile', 'announcement_type'],
                name='uniq_preference_per_student_type',
            ),
        ]
