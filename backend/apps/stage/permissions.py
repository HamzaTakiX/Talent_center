"""REST API permissions for internship offers module."""

from rest_framework.permissions import BasePermission

from apps.accounts_et_roles.models import User
from apps.accounts_et_roles.permissions import IsStudent
from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
from apps.stage.services.permissions import user_can_manage_offers


class CanManageInternshipOffers(BasePermission):
    def has_permission(self, request, view):
        return user_can_manage_offers(request.user)


STAGE_ADMIN_PERMISSIONS = [IsPlatformAdmin, EffectiveHasPermission]
STAGE_MANAGE_PERMISSION = 'internship.manage'


class IsStudentOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if user_can_manage_offers(request.user):
            return True
        return request.user.role == User.RoleChoices.STUDENT
