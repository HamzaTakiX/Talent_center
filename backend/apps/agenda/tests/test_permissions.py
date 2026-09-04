"""
Authorization: who can see, edit, delete and invite.

These are the tests that matter most — every one of them describes an attack a
client could attempt by posting an id it has no business knowing.
"""

from __future__ import annotations

from apps.agenda.models import CalendarEvent, EventVisibility

from .base import EVENTS_URL, AgendaTestCase, at, iso


class StudentAuthorizationTests(AgendaTestCase):
    def test_student_sees_their_own_event(self):
        created = self.create_event(self.student_user)
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 1))
        self.assertEqual([i['id'] for i in data['items']], [created['id']])

    def test_student_cannot_read_another_students_event(self):
        created = self.create_event(self.other_student_user)
        response = self.client_for(self.student_user).get(f'{EVENTS_URL}/{created["id"]}')
        self.assertEqual(response.status_code, 404)

    def test_another_students_event_never_appears_in_a_range_query(self):
        self.create_event(self.other_student_user, title='Not yours')
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 1))
        self.assertEqual(data['items'], [])

    def test_student_cannot_modify_another_students_event(self):
        created = self.create_event(self.other_student_user)
        response = self.client_for(self.student_user).patch(
            f'{EVENTS_URL}/{created["id"]}', {'title': 'Hijacked'}, format='json',
        )
        self.assertEqual(response.status_code, 404)

    def test_student_cannot_delete_another_students_event(self):
        created = self.create_event(self.other_student_user)
        response = self.client_for(self.student_user).delete(f'{EVENTS_URL}/{created["id"]}')
        self.assertEqual(response.status_code, 404)
        self.assertTrue(CalendarEvent.objects.filter(uuid=created['id']).exists())

    def test_student_cannot_attach_an_event_to_another_student(self):
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(related_student_id=self.other_student.pk),
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_student_cannot_claim_an_unrelated_assignment(self):
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(related_assignment_id=self.other_assignment.pk),
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_invitee_can_read_but_not_edit(self):
        created = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        supervisor_client = self.client_for(self.supervisor_user)

        read = supervisor_client.get(f'{EVENTS_URL}/{created["id"]}')
        self.assertEqual(read.status_code, 200)
        self.assertFalse(read.json()['data']['can_edit'])

        write = supervisor_client.patch(
            f'{EVENTS_URL}/{created["id"]}', {'title': 'Changed'}, format='json',
        )
        self.assertEqual(write.status_code, 403)

    def test_anonymous_access_is_rejected(self):
        from rest_framework.test import APIClient

        response = APIClient().get(EVENTS_URL)
        self.assertIn(response.status_code, (401, 403))


class InvitationRuleTests(AgendaTestCase):
    def test_student_may_invite_their_assigned_encadrant(self):
        data = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        invited = [p['user_id'] for p in data['participants']]
        self.assertIn(self.supervisor_user.pk, invited)

    def test_student_cannot_invite_an_unrelated_encadrant(self):
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(participant_user_ids=[self.other_supervisor_user.pk]),
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_student_cannot_invite_another_student(self):
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(participant_user_ids=[self.other_student_user.pk]),
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_encadrant_may_invite_a_supervised_student(self):
        data = self.create_event(
            self.supervisor_user, participant_user_ids=[self.student_user.pk],
        )
        self.assertIn(self.student_user.pk, [p['user_id'] for p in data['participants']])

    def test_encadrant_cannot_invite_an_unsupervised_student(self):
        response = self.client_for(self.supervisor_user).post(
            EVENTS_URL,
            self.event_payload(participant_user_ids=[self.other_student_user.pk]),
            format='json',
        )
        self.assertEqual(response.status_code, 403)

    def test_contacts_endpoint_lists_only_permitted_invitees(self):
        response = self.client_for(self.student_user).get('/api/agenda/contacts')
        self.assertEqual(response.status_code, 200)
        ids = [item['user_id'] for item in response.json()['data']['items']]
        self.assertEqual(ids, [self.supervisor_user.pk])

    def test_adding_an_unauthorized_participant_after_creation_is_rejected(self):
        created = self.create_event(self.student_user)
        response = self.client_for(self.student_user).post(
            f'{EVENTS_URL}/{created["id"]}/participants',
            {'user_ids': [self.other_supervisor_user.pk]},
            format='json',
        )
        self.assertEqual(response.status_code, 403)


