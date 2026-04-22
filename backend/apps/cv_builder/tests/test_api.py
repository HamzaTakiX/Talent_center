"""End-to-end API tests — focuses on ownership isolation and envelope shape."""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts_et_roles.models import StudentProfile
from apps.cv_builder.services import cv_service
from apps.cv_builder.services.template_service import seed_builtin_templates

User = get_user_model()


def _login(client, user, password):
    resp = client.post(
        reverse('auth-login'),
        {'email': user.email, 'password': password},
        format='json',
    )
    token = resp.json()['data']['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')


class CvApiOwnershipTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        seed_builtin_templates()
        cls.pw = 'Pw!12345'
        cls.alice = User.objects.create_user(
            email='alice@example.com', password=cls.pw, role=User.RoleChoices.STUDENT,
        )
        cls.bob = User.objects.create_user(
            email='bob@example.com', password=cls.pw, role=User.RoleChoices.STUDENT,
        )
        cls.alice_profile, _ = StudentProfile.objects.get_or_create(user=cls.alice)
        cls.bob_profile, _ = StudentProfile.objects.get_or_create(user=cls.bob)
        cls.alice_cv = cv_service.create_student_cv(cls.alice_profile, title='Alice CV')

    def test_list_templates_requires_auth(self):
        resp = self.client.get('/api/cv/templates/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_cv_returns_default_template_and_sections(self):
        _login(self.client, self.bob, self.pw)
        resp = self.client.post('/api/cv/student-cvs/', {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        body = resp.json()
        self.assertTrue(body['success'])
        self.assertTrue(body['data']['is_primary'])
        self.assertGreater(len(body['data']['sections']), 0)

    def test_cannot_read_another_students_cv(self):
        _login(self.client, self.bob, self.pw)
        resp = self.client.get(f'/api/cv/student-cvs/{self.alice_cv.pk}/')
        self.assertIn(resp.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND))

    def test_cannot_patch_another_students_cv(self):
        _login(self.client, self.bob, self.pw)
        resp = self.client.patch(
            f'/api/cv/student-cvs/{self.alice_cv.pk}/',
            {'title': 'Hijacked'}, format='json',
        )
        self.assertIn(resp.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND))

    def test_owner_can_patch_title(self):
        _login(self.client, self.alice, self.pw)
        resp = self.client.patch(
            f'/api/cv/student-cvs/{self.alice_cv.pk}/',
            {'title': 'New title'}, format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        self.assertEqual(resp.json()['data']['title'], 'New title')

    def test_reorder_sections(self):
        _login(self.client, self.alice, self.pw)
        ids = list(self.alice_cv.sections.values_list('pk', flat=True))
        reversed_ids = list(reversed(ids))
        resp = self.client.post(
            f'/api/cv/student-cvs/{self.alice_cv.pk}/reorder-sections/',
            {'order': reversed_ids}, format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.content)
        returned = [s['id'] for s in resp.json()['data']]
        self.assertEqual(returned, reversed_ids)

    def test_analyze_returns_score(self):
        _login(self.client, self.alice, self.pw)
        resp = self.client.post(
            f'/api/cv/student-cvs/{self.alice_cv.pk}/analyze/', {}, format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.content)
        data = resp.json()['data']
        self.assertIn('score', data)
        self.assertIsInstance(data['score'], int)
