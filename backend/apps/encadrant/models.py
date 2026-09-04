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

import uuid

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
# 3. MEETING — academic supervision agenda
# ============================================================================

class Meeting(TimestampedModel):
    """Supervision meeting between an encadrant and a supervised student."""

    class MeetingType(models.TextChoices):
        FOLLOW_UP = 'FOLLOW_UP', _('Follow-up Meeting')
        INTERNSHIP_COACHING = 'INTERNSHIP_COACHING', _('Internship Coaching')
        PROGRESS_REVIEW = 'PROGRESS_REVIEW', _('Progress Review')
        MID_TERM_EVAL = 'MID_TERM_EVAL', _('Mid-term Evaluation')
        FINAL_EVAL = 'FINAL_EVAL', _('Final Evaluation')
        PROBLEM_RESOLUTION = 'PROBLEM_RESOLUTION', _('Problem Resolution')
        EMERGENCY = 'EMERGENCY', _('Emergency Meeting')
        ORIENTATION = 'ORIENTATION', _('Orientation Meeting')
        ONLINE = 'ONLINE', _('Online Meeting')
        COMPANY_FOLLOWUP = 'COMPANY_FOLLOWUP', _('Company Follow-up')
        # Legacy
        ONE_ON_ONE = 'ONE_ON_ONE', _('One-on-one (legacy)')
        GROUP = 'GROUP', _('Group (legacy)')
        JURY = 'JURY', _('Jury session (legacy)')
        REVIEW = 'REVIEW', _('Review (legacy)')
        MILESTONE = 'MILESTONE', _('Milestone (legacy)')

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        COMPLETED = 'COMPLETED', _('Completed')
        DELAYED = 'DELAYED', _('Delayed')
        RESCHEDULED = 'RESCHEDULED', _('Rescheduled')
        CANCELLED = 'CANCELLED', _('Cancelled')
        MISSED = 'MISSED', _('Missed')
        NEEDS_FOLLOWUP = 'NEEDS_FOLLOWUP', _('Needs Follow-up')
        NO_SHOW = 'NO_SHOW', _('No-show (legacy)')

    class MeetingMode(models.TextChoices):
        IN_PERSON = 'IN_PERSON', _('In person')
        ONLINE = 'ONLINE', _('Online')
        HYBRID = 'HYBRID', _('Hybrid')

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
        related_name='meetings',
    )
    encadrant_profile = models.ForeignKey(
        'admin_management.EncadrantProfile',
        on_delete=models.CASCADE,
        related_name='meetings',
    )
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='supervision_meetings',
        null=True,
        blank=True,
    )
    assignment = models.ForeignKey(
        'admin_management.Assignment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_meetings',
    )
    students = models.ManyToManyField(
        StudentProfile,
        blank=True,
        related_name='meetings',
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    meeting_type = models.CharField(
        max_length=24,
        choices=MeetingType.choices,
        default=MeetingType.FOLLOW_UP,
        db_index=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
        db_index=True,
    )
    priority = models.CharField(
        max_length=16,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
    )
    meeting_mode = models.CharField(
        max_length=16,
        choices=MeetingMode.choices,
        default=MeetingMode.IN_PERSON,
        db_index=True,
    )
    planned_start = models.DateTimeField(db_index=True, null=True, blank=True)
    planned_end = models.DateTimeField(db_index=True, null=True, blank=True)
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(db_index=True, null=True, blank=True)
    duration_minutes = models.PositiveSmallIntegerField(default=30)
    location = models.CharField(max_length=255, blank=True, default='')
    meeting_url = models.URLField(max_length=512, blank=True, default='')
    session_uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
    )
    jitsi_room_name = models.CharField(
        max_length=128,
        unique=True,
        blank=True,
        null=True,
        db_index=True,
    )
    notes = models.TextField(blank=True, default='')
    follow_up_actions = models.TextField(blank=True, default='')
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    next_suggested_at = models.DateTimeField(null=True, blank=True)
    is_recurring = models.BooleanField(default=False, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_supervision_meetings',
    )
    # Academic snapshot
    filiere = models.ForeignKey(
        'admin_management.Filiere',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_meetings',
    )
    academic_level = models.ForeignKey(
        'admin_management.AcademicLevel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_meetings',
    )
    academic_sector = models.ForeignKey(
        'admin_management.AcademicSector',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_meetings',
    )
    class_group = models.ForeignKey(
        'admin_management.ClassGroup',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_meetings',
    )
    academic_year = models.ForeignKey(
        'admin_management.AcademicYear',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_meetings',
    )
    internship_type = models.ForeignKey(
        'admin_management.InternshipType',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_meetings',
    )
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-planned_start', '-scheduled_at']
        indexes = [
            models.Index(fields=['encadrant_profile', '-planned_start']),
            models.Index(fields=['student_profile', '-planned_start']),
            models.Index(fields=['workspace', '-planned_start']),
            models.Index(fields=['status', '-planned_start']),
            models.Index(fields=['meeting_type', 'status']),
        ]

    def save(self, *args, **kwargs):
        if self.planned_start and not self.planned_end:
            from datetime import timedelta
            self.planned_end = self.planned_start + timedelta(minutes=self.duration_minutes or 30)
        if self.planned_start and not self.scheduled_at:
            self.scheduled_at = self.planned_start
        if self.scheduled_at and not self.planned_start:
            self.planned_start = self.scheduled_at
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        when = self.planned_start or self.scheduled_at
        label = when.strftime('%Y-%m-%d') if when else 'unscheduled'
        return f'Meeting<{self.title} {label}>'


