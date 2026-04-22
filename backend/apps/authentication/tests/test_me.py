from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class MeEndpointTests(APITestCase):
    def setUp(self):
        self.password = 'StrongPass!234'
        self.user = User.objects.create_user(email='me@example.com', password=self.password)

    def test_me_requires_auth(self):
        resp = self.client.get(reverse('auth-me'))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_identity_fields(self):
        login = self.client.post(
            reverse('auth-login'),
            {'email': self.user.email, 'password': self.password},
            format='json',
        ).json()['data']

        resp = self.client.get(
            reverse('auth-me'),
            HTTP_AUTHORIZATION=f'Bearer {login["access"]}',
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()['data']
        for key in ('id', 'email', 'account_status', 'auth_provider', 'last_login_at', 'full_name'):
            self.assertIn(key, data)
        self.assertEqual(data['email'], self.user.email)
        self.assertEqual(data['auth_provider'], 'LOCAL')
