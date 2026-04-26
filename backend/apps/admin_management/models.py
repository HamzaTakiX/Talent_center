"""
Admin / User Management domain models.

Identity contract:
- The canonical User / StudentProfile / StaffProfile / SupervisorProfile
  live in `accounts_et_roles`. This app does NOT recreate them.
- AdminProfile and EncadrantProfile here are *operational* extensions
  (admin metadata, encadrant workload) keyed 1-1 to a User or to a
  SupervisorProfile. They never duplicate identity fields.
"""

from django.conf import settings
from django.db import models
from django.db.models import Q, UniqueConstraint
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import (
    AccessScope,
    Role,
    StudentProfile,
    SupervisorProfile,
    TimestampedModel,
)


# ============================================================================
# 1. ACADEMIC TAXONOMY — Filiere, ClassGroup
# ============================================================================

class Filiere(TimestampedModel):
    """Academic program / major (e.g. ING-INFO, MASTER-DATA)."""

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    department = models.CharField(max_length=128, blank=True, default='', db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['code']

    def __str__(self) -> str:
        return f'Filiere<{self.code}>'


class ClassGroup(TimestampedModel):
    """
    Cohort/class within a Filiere (e.g. ING-INFO-2025-A).

    Renamed from "classes" because `class` is a Python keyword and
    plural model names hurt readability.
    """

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.PROTECT,
        related_name='class_groups',
    )
    academic_year = models.CharField(
        max_length=16,
        db_index=True,
        help_text=_('Format: 2025-2026'),
    )
    level = models.CharField(
        max_length=16,
        blank=True,
        default='',
        help_text=_('e.g. L1, L2, M1, M2, ING-1'),
    )
    student_capacity = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-academic_year', 'filiere', 'code']
        indexes = [
            models.Index(fields=['filiere', 'academic_year']),
        ]

    def __str__(self) -> str:
        return f'ClassGroup<{self.code} {self.academic_year}>'


# ============================================================================
# 2. OPERATIONAL PROFILES — admin / encadrant extensions
# ============================================================================

class AdminProfile(TimestampedModel):
    """
    Admin-operational data, 1-1 to a User who already has a StaffProfile.

    Identity (name, email, phone) lives on UserProfile. This row stores
    only admin-specific operational state (level, last admin login,
    sensitive-action PIN hash, free-form notes).
    """

    class AdminLevel(models.TextChoices):
        SUPER = 'SUPER', _('Super admin')
        STANDARD = 'STANDARD', _('Standard admin')
        READONLY = 'READONLY', _('Read-only admin')

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='admin_profile',
    )
    admin_level = models.CharField(
        max_length=16,
        choices=AdminLevel.choices,
        default=AdminLevel.STANDARD,
        db_index=True,
    )
    last_admin_login_at = models.DateTimeField(null=True, blank=True)
    audit_pin_hash = models.CharField(
        max_length=128,
        blank=True,
        default='',
        help_text=_('SHA-256 of the PIN used to confirm sensitive admin actions.'),
    )
    notes = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f'AdminProfile<{self.user_id}:{self.admin_level}>'


class EncadrantProfile(TimestampedModel):
    """
    Encadrant-operational data, 1-1 to a SupervisorProfile.

    SupervisorProfile (in accounts_et_roles) carries the canonical
    identity. This row layers admin-management operational fields:
    workload counters, availability calendar, internal notes.
    """

    supervisor_profile = models.OneToOneField(
        SupervisorProfile,
        on_delete=models.CASCADE,
        related_name='encadrant_profile',
    )
    current_workload = models.PositiveSmallIntegerField(
        default=0,
        help_text=_('Live count of currently assigned students.'),
    )
    max_concurrent_students = models.PositiveSmallIntegerField(default=0)
    availability_calendar_json = models.JSONField(default=dict, blank=True)
    expertise_areas = models.JSONField(default=list, blank=True)
    internal_notes = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f'EncadrantProfile<{self.supervisor_profile_id}>'


# ============================================================================
# 3. ADMIN ROLE ASSIGNMENTS — admin-management-scoped grant log
# ============================================================================

