"""
CV Builder domain models.

Responsibility boundary:
- This app owns CV templates, student CV instances, editable sections,
  uploaded assets, version snapshots, and AI analysis history.
- Ownership always flows through StudentCv.student_profile.user.
- Content is stored as structured JSON per section (never as HTML blobs),
  so templates can be switched without content loss.
"""

import uuid

from django.conf import settings
from django.db import models
from django.utils.text import slugify

from apps.accounts_et_roles.models import StudentProfile, TimestampedModel

from .constants import (
    AssetType,
    CvStatus,
    SectionType,
    TemplateCategory,
)


# ============================================================================
# Templates
# ============================================================================

class CvTemplate(TimestampedModel):
    """Reusable master template definition (layout + default style)."""

    id = models.BigAutoField(primary_key=True)
    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default='')
    preview_image = models.ImageField(upload_to='cv/templates/', blank=True, null=True)
    category = models.CharField(
        max_length=16,
        choices=TemplateCategory.choices,
        default=TemplateCategory.MODERN,
    )
    # layout_schema describes slots, columns, and the default section order.
    # style_schema describes colour/typography/spacing tokens.
    layout_schema = models.JSONField(default=dict, blank=True)
    style_schema = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_default', 'category', 'name']
        indexes = [
            models.Index(fields=['is_active', 'is_default']),
        ]

    def __str__(self) -> str:
        return f'CvTemplate<{self.code}>'


# ============================================================================
# Student CV instances
# ============================================================================

class StudentCv(TimestampedModel):
    """One editable CV owned by a single StudentProfile."""

    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='cvs',
    )
    template = models.ForeignKey(
        CvTemplate,
        on_delete=models.PROTECT,
        related_name='student_cvs',
    )

    title = models.CharField(max_length=160, default='My CV')
    slug = models.SlugField(max_length=180, blank=True, default='')
    is_primary = models.BooleanField(default=False)
    status = models.CharField(
        max_length=16,
        choices=CvStatus.choices,
        default=CvStatus.DRAFT,
    )

    current_score = models.PositiveSmallIntegerField(null=True, blank=True)
    last_analyzed_at = models.DateTimeField(null=True, blank=True)
    last_exported_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-is_primary', '-updated_at']
        indexes = [
            models.Index(fields=['student_profile', 'is_primary']),
            models.Index(fields=['student_profile', 'status']),
        ]
        constraints = [
            # At most one primary CV per student.
            models.UniqueConstraint(
                fields=['student_profile'],
                condition=models.Q(is_primary=True),
                name='uniq_primary_cv_per_student',
            ),
        ]

    def __str__(self) -> str:
        return f'StudentCv<{self.pk} {self.title}>'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f'{self.title}-{self.uuid.hex[:6]}')[:180]
        super().save(*args, **kwargs)


# ============================================================================
# Sections
# ============================================================================

class CvSection(TimestampedModel):
    """One editable block of a CV. Content is stored as structured JSON."""

    id = models.BigAutoField(primary_key=True)
    student_cv = models.ForeignKey(
        StudentCv,
        on_delete=models.CASCADE,
        related_name='sections',
    )
    section_type = models.CharField(max_length=32, choices=SectionType.choices)
    label = models.CharField(max_length=128)
    order_index = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    # Template slot mapping (e.g. 'left', 'main') — assigned during
    # template switching. Empty string = template default.
    slot_name = models.CharField(max_length=64, blank=True, default='')
    # Per-section display tweaks (font_weight, alignment, accent_color...).
    config_json = models.JSONField(default=dict, blank=True)
    # Actual section content, shape depends on section_type (see schemas.py).
    content_json = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['order_index', 'id']
        indexes = [
            models.Index(fields=['student_cv', 'order_index']),
        ]

    def __str__(self) -> str:
        return f'CvSection<{self.pk} {self.section_type}>'


# ============================================================================
# Assets (profile photo, attachments)
# ============================================================================

class CvAsset(TimestampedModel):
    """Binary asset attached to a CV (e.g. profile image)."""

    id = models.BigAutoField(primary_key=True)
    student_cv = models.ForeignKey(
        StudentCv,
        on_delete=models.CASCADE,
        related_name='assets',
    )
    asset_type = models.CharField(max_length=32, choices=AssetType.choices)
    file = models.FileField(upload_to='cv/assets/%Y/%m/')
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['student_cv', 'asset_type']),
        ]

    def __str__(self) -> str:
        return f'CvAsset<{self.pk} {self.asset_type}>'


# ============================================================================
# Version history
# ============================================================================

class CvVersion(TimestampedModel):
    """Immutable snapshot of a CV state, usable for rollback."""

    id = models.BigAutoField(primary_key=True)
    student_cv = models.ForeignKey(
        StudentCv,
        on_delete=models.CASCADE,
        related_name='versions',
    )
    version_number = models.PositiveIntegerField()
    snapshot_json = models.JSONField()
    change_note = models.CharField(max_length=255, blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
    )

    class Meta:
        ordering = ['-version_number']
        constraints = [
            models.UniqueConstraint(
                fields=['student_cv', 'version_number'],
                name='uniq_version_number_per_cv',
            ),
        ]

    def __str__(self) -> str:
        return f'CvVersion<{self.student_cv_id}#{self.version_number}>'


# ============================================================================
# AI analysis
# ============================================================================

class CvAiAnalysis(TimestampedModel):
    """Stored result of an AI analysis pass. History is preserved."""

    id = models.BigAutoField(primary_key=True)
    student_cv = models.ForeignKey(
        StudentCv,
        on_delete=models.CASCADE,
        related_name='analyses',
    )
    score = models.PositiveSmallIntegerField()
    suggestions_json = models.JSONField(default=list, blank=True)
    strengths_json = models.JSONField(default=list, blank=True)
    weaknesses_json = models.JSONField(default=list, blank=True)
    raw_response_json = models.JSONField(default=dict, blank=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)
    provider = models.CharField(max_length=32, blank=True, default='')

    class Meta:
        ordering = ['-analyzed_at']
        indexes = [
            models.Index(fields=['student_cv', '-analyzed_at']),
        ]

    def __str__(self) -> str:
        return f'CvAiAnalysis<{self.student_cv_id} score={self.score}>'


# ============================================================================
# Public share links
# ============================================================================

class CvShareLink(TimestampedModel):
    """Public, revocable share token for a CV.

    A token resolves to a read-only, schema-driven view of a single CV. Owners
    can revoke (``is_active=False``) or set an ``expires_at``; the public view
    must check both before returning data.
    """

    id = models.BigAutoField(primary_key=True)
    student_cv = models.ForeignKey(
        StudentCv,
        on_delete=models.CASCADE,
        related_name='share_links',
    )
    token = models.CharField(max_length=48, unique=True, editable=False)
    label = models.CharField(max_length=128, blank=True, default='')
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    view_count = models.PositiveIntegerField(default=0)
    last_viewed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student_cv', 'is_active']),
        ]

    def __str__(self) -> str:
        return f'CvShareLink<{self.token} cv={self.student_cv_id}>'

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = uuid.uuid4().hex
        super().save(*args, **kwargs)
