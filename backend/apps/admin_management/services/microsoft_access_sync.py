"""Bridge Talent Center platform access toggles to Microsoft Graph Enterprise App assignment."""

from __future__ import annotations

import logging

from apps.authentication.services.platform_access import (
    grant_platform_access,
    revoke_platform_access,
)
from apps.integrations.microsoft_graph.exceptions import (
    MicrosoftGraphConfigError,
    MicrosoftGraphError,
    MicrosoftGraphForbidden,
    MicrosoftGraphUnauthorized,
    MicrosoftUserNotFound,
)
from apps.integrations.microsoft_graph.service import MicrosoftGraphService
from apps.integrations.microsoft_graph.sync import (
    grant_microsoft_enterprise_access,
    revoke_microsoft_enterprise_access,
)

logger = logging.getLogger(__name__)


class MicrosoftAccessSyncError(ValueError):
    """Raised when Microsoft Graph sync fails during an admin access change."""

    def __init__(self, message: str, *, local_revoked: bool = False):
        super().__init__(message)
        self.message = message
        self.local_revoked = local_revoked


def apply_platform_access_with_microsoft_sync(
    user,
    *,
    grant: bool,
    granted_by=None,
) -> dict | None:
    """
    Grant/revoke Talent Center platform access and keep Entra Enterprise App in sync.

    When Graph is not configured, behaves like plain grant_platform_access / revoke_platform_access.
    When Graph is configured:
    - GRANT: Graph assignment then local grant (failure → no local grant).
    - REVOKE: local revoke first, then Graph unassign. If Graph fails after local revoke,
      raises MicrosoftAccessSyncError(local_revoked=True) so callers report sync failure
      without restoring Talent Center access.
    """
    graph = MicrosoftGraphService()
    if not graph.is_enabled():
        if grant:
            grant_platform_access(user, granted_by=granted_by)
        else:
            revoke_platform_access(user)
        return None

    try:
        if grant:
            return grant_microsoft_enterprise_access(
                user,
                granted_by=granted_by,
                update_local=True,
                service=graph,
            )

        return revoke_microsoft_enterprise_access(
            user,
            update_local=True,
            service=graph,
        )
    except MicrosoftUserNotFound as exc:
        # Grant path only (revoke treats missing Entra user as success).
        raise MicrosoftAccessSyncError(exc.message) from exc
    except MicrosoftGraphConfigError as exc:
        raise MicrosoftAccessSyncError(exc.message) from exc
    except (MicrosoftGraphUnauthorized, MicrosoftGraphForbidden) as exc:
        local_revoked = (not grant) and (not bool(getattr(user, 'platform_access_granted', True)))
        logger.error(
            'Microsoft Graph auth/permission error during %s user_id=%s error=%s',
            'grant' if grant else 'revoke',
            getattr(user, 'pk', None),
            exc.message,
        )
        msg = exc.message
        if local_revoked:
            msg = (
                f'{exc.message} Talent Center access was revoked, but Azure Enterprise '
                f'Application sync failed. Re-check Graph app permissions and retry sync.'
            )
        raise MicrosoftAccessSyncError(msg, local_revoked=local_revoked) from exc
    except MicrosoftGraphError as exc:
        local_revoked = (not grant) and (not bool(getattr(user, 'platform_access_granted', True)))
        logger.error(
            'Microsoft Graph error during %s user_id=%s status=%s error=%s',
            'grant' if grant else 'revoke',
            getattr(user, 'pk', None),
            getattr(exc, 'status_code', None),
            exc.message,
        )
        msg = exc.message
        if local_revoked:
            msg = (
                f'{exc.message} Talent Center access was revoked, but Azure Enterprise '
                f'Application sync failed.'
            )
        raise MicrosoftAccessSyncError(msg, local_revoked=local_revoked) from exc


def ensure_microsoft_assignment_for_new_user(user, *, granted_by=None) -> None:
    """
    After creating a user with grant_access=True, ensure Entra assignment exists.

    On failure, revokes local platform access so TC does not claim access was granted.
    """
    graph = MicrosoftGraphService()
    if not graph.is_enabled():
        return
    if not getattr(user, 'platform_access_granted', False):
        return

    try:
        grant_microsoft_enterprise_access(
            user,
            granted_by=granted_by,
            update_local=False,
            service=graph,
        )
    except (MicrosoftUserNotFound, MicrosoftGraphError) as exc:
        revoke_platform_access(user)
        raise MicrosoftAccessSyncError(str(exc)) from exc
