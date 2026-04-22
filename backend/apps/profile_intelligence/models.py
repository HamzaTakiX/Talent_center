"""
Profile Intelligence domain models.

Design principles:
- The canonical StudentProfile lives in accounts_et_roles. These models
  attach *derived* or *contextual* data to it and MUST NOT duplicate
  identity fields (first name, program, etc.).
- Per-module data is stored as JSON summaries — a module's raw truth
  stays in its own app; only the signal relevant to intelligence lives
  here.
- Every model is independently queryable so dashboards and analytics
  can read a single table instead of reconstructing state from events.
"""

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import StudentProfile, TimestampedModel


# ============================================================================
# 1. ACTIVITY LOG
# ============================================================================

class StudentProfileActivityLog(models.Model):
    """
    Append-only log of signals emitted for a student profile.

    One row per meaningful action (login, CV update, profile field set,
    meeting booked...). Nothing is mutated after insert — services consume
    this log to derive metrics and indicators.
    """

    class ActivityType(models.TextChoices):
        LOGIN = 'LOGIN', _('Login')
        LOGOUT = 'LOGOUT', _('Logout')
        ACTION = 'ACTION', _('Action')
        UPDATE = 'UPDATE', _('Update')
        VIEW = 'VIEW', _('View')
        SYSTEM = 'SYSTEM', _('System')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='activity_logs',
    )
    activity_type = models.CharField(
        max_length=16,
        choices=ActivityType.choices,
        db_index=True,
    )
    source_app = models.CharField(max_length=64, db_index=True)
    action_code = models.SlugField(max_length=128, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student_profile', '-created_at']),
            models.Index(fields=['source_app', 'action_code']),
        ]

    def __str__(self) -> str:
        return f'Activity<{self.student_profile_id} {self.source_app}:{self.action_code}>'


# ============================================================================
# 2. INDICATORS — latest derived scores
# ============================================================================

class StudentProfileIndicator(TimestampedModel):
    """
    Rolling snapshot of the three headline scores for a student.

    Exactly one row per student_profile. `profile_intelligence_engine`
    writes this after aggregation; dashboards read it directly instead
    of recomputing.
    """

    student_profile = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='indicator',
    )
    health_score = models.PositiveSmallIntegerField(default=0)        # 0-100
    engagement_score = models.PositiveSmallIntegerField(default=0)    # 0-100
    risk_score = models.PositiveSmallIntegerField(default=0)          # 0-100
    last_activity_at = models.DateTimeField(null=True, blank=True)
    is_at_risk = models.BooleanField(default=False, db_index=True)

    class Meta(TimestampedModel.Meta):
        indexes = [
            models.Index(fields=['is_at_risk', '-updated_at']),
        ]

    def __str__(self) -> str:
        return f'Indicator<{self.student_profile_id} h={self.health_score} r={self.risk_score}>'


# ============================================================================
# 3. BEHAVIOR METRICS — per (student, source_app) aggregate
# ============================================================================

class StudentProfileBehaviorMetric(TimestampedModel):
    """
    Aggregated behaviour signals for a student in the scope of one
    source app. Recomputed periodically from the activity log.
    """

    class EngagementLevel(models.TextChoices):
        INACTIVE = 'INACTIVE', _('Inactive')
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='behavior_metrics',
    )
    source_app = models.CharField(max_length=64, db_index=True)
    login_count = models.PositiveIntegerField(default=0)
    actions_count = models.PositiveIntegerField(default=0)
    average_session_duration = models.FloatField(default=0.0)   # seconds
    engagement_level = models.CharField(
        max_length=16,
        choices=EngagementLevel.choices,
        default=EngagementLevel.INACTIVE,
        db_index=True,
    )

    class Meta(TimestampedModel.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=['student_profile', 'source_app'],
                name='uniq_behavior_metric_per_student_app',
            ),
        ]

    def __str__(self) -> str:
        return f'Behavior<{self.student_profile_id} {self.source_app}>'


# ============================================================================
# 4. CONTEXT — module-contributed summaries
# ============================================================================

