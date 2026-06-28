"""CV Intelligence domain models."""

from __future__ import annotations

import uuid

from django.db import models
from django.utils import timezone

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


class InterviewSession(TimestampedModel):
    class Mode(models.TextChoices):
        PROFILE = 'profile', 'Profile Interview'
        OFFER = 'offer', 'Offer Interview'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        ABANDONED = 'abandoned', 'Abandoned'

    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='interview_sessions',
    )
    offer_uuid = models.UUIDField(null=True, blank=True, db_index=True)
    external_offer_url = models.URLField(max_length=2048, blank=True, default='')
    mode = models.CharField(max_length=24, choices=Mode.choices)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.DRAFT)
    language = models.CharField(max_length=8, default='fr')
    llm_provider = models.CharField(max_length=64, blank=True, default='')
    llm_model = models.CharField(max_length=128, blank=True, default='')
    duration_seconds = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_activity_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student_profile', '-created_at']),
            models.Index(fields=['student_profile', 'status', '-created_at']),
            models.Index(fields=['student_profile', 'mode', '-created_at']),
        ]


class InterviewConfiguration(TimestampedModel):
    class Difficulty(models.TextChoices):
        EASY = 'easy', 'Easy'
        MEDIUM = 'medium', 'Medium'
        HARD = 'hard', 'Hard'

    class CommunicationMode(models.TextChoices):
        TEXT = 'text', 'Text'
        VOICE = 'voice', 'Voice'
        VOICE_TEXT = 'voice_text', 'Voice + Text'

    class InterviewType(models.TextChoices):
        HR = 'hr', 'HR'
        TECHNICAL = 'technical', 'Technical'
        BEHAVIORAL = 'behavioral', 'Behavioral'
        CASE_STUDY = 'case_study', 'Case Study'
        MIXED = 'mixed', 'Mixed'

    id = models.BigAutoField(primary_key=True)
    session = models.OneToOneField(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name='configuration',
    )
    difficulty = models.CharField(max_length=16, choices=Difficulty.choices, default=Difficulty.MEDIUM)
    duration_minutes = models.PositiveSmallIntegerField(default=20)
    communication_mode = models.CharField(
        max_length=16,
        choices=CommunicationMode.choices,
        default=CommunicationMode.TEXT,
    )
    interview_type = models.CharField(
        max_length=16,
        choices=InterviewType.choices,
        default=InterviewType.MIXED,
    )
    recruiter_profile = models.CharField(max_length=255, blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)


class InterviewContextSummary(TimestampedModel):
    id = models.BigAutoField(primary_key=True)
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='interview_context_summaries',
    )
    summary_key = models.CharField(max_length=64)
    summary_text = models.TextField(blank=True, default='')
    source_hash = models.CharField(max_length=64, blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-updated_at']
        unique_together = [('student_profile', 'summary_key')]
        indexes = [
            models.Index(fields=['student_profile', 'summary_key']),
        ]


class InterviewQuestion(TimestampedModel):
    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name='questions',
    )
    order_index = models.PositiveIntegerField(default=1)
    question_text = models.TextField()
    category = models.CharField(max_length=32, blank=True, default='')
    rationale = models.TextField(blank=True, default='')
    is_follow_up = models.BooleanField(default=False)
    asked_at = models.DateTimeField(default=timezone.now)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['order_index', 'created_at']
        unique_together = [('session', 'order_index')]
        indexes = [
            models.Index(fields=['session', 'order_index']),
        ]


class InterviewAnswer(TimestampedModel):
    id = models.BigAutoField(primary_key=True)
    question = models.OneToOneField(
        InterviewQuestion,
        on_delete=models.CASCADE,
        related_name='answer',
    )
    answer_text = models.TextField(blank=True, default='')
    answered_at = models.DateTimeField(default=timezone.now)
    answer_language = models.CharField(max_length=8, blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)


class InterviewEvaluation(TimestampedModel):
    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name='evaluations',
    )
    question = models.ForeignKey(
        InterviewQuestion,
        on_delete=models.CASCADE,
        related_name='evaluations',
        null=True,
        blank=True,
    )
    communication_score = models.PositiveSmallIntegerField(default=0)
    confidence_score = models.PositiveSmallIntegerField(default=0)
    technical_score = models.PositiveSmallIntegerField(default=0)
    problem_solving_score = models.PositiveSmallIntegerField(default=0)
    professionalism_score = models.PositiveSmallIntegerField(default=0)
    soft_skills_score = models.PositiveSmallIntegerField(default=0)
    language_quality_score = models.PositiveSmallIntegerField(default=0)
    relevance_score = models.PositiveSmallIntegerField(default=0)
    overall_score = models.PositiveSmallIntegerField(default=0)
    strengths_json = models.JSONField(default=list, blank=True)
    weaknesses_json = models.JSONField(default=list, blank=True)
    missing_skills_json = models.JSONField(default=list, blank=True)
    ideal_answer = models.TextField(blank=True, default='')
    improvement_tips_json = models.JSONField(default=list, blank=True)
    readiness_label = models.CharField(max_length=32, blank=True, default='')
    is_final = models.BooleanField(default=False)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'is_final', '-created_at']),
            models.Index(fields=['question', '-created_at']),
        ]


class InterviewFeedback(TimestampedModel):
    id = models.BigAutoField(primary_key=True)
    session = models.OneToOneField(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name='feedback',
    )
    strengths = models.TextField(blank=True, default='')
    weaknesses = models.TextField(blank=True, default='')
    missing_skills = models.TextField(blank=True, default='')
    improvement_recommendations = models.TextField(blank=True, default='')
    interview_readiness = models.CharField(max_length=64, blank=True, default='')
    offer_comparison_json = models.JSONField(default=dict, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)


class InterviewTranscript(TimestampedModel):
    id = models.BigAutoField(primary_key=True)
    session = models.OneToOneField(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name='transcript',
    )
    transcript_text = models.TextField(blank=True, default='')
    transcript_json = models.JSONField(default=list, blank=True)
