from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import LoginAttempt, LoginSession, SecurityEvent

User = get_user_model()


class LocalLoginTests(APITestCase):
    def setUp(self):
        self.password = 'StrongPass!234'
        self.user = User.objects.create_user(
            email='hamza@example.com',
            password=self.password,
        )
        self.url = reverse('auth-login')

    def test_login_success_returns_envelope_with_tokens_and_creates_session(self):
        response = self.client.post(
            self.url, {'email': self.user.email, 'password': self.password}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertTrue(body['success'])
        self.assertIn('access', body['data'])
        self.assertIn('refresh', body['data'])
        self.assertEqual(body['data']['user']['email'], self.user.email)
        self.assertEqual(body['data']['user']['auth_provider'], 'LOCAL')

        self.assertEqual(LoginSession.objects.filter(user=self.user).count(), 1)
        self.assertTrue(LoginAttempt.objects.filter(identifier=self.user.email, success=True).exists())
        self.assertTrue(SecurityEvent.objects.filter(event_type='LOGIN_SUCCESS', user=self.user).exists())

    def test_login_wrong_password_returns_generic_error(self):
        response = self.client.post(
            self.url, {'email': self.user.email, 'password': 'nope'}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        body = response.json()
        self.assertFalse(body['success'])
        self.assertIn('errors', body)
        # No tokens leaked
        self.assertNotIn('access', body.get('data', {}) or {})
        self.assertTrue(LoginAttempt.objects.filter(identifier=self.user.email, success=False).exists())

    def test_login_unknown_user_returns_same_generic_error(self):
        response = self.client.post(
            self.url, {'email': 'ghost@example.com', 'password': 'whatever'}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.json()['success'])

    def test_login_inactive_account_rejected(self):
        self.user.account_status = User.AccountStatus.SUSPENDED
        self.user.save(update_fields=['account_status'])
        response = self.client.post(
            self.url, {'email': self.user.email, 'password': self.password}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(AUTH_MAX_FAILED_ATTEMPTS=3, AUTH_FAILED_WINDOW_SECONDS=900, AUTH_LOCKOUT_SECONDS=900)
    def test_repeated_failures_trigger_lockout_423(self):
        for _ in range(3):
            self.client.post(
                self.url, {'email': self.user.email, 'password': 'nope'}, format='json',
            )
        response = self.client.post(
            self.url, {'email': self.user.email, 'password': self.password}, format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_423_LOCKED)
        body = response.json()
        self.assertFalse(body['success'])
        self.assertEqual(body['message'], 'Account temporarily locked')
