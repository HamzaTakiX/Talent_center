"""Invitations: add, remove, accept, decline, tentative."""

from __future__ import annotations

from apps.agenda.models import EventParticipant

from .base import EVENTS_URL, AgendaTestCase


class ParticipantManagementTests(AgendaTestCase):
    def setUp(self):
        super().setUp()
        self.event = self.create_event(self.student_user)
        self.event_url = f'{EVENTS_URL}/{self.event["id"]}'

    def test_add_participant(self):
        response = self.client_for(self.student_user).post(
            f'{self.event_url}/participants',
            {'user_ids': [self.supervisor_user.pk]},
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        participants = response.json()['data']['participants']
        self.assertIn(self.supervisor_user.pk, [p['user_id'] for p in participants])

    def test_new_participant_starts_pending(self):
        self.client_for(self.student_user).post(
            f'{self.event_url}/participants',
            {'user_ids': [self.supervisor_user.pk]},
            format='json',
        )
        participant = EventParticipant.objects.get(
            event__uuid=self.event['id'], user=self.supervisor_user,
        )
        self.assertEqual(participant.response, EventParticipant.Response.PENDING)
        self.assertEqual(participant.role, EventParticipant.Role.REQUIRED)

    def test_adding_a_duplicate_participant_is_a_no_op(self):
        client = self.client_for(self.student_user)
        for _ in range(2):
            client.post(
                f'{self.event_url}/participants',
                {'user_ids': [self.supervisor_user.pk]},
                format='json',
            )
        self.assertEqual(
            EventParticipant.objects.filter(
                event__uuid=self.event['id'], user=self.supervisor_user,
            ).count(),
            1,
        )

    def test_remove_participant(self):
        client = self.client_for(self.student_user)
        client.post(
            f'{self.event_url}/participants',
            {'user_ids': [self.supervisor_user.pk]},
            format='json',
        )
        response = client.delete(
            f'{self.event_url}/participants?user_id={self.supervisor_user.pk}',
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(
            EventParticipant.objects.filter(
                event__uuid=self.event['id'], user=self.supervisor_user,
            ).exists(),
        )

    def test_organizer_cannot_be_removed(self):
        response = self.client_for(self.student_user).delete(
            f'{self.event_url}/participants?user_id={self.student_user.pk}',
        )
        self.assertEqual(response.status_code, 400)

    def test_removing_an_absent_participant_returns_404(self):
        response = self.client_for(self.student_user).delete(
            f'{self.event_url}/participants?user_id={self.supervisor_user.pk}',
        )
        self.assertEqual(response.status_code, 404)

    def test_non_organizer_cannot_add_participants(self):
        self.client_for(self.student_user).post(
            f'{self.event_url}/participants',
            {'user_ids': [self.supervisor_user.pk]},
            format='json',
        )
        response = self.client_for(self.supervisor_user).post(
            f'{self.event_url}/participants',
            {'user_ids': [self.student_user.pk]},
            format='json',
        )
        self.assertEqual(response.status_code, 403)


class InvitationResponseTests(AgendaTestCase):
    def setUp(self):
        super().setUp()
        self.event = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        self.respond_url = f'{EVENTS_URL}/{self.event["id"]}/respond'

    def _respond(self, user, value):
        return self.client_for(user).post(self.respond_url, {'response': value}, format='json')

    def test_accept_invitation(self):
        response = self._respond(self.supervisor_user, 'ACCEPTED')
        self.assertEqual(response.status_code, 200)
        participant = EventParticipant.objects.get(
            event__uuid=self.event['id'], user=self.supervisor_user,
        )
        self.assertEqual(participant.response, EventParticipant.Response.ACCEPTED)
        self.assertIsNotNone(participant.responded_at)

    def test_decline_invitation(self):
        self._respond(self.supervisor_user, 'DECLINED')
        participant = EventParticipant.objects.get(
            event__uuid=self.event['id'], user=self.supervisor_user,
        )
        self.assertEqual(participant.response, EventParticipant.Response.DECLINED)

    def test_tentative_invitation(self):
        self._respond(self.supervisor_user, 'TENTATIVE')
        participant = EventParticipant.objects.get(
            event__uuid=self.event['id'], user=self.supervisor_user,
        )
        self.assertEqual(participant.response, EventParticipant.Response.TENTATIVE)

    def test_response_is_reflected_in_the_payload(self):
        response = self._respond(self.supervisor_user, 'ACCEPTED')
        self.assertEqual(response.json()['data']['my_response'], 'ACCEPTED')

    def test_invalid_response_value_is_rejected(self):
        response = self._respond(self.supervisor_user, 'MAYBE_LATER')
        self.assertEqual(response.status_code, 400)

    def test_organizer_cannot_respond_to_their_own_invitation(self):
        response = self._respond(self.student_user, 'DECLINED')
        self.assertEqual(response.status_code, 400)

    def test_a_non_participant_cannot_respond(self):
        """An outsider gets 404 — the event is not theirs to know about."""
        response = self._respond(self.other_supervisor_user, 'ACCEPTED')
        self.assertEqual(response.status_code, 404)

    def test_responding_does_not_grant_edit_rights(self):
        self._respond(self.supervisor_user, 'ACCEPTED')
        response = self.client_for(self.supervisor_user).patch(
            f'{EVENTS_URL}/{self.event["id"]}', {'title': 'Nope'}, format='json',
        )
        self.assertEqual(response.status_code, 403)