class AdminRoleAssignment(TimestampedModel):
    """
    Admin-management's specialised log of role grants restricted to
    a Filiere or ClassGroup scope.

    NOT a duplicate of accounts_et_roles.UserRoleAssignment:
    - UserRoleAssignment is generic and uses AccessScope (free-form).
    - AdminRoleAssignment is scoped specifically to (Filiere | ClassGroup),
      because the admin UI surfaces those objects directly.
    """

    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='admin_role_assignments',
    )
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name='admin_assignments')
    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='role_assignments',
    )
    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='role_assignments',
    )
    access_scope = models.ForeignKey(
        AccessScope,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admin_role_assignments',
        help_text=_('Optional bridge to the canonical AccessScope hierarchy.'),
    )
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    granted_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    reason = models.TextField(blank=True, default='')

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['target_user', 'role', 'filiere', 'class_group'],
                condition=Q(is_active=True),
                name='uniq_active_admin_role_per_scope',
            ),
        ]
        indexes = [
            models.Index(fields=['target_user', 'is_active']),
            models.Index(fields=['role', 'is_active']),
            models.Index(fields=['filiere', 'is_active']),
            models.Index(fields=['class_group', 'is_active']),
        ]

    def __str__(self) -> str:
        scope = self.class_group_id or self.filiere_id or 'GLOBAL'
        return f'AdminRoleAssign<{self.target_user_id}:{self.role.code}@{scope}>'


# ============================================================================
# 4. ASSIGNMENT — student → class → encadrant
# ============================================================================

class Assignment(TimestampedModel):
    """
    Per-academic-year assignment of a student to a ClassGroup and
    optionally an Encadrant.

    Constraint: at most one ACTIVE assignment per (student_profile,
    academic_year). Use is_active=False to keep history.
    """

    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='assignments',
    )
    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.PROTECT,
        related_name='assignments',
    )
    encadrant_profile = models.ForeignKey(
        EncadrantProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assignments',
    )
    academic_year = models.CharField(max_length=16, db_index=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    notes = models.TextField(blank=True, default='')
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-academic_year', '-created_at']
        constraints = [
            UniqueConstraint(
                fields=['student_profile', 'academic_year'],
                condition=Q(is_active=True),
                name='uniq_active_assignment_per_year',
            ),
        ]
        indexes = [
            models.Index(fields=['student_profile', 'academic_year']),
            models.Index(fields=['class_group', 'academic_year']),
            models.Index(fields=['encadrant_profile', 'is_active']),
        ]

    def __str__(self) -> str:
        return f'Assignment<{self.student_profile_id}->{self.class_group_id} {self.academic_year}>'


# ============================================================================
# 5. IMPORT LOGS — CSV/Excel batch imports audit
# ============================================================================

class ImportLog(TimestampedModel):
    """
    Audit row for a bulk import (students roster, encadrants list,
    class definitions, assignments…). Errors are stored as JSON
    for ad-hoc troubleshooting.
    """

    class ImportType(models.TextChoices):
        STUDENTS = 'STUDENTS', _('Students')
        ENCADRANTS = 'ENCADRANTS', _('Encadrants')
        CLASS_GROUPS = 'CLASS_GROUPS', _('Class groups')
        FILIERES = 'FILIERES', _('Filieres')
        ASSIGNMENTS = 'ASSIGNMENTS', _('Assignments')
        ROLES = 'ROLES', _('Roles')
        OTHER = 'OTHER', _('Other')

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        RUNNING = 'RUNNING', _('Running')
        COMPLETED = 'COMPLETED', _('Completed')
        PARTIAL = 'PARTIAL', _('Partial')
        FAILED = 'FAILED', _('Failed')

    import_type = models.CharField(
        max_length=32,
        choices=ImportType.choices,
        db_index=True,
    )
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    source_filename = models.CharField(max_length=255, blank=True, default='')
    total_rows = models.PositiveIntegerField(default=0)
    success_rows = models.PositiveIntegerField(default=0)
    error_rows = models.PositiveIntegerField(default=0)
    errors_json = models.JSONField(default=list, blank=True)
    summary_json = models.JSONField(default=dict, blank=True)
    started_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='import_logs',
    )
    started_at = models.DateTimeField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['import_type', 'status']),
            models.Index(fields=['started_by', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'ImportLog<{self.import_type} {self.status} {self.success_rows}/{self.total_rows}>'