class EncadrantAuthorizationTests(AgendaTestCase):
    def test_encadrant_sees_supervision_visible_events_of_their_students(self):
        self.create_event(
            self.student_user,
            title='Supervision-visible',
            visibility=EventVisibility.SUPERVISION,
            related_student_id=self.student.pk,
            related_encadrant_id=self.encadrant.pk,
        )
        data = self.list_range(self.supervisor_user, at(2026, 9, 1), at(2026, 10, 1))
        self.assertEqual([i['title'] for i in data['items']], ['Supervision-visible'])

    def test_encadrant_does_not_see_a_students_participants_only_event(self):
        self.create_event(
            self.student_user,
            title='Just mine',
            related_student_id=self.student.pk,
        )
        data = self.list_range(self.supervisor_user, at(2026, 9, 1), at(2026, 10, 1))
        self.assertEqual(data['items'], [])

    def test_encadrant_cannot_see_an_unsupervised_students_event(self):
        self.create_event(
            self.other_student_user,
            title='Other cohort',
            visibility=EventVisibility.SUPERVISION,
            related_student_id=self.other_student.pk,
        )
        data = self.list_range(self.supervisor_user, at(2026, 9, 1), at(2026, 10, 1))
        self.assertEqual(data['items'], [])

    def test_encadrant_cannot_attach_an_event_to_an_unsupervised_student(self):
        response = self.client_for(self.supervisor_user).post(
            EVENTS_URL,
            self.event_payload(related_student_id=self.other_student.pk),
            format='json',
        )
        self.assertEqual(response.status_code, 403)


class PrivateVisibilityTests(AgendaTestCase):
    def test_private_event_is_invisible_to_the_supervising_encadrant(self):
        self.create_event(
            self.student_user,
            title='Private study block',
            visibility=EventVisibility.PRIVATE,
            related_student_id=self.student.pk,
            related_encadrant_id=self.encadrant.pk,
        )
        data = self.list_range(self.supervisor_user, at(2026, 9, 1), at(2026, 10, 1))
        self.assertEqual(data['items'], [])

    def test_private_event_is_invisible_to_an_admin(self):
        created = self.create_event(
            self.student_user,
            title='Private',
            visibility=EventVisibility.PRIVATE,
            related_student_id=self.student.pk,
        )
        response = self.client_for(self.admin_user).get(f'{EVENTS_URL}/{created["id"]}')
        self.assertEqual(response.status_code, 404)


class AdminAuthorizationTests(AgendaTestCase):
    def test_super_admin_sees_non_private_events(self):
        self.create_event(
            self.student_user, title='Visible to admin', related_student_id=self.student.pk,
        )
        data = self.list_range(self.admin_user, at(2026, 9, 1), at(2026, 10, 1))
        self.assertIn('Visible to admin', [i['title'] for i in data['items']])

    def test_super_admin_can_edit_a_scoped_event(self):
        created = self.create_event(
            self.student_user, related_student_id=self.student.pk,
        )
        response = self.client_for(self.admin_user).patch(
            f'{EVENTS_URL}/{created["id"]}', {'title': 'Rescheduled by admin'}, format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['title'], 'Rescheduled by admin')

    def test_admin_can_create_an_event_for_a_student(self):
        response = self.client_for(self.admin_user).post(
            EVENTS_URL,
            self.event_payload(
                title='Administrative review',
                event_type='ADMINISTRATIVE',
                related_student_id=self.student.pk,
            ),
            format='json',
        )
        self.assertEqual(response.status_code, 201, msg=response.content)