class StudentProfileContext(TimestampedModel):
    """
    Contextual payload contributed by another module about a student.

    Example: cv_builder writes context_code='cv_completion' with a
    summary describing CV status; internships app writes 'application_status'.
    Kept deliberately generic so new modules can plug in without schema
    changes.
    """

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        STALE = 'STALE', _('Stale')
        ARCHIVED = 'ARCHIVED', _('Archived')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='contexts',
    )
    context_code = models.SlugField(max_length=128, db_index=True)
    source_app = models.CharField(max_length=64, db_index=True)
    summary_json = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )

    class Meta(TimestampedModel.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=['student_profile', 'context_code'],
                name='uniq_context_per_student',
            ),
        ]

    def __str__(self) -> str:
        return f'Context<{self.student_profile_id} {self.context_code}>'


# ============================================================================
# 5. MODULE REGISTRY + MODULE DATA
# ============================================================================

class StudentProfileModuleRegistry(TimestampedModel):
    """
    Declarative registry of modules that contribute to profile intelligence.

    Seed rows for the modules you integrate (e.g. CV_BUILDER, INTERNSHIPS).
    Feature flags / activation is done by `is_active` so the engine can
    ignore retired modules without deleting their historical data.
    """

    module_code = models.SlugField(max_length=64, unique=True)
    module_name = models.CharField(max_length=128)
    source_app = models.CharField(max_length=64, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['module_code']

    def __str__(self) -> str:
        return f'Module<{self.module_code}>'


class StudentProfileModuleData(TimestampedModel):
    """
    Per (student, module) rollup. Holds a cheap summary + numeric metrics
    so dashboards can render without cross-app joins.
    """

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='module_data',
    )
    module = models.ForeignKey(
        StudentProfileModuleRegistry,
        on_delete=models.CASCADE,
        related_name='student_data',
    )
    summary_json = models.JSONField(default=dict, blank=True)
    metrics_json = models.JSONField(default=dict, blank=True)
    last_updated_at = models.DateTimeField(auto_now=True)

    class Meta(TimestampedModel.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=['student_profile', 'module'],
                name='uniq_module_data_per_student',
            ),
        ]
        indexes = [
            models.Index(fields=['student_profile', '-last_updated_at']),
        ]

    def __str__(self) -> str:
        return f'ModuleData<{self.student_profile_id} {self.module_id}>'


# ============================================================================
# 6. SUGGESTIONS
# ============================================================================

