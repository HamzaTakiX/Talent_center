
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import (
    User, UserProfile, StudentProfile, StaffProfile, SupervisorProfile,
    Role, Permission, RolePermission, UserRoleAssignment,
    AccessScope, UserScopeAssignment,
    AccountInvitation, OnboardingStep, UserOnboardingProgress,
    RoleChangeLog, PermissionChangeLog, AccountStatusLog,
)


# =============================================================================
# USER ADMIN
# =============================================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin with role and status fields."""

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('role',)}),
        (_('Status'), {'fields': ('account_status', 'auth_provider', 'provider_user_id')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'role', 'password1', 'password2'),
        }),
    )

    list_display = ('email', 'role', 'account_status', 'auth_provider', 'is_active', 'created_at')
    list_filter = ('role', 'account_status', 'auth_provider', 'is_active', 'is_staff', 'created_at')
    search_fields = ('email', 'provider_user_id')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'last_login')
    filter_horizontal = ('groups', 'user_permissions')


# =============================================================================
# PROFILE ADMINS
# =============================================================================

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Common profile fields for all users."""

    list_display = ('user', 'full_name', 'phone', 'gender', 'created_at')
    list_filter = ('gender', 'language', 'created_at')
    search_fields = ('user__email', 'first_name', 'last_name', 'phone')
    raw_id_fields = ('user',)
    readonly_fields = ('created_at', 'updated_at')

    @admin.display(description=_('Full name'))
    def full_name(self, obj):
        return obj.full_name


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    """Student-specific profile admin."""

    list_display = (
        'user', 'student_number', 'program_major', 'current_class',
        'identity_confirmed', 'profile_completed', 'created_at',
    )
    list_filter = ('identity_confirmed', 'profile_completed', 'enrollment_year', 'created_at')
    search_fields = ('user__email', 'student_number', 'program_major', 'legacy_first_name', 'legacy_last_name')
    raw_id_fields = ('user',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    """Staff-specific profile admin."""

    list_display = ('user', 'employee_number', 'department', 'job_title', 'hire_date', 'created_at')
    list_filter = ('department', 'hire_date', 'created_at')
    search_fields = ('user__email', 'employee_number', 'department', 'job_title')
    raw_id_fields = ('user',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SupervisorProfile)
class SupervisorProfileAdmin(admin.ModelAdmin):
    """Supervisor-specific profile admin."""

    list_display = ('user', 'specialization', 'accepting_students', 'student_capacity', 'created_at')
    list_filter = ('accepting_students', 'created_at')
    search_fields = ('user__email', 'specialization', 'research_interests')
    raw_id_fields = ('user',)
    readonly_fields = ('created_at', 'updated_at')


# =============================================================================
# RBAC ADMINS
# =============================================================================

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    """Permission admin."""

    list_display = ('code', 'name', 'module', 'created_at')
    list_filter = ('module', 'created_at')
    search_fields = ('code', 'name', 'description')
    readonly_fields = ('created_at', 'updated_at')


class RolePermissionInline(admin.TabularInline):
    """Inline for viewing role-permission assignments."""

    model = RolePermission
    extra = 0
    readonly_fields = ('granted_at',)
    raw_id_fields = ('granted_by',)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Role admin with inline permissions."""

    list_display = ('code', 'name', 'is_system', 'created_at')
    list_filter = ('is_system', 'created_at')
    search_fields = ('code', 'name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [RolePermissionInline]


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    """Role-Permission join table admin (for detailed audit)."""

    list_display = ('role', 'permission', 'granted_by', 'granted_at')
    list_filter = ('granted_at',)
    search_fields = ('role__code', 'permission__code')
    raw_id_fields = ('role', 'permission', 'granted_by')
    readonly_fields = ('granted_at',)


@admin.register(UserRoleAssignment)
class UserRoleAssignmentAdmin(admin.ModelAdmin):
    """User-Role assignment admin."""

    list_display = ('user', 'role', 'is_active', 'assigned_at', 'expires_at')
    list_filter = ('is_active', 'assigned_at', 'role__code')
    search_fields = ('user__email', 'role__code')
    raw_id_fields = ('user', 'role', 'assigned_by')
    readonly_fields = ('assigned_at',)


# =============================================================================
# SCOPE ADMINS
# =============================================================================

@admin.register(AccessScope)
class AccessScopeAdmin(admin.ModelAdmin):
    """Access scope admin."""

    list_display = ('code', 'name', 'scope_type', 'parent', 'created_at')
    list_filter = ('scope_type', 'created_at')
    search_fields = ('code', 'name', 'description')
    raw_id_fields = ('parent',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(UserScopeAssignment)
class UserScopeAssignmentAdmin(admin.ModelAdmin):
    """User-Scope assignment admin."""

    list_display = ('user', 'scope', 'is_active', 'assigned_at', 'expires_at')
    list_filter = ('is_active', 'assigned_at', 'scope__scope_type')
    search_fields = ('user__email', 'scope__code')
    raw_id_fields = ('user', 'scope', 'assigned_by')
    readonly_fields = ('assigned_at',)


# =============================================================================
# INVITATION ADMIN
# =============================================================================

@admin.register(AccountInvitation)
class AccountInvitationAdmin(admin.ModelAdmin):
    """Account invitation admin."""

    list_display = ('email', 'role', 'status', 'invited_at', 'expires_at', 'accepted_at')
    list_filter = ('status', 'invited_at', 'role')
    search_fields = ('email', 'message')
    raw_id_fields = ('role', 'scope', 'invited_by', 'accepted_user')
    readonly_fields = ('invited_at', 'accepted_at')


# =============================================================================
# ONBOARDING ADMINS
# =============================================================================

@admin.register(OnboardingStep)
class OnboardingStepAdmin(admin.ModelAdmin):
    """Onboarding step definition admin."""

    list_display = ('code', 'name', 'order', 'is_required', 'created_at')
    list_filter = ('is_required', 'created_at')
    search_fields = ('code', 'name', 'description')
    filter_horizontal = ('for_roles',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(UserOnboardingProgress)
class UserOnboardingProgressAdmin(admin.ModelAdmin):
    """User onboarding progress admin."""

    list_display = ('user', 'step', 'status', 'started_at', 'completed_at', 'updated_at')
    list_filter = ('status', 'completed_at', 'started_at')
    search_fields = ('user__email', 'step__code')
    raw_id_fields = ('user', 'step')
    readonly_fields = ('updated_at',)


# =============================================================================
# AUDIT LOG ADMINS (Read-only)
# =============================================================================

@admin.register(RoleChangeLog)
class RoleChangeLogAdmin(admin.ModelAdmin):
    """Role change audit log (append-only)."""

    list_display = ('user', 'role', 'action', 'changed_by', 'changed_at')
    list_filter = ('action', 'changed_at')
    search_fields = ('user__email', 'role__code', 'reason')
    raw_id_fields = ('user', 'role', 'changed_by')
    readonly_fields = ('user', 'role', 'action', 'changed_by', 'changed_at', 'reason')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(PermissionChangeLog)
class PermissionChangeLogAdmin(admin.ModelAdmin):
    """Permission change audit log (append-only)."""

    list_display = ('role', 'permission', 'action', 'changed_by', 'changed_at')
    list_filter = ('action', 'changed_at')
    search_fields = ('role__code', 'permission__code', 'reason')
    raw_id_fields = ('role', 'permission', 'changed_by')
    readonly_fields = ('role', 'permission', 'action', 'changed_by', 'changed_at', 'reason')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(AccountStatusLog)
class AccountStatusLogAdmin(admin.ModelAdmin):
    """Account status change audit log (append-only)."""

    list_display = ('user', 'old_status', 'new_status', 'changed_by', 'changed_at')
    list_filter = ('old_status', 'new_status', 'changed_at')
    search_fields = ('user__email', 'reason')
    raw_id_fields = ('user', 'changed_by')
    readonly_fields = ('user', 'old_status', 'new_status', 'changed_by', 'changed_at', 'reason')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
