from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.authentication.models import PasswordResetRequest
from apps.authentication.utils import hash_token

User = get_user_model()


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    FRONTEND_RESET_PASSWORD_URL='http://frontend.test/reset',
)
class ForgotResetTests(APITestCase):
    def setUp(self):
        self.old_password = 'StrongPass!234'
        self.new_password = 'AnotherStrong!99'
        self.user = User.objects.create_user(email='reset@example.com', password=self.old_password)

    def test_forgot_password_sends_email_and_creates_hashed_token(self):
        resp = self.client.post(reverse('auth-forgot-password'), {'email': self.user.email}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

        record = PasswordResetRequest.objects.get(user=self.user)
        # token stored is the HASH, not the raw value
        self.assertEqual(len(record.token), 64)
        raw = mail.outbox[0].body.split('token=')[-1].split()[0].strip()
        self.assertEqual(hash_token(raw), record.token)

    def test_forgot_password_unknown_email_still_returns_200(self):
        resp = self.client.post(reverse('auth-forgot-password'), {'email': 'ghost@example.com'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(PasswordResetRequest.objects.count(), 0)

    def test_forgot_password_remote_user_silently_ignored(self):
        self.user.auth_provider = 'AUTH0'
        self.user.provider_user_id = 'auth0|abc'
        self.user.save(update_fields=['auth_provider', 'provider_user_id'])
        resp = self.client.post(reverse('auth-forgot-password'), {'email': self.user.email}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(PasswordResetRequest.objects.count(), 0)

    def test_reset_password_with_valid_token_changes_password(self):
        self.client.post(reverse('auth-forgot-password'), {'email': self.user.email}, format='json')
        raw = mail.outbox[0].body.split('token=')[-1].split()[0].strip()

        resp = self.client.post(
            reverse('auth-reset-password'),
            {'token': raw, 'new_password': self.new_password},
            format='json',
        )
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.new_password))

    def test_reset_password_with_invalid_token_400(self):
        resp = self.client.post(
            reverse('auth-reset-password'),
            {'token': 'not-a-real-token', 'new_password': self.new_password},
            format='json',
        )
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.json()['success'])

    def test_reset_password_with_used_token_400(self):
        self.client.post(reverse('auth-forgot-password'), {'email': self.user.email}, format='json')
        raw = mail.outbox[0].body.split('token=')[-1].split()[0].strip()

        first = self.client.post(
            reverse('auth-reset-password'),
            {'token': raw, 'new_password': self.new_password},
            format='json',
        )
        self.assertEqual(first.status_code, 200)

        second = self.client.post(
            reverse('auth-reset-password'),
            {'token': raw, 'new_password': 'YetAnother!42'},
            format='json',
        )
        self.assertEqual(second.status_code, 400)


class ChangePasswordTests(APITestCase):
    def setUp(self):
        self.old_password = 'StrongPass!234'
        self.new_password = 'AnotherStrong!99'
        self.user = User.objects.create_user(email='cp@example.com', password=self.old_password)

    def _login(self):
        resp = self.client.post(
            reverse('auth-login'),
            {'email': self.user.email, 'password': self.old_password},
            format='json',
        )
        return resp.json()['data']

    def test_change_password_success(self):
        data = self._login()
        resp = self.client.post(
            reverse('auth-change-password'),
            {'old_password': self.old_password, 'new_password': self.new_password},
            HTTP_AUTHORIZATION=f'Bearer {data["access"]}',
            format='json',
        )
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.new_password))

    def test_change_password_wrong_old_password_401(self):
        data = self._login()
        resp = self.client.post(
            reverse('auth-change-password'),
            {'old_password': 'wrong', 'new_password': self.new_password},
            HTTP_AUTHORIZATION=f'Bearer {data["access"]}',
            format='json',
        )
        self.assertEqual(resp.status_code, 401)