class StudentProfileSuggestion(TimestampedModel):
    """
    Actionable nudge generated by the suggestion engine (e.g. "complete
    your CV", "update your availability"). Students can complete them;
    completed suggestions are kept for analytics.
    """

    class SuggestionType(models.TextChoices):
        PROFILE = 'PROFILE', _('Profile')
        CV = 'CV', _('CV')
        CAREER = 'CAREER', _('Career')
        ENGAGEMENT = 'ENGAGEMENT', _('Engagement')
        RISK = 'RISK', _('Risk')

    class Priority(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        CRITICAL = 'CRITICAL', _('Critical')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='suggestions',
    )
    suggestion_type = models.CharField(
        max_length=16,
        choices=SuggestionType.choices,
        db_index=True,
    )
    title = models.CharField(max_length=255)
    priority = models.CharField(
        max_length=16,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
    )
    is_completed = models.BooleanField(default=False, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['is_completed', '-priority', '-created_at']
        indexes = [
            models.Index(fields=['student_profile', 'is_completed']),
        ]

    def __str__(self) -> str:
        return f'Suggestion<{self.student_profile_id} {self.title}>'


# ============================================================================
# 7. RISK
# ============================================================================

class StudentProfileRisk(TimestampedModel):
    """
    A specific risk detected for a student (e.g. inactivity, stale CV,
    no internship applications). Multiple risks can coexist; a risk is
    closed by setting `is_active=False`.
    """

    class RiskLevel(models.TextChoices):
        LOW = 'LOW', _('Low')
        MEDIUM = 'MEDIUM', _('Medium')
        HIGH = 'HIGH', _('High')
        CRITICAL = 'CRITICAL', _('Critical')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='risks',
    )
    risk_type = models.SlugField(max_length=64, db_index=True)
    risk_level = models.CharField(
        max_length=16,
        choices=RiskLevel.choices,
        default=RiskLevel.LOW,
        db_index=True,
    )
    is_active = models.BooleanField(default=True, db_index=True)
    details_json = models.JSONField(default=dict, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta(TimestampedModel.Meta):
        indexes = [
            models.Index(fields=['student_profile', 'is_active']),
            models.Index(fields=['risk_type', 'risk_level']),
        ]

    def __str__(self) -> str:
        return f'Risk<{self.student_profile_id} {self.risk_type}:{self.risk_level}>'


# ============================================================================
# 8. STATE TRANSITIONS — profile state machine log
# ============================================================================

class StudentProfileStateTransition(models.Model):
    """
    Append-only log of profile state changes
    (NEW -> ONBOARDING -> ACTIVE -> AT_RISK -> DORMANT ...).

    The *current* state lives on StudentProfileIndicator via derivation;
    this table is the history.
    """

    class State(models.TextChoices):
        NEW = 'NEW', _('New')
        ONBOARDING = 'ONBOARDING', _('Onboarding')
        ACTIVE = 'ACTIVE', _('Active')
        ENGAGED = 'ENGAGED', _('Engaged')
        AT_RISK = 'AT_RISK', _('At risk')
        DORMANT = 'DORMANT', _('Dormant')
        GRADUATED = 'GRADUATED', _('Graduated')

    class TriggerType(models.TextChoices):
        SYSTEM = 'SYSTEM', _('System')
        USER_ACTION = 'USER_ACTION', _('User action')
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        MANUAL = 'MANUAL', _('Manual')

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='state_transitions',
    )
    from_state = models.CharField(max_length=16, choices=State.choices, blank=True, default='')
    to_state = models.CharField(max_length=16, choices=State.choices)
    trigger_type = models.CharField(
        max_length=16,
        choices=TriggerType.choices,
        default=TriggerType.SYSTEM,
    )
    transitioned_at = models.DateTimeField(auto_now_add=True, db_index=True)
    reason = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        ordering = ['-transitioned_at']
        indexes = [
            models.Index(fields=['student_profile', '-transitioned_at']),
        ]

    def __str__(self) -> str:
        return f'Transition<{self.student_profile_id} {self.from_state}->{self.to_state}>'


# ============================================================================
# 9. QUERY LOG — audit of search / filter usage
# ============================================================================

class StudentProfileQueryLog(models.Model):
    """
    Audit of advanced searches executed against the intelligence layer.
    Used to tune indexes and to give staff their own query history.
    """

    executed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='profile_intelligence_queries',
    )
    query_type = models.SlugField(max_length=64, db_index=True)
    filters_json = models.JSONField(default=dict, blank=True)
    result_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['executed_by', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'Query<{self.query_type} by={self.executed_by_id}>'


# ============================================================================
# 10. SNAPSHOT — daily / periodic point-in-time record
# ============================================================================

class StudentProfileSnapshot(models.Model):
    """
    Immutable point-in-time metrics record. Fed by a periodic task
    so historical dashboards and trend lines are cheap to compute.
    """

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='snapshots',
    )
    completion_rate = models.PositiveSmallIntegerField(default=0)   # 0-100
    engagement_score = models.PositiveSmallIntegerField(default=0)  # 0-100
    risk_score = models.PositiveSmallIntegerField(default=0)        # 0-100
    snapshot_date = models.DateField(db_index=True)

    class Meta:
        ordering = ['-snapshot_date']
        constraints = [
            models.UniqueConstraint(
                fields=['student_profile', 'snapshot_date'],
                name='uniq_snapshot_per_student_per_day',
            ),
        ]
        indexes = [
            models.Index(fields=['student_profile', '-snapshot_date']),
        ]

    def __str__(self) -> str:
        return f'Snapshot<{self.student_profile_id} {self.snapshot_date}>'
