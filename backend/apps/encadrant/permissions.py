"""Permissions for supervision report APIs."""

from rest_framework import permissions

from apps.accounts_et_roles.models import User
from apps.admin_management.permissions import EffectiveHasPermission
from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.admin_management.services.scopes import is_super_admin
from apps.admin_management.services.report_scopes import assert_report_in_scope, report_in_admin_scope


class IsSupervisor(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.role == User.RoleChoices.SUPERVISOR)


class HasReportPermission(EffectiveHasPermission):
    """Admin must hold required_permission on the view."""

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.role != User.RoleChoices.ADMIN and not user.is_superuser:
            return False
        required = getattr(view, 'required_permission', 'reports.access')
        if user.is_superuser or is_super_admin(user):
            return True
        return required in get_admin_effective_permissions(user)


class ReportObjectPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user
        if user.role == User.RoleChoices.SUPERVISOR:
            enc = getattr(user, 'supervisor_profile', None)
            if enc and hasattr(enc, 'encadrant_profile'):
                return obj.encadrant_profile_id == enc.encadrant_profile.pk
            return False
        if user.role == User.RoleChoices.ADMIN or user.is_superuser:
            return report_in_admin_scope(user, obj)
        return False


class HasMeetingPermission(EffectiveHasPermission):
    """Admin must hold required_permission on the view (meetings module)."""

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.role != User.RoleChoices.ADMIN and not user.is_superuser:
            return False
        required = getattr(view, 'required_permission', 'meetings.access')
        if user.is_superuser or is_super_admin(user):
            return True
        return required in get_admin_effective_permissions(user)


class MeetingObjectPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        from apps.admin_management.services.meeting_scopes import meeting_in_admin_scope

        user = request.user
        if user.role == User.RoleChoices.SUPERVISOR:
            enc = getattr(user, 'supervisor_profile', None)
            if enc and hasattr(enc, 'encadrant_profile'):
                return obj.encadrant_profile_id == enc.encadrant_profile.pk
            return False
        if user.role == User.RoleChoices.ADMIN or user.is_superuser:
            return meeting_in_admin_scope(user, obj)
        return False
