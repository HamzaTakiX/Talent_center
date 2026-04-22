
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models import Q, UniqueConstraint
from django.utils.translation import gettext_lazy as _


# ============================================================================
# 1. USER
# ============================================================================

class CustomUserManager(BaseUserManager):
    """Manager where email is the unique identifier for authentication."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('auth_provider', User.AuthProvider.LOCAL)
        extra_fields.setdefault('account_status', User.AccountStatus.ACTIVE)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user.

    The legacy `role` CharField marks the user's PRIMARY TYPE (what profile
    to attach, which UI persona to render). Fine-grained authorization is
    handled by the RBAC models (Role/Permission/UserRoleAssignment) below.
    """

    class RoleChoices(models.TextChoices):
        STUDENT = 'STUDENT', _('Student')
        STAFF = 'STAFF', _('Staff')
        SUPERVISOR = 'SUPERVISOR', _('Supervisor')
        ADMIN = 'ADMIN', _('Admin')

    class AuthProvider(models.TextChoices):
        LOCAL = 'LOCAL', _('Local')
        AUTH0 = 'AUTH0', _('Auth0')
        MICROSOFT = 'MICROSOFT', _('Microsoft')
        SSO = 'SSO', _('SSO')

    class AccountStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        PENDING = 'PENDING', _('Pending')
        SUSPENDED = 'SUSPENDED', _('Suspended')
        LOCKED = 'LOCKED', _('Locked')

    username = None
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.STUDENT,
        help_text=_('Primary user type. For fine-grained permissions, use UserRoleAssignment.'),
    )

    # Auth module fields
    auth_provider = models.CharField(
        max_length=32,
        choices=AuthProvider.choices,
        default=AuthProvider.LOCAL,
        db_index=True,
    )
    provider_user_id = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text=_('Subject identifier from the external identity provider (e.g. OIDC sub claim).'),
    )
    account_status = models.CharField(
        max_length=16,
        choices=AccountStatus.choices,
        default=AccountStatus.ACTIVE,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['auth_provider', 'provider_user_id'],
                condition=~Q(provider_user_id=''),
                name='unique_provider_identity',
            ),
        ]

    def __str__(self):
        return self.email

    @property
    def full_name(self) -> str:
        profile = getattr(self, 'profile', None)
        if profile and (profile.first_name or profile.last_name):
            return f'{profile.first_name} {profile.last_name}'.strip()
        # Back-compat: fall back to legacy StudentProfile first/last name.
        student = getattr(self, 'student_profile', None)
        if student and getattr(student, 'legacy_first_name', ''):
            return f'{student.legacy_first_name} {student.legacy_last_name}'.strip()
        return self.email

    # ---- Convenience authorization helpers (used by permissions classes) ----

    def active_role_codes(self) -> list[str]:
        return list(
            self.role_assignments
            .filter(is_active=True)
            .values_list('role__code', flat=True)
        )

    def permission_codes(self) -> set[str]:
        return set(
            RolePermission.objects
            .filter(role__user_assignments__user=self, role__user_assignments__is_active=True)
            .values_list('permission__code', flat=True)
        )

    def has_perm_code(self, code: str) -> bool:
        return code in self.permission_codes()


# ============================================================================
# 2. PROFILES
# ============================================================================

