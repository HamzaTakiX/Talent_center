from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, override_settings

from apps.admin_management.services.microsoft_access_sync import (
    MicrosoftAccessSyncError,
    apply_platform_access_with_microsoft_sync,
)
from apps.integrations.microsoft_graph.client import MicrosoftGraphClient
from apps.integrations.microsoft_graph.exceptions import (
    MicrosoftGraphConfigError,
    MicrosoftGraphForbidden,
    MicrosoftGraphNotFound,
    MicrosoftGraphUnauthorized,
    MicrosoftUserNotFound,
)
from apps.integrations.microsoft_graph.service import (
    DEFAULT_ACCESS_APP_ROLE_ID,
    MicrosoftGraphService,
)
from apps.integrations.microsoft_graph.sync import (
    get_microsoft_access_status,
    grant_microsoft_enterprise_access,
    revoke_microsoft_enterprise_access,
)

User = get_user_model()

GRAPH_SETTINGS = {
    'ENABLED': True,
    'TENANT_ID': 'tenant-id',
    'CLIENT_ID': 'client-id',
    'CLIENT_SECRET': 'client-secret',
    'ENTERPRISE_APP_OBJECT_ID': 'sp-object-id',
    'APP_ROLE_ID': '',
}


def _mock_user(*, granted: bool = False, email: str = 'student@esca.ma'):
    user = MagicMock()
    user.pk = 42
    user.email = email
    user.platform_access_granted = granted
    user.sso_enabled = True
    user.account_status = (
        User.AccountStatus.AUTHORIZED if granted else User.AccountStatus.PENDING
    )
    user.profile = None
    user.refresh_from_db = MagicMock()
    return user


@override_settings(MICROSOFT_GRAPH=GRAPH_SETTINGS)
class MicrosoftGraphServiceTests(SimpleTestCase):
    def setUp(self):
        self.http = MagicMock(spec=MicrosoftGraphClient)
        self.http.is_configured.return_value = True
        self.http.require_configured.return_value = GRAPH_SETTINGS
        self.service = MicrosoftGraphService(client=self.http)

    def test_find_user_by_email(self):
        self.http.request.return_value = {
            'value': [{
                'id': 'entra-1',
                'mail': 'student@esca.ma',
                'userPrincipalName': 'student@esca.ma',
            }],
        }
        user = self.service.find_user_by_email('student@esca.ma')
        self.assertEqual(user['id'], 'entra-1')

    def test_find_user_not_found(self):
        def _req(method, path, **kwargs):
            if path.startswith('/users/') and not path.endswith('/appRoleAssignments'):
                raise MicrosoftGraphNotFound('not found', status_code=404)
            return {'value': []}

        self.http.request.side_effect = _req
        with self.assertRaises(MicrosoftUserNotFound):
            self.service.find_user_by_email('missing@esca.ma')

    def test_detect_existing_assignment(self):
        self.http.request.return_value = {
            'value': [{
                'id': 'asg-1',
                'resourceId': 'sp-object-id',
                'principalId': 'entra-1',
            }],
        }
        self.assertTrue(self.service.is_user_assigned('entra-1'))

    def test_assign_user_creates_assignment(self):
        self.http.request.side_effect = [
            {'value': []},
            {
                'id': 'sp-object-id',
                'appRoles': [{
                    'id': 'role-user',
                    'isEnabled': True,
                    'allowedMemberTypes': ['User'],
                    'displayName': 'User',
                }],
            },
            {'id': 'asg-new', 'resourceId': 'sp-object-id'},
        ]
        result = self.service.assign_user('entra-1')
        self.assertTrue(result['created'])
        self.assertEqual(result['assignment']['id'], 'asg-new')

    def test_assign_user_idempotent_duplicate(self):
        existing = {'id': 'asg-1', 'resourceId': 'sp-object-id'}
        self.http.request.return_value = {'value': [existing]}
        result = self.service.assign_user('entra-1')
        self.assertFalse(result['created'])
        self.assertEqual(result['assignment']['id'], 'asg-1')

    def test_remove_user_assignment(self):
        self.http.request.side_effect = [
            {'value': [{'id': 'asg-1', 'resourceId': 'sp-object-id'}]},
            None,
        ]
        result = self.service.remove_user_assignment('entra-1')
        self.assertTrue(result['removed'])
        self.assertEqual(result['assignment_id'], 'asg-1')
        delete_call = self.http.request.call_args_list[-1]
        self.assertEqual(delete_call.args[0], 'DELETE')
        self.assertEqual(
            delete_call.args[1],
            '/users/entra-1/appRoleAssignments/asg-1',
        )

    def test_remove_user_assignment_when_none_exists(self):
        self.http.request.return_value = {'value': []}
        result = self.service.remove_user_assignment('entra-1')
        self.assertFalse(result['removed'])
        self.assertTrue(result['already_absent'])
        self.assertEqual(self.http.request.call_count, 1)
        self.assertEqual(self.http.request.call_args.args[0], 'GET')

    def test_remove_user_assignment_delete_404_is_idempotent(self):
        def _req(method, path, **kwargs):
            if method == 'GET':
                return {'value': [{'id': 'asg-1', 'resourceId': 'sp-object-id'}]}
            if method == 'DELETE':
                raise MicrosoftGraphNotFound('already gone', status_code=404)
            raise AssertionError(f'Unexpected {method} {path}')

        self.http.request.side_effect = _req
        result = self.service.remove_user_assignment('entra-1')
        self.assertFalse(result['removed'])
        self.assertTrue(result['already_absent'])

    def test_remove_never_calls_delete_on_user(self):
        self.http.request.side_effect = [
            {'value': [{'id': 'asg-1', 'resourceId': 'sp-object-id'}]},
            None,
        ]
        self.service.remove_user_assignment('entra-1')
        for c in self.http.request.call_args_list:
            method, path = c.args[0], c.args[1]
            if method == 'DELETE':
                self.assertIn('/appRoleAssignments/', path)
                self.assertNotEqual(path, '/users/entra-1')

    def test_remove_user_assignment_forbidden_raises(self):
        def _req(method, path, **kwargs):
            if method == 'GET':
                return {'value': [{'id': 'asg-1', 'resourceId': 'sp-object-id'}]}
            raise MicrosoftGraphForbidden('insufficient privileges', status_code=403)

        self.http.request.side_effect = _req
        with self.assertRaises(MicrosoftGraphForbidden):
            self.service.remove_user_assignment('entra-1')

    def test_default_access_role_when_no_custom_roles(self):
        self.http.request.return_value = {'id': 'sp-object-id', 'appRoles': []}
        self.assertEqual(self.service.resolve_app_role_id(), DEFAULT_ACCESS_APP_ROLE_ID)

    def test_ensure_user_invites_when_missing(self):
        with patch.object(
            self.service,
            'find_user_by_email',
            side_effect=MicrosoftUserNotFound('missing'),
        ):
            self.http.request.return_value = {
                'status': 'PendingAcceptance',
                'invitedUser': {'id': 'guest-1'},
            }
            user = self.service.ensure_user_in_directory(
                'hazoakaka@gmail.com',
                display_name='hamza taki',
            )
        self.assertEqual(user['id'], 'guest-1')
        self.assertTrue(user.get('invited') or user.get('created'))


