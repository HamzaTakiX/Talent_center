from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.models import LoginSession

User = get_user_model()


class SessionTests(APITestCase):
    def setUp(self):
        self.password = 'StrongPass!234'
        self.user = User.objects.create_user(email='u@example.com', password=self.password)

    def _login(self):
        resp = self.client.post(
            reverse('auth-login'),
            {'email': self.user.email, 'password': self.password},
            format='json',
        )
        self.assertEqual(resp.status_code, 200)
        return resp.json()['data']

    def _auth(self, access):
        return {'HTTP_AUTHORIZATION': f'Bearer {access}'}

    def test_logout_revokes_current_session(self):
        data = self._login()
        resp = self.client.post(reverse('auth-logout'), **self._auth(data['access']))
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(LoginSession.objects.get(id=data['session']['id']).revoked_at is not None)

        # Subsequent call with the same token is rejected
        me = self.client.get(reverse('auth-me'), **self._auth(data['access']))
        self.assertEqual(me.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_all_revokes_every_session(self):
        d1 = self._login()
        self._login()
        resp = self.client.post(reverse('auth-logout-all'), **self._auth(d1['access']))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(LoginSession.objects.filter(user=self.user, revoked_at__isnull=True).count(), 0)

    def test_list_sessions_marks_current(self):
        d1 = self._login()
        self._login()
        resp = self.client.get(reverse('auth-sessions-list'), **self._auth(d1['access']))
        self.assertEqual(resp.status_code, 200)
        sessions = resp.json()['data']
        self.assertEqual(len(sessions), 2)
        currents = [s for s in sessions if s['current']]
        self.assertEqual(len(currents), 1)
        self.assertEqual(currents[0]['id'], d1['session']['id'])

    def test_revoke_specific_session_rejects_its_token(self):
        d1 = self._login()
        d2 = self._login()
        resp = self.client.delete(
            reverse('auth-sessions-revoke', kwargs={'session_id': d2['session']['id']}),
            **self._auth(d1['access']),
        )
        self.assertEqual(resp.status_code, 200)

        me = self.client.get(reverse('auth-me'), **self._auth(d2['access']))
        self.assertEqual(me.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_revoke_another_users_session(self):
        other = User.objects.create_user(email='other@example.com', password=self.password)
        other_session = LoginSession.objects.create(
            user=other, jti='x' * 32,
            expires_at='2099-01-01T00:00:00Z',
        )
        d1 = self._login()
        resp = self.client.delete(
            reverse('auth-sessions-revoke', kwargs={'session_id': other_session.id}),
            **self._auth(d1['access']),
        )
        self.assertEqual(resp.status_code, 404)
