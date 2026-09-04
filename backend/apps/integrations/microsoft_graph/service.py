"""
Microsoft Graph operations for Talent Center Enterprise Application assignments.

appRoleId resolution (do not invent IDs):
1. MICROSOFT_TALENT_CENTER_APP_ROLE_ID env override if set.
2. Otherwise read servicePrincipal.appRoles from Graph and prefer an enabled
   role that allows User members.
3. If the Enterprise Application defines no app roles, Microsoft Graph uses the
   well-known Default Access role ID:
   00000000-0000-0000-0000-000000000000
   (documented for apps without custom app roles).
"""

from __future__ import annotations

import logging
from typing import Any, Optional
from urllib.parse import quote

from django.conf import settings

from .client import MicrosoftGraphClient
from .exceptions import MicrosoftGraphError, MicrosoftGraphNotFound, MicrosoftUserNotFound

logger = logging.getLogger(__name__)

# Microsoft-documented Default Access role when the resource has no custom appRoles.
DEFAULT_ACCESS_APP_ROLE_ID = '00000000-0000-0000-0000-000000000000'


class MicrosoftGraphService:
    def __init__(self, client: MicrosoftGraphClient | None = None):
        self.client = client or MicrosoftGraphClient()

    @property
    def enterprise_app_object_id(self) -> str:
        return self.client.require_configured()['ENTERPRISE_APP_OBJECT_ID']

    def is_enabled(self) -> bool:
        return self.client.is_configured()

    def find_user_by_email(self, email: str) -> dict:
        """
        Resolve an Entra user by mail, userPrincipalName, or otherMails (guests).
        Raises MicrosoftUserNotFound when no match exists.
        """
        email = (email or '').strip()
        if not email:
            raise MicrosoftUserNotFound('Email is required to find a Microsoft account.')

        # Escape single quotes for OData.
        safe = email.replace("'", "''")
        filt = (
            f"mail eq '{safe}' or userPrincipalName eq '{safe}' "
            f"or otherMails/any(x:x eq '{safe}')"
        )
        try:
            payload = self.client.request(
                'GET',
                '/users',
                query={
                    '$filter': filt,
                    '$select': 'id,displayName,mail,userPrincipalName,otherMails,accountEnabled',
                    '$top': '5',
                },
            )
            users = (payload or {}).get('value') or []
        except MicrosoftGraphError:
            # some tenants restrict otherMails filter — fall back to mail/UPN only
            filt = f"mail eq '{safe}' or userPrincipalName eq '{safe}'"
            payload = self.client.request(
                'GET',
                '/users',
                query={
                    '$filter': filt,
                    '$select': 'id,displayName,mail,userPrincipalName,otherMails,accountEnabled',
                    '$top': '5',
                },
            )
            users = (payload or {}).get('value') or []

        if not users:
            # Fallback: direct lookup by UPN (works when filter is restricted).
            try:
                user = self.client.request(
                    'GET',
                    f'/users/{quote(email)}',
                    query={
                        '$select': 'id,displayName,mail,userPrincipalName,otherMails,accountEnabled',
                    },
                )
                if user and user.get('id'):
                    return user
            except MicrosoftGraphError:
                pass
            raise MicrosoftUserNotFound(
                f'Microsoft account not found for email "{email}".',
            )

        # Prefer exact mail/UPN/otherMails match (case-insensitive).
        email_l = email.lower()
        for user in users:
            mail = (user.get('mail') or '').lower()
            upn = (user.get('userPrincipalName') or '').lower()
            others = [str(x).lower() for x in (user.get('otherMails') or [])]
            if email_l in (mail, upn) or email_l in others:
                return user
        return users[0]

    def invite_guest_user(
        self,
        email: str,
        *,
        display_name: str = '',
        send_invitation_message: bool = False,
    ) -> dict:
        """
        Invite an external email into the Entra tenant as a guest user.

        Requires application permission User.Invite.All (or User.ReadWrite.All)
        with admin consent. Gmail / personal Microsoft accounts cannot be created
        as members; they must be invited as guests.
        """
        email = (email or '').strip().lower()
        if not email or '@' not in email:
            raise MicrosoftGraphError('A valid email is required to invite a Microsoft user.')

        from django.conf import settings as dj_settings

        redirect = (
            getattr(dj_settings, 'FRONTEND_BASE_URL', None)
            or getattr(dj_settings, 'FRONTEND_ORIGIN', None)
            or ''
        )
        redirect = str(redirect).strip().rstrip('/')
        # Graph requires a valid absolute HTTPS inviteRedirectUrl.
        if redirect.startswith('https://'):
            invite_redirect = f'{redirect}/login'
        else:
            invite_redirect = 'https://myapps.microsoft.com'
        body = {
            'invitedUserEmailAddress': email,
            'inviteRedirectUrl': invite_redirect,
            'sendInvitationMessage': bool(send_invitation_message),
        }
        if display_name:
            body['invitedUserDisplayName'] = display_name.strip()

        try:
            invitation = self.client.request(
                'POST',
                '/invitations',
                json_body=body,
                expected=(201,),
            )
        except MicrosoftGraphError as exc:
            # Graph often returns 401 (not only 403) when Invite permission is missing.
            msg = (exc.message or '').lower()
            details_l = str(exc.details or '').lower()
            privilege_denied = (
                exc.status_code in (401, 403)
                and (
                    'insufficient privileges' in msg
                    or 'authorization_requestdenied' in msg
                    or 'authorization_requestdenied' in details_l
                    or 'msgraphinviteapi' in details_l
                    or 'createinvite' in details_l
                )
            )
            if privilege_denied:
                raise MicrosoftGraphError(
                    'Microsoft Graph cannot invite users into Entra. On app registration '
                    '"Talent Center Backend Graph", add application permission User.Invite.All '
                    '(or User.ReadWrite.All), click Grant admin consent, then retry.',
                    status_code=exc.status_code,
                    details=exc.details,
                ) from exc
            raise

        invited = (invitation or {}).get('invitedUser') or {}
        entra_id = invited.get('id')
        if not entra_id:
            # Invitation accepted / user already pending — re-resolve by email.
            try:
                found = self.find_user_by_email(email)
                entra_id = found.get('id')
                invited = found
            except MicrosoftUserNotFound as exc:
                raise MicrosoftGraphError(
                    f'Invitation created for "{email}" but Entra user id was not returned.',
                ) from exc

        logger.info(
            'Invited Microsoft guest user email=%s entra_user_id=%s status=%s',
            email,
            entra_id,
            (invitation or {}).get('status'),
        )
        return {
            'id': entra_id,
            'mail': email,
            'userPrincipalName': invited.get('userPrincipalName'),
            'displayName': display_name or invited.get('displayName') or email,
            'invited': True,
            'invitation_status': (invitation or {}).get('status'),
        }

    def ensure_user_in_directory(
        self,
        email: str,
        *,
        display_name: str = '',
    ) -> dict:
        """
        Find the Entra user by email, or invite them as a guest when missing.

        Then the caller can assign them to the Enterprise Application (Users and groups).
        """
        try:
            user = self.find_user_by_email(email)
            return {**user, 'invited': False, 'created': False}
        except MicrosoftUserNotFound:
            logger.info(
                'Entra user missing for email=%s — inviting as guest into tenant',
                email,
            )
            invited = self.invite_guest_user(email, display_name=display_name)
            return {**invited, 'created': True}

    def resolve_app_role_id(self) -> str:
        cfg = self.client.require_configured()
        configured = (cfg.get('APP_ROLE_ID') or '').strip()
        if configured:
            return configured

        sp = self.client.request(
            'GET',
            f'/servicePrincipals/{self.enterprise_app_object_id}',
            query={'$select': 'id,appId,displayName,appRoles'},
        )
        roles = (sp or {}).get('appRoles') or []
        enabled_user_roles = [
            r for r in roles
            if r.get('isEnabled', True)
            and 'User' in (r.get('allowedMemberTypes') or [])
        ]
        if enabled_user_roles:
            # Prefer a role named User / Default Access / Default when present.
            for preferred in ('User', 'Default Access', 'Default', 'msiam_access'):
                for role in enabled_user_roles:
                    if (role.get('displayName') or '').strip().lower() == preferred.lower():
                        role_id = role.get('id')
                        if role_id:
                            logger.info(
                                'Using Enterprise App role displayName=%s id=%s',
                                role.get('displayName'),
                                role_id,
                            )
                            return role_id
            role_id = enabled_user_roles[0].get('id')
            if role_id:
                logger.info(
                    'Using first enabled User appRole displayName=%s id=%s',
                    enabled_user_roles[0].get('displayName'),
                    role_id,
                )
                return role_id

        logger.info(
            'Enterprise Application has no custom User appRoles; '
            'using Microsoft Default Access role id=%s',
            DEFAULT_ACCESS_APP_ROLE_ID,
        )
        return DEFAULT_ACCESS_APP_ROLE_ID

    def list_user_app_role_assignments(self, entra_user_id: str) -> list[dict]:
        payload = self.client.request(
            'GET',
            f'/users/{entra_user_id}/appRoleAssignments',
        )
        return (payload or {}).get('value') or []

    def find_assignment(self, entra_user_id: str) -> Optional[dict]:
        resource_id = self.enterprise_app_object_id.lower()
        for assignment in self.list_user_app_role_assignments(entra_user_id):
            if (assignment.get('resourceId') or '').lower() == resource_id:
                return assignment
        return None

    def is_user_assigned(self, entra_user_id: str) -> bool:
        return self.find_assignment(entra_user_id) is not None

    def assign_user(self, entra_user_id: str) -> dict:
        """
        Assign the Entra user to the Talent Center Enterprise Application.
        Idempotent: returns the existing assignment if already present.
        """
        existing = self.find_assignment(entra_user_id)
        if existing:
            logger.info(
                'Microsoft Enterprise App assignment already exists assignment_id=%s user_id=%s',
                existing.get('id'),
                entra_user_id,
            )
            return {'created': False, 'assignment': existing}

        app_role_id = self.resolve_app_role_id()
        body = {
            'principalId': entra_user_id,
            'resourceId': self.enterprise_app_object_id,
            'appRoleId': app_role_id,
        }
        try:
            assignment = self.client.request(
                'POST',
                f'/users/{entra_user_id}/appRoleAssignments',
                json_body=body,
                expected=(201,),
            )
        except MicrosoftGraphError as exc:
            # Concurrent / duplicate assignment race.
            details = str(exc.details).lower() if exc.details else ''
            if exc.status_code in (400, 409) and (
                'already' in (exc.message or '').lower()
                or 'permissionbeingassigned' in details
                or 'conflicttype' in details
            ):
                existing = self.find_assignment(entra_user_id)
                if existing:
                    return {'created': False, 'assignment': existing}
            raise

        logger.info(
            'Assigned Microsoft user to Enterprise App user_id=%s assignment_id=%s appRoleId=%s',
            entra_user_id,
            (assignment or {}).get('id'),
            app_role_id,
        )
        return {'created': True, 'assignment': assignment or {}}

    def remove_user_assignment(self, entra_user_id: str) -> dict:
        """
        Remove the Enterprise Application assignment for the Entra user.

        Idempotent:
        - no assignment → success (removed=False)
        - DELETE returns 404 → success (already gone)
        Never deletes the Entra user or guest account — only the appRoleAssignment.
        """
        existing = self.find_assignment(entra_user_id)
        if not existing:
            logger.info(
                'No Microsoft Enterprise App assignment to remove user_id=%s',
                entra_user_id,
            )
            return {'removed': False, 'assignment_id': None, 'already_absent': True}

        assignment_id = existing.get('id')
        try:
            self.client.request(
                'DELETE',
                f'/users/{entra_user_id}/appRoleAssignments/{assignment_id}',
                expected=(204,),
            )
        except MicrosoftGraphNotFound:
            # Assignment disappeared between list and delete (or already revoked).
            logger.info(
                'Microsoft Enterprise App assignment already gone user_id=%s assignment_id=%s',
                entra_user_id,
                assignment_id,
            )
            return {
                'removed': False,
                'assignment_id': assignment_id,
                'already_absent': True,
            }

        logger.info(
            'Removed Microsoft Enterprise App assignment user_id=%s assignment_id=%s',
            entra_user_id,
            assignment_id,
        )
        return {
            'removed': True,
            'assignment_id': assignment_id,
            'already_absent': False,
        }

    def get_access_for_email(self, email: str) -> dict[str, Any]:
        user = self.find_user_by_email(email)
        assignment = self.find_assignment(user['id'])
        return {
            'microsoft_access': assignment is not None,
            'entra_user_id': user.get('id'),
            'entra_user_principal_name': user.get('userPrincipalName') or user.get('mail'),
            'assignment_id': (assignment or {}).get('id'),
        }