@override_settings(MICROSOFT_GRAPH=GRAPH_SETTINGS)
class MicrosoftGraphSyncTests(SimpleTestCase):
    @patch('apps.integrations.microsoft_graph.sync.transaction.atomic')
    @patch('apps.integrations.microsoft_graph.sync.grant_platform_access')
    def test_grant_flow(self, mock_grant, mock_atomic):
        mock_atomic.return_value.__enter__ = MagicMock(return_value=None)
        mock_atomic.return_value.__exit__ = MagicMock(return_value=False)
        user = _mock_user(granted=False)
        service = MagicMock()
        service.is_enabled.return_value = True
        service.ensure_user_in_directory.return_value = {
            'id': 'entra-1',
            'invited': False,
            'created': False,
        }
        service.assign_user.return_value = {
            'created': True,
            'assignment': {'id': 'asg-1'},
        }
        result = grant_microsoft_enterprise_access(user, service=service)
        self.assertTrue(result['microsoft_access'])
        mock_grant.assert_called_once()

    @patch('apps.integrations.microsoft_graph.sync.revoke_platform_access')
    def test_revoke_flow_removes_assignment(self, mock_revoke_local):
        user = _mock_user(granted=True)
        service = MagicMock()
        service.is_enabled.return_value = True
        service.find_user_by_email.return_value = {'id': 'entra-1'}
        service.remove_user_assignment.return_value = {
            'removed': True,
            'assignment_id': 'asg-1',
            'already_absent': False,
        }
        result = revoke_microsoft_enterprise_access(user, service=service)
        self.assertFalse(result['microsoft_access'])
        mock_revoke_local.assert_called_once_with(user)
        service.remove_user_assignment.assert_called_once_with('entra-1')
        self.assertTrue(result['success'])
        self.assertTrue(result['graph_synced'])

    @patch('apps.integrations.microsoft_graph.sync.revoke_platform_access')
    def test_revoke_when_no_assignment_succeeds(self, mock_revoke_local):
        user = _mock_user(granted=True)
        service = MagicMock()
        service.is_enabled.return_value = True
        service.find_user_by_email.return_value = {'id': 'entra-1'}
        service.remove_user_assignment.return_value = {
            'removed': False,
            'assignment_id': None,
            'already_absent': True,
        }
        result = revoke_microsoft_enterprise_access(user, service=service)
        self.assertTrue(result['success'])
        self.assertTrue(result['already_absent'])
        mock_revoke_local.assert_called_once()

    @patch('apps.integrations.microsoft_graph.sync.revoke_platform_access')
    def test_revoke_when_entra_user_missing_succeeds(self, mock_revoke_local):
        user = _mock_user(granted=True)
        service = MagicMock()
        service.is_enabled.return_value = True
        service.find_user_by_email.side_effect = MicrosoftUserNotFound('not found')
        result = revoke_microsoft_enterprise_access(user, service=service)
        self.assertTrue(result['success'])
        self.assertTrue(result['already_absent'])
        mock_revoke_local.assert_called_once()
        service.remove_user_assignment.assert_not_called()

    @patch('apps.integrations.microsoft_graph.sync.revoke_platform_access')
    def test_revoke_graph_forbidden_keeps_local_revoked(self, mock_revoke_local):
        user = _mock_user(granted=True)

        def _local_revoke(u):
            u.platform_access_granted = False

        mock_revoke_local.side_effect = _local_revoke
        service = MagicMock()
        service.is_enabled.return_value = True
        service.find_user_by_email.return_value = {'id': 'entra-1'}
        service.remove_user_assignment.side_effect = MicrosoftGraphForbidden(
            'forbidden', status_code=403,
        )
        with self.assertRaises(MicrosoftGraphForbidden):
            revoke_microsoft_enterprise_access(user, service=service)
        mock_revoke_local.assert_called_once()
        self.assertFalse(user.platform_access_granted)

    @patch('apps.integrations.microsoft_graph.sync.revoke_platform_access')
    def test_revoke_graph_unauthorized_keeps_local_revoked(self, mock_revoke_local):
        user = _mock_user(granted=True)

        def _local_revoke(u):
            u.platform_access_granted = False

        mock_revoke_local.side_effect = _local_revoke
        service = MagicMock()
        service.is_enabled.return_value = True
        service.find_user_by_email.return_value = {'id': 'entra-1'}
        service.remove_user_assignment.side_effect = MicrosoftGraphUnauthorized(
            'unauthorized', status_code=401,
        )
        with self.assertRaises(MicrosoftGraphUnauthorized):
            revoke_microsoft_enterprise_access(user, service=service)
        self.assertFalse(user.platform_access_granted)

    @patch('apps.integrations.microsoft_graph.sync.revoke_platform_access')
    def test_revoke_idempotent_second_call(self, mock_revoke_local):
        user = _mock_user(granted=False)
        service = MagicMock()
        service.is_enabled.return_value = True
        service.find_user_by_email.return_value = {'id': 'entra-1'}
        service.remove_user_assignment.return_value = {
            'removed': False,
            'assignment_id': None,
            'already_absent': True,
        }
        result = revoke_microsoft_enterprise_access(user, service=service)
        self.assertTrue(result['success'])

    @patch('apps.integrations.microsoft_graph.sync.transaction.atomic')
    @patch('apps.integrations.microsoft_graph.sync.revoke_platform_access')
    @patch('apps.integrations.microsoft_graph.sync.grant_platform_access')
    def test_grant_then_revoke_then_grant(self, mock_grant, mock_revoke_local, mock_atomic):
        mock_atomic.return_value.__enter__ = MagicMock(return_value=None)
        mock_atomic.return_value.__exit__ = MagicMock(return_value=False)
        user = _mock_user(granted=False)
        service = MagicMock()
        service.is_enabled.return_value = True
        service.ensure_user_in_directory.return_value = {
            'id': 'entra-1',
            'invited': False,
            'created': False,
        }
        service.assign_user.return_value = {
            'created': True,
            'assignment': {'id': 'asg-1'},
        }
        service.find_user_by_email.return_value = {'id': 'entra-1'}
        service.remove_user_assignment.return_value = {
            'removed': True,
            'assignment_id': 'asg-1',
            'already_absent': False,
        }

        grant_microsoft_enterprise_access(user, service=service)
        revoke_microsoft_enterprise_access(user, service=service)
        service.assign_user.return_value = {
            'created': True,
            'assignment': {'id': 'asg-2'},
        }
        grant_microsoft_enterprise_access(user, service=service)

        self.assertEqual(mock_grant.call_count, 2)
        mock_revoke_local.assert_called_once()
        service.remove_user_assignment.assert_called_once()
        self.assertEqual(service.assign_user.call_count, 2)

    @patch('apps.integrations.microsoft_graph.sync.transaction.atomic')
    @patch('apps.integrations.microsoft_graph.sync.grant_platform_access')
    def test_grant_user_not_found(self, mock_grant, mock_atomic):
        mock_atomic.return_value.__enter__ = MagicMock(return_value=None)
        mock_atomic.return_value.__exit__ = MagicMock(return_value=False)
        user = _mock_user(granted=False)
        service = MagicMock()
        service.is_enabled.return_value = True
        service.ensure_user_in_directory.side_effect = MicrosoftUserNotFound(
            'Microsoft account not found',
        )
        with self.assertRaises(MicrosoftUserNotFound):
            grant_microsoft_enterprise_access(user, service=service)
        mock_grant.assert_not_called()

    def test_status_when_not_configured(self):
        user = _mock_user()
        service = MagicMock()
        service.is_enabled.return_value = False
        data = get_microsoft_access_status(user, service=service)
        self.assertFalse(data['configured'])
        self.assertFalse(data['microsoft_access'])


