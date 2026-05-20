from rest_framework import permissions

from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
from apps.history.services.visibility import user_has_global_history


class HistoryAccessPermission(permissions.BasePermission):
    """Any authenticated platform user may access scoped history."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)


class HistoryGlobalPermission(permissions.BasePermission):
    """Global history center — platform admins with history.global.access."""

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if request.user.role != request.user.RoleChoices.ADMIN:
            return False
        return user_has_global_history(request.user)


class HistoryExportPermission(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        checker = EffectiveHasPermission()
        view.required_permission = 'history.export'
        if request.user and request.user.is_superuser:
            return True
        if not IsPlatformAdmin().has_permission(request, view):
            return False
        return checker.has_permission(request, view)


def history_read_permissions():
    return [permissions.IsAuthenticated, HistoryAccessPermission]


def history_global_permissions():
    return [permissions.IsAuthenticated, IsPlatformAdmin, HistoryGlobalPermission]


def history_export_permissions():
    return [permissions.IsAuthenticated, HistoryExportPermission]
