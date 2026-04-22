
from rest_framework.permissions import BasePermission


class IsActiveUser(BasePermission):
    """Allows only authenticated users whose account_status is ACTIVE."""

    message = 'Account is not active.'

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, 'account_status', None) == 'ACTIVE'
        )
