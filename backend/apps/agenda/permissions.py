"""Calendar access gates. Object-level rules live in ``services.access``."""

from rest_framework import permissions

from apps.accounts_et_roles.models import User

CALENDAR_ROLES = {
    User.RoleChoices.STUDENT,
    User.RoleChoices.SUPERVISOR,
    User.RoleChoices.ADMIN,
    User.RoleChoices.STAFF,
}


class CanUseCalendar(permissions.BasePermission):
    """
    Gate for every calendar endpoint.

    Coarse by design — it only answers "may this account open a calendar at
    all". Which events they see and what they may change is decided per object
    in ``services.access``, so no endpoint relies on this class for isolation.
    """

    message = 'You do not have access to the calendar.'

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        if user.account_status in {
            User.AccountStatus.SUSPENDED,
            User.AccountStatus.BLOCKED,
            User.AccountStatus.ARCHIVED,
        }:
            return False
        return user.role in CALENDAR_ROLES
