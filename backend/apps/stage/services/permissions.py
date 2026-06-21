"""Permission matrix for internship offers module."""

from __future__ import annotations

from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.admin_management.services.scopes import is_super_admin
from apps.stage.services.exceptions import OfferPermissionError

PERMISSION_MANAGE = 'internship.manage'
PERMISSION_VIEW_ANALYTICS = 'internship.manage'
PERMISSION_IMPORT = 'internship.manage'
PERMISSION_DELETE = 'internship.manage'


def _effective_permissions(user) -> set[str]:
    if not user or not user.is_authenticated:
        return set()
    if user.is_superuser or is_super_admin(user):
        return {PERMISSION_MANAGE, PERMISSION_VIEW_ANALYTICS, PERMISSION_IMPORT, PERMISSION_DELETE}
    return get_admin_effective_permissions(user)


def user_can_manage_offers(user) -> bool:
    return PERMISSION_MANAGE in _effective_permissions(user)


def user_can_import_offers(user) -> bool:
    return PERMISSION_IMPORT in _effective_permissions(user)


def user_can_view_analytics(user) -> bool:
    return PERMISSION_VIEW_ANALYTICS in _effective_permissions(user)


def user_can_hard_delete(user) -> bool:
    return user and (user.is_superuser or is_super_admin(user))


def user_can_publish(user) -> bool:
    return user_can_manage_offers(user)


def user_can_manage_applications(user) -> bool:
    return user_can_manage_offers(user)


def user_can_access_chat(user) -> bool:
    if not user or not user.is_authenticated:
        return False
    from apps.accounts_et_roles.models import User

    if user.role == User.RoleChoices.STUDENT:
        return True
    return user_can_manage_offers(user)


def assert_can_manage_offers(user) -> None:
    if not user_can_manage_offers(user):
        raise OfferPermissionError('You do not have permission to manage internship offers.')


def assert_can_import_offers(user) -> None:
    if not user_can_import_offers(user):
        raise OfferPermissionError('You do not have permission to import internship offers.')


def assert_can_hard_delete(user) -> None:
    if not user_can_hard_delete(user):
        raise OfferPermissionError('Only Super Administrators can permanently delete offers.')


def assert_can_manage_applications(user) -> None:
    if not user_can_manage_applications(user):
        raise OfferPermissionError('You do not have permission to manage applications.')


def permission_matrix() -> dict[str, dict[str, bool]]:
    """Documented permission matrix for all internship roles."""
    return {
        'create_offer': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': False},
        'edit_offer': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': False},
        'publish_offer': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': False},
        'archive_offer': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': False},
        'delete_offer': {'super_admin': True, 'internship_admin': False, 'student': False, 'company_user': False},
        'import_offers': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': False},
        'manage_companies': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': False},
        'manage_applications': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': True},
        'apply': {'super_admin': False, 'internship_admin': False, 'student': True, 'company_user': False},
        'view_analytics': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': False},
        'manage_collections': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': False},
        'manage_interviews': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': True},
        'access_chat': {'super_admin': True, 'internship_admin': True, 'student': True, 'company_user': True},
        'view_pipeline': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': True},
        'manage_webhooks': {'super_admin': True, 'internship_admin': False, 'student': False, 'company_user': False},
        'manage_sla': {'super_admin': True, 'internship_admin': True, 'student': False, 'company_user': False},
    }
