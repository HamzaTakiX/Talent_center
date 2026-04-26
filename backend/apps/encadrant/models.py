"""
Encadrant / Supervision domain models.

Identity contract:
- The canonical encadrant identity is `admin_management.EncadrantProfile`,
  itself 1-1 with `accounts_et_roles.SupervisorProfile`. This app does
  NOT define a duplicate `Encadrant` table — every supervision-workflow
  model below references `EncadrantProfile` via FK.
- Spec note: the diagram lists "encadrants" as a table inside this app,
  but in Django that would be a third identity layer with no fields
  beyond the FK. Per the user's directive ("if a table already exists,
  reference by FK; do not recreate"), we collapse it.
"""

from django.conf import settings
from django.db import models
from django.db.models import Q, UniqueConstraint
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import StudentProfile, TimestampedModel


# ============================================================================
# 1. WORKSPACE — supervision context (project / cohort / team)
# ============================================================================

class Workspace(TimestampedModel):
    """Container for supervision activity (a project, cohort, or team)."""

    class WorkspaceType(models.TextChoices):
        PROJECT = 'PROJECT', _('Project')
        COHORT = 'COHORT', _('Cohort')
        TEAM = 'TEAM', _('Team')
        INDIVIDUAL = 'INDIVIDUAL', _('Individual')

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        PAUSED = 'PAUSED', _('Paused')
        CLOSED = 'CLOSED', _('Closed')
        ARCHIVED = 'ARCHIVED', _('Archived')

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    workspace_type = models.CharField(
        max_length=16,
        choices=WorkspaceType.choices,
        default=WorkspaceType.PROJECT,
        db_index=True,
    )
    owner_encadrant = models.ForeignKey(
        'admin_management.EncadrantProfile',
        on_delete=models.PROTECT,
        related_name='owned_workspaces',
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['owner_encadrant', 'status']),
            models.Index(fields=['workspace_type', 'status']),
        ]

    def __str__(self) -> str:
        return f'Workspace<{self.code}>'


# ============================================================================
# 2. SUPERVISED STUDENT — encadrant ↔ student link
# ============================================================================

class SupervisedStudent(TimestampedModel):
    """Period-bounded supervision relationship between encadrant and student."""

    class Role(models.TextChoices):
        PRIMARY = 'PRIMARY', _('Primary supervisor')
        CO_SUPERVISOR = 'CO_SUPERVISOR', _('Co-supervisor')
        EXTERNAL = 'EXTERNAL', _('External supervisor')
        JURY = 'JURY', _('Jury member')

    encadrant_profile = models.ForeignKey(
        'admin_management.EncadrantProfile',
        on_delete=models.CASCADE,
        related_name='supervised_students',
    )
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='supervisions',
    )
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervised_students',
    )
    role = models.CharField(
        max_length=16,
        choices=Role.choices,
        default=Role.PRIMARY,
        db_index=True,
    )
    period_start = models.DateField()
    period_end = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    notes = models.TextField(blank=True, default='')

    class Meta(TimestampedModel.Meta):
        ordering = ['-period_start', '-created_at']
        constraints = [
            # At most one active PRIMARY supervisor per (student, workspace).
            UniqueConstraint(
                fields=['student_profile', 'workspace', 'role'],
                condition=Q(is_active=True, role='PRIMARY'),
                name='uniq_active_primary_supervisor_per_student_workspace',
            ),
        ]
        indexes = [
            models.Index(fields=['encadrant_profile', 'is_active']),
            models.Index(fields=['student_profile', 'is_active']),
            models.Index(fields=['workspace', 'is_active']),
        ]

    def __str__(self) -> str:
        return f'Supervision<{self.encadrant_profile_id}->{self.student_profile_id} {self.role}>'


# ============================================================================
# 3. MEETING
# ============================================================================

