
from typing import Optional
from django.db.models import QuerySet
from django.core.exceptions import ObjectDoesNotExist

from .models import (
    User, UserProfile, StudentProfile, StaffProfile, SupervisorProfile,
    Role, Permission, UserRoleAssignment,
    AccessScope, UserScopeAssignment,
    AccountInvitation, OnboardingStep, UserOnboardingProgress,
    RoleChangeLog, PermissionChangeLog, AccountStatusLog,
)


# =============================================================================
# USER SELECTORS
# =============================================================================

def get_user_by_id(user_id: int) -> Optional[User]:
    """Fetch user by primary key."""
    try:
        return User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return None


def get_user_by_email(email: str) -> Optional[User]:
    """Fetch user by email (case-insensitive)."""
    try:
        return User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return None


def get_user_by_provider_id(provider: str, provider_user_id: str) -> Optional[User]:
    """Fetch user by external identity provider ID."""
    try:
        return User.objects.get(
            auth_provider=provider,
            provider_user_id=provider_user_id,
        )
    except User.DoesNotExist:
        return None


def list_active_users() -> QuerySet[User]:
    """List all active (non-deleted, active status) users."""
    return User.objects.filter(
        is_active=True,
        account_status=User.AccountStatus.ACTIVE,
    )


def list_users_by_role(role_code: str) -> QuerySet[User]:
    """List users with a specific primary role."""
    return User.objects.filter(role=role_code)


def list_users_by_assigned_role(role_code: str) -> QuerySet[User]:
    """List users with an active RBAC role assignment."""
    return User.objects.filter(
        role_assignments__role__code=role_code,
        role_assignments__is_active=True,
    ).distinct()


# =============================================================================
# PROFILE SELECTORS
# =============================================================================

def get_user_profile(user: User) -> Optional[UserProfile]:
    """Get the common UserProfile for a user."""
    try:
        return user.profile
    except ObjectDoesNotExist:
        return None


def get_student_profile(user: User) -> Optional[StudentProfile]:
    """Get the StudentProfile for a user (if they have one)."""
    try:
        return user.student_profile
    except ObjectDoesNotExist:
        return None


def get_staff_profile(user: User) -> Optional[StaffProfile]:
    """Get the StaffProfile for a user (if they have one)."""
    try:
        return user.staff_profile
    except ObjectDoesNotExist:
        return None


def get_supervisor_profile(user: User) -> Optional[SupervisorProfile]:
    """Get the SupervisorProfile for a user (if they have one)."""
    try:
        return user.supervisor_profile
    except ObjectDoesNotExist:
        return None


def get_any_profile_for_user(user: User):
    """
    Get the appropriate role-specific profile for a user based on their role.

    Returns:
        StudentProfile, StaffProfile, SupervisorProfile, or None
    """
    if user.role == User.RoleChoices.STUDENT:
        return get_student_profile(user)
    if user.role == User.RoleChoices.STAFF:
        return get_staff_profile(user)
    if user.role == User.RoleChoices.SUPERVISOR:
        return get_supervisor_profile(user)
    return None


def list_students() -> QuerySet[StudentProfile]:
    """List all student profiles with user data."""
    return StudentProfile.objects.select_related('user').all()


def list_staff() -> QuerySet[StaffProfile]:
    """List all staff profiles with user data."""
    return StaffProfile.objects.select_related('user').all()


def list_supervisors() -> QuerySet[SupervisorProfile]:
    """List all supervisor profiles with user data."""
    return SupervisorProfile.objects.select_related('user').all()


# =============================================================================
# RBAC SELECTORS
# =============================================================================

def get_role_by_code(code: str) -> Optional[Role]:
    """Fetch role by unique code."""
    try:
        return Role.objects.get(code=code)
    except Role.DoesNotExist:
        return None


def list_roles() -> QuerySet[Role]:
    """List all roles."""
    return Role.objects.prefetch_related('permissions').all()


def list_active_roles_for_user(user: User) -> QuerySet[Role]:
    """List all active roles assigned to a user."""
    return Role.objects.filter(
        user_assignments__user=user,
        user_assignments__is_active=True,
    )


def get_permission_by_code(code: str) -> Optional[Permission]:
    """Fetch permission by unique code."""
    try:
        return Permission.objects.get(code=code)
    except Permission.DoesNotExist:
        return None


def list_permissions() -> QuerySet[Permission]:
    """List all permissions."""
    return Permission.objects.all()


def list_permissions_for_role(role: Role) -> QuerySet[Permission]:
    """List all permissions granted to a role."""
    return role.permissions.all()


def list_permissions_for_user(user: User) -> set[str]:
    """Get all permission codes a user has through active role assignments."""
    return user.permission_codes()


