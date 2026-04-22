from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.authentication.exceptions import ProviderNotEnabled, ProviderNotFound
from apps.authentication.providers import registry
from apps.authentication.providers.base import ProviderName


class RegistryTests(TestCase):
    def test_local_is_registered_and_enabled(self):
        provider = registry.get_provider(ProviderName.LOCAL)
        self.assertEqual(provider.name, ProviderName.LOCAL)

    def test_list_enabled_only_local_by_default(self):
        enabled = registry.list_enabled()
        self.assertIn('LOCAL', enabled)
        self.assertNotIn('AUTH0', enabled)
        self.assertNotIn('MICROSOFT', enabled)
        self.assertNotIn('SSO', enabled)

    def test_list_all_contains_every_provider(self):
        self.assertSetEqual(
            set(registry.list_all()),
            {'LOCAL', 'AUTH0', 'MICROSOFT', 'SSO'},
        )

    def test_get_disabled_provider_raises(self):
        with self.assertRaises(ProviderNotEnabled):
            registry.get_provider('AUTH0')

    def test_get_unknown_provider_raises(self):
        with self.assertRaises(ProviderNotFound):
            registry.get_provider('NOT_A_PROVIDER')


@override_settings(AUTH_PROVIDERS={
    'LOCAL': {'ENABLED': True, 'JIT_PROVISION': False},
    'AUTH0': {'ENABLED': True, 'DOMAIN': 'x', 'CLIENT_ID': 'x',
              'CLIENT_SECRET': 'x', 'REDIRECT_URI': 'x', 'JIT_PROVISION': True},
    'MICROSOFT': {'ENABLED': False},
    'SSO': {'ENABLED': False},
})
class StubBehaviorTests(TestCase):
    def test_enabled_stub_authenticate_raises_not_implemented(self):
        provider = registry.get_provider('AUTH0')
        with self.assertRaises(NotImplementedError):
            provider.authenticate({}, None)

    def test_enabled_stub_begin_raises_not_implemented(self):
        provider = registry.get_provider('AUTH0')
        with self.assertRaises(NotImplementedError):
            provider.begin_login(None)


class ProviderEndpointTests(APITestCase):
    def test_providers_list_endpoint(self):
        resp = self.client.get(reverse('auth-providers'))
        self.assertEqual(resp.status_code, 200)
        data = resp.json()['data']
        self.assertEqual(data['enabled'], ['LOCAL'])
        self.assertIn('AUTH0', data['all'])

    def test_disabled_provider_begin_returns_400(self):
        resp = self.client.get(reverse('auth-provider-begin', kwargs={'provider': 'AUTH0'}))
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(resp.json()['success'])

    @override_settings(AUTH_PROVIDERS={
        'LOCAL': {'ENABLED': True, 'JIT_PROVISION': False},
        'AUTH0': {'ENABLED': True, 'DOMAIN': '', 'CLIENT_ID': '',
                  'CLIENT_SECRET': '', 'REDIRECT_URI': '', 'JIT_PROVISION': True},
        'MICROSOFT': {'ENABLED': False},
        'SSO': {'ENABLED': False},
    })
    def test_enabled_stub_begin_returns_501(self):
        resp = self.client.get(reverse('auth-provider-begin', kwargs={'provider': 'AUTH0'}))
        self.assertEqual(resp.status_code, 501)
        body = resp.json()
        self.assertFalse(body['success'])
        self.assertEqual(body['message'], 'Not implemented')