class TimestampedModel(models.Model):
    """Abstract mixin adding created_at/updated_at to a model."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserProfile(TimestampedModel):
    """
    Common profile fields for EVERY user, independent of their role.

    Specialized profiles (StudentProfile, StaffProfile, SupervisorProfile)
    extend this with role-specific fields via a separate 1-1 to User.
    """

    class Gender(models.TextChoices):
        MALE = 'MALE', _('Male')
        FEMALE = 'FEMALE', _('Female')
        OTHER = 'OTHER', _('Other')
        UNSPECIFIED = '', _('Unspecified')

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    first_name = models.CharField(max_length=150, blank=True, default='')
    last_name = models.CharField(max_length=150, blank=True, default='')
    phone = models.CharField(max_length=32, blank=True, default='')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=16,
        choices=Gender.choices,
        blank=True,
        default=Gender.UNSPECIFIED,
    )
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True, default='')
    timezone = models.CharField(max_length=64, blank=True, default='UTC')
    language = models.CharField(max_length=16, blank=True, default='en')

    def __str__(self):
        return f'Profile<{self.user_id}>'

    @property
    def full_name(self) -> str:
        return f'{self.first_name} {self.last_name}'.strip() or self.user.email


class StudentProfile(TimestampedModel):
    """Student-specific fields. Common fields live on UserProfile."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
    )

    # Academic
    program_major = models.CharField(max_length=255, blank=True, default='')
    current_class = models.CharField(max_length=100, blank=True, default='')
    student_number = models.CharField(max_length=64, blank=True, default='', db_index=True)
    enrollment_year = models.PositiveSmallIntegerField(null=True, blank=True)
    expected_graduation_year = models.PositiveSmallIntegerField(null=True, blank=True)

    # Professional
    linkedin_url = models.URLField(max_length=255, blank=True, default='')
    professional_summary = models.TextField(blank=True, default='')
    cv_file = models.FileField(upload_to='cvs/', null=True, blank=True)

    # Career & Internship Preferences
    career_objective = models.TextField(blank=True, default='')
    skills = models.JSONField(default=list, blank=True)
    availability = models.CharField(max_length=50, blank=True, default='')
    start_date = models.DateField(null=True, blank=True)
    city = models.CharField(max_length=100, blank=True, default='')
    mobility = models.JSONField(default=list, blank=True)
    has_applied = models.BooleanField(null=True, blank=True)

    # Legacy duplicated fields kept for a single release to ease migration.
    # New code must read UserProfile.first_name / last_name / date_of_birth.
    legacy_first_name = models.CharField(max_length=150, blank=True, default='')
    legacy_last_name = models.CharField(max_length=150, blank=True, default='')
    legacy_date_of_birth = models.DateField(null=True, blank=True)

    # Quick onboarding flags (canonical onboarding lives in UserOnboardingProgress)
    identity_confirmed = models.BooleanField(default=False)
    profile_completed = models.BooleanField(default=False)

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['student_number'],
                condition=~Q(student_number=''),
                name='unique_student_number',
            ),
        ]

    def __str__(self):
        return f'StudentProfile<{self.user_id}>'


class StaffProfile(TimestampedModel):
    """Administrative / non-academic staff profile."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='staff_profile',
    )
    department = models.CharField(max_length=128, blank=True, default='', db_index=True)
    job_title = models.CharField(max_length=128, blank=True, default='')
    office_location = models.CharField(max_length=128, blank=True, default='')
    phone_extension = models.CharField(max_length=16, blank=True, default='')
    hire_date = models.DateField(null=True, blank=True)
    employee_number = models.CharField(max_length=64, blank=True, default='', db_index=True)

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['employee_number'],
                condition=~Q(employee_number=''),
                name='unique_staff_employee_number',
            ),
        ]

    def __str__(self):
        return f'StaffProfile<{self.user_id}>'


class SupervisorProfile(TimestampedModel):
    """Academic/professional supervisor profile (mentors students, PFE jury, etc.)."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supervisor_profile',
    )
    specialization = models.CharField(max_length=255, blank=True, default='')
    office_location = models.CharField(max_length=128, blank=True, default='')
    accepting_students = models.BooleanField(default=True)
    student_capacity = models.PositiveSmallIntegerField(default=0)
    linkedin_url = models.URLField(max_length=255, blank=True, default='')
    research_interests = models.TextField(blank=True, default='')

    def __str__(self):
        return f'SupervisorProfile<{self.user_id}>'


# ============================================================================
# 3. RBAC — Permission, Role, RolePermission, UserRoleAssignment
# ============================================================================

