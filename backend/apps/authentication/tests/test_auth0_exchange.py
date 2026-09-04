from unittest.mock import patch

from django.test import TestCase, override_settings
from rest_framework.exceptions import AuthenticationFailed

from apps.authentication.providers.auth0 import (
    Auth0Provider,
    _fetch_auth0_userinfo,
    _is_jwt,
    _resolve_auth0_claims,
)


@override_settings(AUTH_PROVIDERS={
    'LOCAL': {'ENABLED': True, 'JIT_PROVISION': False},
    'AUTH0': {
        'ENABLED': True,
        'DOMAIN': 'dev-wmri6mufgeepklog.us.auth0.com',
        'CLIENT_ID': 'W5BBJeFW6fniUT5EsTc0z7B2csWl1mvO',
        'CLIENT_SECRET': 'secret',
        'REDIRECT_URI': 'http://localhost:5173/callback',
        'JIT_PROVISION': True,
    },
    'MICROSOFT': {'ENABLED': False},
    'SSO': {'ENABLED': False},
})
class Auth0TokenResolutionTests(TestCase):
    def test_opaque_token_is_not_jwt(self):
        self.assertFalse(_is_jwt('opaque-access-token-without-dots'))

    @patch('apps.authentication.providers.auth0._fetch_auth0_userinfo')
    @patch('apps.authentication.providers.auth0._decode_auth0_jwt')
    def test_opaque_token_falls_back_to_userinfo(self, mock_decode_jwt, mock_userinfo):
        mock_userinfo.return_value = {
            'sub': 'windowslive|abc123',
            'email': 'student@school.edu',
            'email_verified': True,
        }
        claims = _resolve_auth0_claims('opaque-access-token-without-dots')
        mock_decode_jwt.assert_not_called()
        mock_userinfo.assert_called_once_with('opaque-access-token-without-dots')
        self.assertEqual(claims['sub'], 'windowslive|abc123')
        self.assertEqual(claims['email'], 'student@school.edu')

    @patch('apps.authentication.providers.auth0._fetch_auth0_userinfo')
    @patch('apps.authentication.providers.auth0._decode_auth0_jwt')
    def test_jwt_without_email_falls_back_to_userinfo(self, mock_decode_jwt, mock_userinfo):
        mock_decode_jwt.return_value = {
            'sub': 'windowslive|abc123',
            'aud': 'https://custom-api',
        }
        mock_userinfo.return_value = {
            'sub': 'windowslive|abc123',
            'email': 'student@school.edu',
            'email_verified': True,
        }
        token = 'header.payload.signature'
        claims = _resolve_auth0_claims(token)
        mock_decode_jwt.assert_called_once_with(token)
        mock_userinfo.assert_called_once_with(token)
        self.assertEqual(claims['email'], 'student@school.edu')

    @patch('apps.authentication.providers.auth0._fetch_auth0_userinfo')
    def test_provider_authenticate_uses_userinfo_for_opaque_token(self, mock_userinfo):
        mock_userinfo.return_value = {
            'sub': 'windowslive|abc123',
            'email': 'student@school.edu',
            'email_verified': True,
        }
        provider = Auth0Provider()
        identity = provider.authenticate({'access_token': 'opaque-token'}, None)
        self.assertEqual(identity.provider_user_id, 'windowslive|abc123')
        self.assertEqual(identity.email, 'student@school.edu')

    @patch('apps.authentication.providers.auth0.urlopen')
    def test_userinfo_http_error_raises_authentication_failed(self, mock_urlopen):
        from urllib.error import HTTPError
        mock_urlopen.side_effect = HTTPError(
            url='https://example.com/userinfo',
            code=401,
            msg='Unauthorized',
            hdrs=None,
            fp=None,
        )
        with self.assertRaises(AuthenticationFailed):
            _fetch_auth0_userinfo('bad-token')
