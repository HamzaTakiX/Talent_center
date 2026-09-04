"""Workspace document center API — upload, review, viewed tracking."""

from __future__ import annotations

from datetime import date
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts_et_roles.models import StudentProfile, SupervisorProfile
from apps.admin_management.models import EncadrantProfile
from apps.encadrant.models import SupervisedStudent, WorkspaceDocument, WorkspaceDocumentReview

User = get_user_model()


class WorkspaceDocumentApiTests(APITestCase):
    def setUp(self):
        self.student_user = User.objects.create_user(email='student@test.com', password='pass')
        self.student_user.role = User.RoleChoices.STUDENT
        self.student_user.save()
        self.student = StudentProfile.objects.create(user=self.student_user)

        self.other_student_user = User.objects.create_user(email='other@test.com', password='pass')
        self.other_student_user.role = User.RoleChoices.STUDENT
        self.other_student_user.save()
        self.other_student = StudentProfile.objects.create(user=self.other_student_user)

        self.supervisor_user = User.objects.create_user(email='supervisor@test.com', password='pass')
        self.supervisor_user.role = User.RoleChoices.SUPERVISOR
        self.supervisor_user.save()
        self.supervisor = SupervisorProfile.objects.create(user=self.supervisor_user)
        self.encadrant = EncadrantProfile.objects.create(supervisor_profile=self.supervisor)

        SupervisedStudent.objects.create(
            encadrant_profile=self.encadrant,
            student_profile=self.student,
            is_active=True,
            period_start=date(2026, 1, 1),
        )

        self.list_url = '/api/encadrant/workspace/documents'

    def _auth(self, user) -> APIClient:
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    def _pdf(self, name='Chapter_2_Draft.pdf') -> SimpleUploadedFile:
        return SimpleUploadedFile(name, BytesIO(b'%PDF-1.4 test').getvalue(), content_type='application/pdf')

    def test_student_uploads_and_lists_document(self):
        client = self._auth(self.student_user)
        response = client.post(self.list_url, {'file': self._pdf()}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        body = response.json()
        self.assertTrue(body['success'])
        self.assertEqual(body['data']['name'], 'Chapter_2_Draft.pdf')
        self.assertEqual(body['data']['category'], 'report')
        self.assertFalse(body['data']['viewedByEncadrant'])
        self.assertIsNone(body['data']['review'])

        listed = client.get(self.list_url)
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertEqual(len(listed.json()['data']['items']), 1)

    def test_encadrant_reviews_and_marks_viewed(self):
        student_client = self._auth(self.student_user)
        uploaded = student_client.post(self.list_url, {'file': self._pdf()}, format='multipart')
        document_id = uploaded.json()['data']['id']

        enc_client = self._auth(self.supervisor_user)
        listed = enc_client.get(self.list_url, {'student_profile_id': self.student.pk})
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertEqual(len(listed.json()['data']['items']), 1)

        viewed = enc_client.post(f'{self.list_url}/{document_id}/viewed')
        self.assertEqual(viewed.status_code, status.HTTP_200_OK)
        self.assertTrue(viewed.json()['data']['viewedByEncadrant'])

        reviewed = enc_client.post(
            f'{self.list_url}/{document_id}/review',
            {'comment': 'Renforcer la méthodologie.', 'grade': '14/20', 'status': 'in_review'},
            format='json',
        )
        self.assertEqual(reviewed.status_code, status.HTTP_200_OK)
        payload = reviewed.json()['data']
        self.assertEqual(payload['review']['comment'], 'Renforcer la méthodologie.')
        self.assertEqual(payload['review']['grade'], '14/20')
        self.assertEqual(payload['review']['status'], 'in_review')

        student_view = student_client.get(self.list_url)
        item = student_view.json()['data']['items'][0]
        self.assertTrue(item['viewedByEncadrant'])
        self.assertEqual(item['review']['grade'], '14/20')
        self.assertEqual(WorkspaceDocumentReview.objects.filter(document_id=document_id).count(), 1)

    def test_other_student_cannot_see_document(self):
        student_client = self._auth(self.student_user)
        uploaded = student_client.post(self.list_url, {'file': self._pdf()}, format='multipart')
        document_id = uploaded.json()['data']['id']

        other = self._auth(self.other_student_user)
        listed = other.get(self.list_url)
        self.assertEqual(listed.json()['data']['items'], [])
        detail = other.get(f'{self.list_url}/{document_id}')
        self.assertEqual(detail.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_review(self):
        student_client = self._auth(self.student_user)
        uploaded = student_client.post(self.list_url, {'file': self._pdf()}, format='multipart')
        document_id = uploaded.json()['data']['id']
        response = student_client.post(
            f'{self.list_url}/{document_id}/review',
            {'comment': 'auto'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(WorkspaceDocument.objects.filter(pk=document_id).count(), 1)
