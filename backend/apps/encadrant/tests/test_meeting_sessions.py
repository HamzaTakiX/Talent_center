"""Meeting session API — authorization, reuse, lifecycle."""

from __future__ import annotations

import uuid

from datetime import date

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.accounts_et_roles.models import StudentProfile, SupervisorProfile
from apps.admin_management.models import EncadrantProfile
from apps.encadrant.models import Meeting, SupervisedStudent

User = get_user_model()


class MeetingSessionApiTests(APITestCase):
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

        now = timezone.now()
        self.scheduled_meeting = Meeting.objects.create(
            encadrant_profile=self.encadrant,
            student_profile=self.student,
            title='Weekly review',
            status=Meeting.Status.SCHEDULED,
            meeting_mode=Meeting.MeetingMode.ONLINE,
            planned_start=now,
            planned_end=now + timezone.timedelta(minutes=45),
            scheduled_at=now,
            jitsi_room_name='tc_meeting_scheduled_test_room',
        )

        self.create_url = '/api/encadrant/meeting-sessions'
        self.scheduled_url = '/api/encadrant/meeting-sessions/scheduled'

    def _auth(self, user) -> APIClient:
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    def test_student_creates_ad_hoc_meeting(self):
        client = self._auth(self.student_user)
        before = Meeting.objects.count()
        response = client.post(self.create_url, {'mode': 'video'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        body = response.json()
        self.assertTrue(body['success'])
        self.assertEqual(Meeting.objects.count(), before + 1)
        meeting = Meeting.objects.get(pk=body['data']['meeting_id'])
        self.assertTrue((meeting.metadata_json or {}).get('ad_hoc'))
        self.assertTrue(meeting.jitsi_room_name)
        self.assertEqual(meeting.student_profile_id, self.student.pk)
        self.assertEqual(meeting.encadrant_profile_id, self.encadrant.pk)

    def test_reuse_scheduled_meeting_by_id(self):
        client = self._auth(self.student_user)
        before = Meeting.objects.count()
        room_before = self.scheduled_meeting.jitsi_room_name
        session_before = self.scheduled_meeting.session_uuid

        response = client.post(
            self.create_url,
            {'mode': 'video', 'meeting_id': self.scheduled_meeting.pk},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        body = response.json()
        self.assertEqual(body['data']['meeting_id'], self.scheduled_meeting.pk)
        self.assertEqual(body['data']['session_id'], str(session_before))
        self.assertEqual(body['data']['jitsi_room_name'], room_before)
        self.assertEqual(Meeting.objects.count(), before)

        self.scheduled_meeting.refresh_from_db()
        self.assertEqual(self.scheduled_meeting.status, Meeting.Status.IN_PROGRESS)

    def test_encadrant_reuses_same_scheduled_meeting(self):
        client = self._auth(self.supervisor_user)
        response = client.post(
            self.create_url,
            {
                'mode': 'video',
                'meeting_id': self.scheduled_meeting.pk,
                'student_profile_id': self.student.pk,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()['data']['meeting_id'], self.scheduled_meeting.pk)

    def test_unrelated_student_rejected(self):
        client = self._auth(self.other_student_user)
        response = client.post(self.create_url, {'mode': 'video'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unrelated_student_cannot_join_scheduled_meeting(self):
        client = self._auth(self.other_student_user)
        response = client.post(
            self.create_url,
            {'mode': 'video', 'meeting_id': self.scheduled_meeting.pk},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_meeting_id_returns_404(self):
        client = self._auth(self.student_user)
        response = client.post(
            self.create_url,
            {'mode': 'video', 'meeting_id': 999999},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_invalid_session_uuid_returns_404(self):
        client = self._auth(self.student_user)
        bad_uuid = uuid.uuid4()
        response = client.post(
            f'/api/encadrant/meeting-sessions/{bad_uuid}/join',
            {'mode': 'video'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_join_and_end_session_lifecycle(self):
        client = self._auth(self.student_user)
        session_uuid = self.scheduled_meeting.session_uuid

        join = client.post(
            f'/api/encadrant/meeting-sessions/{session_uuid}/join',
            {'mode': 'voice'},
            format='json',
        )
        self.assertEqual(join.status_code, status.HTTP_200_OK)
        self.assertEqual(join.json()['data']['mode'], 'voice')

        self.scheduled_meeting.refresh_from_db()
        self.assertEqual(self.scheduled_meeting.status, Meeting.Status.IN_PROGRESS)
        self.assertIsNotNone(self.scheduled_meeting.actual_start)

        end = client.post(f'/api/encadrant/meeting-sessions/{session_uuid}/end', format='json')
        self.assertEqual(end.status_code, status.HTTP_200_OK)
        self.scheduled_meeting.refresh_from_db()
        self.assertEqual(self.scheduled_meeting.status, Meeting.Status.COMPLETED)
        self.assertIsNotNone(self.scheduled_meeting.actual_end)

    def test_scheduled_meetings_list_excludes_ad_hoc(self):
        client = self._auth(self.student_user)
        client.post(self.create_url, {'mode': 'video'}, format='json')

        response = client.get(self.scheduled_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item['meeting_id'] for item in response.json()['data']]
        self.assertIn(self.scheduled_meeting.pk, ids)
        ad_hoc_ids = [
            m.pk
            for m in Meeting.objects.filter(metadata_json__ad_hoc=True)
        ]
        for ad_hoc_id in ad_hoc_ids:
            self.assertNotIn(ad_hoc_id, ids)

    def test_jitsi_domain_returned_from_backend(self):
        client = self._auth(self.student_user)
        response = client.post(
            self.create_url,
            {'mode': 'video', 'meeting_id': self.scheduled_meeting.pk},
            format='json',
        )
        self.assertIn('jitsi_domain', response.json()['data'])
        self.assertIn('jitsi_room_name', response.json()['data'])