class MeetingAttachment(TimestampedModel):
    """File attached to a supervision meeting."""

    meeting = models.ForeignKey(
        Meeting,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    file = models.FileField(upload_to='supervision_meetings/%Y/%m/')
    original_name = models.CharField(max_length=255, blank=True, default='')
    mime_type = models.CharField(max_length=128, blank=True, default='')
    size_bytes = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'MeetingAttachment<{self.meeting_id}:{self.original_name}>'


class MeetingTimelineEvent(models.Model):
    """Immutable audit trail for meeting status and scheduling changes."""

    class Action(models.TextChoices):
        CREATED = 'CREATED', _('Created')
        UPDATED = 'UPDATED', _('Updated')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        STARTED = 'STARTED', _('Started')
        COMPLETED = 'COMPLETED', _('Completed')
        DELAYED = 'DELAYED', _('Delayed')
        RESCHEDULED = 'RESCHEDULED', _('Rescheduled')
        CANCELLED = 'CANCELLED', _('Cancelled')
        MISSED = 'MISSED', _('Missed')
        NEEDS_FOLLOWUP = 'NEEDS_FOLLOWUP', _('Needs follow-up')
        REMINDER_SENT = 'REMINDER_SENT', _('Reminder sent')
        NOTE_ADDED = 'NOTE_ADDED', _('Note added')
        NOTIFIED = 'NOTIFIED', _('Notification sent')

    meeting = models.ForeignKey(
        Meeting,
        on_delete=models.CASCADE,
        related_name='timeline_events',
    )
    action = models.CharField(max_length=32, choices=Action.choices, db_index=True)
    from_status = models.CharField(max_length=20, blank=True, default='')
    to_status = models.CharField(max_length=20, blank=True, default='')
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    note = models.TextField(blank=True, default='')
    payload_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['created_at']
        indexes = [models.Index(fields=['meeting', 'created_at'])]

    def __str__(self) -> str:
        return f'MeetingTimelineEvent<{self.meeting_id}:{self.action}>'


class MeetingRecurrence(TimestampedModel):
    """Recurrence rule for supervision meetings."""

    class Frequency(models.TextChoices):
        WEEKLY = 'WEEKLY', _('Weekly')
        BIWEEKLY = 'BIWEEKLY', _('Bi-weekly')
        MONTHLY = 'MONTHLY', _('Monthly')

    meeting = models.OneToOneField(
        Meeting,
        on_delete=models.CASCADE,
        related_name='recurrence',
    )
    frequency = models.CharField(max_length=16, choices=Frequency.choices, default=Frequency.WEEKLY)
    interval_count = models.PositiveSmallIntegerField(default=1)
    until_date = models.DateField(null=True, blank=True)
    occurrences_count = models.PositiveSmallIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'MeetingRecurrence<{self.meeting_id} {self.frequency}>'


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
    """Supervision action item assigned by an encadrant to a supervised student."""

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
    """Supervision report (ERMS) — progress, evaluation, risk, validation, etc."""

    class ReportType(models.TextChoices):
        FOLLOW_UP = 'FOLLOW_UP', _('Follow-up report')
        MID_TERM = 'MID_TERM', _('Mid-term evaluation')
        FINAL = 'FINAL', _('Final evaluation')
        RISK_ALERT = 'RISK_ALERT', _('Risk alert')
        ATTENDANCE = 'ATTENDANCE', _('Attendance issue')
        VALIDATION = 'VALIDATION', _('Internship validation')
        COMPANY_ISSUE = 'COMPANY_ISSUE', _('Company problem')
        RECOMMENDATION = 'RECOMMENDATION', _('Recommendation')
        PERFORMANCE = 'PERFORMANCE', _('Student performance')
        # Legacy codes (read-only compatibility)
        PROGRESS = 'PROGRESS', _('Progress (legacy)')
        EVALUATION = 'EVALUATION', _('Evaluation (legacy)')
        INTERIM = 'INTERIM', _('Interim (legacy)')
        INCIDENT = 'INCIDENT', _('Incident (legacy)')

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        SUBMITTED = 'SUBMITTED', _('Submitted')
        UNDER_REVIEW = 'UNDER_REVIEW', _('Under review')
        REQUIRES_CHANGES = 'REQUIRES_CHANGES', _('Requires changes')
        RESUBMITTED = 'RESUBMITTED', _('Resubmitted')
        ESCALATED = 'ESCALATED', _('Escalated')
        CRITICAL_REVIEW = 'CRITICAL_REVIEW', _('Critical review')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
        ARCHIVED = 'ARCHIVED', _('Archived')
        REVIEWED = 'REVIEWED', _('Reviewed (legacy)')

    class Severity(models.TextChoices):
        INFO = 'INFO', _('Info')
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        CRITICAL = 'CRITICAL', _('Critical')

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
    assignment = models.ForeignKey(
        'admin_management.Assignment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_reports',
    )
    title = models.CharField(max_length=255)
    report_type = models.CharField(
        max_length=20,
        choices=ReportType.choices,
        default=ReportType.FOLLOW_UP,
        db_index=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    severity = models.CharField(
        max_length=16,
        choices=Severity.choices,
        default=Severity.INFO,
        db_index=True,
    )
    priority_score = models.PositiveIntegerField(default=0, db_index=True)
    is_overdue = models.BooleanField(default=False, db_index=True)
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    submitted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_supervision_reports',
    )
    assigned_reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_supervision_reports',
    )
    escalated_at = models.DateTimeField(null=True, blank=True)
    escalated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='escalated_supervision_reports',
    )
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='archived_supervision_reports',
    )
    score = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
        help_text=_('Optional 0.00 - 100.00 evaluation score.'),
    )
    comments = models.TextField(blank=True, default='')
    evaluation_json = models.JSONField(default=dict, blank=True)
    # Academic snapshot at submission
    filiere = models.ForeignKey(
        'admin_management.Filiere',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_reports',
    )
    academic_level = models.ForeignKey(
        'admin_management.AcademicLevel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_reports',
    )
    academic_sector = models.ForeignKey(
        'admin_management.AcademicSector',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_reports',
    )
    class_group = models.ForeignKey(
        'admin_management.ClassGroup',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_reports',
    )
    academic_year = models.ForeignKey(
        'admin_management.AcademicYear',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_reports',
    )
    internship_type = models.ForeignKey(
        'admin_management.InternshipType',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_reports',
    )
    company_name = models.CharField(max_length=255, blank=True, default='', db_index=True)
    company_city = models.CharField(max_length=128, blank=True, default='')
    internship_period_start = models.DateField(null=True, blank=True)
    internship_period_end = models.DateField(null=True, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-priority_score', '-submitted_at', '-created_at']
        indexes = [
            models.Index(fields=['student_profile', '-created_at']),
            models.Index(fields=['encadrant_profile', '-created_at']),
            models.Index(fields=['status', '-priority_score']),
            models.Index(fields=['severity', '-priority_score']),
            models.Index(fields=['filiere', 'status']),
            models.Index(fields=['is_overdue', '-due_at']),
            models.Index(fields=['report_type', 'status']),
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


# ============================================================================
# 8. REPORT ATTACHMENT
# ============================================================================

class ReportAttachment(TimestampedModel):
    """File attached to a supervision report."""

    report = models.ForeignKey(
        Report,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    file = models.FileField(upload_to='supervision_reports/%Y/%m/')
    original_name = models.CharField(max_length=255, blank=True, default='')
    mime_type = models.CharField(max_length=128, blank=True, default='')
    size_bytes = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'ReportAttachment<{self.report_id}:{self.original_name}>'


# ============================================================================
# 9. REPORT WORKFLOW EVENT — immutable timeline
# ============================================================================

class ReportWorkflowEvent(models.Model):
    """Audit trail for report status transitions and admin actions."""

    class Action(models.TextChoices):
        CREATED = 'CREATED', _('Created')
        UPDATED = 'UPDATED', _('Updated')
        SUBMITTED = 'SUBMITTED', _('Submitted')
        RESUBMITTED = 'RESUBMITTED', _('Resubmitted')
        ASSIGNED_REVIEWER = 'ASSIGNED_REVIEWER', _('Reviewer assigned')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')
        REQUESTED_CHANGES = 'REQUESTED_CHANGES', _('Changes requested')
        ESCALATED = 'ESCALATED', _('Escalated')
        ARCHIVED = 'ARCHIVED', _('Archived')
        NOTE_ADDED = 'NOTE_ADDED', _('Note added')
        NOTIFIED = 'NOTIFIED', _('Notification sent')
        PRIORITY_RECALCULATED = 'PRIORITY_RECALCULATED', _('Priority recalculated')

    report = models.ForeignKey(
        Report,
        on_delete=models.CASCADE,
        related_name='workflow_events',
    )
    action = models.CharField(max_length=32, choices=Action.choices, db_index=True)
    from_status = models.CharField(max_length=20, blank=True, default='')
    to_status = models.CharField(max_length=20, blank=True, default='')
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    note = models.TextField(blank=True, default='')
    payload_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['report', 'created_at']),
        ]

    def __str__(self) -> str:
        return f'ReportWorkflowEvent<{self.report_id}:{self.action}>'


# ============================================================================
# 10. REPORT COMMENT — internal admin notes
# ============================================================================

class ReportComment(TimestampedModel):
    """Internal note visible to admins (not encadrant-facing by default)."""

    report = models.ForeignKey(
        Report,
        on_delete=models.CASCADE,
        related_name='admin_comments',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervision_report_comments',
    )
    body = models.TextField()
    is_internal = models.BooleanField(default=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'ReportComment<{self.report_id}>'


# ============================================================================
# 11. REPORT TEMPLATE — schema per type / internship
# ============================================================================

class ReportTemplate(TimestampedModel):
    """JSON schema for structured report content by type and internship."""

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    report_type = models.CharField(
        max_length=20,
        choices=Report.ReportType.choices,
        db_index=True,
    )
    internship_type = models.ForeignKey(
        'admin_management.InternshipType',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='report_templates',
    )
    schema_json = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['report_type', 'code']

    def __str__(self) -> str:
        return f'ReportTemplate<{self.code}>'


# ============================================================================
# 12. REPORT OBLIGATION — expected submissions
# ============================================================================

class ReportObligation(TimestampedModel):
    """Tracks expected report submissions for a supervised student."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        SATISFIED = 'SATISFIED', _('Satisfied')
        OVERDUE = 'OVERDUE', _('Overdue')
        WAIVED = 'WAIVED', _('Waived')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='report_obligations',
    )
    encadrant_profile = models.ForeignKey(
        'admin_management.EncadrantProfile',
        on_delete=models.CASCADE,
        related_name='report_obligations',
    )
    assignment = models.ForeignKey(
        'admin_management.Assignment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='report_obligations',
    )
    report_type = models.CharField(
        max_length=20,
        choices=Report.ReportType.choices,
        db_index=True,
    )
    academic_year = models.ForeignKey(
        'admin_management.AcademicYear',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='report_obligations',
    )
    due_at = models.DateTimeField(db_index=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    satisfied_by_report = models.ForeignKey(
        Report,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='satisfied_obligations',
    )
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['due_at']
        indexes = [
            models.Index(fields=['encadrant_profile', 'status', 'due_at']),
            models.Index(fields=['student_profile', 'status']),
        ]

    def __str__(self) -> str:
        return f'ReportObligation<{self.student_profile_id}:{self.report_type}>'


# ============================================================================
# 12. WORKSPACE DOCUMENT — fichiers partagés étudiant ↔ encadrant
# ============================================================================

class WorkspaceDocument(TimestampedModel):
    """Fichier importé dans le centre documentaire d'un workspace de supervision."""

    class Category(models.TextChoices):
        REPORT = 'report', _('Report')
        RESEARCH = 'research', _('Research')
        INTERNSHIP = 'internship', _('Internship')
        MEETING = 'meeting', _('Meeting')
        SHARED = 'shared', _('Shared')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='workspace_documents',
    )
    encadrant_profile = models.ForeignKey(
        'admin_management.EncadrantProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='workspace_documents',
    )
    file = models.FileField(upload_to='workspace_documents/%Y/%m/')
    original_name = models.CharField(max_length=255)
    category = models.CharField(
        max_length=16,
        choices=Category.choices,
        default=Category.SHARED,
        db_index=True,
    )
    mime_type = models.CharField(max_length=128, blank=True, default='')
    size_bytes = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    version = models.PositiveIntegerField(default=1)
    viewed_by_encadrant_at = models.DateTimeField(null=True, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student_profile', '-created_at']),
            models.Index(fields=['encadrant_profile', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'WorkspaceDocument<{self.student_profile_id}:{self.original_name}>'


class WorkspaceDocumentReview(TimestampedModel):
    """Feedback / note de l'encadrant sur un document du workspace."""

    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        IN_REVIEW = 'in_review', _('In review')
        RESOLVED = 'resolved', _('Resolved')

    document = models.OneToOneField(
        WorkspaceDocument,
        on_delete=models.CASCADE,
        related_name='review',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    comment = models.TextField(blank=True, default='')
    grade = models.CharField(max_length=32, blank=True, default='')
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f'WorkspaceDocumentReview<{self.document_id}>'