class Permission(TimestampedModel):
    """
    Atomic permission (e.g. "student.read", "role.assign", "invitation.send").

    Naming convention: "<module>.<action>". `module` is indexed so you can
    list all permissions of a given module cheaply.
    """

    code = models.SlugField(max_length=128, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    module = models.CharField(max_length=64, db_index=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['module', 'code']

    def __str__(self):
        return self.code


class Role(TimestampedModel):
    """
    Named bundle of Permissions (e.g. STUDENT, SUPERVISOR, ADMIN,
    DEPARTMENT_HEAD). Use `is_system=True` for seeded built-in roles so
    admins cannot delete them.
    """

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default='')
    is_system = models.BooleanField(default=False)
    permissions = models.ManyToManyField(
        Permission,
        through='RolePermission',
        related_name='roles',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['code']

    def __str__(self):
        return self.code

    def permission_codes(self) -> list[str]:
        return list(self.permissions.values_list('code', flat=True))


class RolePermission(models.Model):
    """Join row — records WHO granted a permission to a role and WHEN."""

    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='role_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='permission_roles')
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    class Meta:
        constraints = [
            UniqueConstraint(fields=['role', 'permission'], name='unique_role_permission'),
        ]
        indexes = [
            models.Index(fields=['role', 'permission']),
        ]

    def __str__(self):
        return f'{self.role.code}:{self.permission.code}'


class UserRoleAssignment(models.Model):
    """Assigns a Role to a User. Optionally time-bounded and deactivatable."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='role_assignments',
    )
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='user_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['user', 'role'], name='unique_user_role'),
        ]
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['role', 'is_active']),
        ]

    def __str__(self):
        return f'{self.user_id}:{self.role.code}'


# ============================================================================
# 4. SCOPES — AccessScope, UserScopeAssignment
# ============================================================================

class AccessScope(TimestampedModel):
    """
    Multi-tenant/attribute boundary a user is authorized to operate within
    (e.g. a department, a program, a cohort, a specific class).

    Hierarchical: a scope can have a parent (DEPARTMENT > PROGRAM > COHORT).
    Permission checks can use scope inheritance to avoid assigning every leaf.
    """

    class ScopeType(models.TextChoices):
        GLOBAL = 'GLOBAL', _('Global')
        DEPARTMENT = 'DEPARTMENT', _('Department')
        PROGRAM = 'PROGRAM', _('Program')
        COHORT = 'COHORT', _('Cohort')
        CLASS = 'CLASS', _('Class')
        CUSTOM = 'CUSTOM', _('Custom')

    code = models.SlugField(max_length=128, unique=True)
    name = models.CharField(max_length=255)
    scope_type = models.CharField(
        max_length=32,
        choices=ScopeType.choices,
        default=ScopeType.CUSTOM,
        db_index=True,
    )
    description = models.TextField(blank=True, default='')
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children',
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['scope_type', 'code']

    def __str__(self):
        return f'{self.scope_type}:{self.code}'

    def ancestors(self) -> list['AccessScope']:
        """Walk up the parent chain. Returns [parent, grandparent, ...]."""
        chain = []
        node = self.parent
        while node is not None:
            chain.append(node)
            node = node.parent
        return chain


class UserScopeAssignment(models.Model):
    """Gives a user access within an AccessScope."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='scope_assignments',
    )
    scope = models.ForeignKey(AccessScope, on_delete=models.CASCADE, related_name='user_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['user', 'scope'], name='unique_user_scope'),
        ]
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['scope', 'is_active']),
        ]

    def __str__(self):
        return f'{self.user_id}:{self.scope.code}'


# ============================================================================
# 5. INVITATIONS
# ============================================================================

