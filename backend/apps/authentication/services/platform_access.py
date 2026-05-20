"""Platform access authorization — SSO identity ≠ platform access."""

from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

LOGIN_ALLOWED_STATUSES = frozenset({
    User.AccountStatus.AUTHORIZED,
    User.AccountStatus.ACTIVE,
})


def can_access_platform(user) -> bool:
    """Return True if the user may authenticate and use the platform."""
    if not user or not user.is_active:
        return False

    if user.account_status in (
        User.AccountStatus.SUSPENDED,
        User.AccountStatus.BLOCKED,
        User.AccountStatus.ARCHIVED,
        User.AccountStatus.LOCKED,
    ):
        return False

    if user.role in (User.RoleChoices.ADMIN, User.RoleChoices.STAFF, User.RoleChoices.SUPERVISOR):
        if not user.platform_access_granted:
            return False
        if user.role == User.RoleChoices.ADMIN:
            try:
                admin_profile = user.admin_profile
                if not admin_profile.is_active:
                    return False
            except Exception:
                return False
        return user.account_status in LOGIN_ALLOWED_STATUSES

    if user.role == User.RoleChoices.STUDENT:
        return (
            user.platform_access_granted
            and user.account_status in LOGIN_ALLOWED_STATUSES
        )

    return user.account_status in LOGIN_ALLOWED_STATUSES


def platform_access_denial_reason(user) -> str:
    if not user.is_active:
        return 'Account is disabled.'
    if user.account_status == User.AccountStatus.PENDING:
        return 'Your account is pending admin authorization.'
    if user.account_status == User.AccountStatus.SUSPENDED:
        return 'Your account has been suspended.'
    if user.account_status == User.AccountStatus.BLOCKED:
        return 'Your account has been blocked.'
    if user.account_status == User.AccountStatus.ARCHIVED:
        return 'Your account has been archived.'
    if user.role in (
        User.RoleChoices.STUDENT,
        User.RoleChoices.ADMIN,
        User.RoleChoices.STAFF,
        User.RoleChoices.SUPERVISOR,
    ) and not user.platform_access_granted:
        return 'Platform access has not been granted by an administrator.'
    if user.role == User.RoleChoices.ADMIN:
        try:
            if not user.admin_profile.is_active:
                return 'Administrator account is deactivated.'
        except Exception:
            return 'Administrator profile is not configured.'
    if user.account_status not in LOGIN_ALLOWED_STATUSES:
        return 'Account is not authorized to access the platform.'
    return 'Account is not active.'


def grant_platform_access(user, *, granted_by=None) -> None:
    user.platform_access_granted = True
    user.platform_access_granted_at = timezone.now()
    user.platform_access_granted_by = granted_by
    if user.account_status == User.AccountStatus.PENDING:
        user.account_status = User.AccountStatus.AUTHORIZED
    user.save(update_fields=[
        'platform_access_granted',
        'platform_access_granted_at',
        'platform_access_granted_by',
        'account_status',
        'updated_at',
    ])


def revoke_platform_access(user) -> None:
    user.platform_access_granted = False
    if user.account_status in LOGIN_ALLOWED_STATUSES:
        user.account_status = User.AccountStatus.PENDING
    user.save(update_fields=['platform_access_granted', 'account_status', 'updated_at'])
