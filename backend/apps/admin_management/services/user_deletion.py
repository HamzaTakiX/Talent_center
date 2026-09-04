"""Hard-delete platform users (students, administrators, supervisors)."""

from __future__ import annotations

import logging
from typing import Callable, Optional

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import ProtectedError
from rest_framework.exceptions import PermissionDenied

from apps.admin_management.models import AdminProfile
from apps.admin_management.services.scopes import assert_student_in_scope

User = get_user_model()
logger = logging.getLogger(__name__)

ROLE_LABELS = {
    User.RoleChoices.STUDENT: 'student',
    User.RoleChoices.ADMIN: 'administrator',
    User.RoleChoices.SUPERVISOR: 'supervisor',
}


class UserDeletionError(Exception):
    def __init__(self, message: str, *, field: str = 'user') -> None:
        super().__init__(message)
        self.field = field


def _assert_not_self(*, target: User, acting_user: User) -> None:
    if target.pk == acting_user.pk:
        raise UserDeletionError('You cannot delete your own account.', field='self')


def _assert_role(user: User, expected_role: str) -> None:
    if user.role != expected_role:
        raise UserDeletionError(
            f'User is not a {ROLE_LABELS.get(expected_role, expected_role)}.',
            field='role',
        )


def _assert_last_super_admin(user: User) -> None:
    profile = getattr(user, 'admin_profile', None)
    if profile is None or profile.admin_level != AdminProfile.AdminLevel.SUPER:
        return
    remaining = (
        User.objects.filter(
            role=User.RoleChoices.ADMIN,
            admin_profile__admin_level=AdminProfile.AdminLevel.SUPER,
            admin_profile__is_active=True,
        )
        .exclude(pk=user.pk)
        .exists()
    )
    if not remaining:
        raise UserDeletionError(
            'Cannot delete the last active super administrator.',
            field='admin',
        )


def _unassign_microsoft_enterprise_app_before_delete(user: User) -> None:
    """
    Remove Enterprise Application assignment via Graph before deleting the TC user.

    Does NOT delete the Entra / Guest account — only the app role assignment.
    If Graph is not configured, deletion proceeds (local-only).
    If Graph is configured and unassign fails hard, block deletion so Azure is not left
    out of sync silently.
    """
    from apps.integrations.microsoft_graph.exceptions import (
        MicrosoftGraphError,
        MicrosoftUserNotFound,
    )
    from apps.integrations.microsoft_graph.service import MicrosoftGraphService
    from apps.integrations.microsoft_graph.sync import revoke_microsoft_enterprise_access

    graph = MicrosoftGraphService()
    if not graph.is_enabled():
        return

    email = (getattr(user, 'email', '') or '').strip()
    try:
        # update_local=False: the Talent Center row is about to be hard-deleted.
        revoke_microsoft_enterprise_access(user, update_local=False, service=graph)
    except MicrosoftUserNotFound:
        logger.info(
            'Delete user: Entra user already absent for email=%s (proceeding with TC delete)',
            email,
        )
    except MicrosoftGraphError as exc:
        logger.error(
            'Delete user blocked: Microsoft Graph unassign failed user_id=%s email=%s error=%s',
            getattr(user, 'pk', None),
            email,
            exc.message,
        )
        raise UserDeletionError(
            'Account was not deleted because Azure Enterprise Application sync failed. '
            f'{exc.message} Fix Graph permissions, then retry deletion.',
            field='microsoft',
        ) from exc


def delete_platform_user(
    *,
    user: User,
    acting_user: User,
    expected_role: str,
    scope_check: Optional[Callable[[User], None]] = None,
) -> None:
    _assert_not_self(target=user, acting_user=acting_user)
    _assert_role(user, expected_role)
    if expected_role == User.RoleChoices.ADMIN:
        _assert_last_super_admin(user)
    if scope_check is not None:
        try:
            scope_check(user)
        except PermissionDenied as exc:
            raise UserDeletionError(str(exc.detail), field='scope') from exc

    with transaction.atomic():
        # Unassign from Talent Center Auth0 Demo before hard delete.
        _unassign_microsoft_enterprise_app_before_delete(user)
        try:
            user.delete()
        except ProtectedError as exc:
            raise UserDeletionError(
                'This account is linked to protected records and cannot be deleted.',
                field='protected',
            ) from exc


def bulk_delete_platform_users(
    *,
    user_ids: list[int],
    acting_user: User,
    expected_role: str,
    queryset,
    scope_check: Optional[Callable[[User], None]] = None,
) -> dict:
    unique_ids = list(dict.fromkeys(user_ids))
    users_by_id = {
        u.pk: u
        for u in queryset.filter(pk__in=unique_ids)
    }
    deleted_ids: list[int] = []
    failed: list[dict] = []

    for user_id in unique_ids:
        user = users_by_id.get(user_id)
        if user is None:
            failed.append({'id': user_id, 'reason': 'User not found.'})
            continue
        try:
            with transaction.atomic():
                delete_platform_user(
                    user=user,
                    acting_user=acting_user,
                    expected_role=expected_role,
                    scope_check=scope_check,
                )
            deleted_ids.append(user_id)
        except UserDeletionError as exc:
            failed.append({'id': user_id, 'reason': str(exc)})
        except Exception:
            failed.append({'id': user_id, 'reason': 'Deletion failed.'})

    return {'deleted_ids': deleted_ids, 'failed': failed}


def student_scope_check(acting_user: User) -> Callable[[User], None]:
    def _check(user: User) -> None:
        assert_student_in_scope(acting_user, user)

    return _check
