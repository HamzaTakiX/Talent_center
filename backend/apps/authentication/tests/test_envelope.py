from django.urls import reverse
from rest_framework.test import APITestCase


class EnvelopeShapeTests(APITestCase):
    def _assert_error_envelope(self, body):
        self.assertIn('success', body)
        self.assertFalse(body['success'])
        self.assertIn('message', body)
        self.assertIn('errors', body)
        self.assertIsInstance(body['errors'], dict)

    def test_login_validation_error_uses_envelope(self):
        resp = self.client.post(reverse('auth-login'), {'email': 'not-an-email'}, format='json')
        self.assertEqual(resp.status_code, 400)
        self._assert_error_envelope(resp.json())

    def test_unauthenticated_me_uses_envelope(self):
        resp = self.client.get(reverse('auth-me'))
        self.assertEqual(resp.status_code, 401)
        self._assert_error_envelope(resp.json())

    def test_unknown_provider_uses_envelope(self):
        resp = self.client.get(reverse('auth-provider-begin', kwargs={'provider': 'FAKE'}))
        self.assertEqual(resp.status_code, 404)
        self._assert_error_envelope(resp.json())