@override_settings(MICROSOFT_GRAPH=GRAPH_SETTINGS)
class MicrosoftAccessSyncBridgeTests(SimpleTestCase):
    @patch('apps.admin_management.services.microsoft_access_sync.MicrosoftGraphService')
    @patch('apps.admin_management.services.microsoft_access_sync.revoke_microsoft_enterprise_access')
    def test_apply_revoke_uses_central_sync(self, mock_revoke, mock_service_cls):
        user = _mock_user(granted=True, email='encadrant@groupe-esca.ma')
        mock_service_cls.return_value.is_enabled.return_value = True
        mock_revoke.return_value = {'success': True, 'microsoft_access': False}
        apply_platform_access_with_microsoft_sync(user, grant=False)
        mock_revoke.assert_called_once()
        self.assertTrue(mock_revoke.call_args.kwargs.get('update_local'))

    @patch('apps.admin_management.services.microsoft_access_sync.MicrosoftGraphService')
    @patch('apps.admin_management.services.microsoft_access_sync.revoke_microsoft_enterprise_access')
    def test_apply_revoke_reports_graph_forbidden(self, mock_revoke, mock_service_cls):
        user = _mock_user(granted=True, email='encadrant@groupe-esca.ma')
        mock_service_cls.return_value.is_enabled.return_value = True

        def _side_effect(u, **kwargs):
            u.platform_access_granted = False
            raise MicrosoftGraphForbidden('no permission', status_code=403)

        mock_revoke.side_effect = _side_effect
        with self.assertRaises(MicrosoftAccessSyncError) as ctx:
            apply_platform_access_with_microsoft_sync(user, grant=False)
        self.assertTrue(ctx.exception.local_revoked)
        self.assertFalse(user.platform_access_granted)


