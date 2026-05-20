from rest_framework import permissions

from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin


class AnnouncementAdminPermission(permissions.BasePermission):
    """Platform admin with announcements permission."""

    def has_permission(self, request, view) -> bool:
        checker = EffectiveHasPermission()
        if not checker.has_permission(request, view):
            return False
        required = getattr(view, 'required_permission', 'announcements.view')
        if request.user and request.user.is_superuser:
            return True
        view.required_permission = required
        return checker.has_permission(request, view)


def announcement_view_permission():
    return [permissions.IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]


ANNOUNCEMENT_PERMISSIONS = {
    'view': 'announcements.view',
    'create': 'announcements.create',
    'edit': 'announcements.edit',
    'publish': 'announcements.publish',
    'archive': 'announcements.archive',
    'analytics': 'announcements.analytics',
    'targeting': 'announcements.targeting',
    'types_manage': 'announcements.types.manage',
    'recommendation': 'announcements.recommendation.manage',
}
