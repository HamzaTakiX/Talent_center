"""CV Intelligence domain models."""

from __future__ import annotations

import uuid

from django.db import models

from apps.accounts_et_roles.models import StudentProfile, TimestampedModel
from apps.cv_builder.models import StudentCv

from .constants import AnalysisStatus, CvSourceType


class CvStructuredData(TimestampedModel):
    """Structured CV content extracted from PDF, DOCX, or CV Builder."""

    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='cv_structured_data',
    )
    student_cv = models.ForeignKey(
        StudentCv,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='structured_extractions',
    )
    source_type = models.CharField(max_length=20, choices=CvSourceType.choices)
    source_filename = models.CharField(max_length=255, blank=True, default='')
    raw_text = models.TextField(blank=True, default='')
    detected_languages = models.JSONField(default=list, blank=True)
    structured_json = models.JSONField(default=dict, blank=True)
    extraction_metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student_profile', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'CvStructuredData<{self.pk} {self.source_type}>'


class CvIntelligenceReport(TimestampedModel):
    """Full career intelligence analysis — persisted for history and evolution tracking."""

    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='cv_intelligence_reports',
    )
    student_cv = models.ForeignKey(
        StudentCv,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='intelligence_reports',
    )
    structured_data = models.ForeignKey(
        CvStructuredData,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reports',
    )
    previous_report = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='successor_reports',
    )
    source_type = models.CharField(max_length=20, choices=CvSourceType.choices)
    status = models.CharField(
        max_length=16,
        choices=AnalysisStatus.choices,
        default=AnalysisStatus.COMPLETED,
    )
    provider = models.CharField(max_length=32, blank=True, default='')
    ai_model = models.CharField(max_length=64, blank=True, default='')
    detected_languages = models.JSONField(default=list, blank=True)

    global_score = models.PositiveSmallIntegerField(default=0)
    skills_score = models.PositiveSmallIntegerField(default=0)
    experience_score = models.PositiveSmallIntegerField(default=0)
    education_score = models.PositiveSmallIntegerField(default=0)
    formatting_score = models.PositiveSmallIntegerField(default=0)
    ats_score = models.PositiveSmallIntegerField(default=0)
    readiness_score = models.PositiveSmallIntegerField(default=0)
    potential_score = models.PositiveSmallIntegerField(default=0)

    semantic_profile_json = models.JSONField(default=dict, blank=True)
    swot_json = models.JSONField(default=dict, blank=True)
    ats_analysis_json = models.JSONField(default=dict, blank=True)
    score_explanations_json = models.JSONField(default=dict, blank=True)
    internship_matches_json = models.JSONField(default=list, blank=True)
    missing_skills_json = models.JSONField(default=list, blank=True)
    recommended_skills_json = models.JSONField(default=list, blank=True)
    roadmap_json = models.JSONField(default=list, blank=True)
    interview_prep_json = models.JSONField(default=list, blank=True)
    dashboard_json = models.JSONField(default=dict, blank=True)
    raw_response_json = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, default='')
    analyzed_at = models.DateTimeField(auto_now_add=True)
    cv_hash = models.CharField(max_length=64, blank=True, default='', db_index=True)
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-analyzed_at']
        indexes = [
            models.Index(fields=['student_profile', '-analyzed_at']),
            models.Index(fields=['student_cv', '-analyzed_at']),
            models.Index(fields=['student_profile', 'is_active', '-analyzed_at']),
            models.Index(fields=['student_profile', 'cv_hash']),
        ]

    def __str__(self) -> str:
        return f'CvIntelligenceReport<{self.pk} score={self.global_score}>'

    @property
    def score_delta(self) -> int | None:
        if not self.previous_report:
            return None
        return self.global_score - self.previous_report.global_score