class Meeting(TimestampedModel):
    """Scheduled or held meeting between an encadrant and one or more students."""

    class MeetingType(models.TextChoices):
        ONE_ON_ONE = 'ONE_ON_ONE', _('One-on-one')
        GROUP = 'GROUP', _('Group')
        JURY = 'JURY', _('Jury session')
        REVIEW = 'REVIEW', _('Review')
        MILESTONE = 'MILESTONE', _('Milestone')

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        IN_PROGRESS = 'IN_PROGRESS', _('In progress')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')
        NO_SHOW = 'NO_SHOW', _('No-show')

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='meetings',
    )
    encadrant_profile = models.ForeignKey(
        'admin_management.EncadrantProfile',
        on_delete=models.CASCADE,
        related_name='meetings',
    )
    students = models.ManyToManyField(
        StudentProfile,
        blank=True,
        related_name='meetings',
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    meeting_type = models.CharField(
        max_length=16,
        choices=MeetingType.choices,
        default=MeetingType.ONE_ON_ONE,
        db_index=True,
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True,
    )
    scheduled_at = models.DateTimeField(db_index=True)
    duration_minutes = models.PositiveSmallIntegerField(default=30)
    location = models.CharField(max_length=255, blank=True, default='')
    meeting_url = models.URLField(max_length=512, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-scheduled_at']
        indexes = [
            models.Index(fields=['encadrant_profile', '-scheduled_at']),
            models.Index(fields=['workspace', '-scheduled_at']),
            models.Index(fields=['status', '-scheduled_at']),
        ]

    def __str__(self) -> str:
        return f'Meeting<{self.title} {self.scheduled_at:%Y-%m-%d}>'


# ============================================================================
# 4. AGENDA EVENT — calendar entry
# ============================================================================

class AgendaEvent(TimestampedModel):
    """Calendar entry for an encadrant (meeting, deadline, OOO, etc.)."""

    class EventType(models.TextChoices):
        MEETING = 'MEETING', _('Meeting')
        DEADLINE = 'DEADLINE', _('Deadline')
        REMINDER = 'REMINDER', _('Reminder')
        OUT_OF_OFFICE = 'OUT_OF_OFFICE', _('Out of office')
        OTHER = 'OTHER', _('Other')

    encadrant_profile = models.ForeignKey(
        'admin_management.EncadrantProfile',
        on_delete=models.CASCADE,
        related_name='agenda_events',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    event_type = models.CharField(
        max_length=16,
        choices=EventType.choices,
        default=EventType.MEETING,
        db_index=True,
    )
    start_at = models.DateTimeField(db_index=True)
    end_at = models.DateTimeField()
    all_day = models.BooleanField(default=False)
    color = models.CharField(max_length=16, blank=True, default='')
    related_meeting = models.ForeignKey(
        Meeting,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='agenda_events',
    )
    related_task = models.ForeignKey(
        'encadrant.Task',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='agenda_events',
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['start_at']
        indexes = [
            models.Index(fields=['encadrant_profile', 'start_at']),
            models.Index(fields=['event_type', 'start_at']),
        ]

    def __str__(self) -> str:
        return f'AgendaEvent<{self.title} {self.start_at:%Y-%m-%d}>'


# ============================================================================
# 5. TASK
# ============================================================================

class Task(TimestampedModel):
    """Action item assigned within a workspace."""

    class Status(models.TextChoices):
        TODO = 'TODO', _('To do')
        IN_PROGRESS = 'IN_PROGRESS', _('In progress')
        DONE = 'DONE', _('Done')
        BLOCKED = 'BLOCKED', _('Blocked')
        CANCELLED = 'CANCELLED', _('Cancelled')

    class Priority(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        URGENT = 'URGENT', _('Urgent')

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    assigned_to_student = models.ForeignKey(
        StudentProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks',
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.TODO,
        db_index=True,
    )
    priority = models.CharField(
        max_length=16,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
    )
    due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['status', '-priority', 'due_at']
        indexes = [
            models.Index(fields=['workspace', 'status']),
            models.Index(fields=['assigned_to_student', 'status']),
            models.Index(fields=['status', 'due_at']),
        ]

    def __str__(self) -> str:
        return f'Task<{self.title} {self.status}>'


# ============================================================================
# 6. REPORT
# ============================================================================

class Report(TimestampedModel):
    """Supervision report (progress, evaluation, final, incident...)."""

    class ReportType(models.TextChoices):
        PROGRESS = 'PROGRESS', _('Progress')
        EVALUATION = 'EVALUATION', _('Evaluation')
        INTERIM = 'INTERIM', _('Interim')
        FINAL = 'FINAL', _('Final')
        INCIDENT = 'INCIDENT', _('Incident')

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        SUBMITTED = 'SUBMITTED', _('Submitted')
        REVIEWED = 'REVIEWED', _('Reviewed')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports',
    )
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='supervision_reports',
    )
    encadrant_profile = models.ForeignKey(
        'admin_management.EncadrantProfile',
        on_delete=models.CASCADE,
        related_name='authored_reports',
    )
    title = models.CharField(max_length=255)
    report_type = models.CharField(
        max_length=16,
        choices=ReportType.choices,
        default=ReportType.PROGRESS,
        db_index=True,
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_supervision_reports',
    )
    score = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
        help_text=_('Optional 0.00 - 100.00 evaluation score.'),
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student_profile', '-created_at']),
            models.Index(fields=['encadrant_profile', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'Report<{self.title} {self.status}>'


# ============================================================================
# 7. REPORT VERSION
# ============================================================================

class ReportVersion(TimestampedModel):
    """Immutable version snapshot of a Report."""

    report = models.ForeignKey(
        Report,
        on_delete=models.CASCADE,
        related_name='versions',
    )
    version_number = models.PositiveIntegerField()
    content_json = models.JSONField(default=dict, blank=True)
    change_note = models.CharField(max_length=255, blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-version_number']
        constraints = [
            UniqueConstraint(
                fields=['report', 'version_number'],
                name='uniq_report_version_number',
            ),
        ]

    def __str__(self) -> str:
        return f'ReportVersion<{self.report_id}#{self.version_number}>'