def user_has_permission(user: User, permission_code: str) -> bool:
    """Check if user has a specific permission."""
    return user.has_perm_code(permission_code)


def list_user_role_assignments(user: User) -> QuerySet[UserRoleAssignment]:
    """List all role assignments for a user."""
    return UserRoleAssignment.objects.filter(user=user).select_related('role')


def list_active_user_role_assignments(user: User) -> QuerySet[UserRoleAssignment]:
    """List active role assignments for a user."""
    return UserRoleAssignment.objects.filter(user=user, is_active=True).select_related('role')


# =============================================================================
# SCOPE SELECTORS
# =============================================================================

def get_scope_by_code(code: str) -> Optional[AccessScope]:
    """Fetch scope by unique code."""
    try:
        return AccessScope.objects.get(code=code)
    except AccessScope.DoesNotExist:
        return None


def list_scopes() -> QuerySet[AccessScope]:
    """List all access scopes."""
    return AccessScope.objects.select_related('parent').all()


def list_scopes_for_user(user: User) -> QuerySet[AccessScope]:
    """List all scopes a user has access to."""
    return AccessScope.objects.filter(
        user_assignments__user=user,
        user_assignments__is_active=True,
    )


def list_child_scopes(parent: AccessScope) -> QuerySet[AccessScope]:
    """List all direct child scopes of a parent scope."""
    return parent.children.all()


# =============================================================================
# INVITATION SELECTORS
# =============================================================================

def get_invitation_by_token_hash(token_hash: str) -> Optional[AccountInvitation]:
    """Fetch invitation by token hash."""
    try:
        return AccountInvitation.objects.get(token=token_hash)
    except AccountInvitation.DoesNotExist:
        return None


def get_pending_invitation_for_email(email: str) -> Optional[AccountInvitation]:
    """Get pending invitation for an email address."""
    try:
        return AccountInvitation.objects.get(
            email__iexact=email,
            status=AccountInvitation.Status.PENDING,
        )
    except AccountInvitation.DoesNotExist:
        return None


def list_pending_invitations() -> QuerySet[AccountInvitation]:
    """List all pending invitations."""
    return AccountInvitation.objects.filter(
        status=AccountInvitation.Status.PENDING,
    ).select_related('role', 'scope')


def list_invitations_by_inviter(inviter: User) -> QuerySet[AccountInvitation]:
    """List all invitations sent by a user."""
    return AccountInvitation.objects.filter(invited_by=inviter)


# =============================================================================
# ONBOARDING SELECTORS
# =============================================================================

def get_onboarding_step_by_code(code: str) -> Optional[OnboardingStep]:
    """Fetch onboarding step by unique code."""
    try:
        return OnboardingStep.objects.get(code=code)
    except OnboardingStep.DoesNotExist:
        return None


def list_onboarding_steps() -> QuerySet[OnboardingStep]:
    """List all onboarding steps in order."""
    return OnboardingStep.objects.prefetch_related('for_roles').all()


def list_onboarding_steps_for_role(role: Role) -> QuerySet[OnboardingStep]:
    """List onboarding steps applicable to a role."""
    return OnboardingStep.objects.filter(for_roles=role)


def get_user_onboarding_progress(user: User, step: OnboardingStep) -> Optional[UserOnboardingProgress]:
    """Get progress for a specific user/step combo."""
    try:
        return UserOnboardingProgress.objects.get(user=user, step=step)
    except UserOnboardingProgress.DoesNotExist:
        return None


def list_onboarding_progress_for_user(user: User) -> QuerySet[UserOnboardingProgress]:
    """List all onboarding progress entries for a user."""
    return UserOnboardingProgress.objects.filter(user=user).select_related('step')


def is_onboarding_step_completed(user: User, step: OnboardingStep) -> bool:
    """Check if user has completed a specific onboarding step."""
    try:
        progress = UserOnboardingProgress.objects.get(user=user, step=step)
        return progress.status == UserOnboardingProgress.Status.COMPLETED
    except UserOnboardingProgress.DoesNotExist:
        return False


# =============================================================================
# AUDIT LOG SELECTORS
# =============================================================================

def list_role_change_logs_for_user(user: User) -> QuerySet[RoleChangeLog]:
    """List role change audit logs for a user."""
    return RoleChangeLog.objects.filter(user=user).select_related('role', 'changed_by')


def list_permission_change_logs_for_role(role: Role) -> QuerySet[PermissionChangeLog]:
    """List permission change audit logs for a role."""
    return PermissionChangeLog.objects.filter(role=role).select_related('permission', 'changed_by')


def list_account_status_logs_for_user(user: User) -> QuerySet[AccountStatusLog]:
    """List account status change audit logs for a user."""
    return AccountStatusLog.objects.filter(user=user).select_related('changed_by')
