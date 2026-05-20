from rest_framework import permissions

from apps.accounts_et_roles.permissions import HasPermission

from .models import AdminProfile
from .services.admins import get_admin_effective_permissions, user_can_manage_admins
from .services.scopes import assert_student_in_scope, is_super_admin


class IsPlatformAdmin(permissions.BasePermission):
    """Admin or superuser staff managing the platform."""

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        return user.role == user.RoleChoices.ADMIN


class IsPlatformAdminOrStudentCatalogRead(permissions.BasePermission):
    """
    Academic reference list APIs only (filieres, class groups, years, etc.).
    Platform operators: full GET access. Students: read-only GET for onboarding forms.
    """

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method not in permissions.SAFE_METHODS:
            return IsPlatformAdmin().has_permission(request, view)
        if user.is_superuser:
            return True
        if user.role in (
            user.RoleChoices.ADMIN,
            user.RoleChoices.STAFF,
            user.RoleChoices.SUPERVISOR,
        ):
            return True
        if user.role == user.RoleChoices.STUDENT:
            return True
        return False


class IsSuperAdmin(permissions.BasePermission):
    """Super administrator — full platform and admin lifecycle access."""

    def has_permission(self, request, view) -> bool:
        return is_super_admin(request.user)


class CanManageAdministrators(permissions.BasePermission):
    """Super admin or holder of admins.manage permission."""

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user_can_manage_admins(user)


class ScopedStudentAccess(permissions.BasePermission):
    """Enforce academic scope on student detail/mutation views."""

    def has_permission(self, request, view) -> bool:
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj) -> bool:
        assert_student_in_scope(request.user, obj)
        return True


class EffectiveHasPermission(HasPermission):
    """HasPermission that also checks AdminProfile.extra_permission_codes."""

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        required = getattr(view, 'required_permission', None)
        if not required:
            return True
        if user.is_superuser or is_super_admin(user):
            return True
        return required in get_admin_effective_permissions(user)