class AccountInvitation(TimestampedModel):
    """
    Invitation to create an account with a pre-assigned Role (and optional
    Scope). The raw token is emailed to the invitee; only a hash is stored.
    """

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        ACCEPTED = 'ACCEPTED', _('Accepted')
        EXPIRED = 'EXPIRED', _('Expired')
        REVOKED = 'REVOKED', _('Revoked')

    email = models.EmailField(db_index=True)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name='invitations')
    scope = models.ForeignKey(
        AccessScope,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invitations',
    )
    token = models.CharField(max_length=128, unique=True)     # SHA-256 hex of the raw token
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    message = models.TextField(blank=True, default='')

    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_invitations',
    )
    invited_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    accepted_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='accepted_invitation',
    )

    class Meta(TimestampedModel.Meta):
        constraints = [
            # One active (PENDING) invitation per email at a time.
            UniqueConstraint(
                fields=['email'],
                condition=Q(status='PENDING'),
                name='unique_pending_invitation_per_email',
            ),
        ]
        indexes = [
            models.Index(fields=['email', 'status']),
            models.Index(fields=['status', 'expires_at']),
        ]

    def __str__(self):
        return f'Invite<{self.email} {self.status}>'


# ============================================================================
# 6. ONBOARDING
# ============================================================================

class OnboardingStep(TimestampedModel):
    """
    Declarative onboarding step (e.g. CONFIRM_IDENTITY, UPLOAD_CV,
    SET_PREFERENCES). A step can apply to multiple roles via `for_roles`.
    """

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, default='')
    order = models.PositiveSmallIntegerField(default=0)
    is_required = models.BooleanField(default=True)
    for_roles = models.ManyToManyField(Role, blank=True, related_name='onboarding_steps')

    class Meta(TimestampedModel.Meta):
        ordering = ['order', 'code']

    def __str__(self):
        return self.code


class UserOnboardingProgress(models.Model):
    """Per-user state of an onboarding step."""

    class Status(models.TextChoices):
        NOT_STARTED = 'NOT_STARTED', _('Not started')
        IN_PROGRESS = 'IN_PROGRESS', _('In progress')
        COMPLETED = 'COMPLETED', _('Completed')
        SKIPPED = 'SKIPPED', _('Skipped')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='onboarding_progress',
    )
    step = models.ForeignKey(OnboardingStep, on_delete=models.CASCADE, related_name='progress_entries')
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.NOT_STARTED,
        db_index=True,
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['user', 'step'], name='unique_user_onboarding_step'),
        ]
        indexes = [
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f'Onboarding<{self.user_id}:{self.step.code}={self.status}>'


# ============================================================================
# 7. AUDIT LOGS — RoleChangeLog, PermissionChangeLog, AccountStatusLog
# ============================================================================

class RoleChangeLog(models.Model):
    """Append-only audit of every role assign / revoke for a user."""

    class Action(models.TextChoices):
        ASSIGNED = 'ASSIGNED', _('Assigned')
        REVOKED = 'REVOKED', _('Revoked')
        REACTIVATED = 'REACTIVATED', _('Reactivated')
        DEACTIVATED = 'DEACTIVATED', _('Deactivated')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='role_change_logs',
    )
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name='change_logs')
    action = models.CharField(max_length=16, choices=Action.choices, db_index=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    changed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    reason = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['user', 'changed_at']),
        ]

    def __str__(self):
        return f'RoleLog<{self.user_id} {self.action} {self.role.code}>'


class PermissionChangeLog(models.Model):
    """Append-only audit of every permission grant/revoke on a role."""

    class Action(models.TextChoices):
        GRANTED = 'GRANTED', _('Granted')
        REVOKED = 'REVOKED', _('Revoked')

    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name='permission_change_logs')
    permission = models.ForeignKey(Permission, on_delete=models.PROTECT, related_name='change_logs')
    action = models.CharField(max_length=16, choices=Action.choices, db_index=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    changed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    reason = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['role', 'changed_at']),
        ]

    def __str__(self):
        return f'PermLog<{self.role.code} {self.action} {self.permission.code}>'


class AccountStatusLog(models.Model):
    """Append-only audit of account_status transitions."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='status_change_logs',
    )
    old_status = models.CharField(max_length=16, choices=User.AccountStatus.choices)
    new_status = models.CharField(max_length=16, choices=User.AccountStatus.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    changed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    reason = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['user', 'changed_at']),
        ]

    def __str__(self):
        return f'StatusLog<{self.user_id} {self.old_status}->{self.new_status}>'