class MicrosoftGraphTokenClientTests(SimpleTestCase):
    @override_settings(MICROSOFT_GRAPH={**GRAPH_SETTINGS, 'ENABLED': False})
    def test_token_requires_config(self):
        client = MicrosoftGraphClient()
        with self.assertRaises(MicrosoftGraphConfigError):
            client.get_access_token()

    @override_settings(MICROSOFT_GRAPH=GRAPH_SETTINGS)
    @patch('apps.integrations.microsoft_graph.client.urlopen')
    def test_token_acquisition(self, mock_urlopen):
        mock_resp = MagicMock()
        mock_resp.read.return_value = b'{"access_token":"tok","expires_in":3600}'
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp
        client = MicrosoftGraphClient()
        self.assertEqual(client.get_access_token(), 'tok')

    @override_settings(MICROSOFT_GRAPH=GRAPH_SETTINGS)
    @patch('apps.integrations.microsoft_graph.client.urlopen')
    def test_token_unauthorized(self, mock_urlopen):
        from urllib.error import HTTPError

        mock_urlopen.side_effect = HTTPError(
            url='https://login.microsoftonline.com/x/oauth2/v2.0/token',
            code=401,
            msg='Unauthorized',
            hdrs=None,
            fp=None,
        )
        client = MicrosoftGraphClient()
        with self.assertRaises(MicrosoftGraphUnauthorized):
            client.get_access_token()
