
from rest_framework import permissions
from rest_framework.request import Request

from .models import UserRoleAssignment, StudentProfile, UserOnboardingProgress


# =============================================================================
# ONBOARDING PERMISSIONS
# =============================================================================

class IsIdentityConfirmed(permissions.BasePermission):
    """
    Allow access only to users who have confirmed their identity.

    For students, this checks StudentProfile.identity_confirmed.
    For other roles, this check is bypassed (assumed confirmed via other means).
    """

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Admin always passes
        if user.is_superuser or user.role == UserRoleAssignment.role.field.model.Role.ADMIN:
            return True

        # Only students need explicit identity confirmation
        if user.role == UserRoleAssignment.user.field.model.RoleChoices.STUDENT:
            try:
                return user.student_profile.identity_confirmed
            except StudentProfile.DoesNotExist:
                return False

        return True


class IsFullyOnboarded(permissions.BasePermission):
    """
    Allow access only to users who have completed all required onboarding steps
    for their assigned roles.
    """

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Admin always passes
        if user.is_superuser:
            return True

        # Get active role assignments
        active_assignments = UserRoleAssignment.objects.filter(
            user=user,
            is_active=True,
        ).select_related('role')

        # No roles assigned = onboarding not complete
        if not active_assignments.exists():
            return False

        # Check each role's required onboarding steps
        for assignment in active_assignments:
            role = assignment.role
            required_steps = role.onboarding_steps.filter(is_required=True)

            for step in required_steps:
                try:
                    progress = UserOnboardingProgress.objects.get(user=user, step=step)
                    if progress.status not in (
                        UserOnboardingProgress.Status.COMPLETED,
                        UserOnboardingProgress.Status.SKIPPED,
                    ):
                        return False
                except UserOnboardingProgress.DoesNotExist:
                    return False

        return True


class HasCompletedOnboardingStep(permissions.BasePermission):
    """
    Permission that checks if user has completed a specific onboarding step.

    Usage:
        class MyView(APIView):
            permission_classes = [IsAuthenticated, HasCompletedOnboardingStep]
            required_onboarding_step = 'UPLOAD_CV'
    """

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        step_code = getattr(view, 'required_onboarding_step', None)
        if not step_code:
            return True  # No specific step required

        try:
            from .models import OnboardingStep
            step = OnboardingStep.objects.get(code=step_code)
            progress = UserOnboardingProgress.objects.get(user=user, step=step)
            return progress.status in (
                UserOnboardingProgress.Status.COMPLETED,
                UserOnboardingProgress.Status.SKIPPED,
            )
        except (OnboardingStep.DoesNotExist, UserOnboardingProgress.DoesNotExist):
            return False


# =============================================================================
# ROLE-BASED PERMISSIONS
# =============================================================================

class IsRole(permissions.BasePermission):
    """
    Permission that checks if the user has a specific primary role.

    Usage:
        permission_classes = [IsAuthenticated, IsRole]
        allowed_roles = ['STUDENT', 'SUPERVISOR']
    """

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        allowed = getattr(view, 'allowed_roles', [])
        if not allowed:
            return True

        return user.role in allowed


class IsStudent(permissions.BasePermission):
    """Allow access only to users with primary role STUDENT."""

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.role == user.RoleChoices.STUDENT


class IsStaff(permissions.BasePermission):
    """Allow access only to users with primary role STAFF."""

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.role == user.RoleChoices.STAFF


class IsSupervisor(permissions.BasePermission):
    """Allow access only to users with primary role SUPERVISOR."""

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.role == user.RoleChoices.SUPERVISOR


class IsAdmin(permissions.BasePermission):
    """Allow access only to admins (is_superuser or role=ADMIN)."""

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_superuser or user.role == user.RoleChoices.ADMIN


# =============================================================================
# RBAC PERMISSION-BASED PERMISSIONS
# =============================================================================

class HasPermission(permissions.BasePermission):
    """
    Permission that checks if the user has a specific permission code
    through their active role assignments.

    Usage:
        permission_classes = [IsAuthenticated, HasPermission]
        required_permission = 'student.read'
    """

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        required = getattr(view, 'required_permission', None)
        if not required:
            return True

        return user.has_perm_code(required)


class HasAnyPermission(permissions.BasePermission):
    """
    Permission that checks if user has ANY of the specified permissions.

    Usage:
        permission_classes = [IsAuthenticated, HasAnyPermission]
        required_permissions = ['student.read', 'student.admin']
    """

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        required = getattr(view, 'required_permissions', [])
        if not required:
            return True

        user_perms = user.permission_codes()
        return any(p in user_perms for p in required)


class HasAllPermissions(permissions.BasePermission):
    """
    Permission that checks if user has ALL of the specified permissions.

    Usage:
        permission_classes = [IsAuthenticated, HasAllPermissions]
        required_permissions = ['student.read', 'student.write']
    """

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False

        required = getattr(view, 'required_permissions', [])
        if not required:
            return True

        user_perms = user.permission_codes()
        return all(p in user_perms for p in required)


# =============================================================================
# ACCOUNT STATUS PERMISSIONS
# =============================================================================

class IsActiveAccount(permissions.BasePermission):
    """Allow access only to users with ACTIVE account status."""

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.account_status == user.AccountStatus.ACTIVE


class IsNotSuspended(permissions.BasePermission):
    """Deny access to suspended accounts."""

    def has_permission(self, request: Request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.account_status != user.AccountStatus.SUSPENDED


# =============================================================================
# COMPOSITE PERMISSIONS (Common combinations)
# =============================================================================

class IsActiveStudent(permissions.BasePermission):
    """Active (non-suspended) student who has confirmed identity."""

    def has_permission(self, request: Request, view) -> bool:
        checks = [
            IsStudent(),
            IsNotSuspended(),
            IsIdentityConfirmed(),
        ]
        return all(c.has_permission(request, view) for c in checks)


class IsActiveStaff(permissions.BasePermission):
    """Active (non-suspended) staff member."""

    def has_permission(self, request: Request, view) -> bool:
        checks = [
            IsStaff(),
            IsNotSuspended(),
        ]
        return all(c.has_permission(request, view) for c in checks)


class IsActiveSupervisor(permissions.BasePermission):
    """Active (non-suspended) supervisor."""

    def has_permission(self, request: Request, view) -> bool:
        checks = [
            IsSupervisor(),
            IsNotSuspended(),
        ]
        return all(c.has_permission(request, view) for c in checks)
