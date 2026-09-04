"""
Synchronize Talent Center platform access with Entra Enterprise App assignment.

Auth0 remains the login broker. This module only manages Graph appRoleAssignments.
"""

from __future__ import annotations

import logging
from typing import Any

from django.db import transaction

from apps.authentication.services.platform_access import (
    grant_platform_access,
    revoke_platform_access,
)

from .exceptions import (
    MicrosoftGraphConfigError,
    MicrosoftGraphError,
    MicrosoftUserNotFound,
)
from .service import MicrosoftGraphService

logger = logging.getLogger(__name__)


def _match_email(user) -> str:
    return (getattr(user, 'email', '') or '').strip().lower()


def _display_name(user) -> str:
    profile = getattr(user, 'profile', None)
    if profile is not None:
        name = f'{getattr(profile, "first_name", "")} {getattr(profile, "last_name", "")}'.strip()
        if name:
            return name
    email = _match_email(user)
    return email.split('@')[0] if email else 'Talent Center user'


def get_microsoft_access_status(user, *, service: MicrosoftGraphService | None = None) -> dict[str, Any]:
    graph = service or MicrosoftGraphService()
    if not graph.is_enabled():
        return {
            'configured': False,
            'microsoft_access': False,
            'entra_user_id': None,
            'message': 'Microsoft Graph integration is not configured.',
        }
    try:
        data = graph.get_access_for_email(_match_email(user))
        return {
            'configured': True,
            'microsoft_access': bool(data.get('microsoft_access')),
            'entra_user_id': data.get('entra_user_id'),
            'entra_user_principal_name': data.get('entra_user_principal_name'),
            'assignment_id': data.get('assignment_id'),
            'message': 'OK',
        }
    except MicrosoftUserNotFound as exc:
        return {
            'configured': True,
            'microsoft_access': False,
            'entra_user_id': None,
            'message': exc.message,
        }
    except MicrosoftGraphError as exc:
        return {
            'configured': True,
            'microsoft_access': False,
            'entra_user_id': None,
            'message': exc.message,
            'error': True,
        }


def grant_microsoft_enterprise_access(
    user,
    *,
    granted_by=None,
    update_local: bool = True,
    service: MicrosoftGraphService | None = None,
) -> dict[str, Any]:
    """
    Ensure Entra directory user exists (invite guest if needed), assign Enterprise App,
    then grant Talent Center platform access.

    If Graph succeeds and local DB update fails, compensating Graph unassign runs.
    If Graph fails, local access is not granted.
    """
    graph = service or MicrosoftGraphService()
    if not graph.is_enabled():
        raise MicrosoftGraphConfigError(
            'Microsoft Graph is not configured; cannot grant Microsoft Enterprise access.',
        )

    email = _match_email(user)
    entra_user = graph.ensure_user_in_directory(
        email,
        display_name=_display_name(user),
    )
    entra_user_id = entra_user['id']
    assignment_result = graph.assign_user(entra_user_id)

    if update_local:
        try:
            with transaction.atomic():
                grant_platform_access(user, granted_by=granted_by)
                if not getattr(user, 'sso_enabled', False):
                    user.sso_enabled = True
                    user.save(update_fields=['sso_enabled', 'updated_at'])
        except Exception:
            # Compensate: remove Entra assignment created in this call.
            if assignment_result.get('created'):
                try:
                    graph.remove_user_assignment(entra_user_id)
                except MicrosoftGraphError as compensate_exc:
                    logger.error(
                        'Compensating Graph unassign failed after local grant error '
                        'user_id=%s entra_user_id=%s error=%s',
                        getattr(user, 'pk', None),
                        entra_user_id,
                        compensate_exc.message,
                    )
            raise

    return {
        'success': True,
        'microsoft_access': True,
        'entra_user_id': entra_user_id,
        'assignment_id': (assignment_result.get('assignment') or {}).get('id'),
        'created': bool(assignment_result.get('created')),
        'invited': bool(entra_user.get('invited') or entra_user.get('created')),
        'platform_access_granted': bool(getattr(user, 'platform_access_granted', False)),
    }


def revoke_microsoft_enterprise_access(
    user,
    *,
    update_local: bool = True,
    service: MicrosoftGraphService | None = None,
) -> dict[str, Any]:
    """
    Revoke Talent Center platform access, then remove Entra Enterprise App assignment.

    Order (business rule):
    1. revoke_platform_access() in Talent Center DB (when update_local=True)
    2. DELETE appRoleAssignment on Enterprise Application via Graph

    Never deletes the Entra user / guest / email — only the app assignment.

    Idempotent:
    - Entra user missing → treated as already unassigned
    - assignment missing / Graph 404 → treated as synchronized success
    - Graph 401/403 (or other hard errors) → local access stays revoked; raises so
      callers can report Azure sync failure
    """
    graph = service or MicrosoftGraphService()
    if not graph.is_enabled():
        raise MicrosoftGraphConfigError(
            'Microsoft Graph is not configured; cannot revoke Microsoft Enterprise access.',
        )

    if update_local:
        revoke_platform_access(user)

    email = _match_email(user)
    entra_user_id = None
    removed = False
    already_absent = False
    try:
        entra_user = graph.find_user_by_email(email)
        entra_user_id = entra_user['id']
        remove_result = graph.remove_user_assignment(entra_user_id)
        removed = bool(remove_result.get('removed'))
        already_absent = bool(remove_result.get('already_absent')) or not removed
    except MicrosoftUserNotFound:
        already_absent = True
        logger.info(
            'Revoke Microsoft access: Entra user not found for email=%s '
            '(treated as unassigned; Microsoft account was not deleted)',
            email,
        )

    user.refresh_from_db()
    return {
        'success': True,
        'microsoft_access': False,
        'entra_user_id': entra_user_id,
        'removed': removed,
        'already_absent': already_absent,
        'platform_access_granted': bool(getattr(user, 'platform_access_granted', False)),
        'graph_synced': True,
    }


def sync_microsoft_access_after_platform_change(
    user,
    *,
    grant: bool,
    granted_by=None,
    service: MicrosoftGraphService | None = None,
) -> dict[str, Any] | None:
    """
    Best-effort sync helper for existing admin flows.

    Returns None when Graph is not configured (no-op).
    Raises MicrosoftGraphError / MicrosoftUserNotFound on failure so callers can roll back.
    """
    graph = service or MicrosoftGraphService()
    if not graph.is_enabled():
        return None
    if grant:
        return grant_microsoft_enterprise_access(
            user,
            granted_by=granted_by,
            update_local=False,
            service=graph,
        )
    return revoke_microsoft_enterprise_access(
        user,
        update_local=False,
        service=graph,
    )
