"""
Integration with the systems the calendar reuses rather than reimplements:
supervision meetings, chat, notifications, realtime and the audit trail.
"""

from __future__ import annotations

from unittest.mock import patch

from apps.agenda.models import (
    CalendarEvent,
    EventReminder,
    EventReminderDispatch,
    EventSource,
)
from apps.agenda.services.reminders import dispatch_due_reminders
from apps.encadrant.models import Meeting
from apps.history.models import HistoryEvent

from .base import EVENTS_URL, AgendaTestCase, at, iso


class VideoMeetingTests(AgendaTestCase):
    def test_online_event_between_a_supervised_pair_gets_a_meeting(self):
        data = self.create_event(
            self.student_user,
            is_online=True,
            participant_user_ids=[self.supervisor_user.pk],
        )
        event = CalendarEvent.objects.get(uuid=data['id'])
        self.assertIsNotNone(event.meeting_id)
        self.assertEqual(event.meeting.meeting_mode, Meeting.MeetingMode.ONLINE)

    def test_the_room_name_is_never_in_the_event_payload(self):
        """On a public Jitsi deployment the room name is the credential."""
        data = self.create_event(
            self.student_user,
            is_online=True,
            participant_user_ids=[self.supervisor_user.pk],
        )
        self.assertIsNotNone(data['video_meeting'])
        self.assertNotIn('jitsi_room_name', data['video_meeting'])
        self.assertNotIn('tc_meeting_', str(data))

    def test_join_returns_credentials_to_a_participant(self):
        data = self.create_event(
            self.student_user,
            is_online=True,
            participant_user_ids=[self.supervisor_user.pk],
        )
        response = self.client_for(self.student_user).post(f'{EVENTS_URL}/{data["id"]}/join')
        self.assertEqual(response.status_code, 200, msg=response.content)
        self.assertTrue(response.json()['data']['jitsi_room_name'])

    def test_join_is_refused_for_an_event_without_a_meeting(self):
        data = self.create_event(self.student_user)
        response = self.client_for(self.student_user).post(f'{EVENTS_URL}/{data["id"]}/join')
        self.assertEqual(response.status_code, 404)

    def test_outsiders_cannot_join(self):
        data = self.create_event(
            self.student_user,
            is_online=True,
            participant_user_ids=[self.supervisor_user.pk],
        )
        response = self.client_for(self.other_student_user).post(
            f'{EVENTS_URL}/{data["id"]}/join',
        )
        self.assertEqual(response.status_code, 404)

    def test_rescheduling_the_event_moves_the_meeting(self):
        data = self.create_event(
            self.student_user,
            is_online=True,
            participant_user_ids=[self.supervisor_user.pk],
        )
        self.client_for(self.student_user).post(
            f'{EVENTS_URL}/{data["id"]}/move',
            {'start': iso(at(2026, 9, 8, 14, 0)), 'end': iso(at(2026, 9, 8, 15, 0))},
            format='json',
        )
        meeting = CalendarEvent.objects.get(uuid=data['id']).meeting
        self.assertEqual(meeting.planned_start, at(2026, 9, 8, 14, 0))

    def test_cancelling_the_event_cancels_the_meeting(self):
        data = self.create_event(
            self.student_user,
            is_online=True,
            participant_user_ids=[self.supervisor_user.pk],
        )
        self.client_for(self.student_user).delete(f'{EVENTS_URL}/{data["id"]}?mode=cancel')
        meeting = CalendarEvent.objects.get(uuid=data['id']).meeting
        self.assertEqual(meeting.status, Meeting.Status.CANCELLED)


class MeetingProjectionTests(AgendaTestCase):
    """A meeting scheduled elsewhere must show up on the calendar."""

    def _make_meeting(self, **overrides) -> Meeting:
        values = {
            'encadrant_profile': self.encadrant,
            'student_profile': self.student,
            'assignment': self.assignment,
            'title': 'Mid-term evaluation',
            'meeting_type': Meeting.MeetingType.MID_TERM_EVAL,
            'planned_start': at(2026, 9, 10, 9, 0),
            'planned_end': at(2026, 9, 10, 10, 0),
            'duration_minutes': 60,
            'created_by': self.supervisor_user,
        }
        values.update(overrides)
        return Meeting.objects.create(**values)

    def test_creating_a_meeting_projects_a_calendar_event(self):
        meeting = self._make_meeting()
        event = CalendarEvent.objects.get(meeting=meeting)
        self.assertEqual(event.source, EventSource.MEETING)
        self.assertEqual(event.start_at, at(2026, 9, 10, 9, 0))

    def test_an_evaluation_meeting_projects_as_an_evaluation_event(self):
        meeting = self._make_meeting()
        event = CalendarEvent.objects.get(meeting=meeting)
        self.assertEqual(event.event_type, 'EVALUATION')

    def test_both_sides_are_participants(self):
        meeting = self._make_meeting()
        event = CalendarEvent.objects.get(meeting=meeting)
        self.assertEqual(
            set(event.participants.values_list('user_id', flat=True)),
            {self.student_user.pk, self.supervisor_user.pk},
        )

    def test_the_projected_event_is_visible_to_both_sides(self):
        self._make_meeting()
        for user in (self.student_user, self.supervisor_user):
            data = self.list_range(user, at(2026, 9, 1), at(2026, 10, 1))
            self.assertEqual([i['title'] for i in data['items']], ['Mid-term evaluation'])

    def test_the_projection_is_updated_not_duplicated(self):
        meeting = self._make_meeting()
        meeting.title = 'Mid-term evaluation (rescheduled)'
        meeting.planned_start = at(2026, 9, 11, 9, 0)
        meeting.planned_end = at(2026, 9, 11, 10, 0)
        meeting.save()

        events = CalendarEvent.objects.filter(meeting=meeting)
        self.assertEqual(events.count(), 1)
        self.assertEqual(events.first().start_at, at(2026, 9, 11, 9, 0))

    def test_ad_hoc_call_sessions_are_not_projected(self):
        meeting = self._make_meeting(metadata_json={'ad_hoc': True})
        self.assertFalse(CalendarEvent.objects.filter(meeting=meeting).exists())

    def test_a_projected_event_cannot_be_deleted_from_the_calendar(self):
        meeting = self._make_meeting()
        event = CalendarEvent.objects.get(meeting=meeting)
        response = self.client_for(self.supervisor_user).delete(f'{EVENTS_URL}/{event.uuid}')
        self.assertEqual(response.status_code, 400)
        self.assertTrue(CalendarEvent.objects.filter(pk=event.pk).exists())

    def test_deleting_the_meeting_removes_the_projection(self):
        meeting = self._make_meeting()
        meeting.delete()
        self.assertFalse(CalendarEvent.objects.filter(source=EventSource.MEETING).exists())


class ChatLinkTests(AgendaTestCase):
    def test_an_event_can_reuse_the_existing_supervision_dm(self):
        with self.captureOnCommitCallbacks(execute=True):
            data = self.create_event(
                self.student_user,
                participant_user_ids=[self.supervisor_user.pk],
                attach_conversation=True,
            )
        event = CalendarEvent.objects.get(uuid=data['id'])
        self.assertIsNotNone(event.conversation_id)

    def test_two_events_for_the_same_pair_share_one_conversation(self):
        with self.captureOnCommitCallbacks(execute=True):
            first = self.create_event(
                self.student_user,
                participant_user_ids=[self.supervisor_user.pk],
                attach_conversation=True,
            )
        with self.captureOnCommitCallbacks(execute=True):
            second = self.create_event(
                self.student_user,
                title='Second meeting',
                start=at(2026, 9, 8, 10, 0),
                participant_user_ids=[self.supervisor_user.pk],
                attach_conversation=True,
            )
        ids = CalendarEvent.objects.filter(
            uuid__in=[first['id'], second['id']],
        ).values_list('conversation_id', flat=True)
        self.assertEqual(len(set(ids)), 1)
        self.assertIsNotNone(list(ids)[0])


class NotificationTests(AgendaTestCase):
    def _codes(self, emit) -> list[str]:
        return [call.kwargs['event_code'] for call in emit.call_args_list]

    def test_creating_an_event_emits_a_domain_event(self):
        with patch('apps.agenda.services.notifications.emit_event') as emit:
            with self.captureOnCommitCallbacks(execute=True):
                self.create_event(self.student_user)
        self.assertIn('agenda.event.created', self._codes(emit))

    def test_inviting_someone_emits_an_invitation(self):
        with patch('apps.agenda.services.notifications.emit_event') as emit:
            with self.captureOnCommitCallbacks(execute=True):
                self.create_event(
                    self.student_user, participant_user_ids=[self.supervisor_user.pk],
                )
        invitation = next(
            call for call in emit.call_args_list
            if call.kwargs['event_code'] == 'agenda.invitation.sent'
        )
        self.assertEqual(
            invitation.kwargs['payload']['recipient_user_ids'], [self.supervisor_user.pk],
        )

    def test_answering_an_invitation_notifies_the_organizer(self):
        event = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        with patch('apps.agenda.services.notifications.emit_event') as emit:
            with self.captureOnCommitCallbacks(execute=True):
                self.client_for(self.supervisor_user).post(
                    f'{EVENTS_URL}/{event["id"]}/respond',
                    {'response': 'ACCEPTED'},
                    format='json',
                )
        answered = next(
            call for call in emit.call_args_list
            if call.kwargs['event_code'] == 'agenda.invitation.answered'
        )
        self.assertEqual(
            answered.kwargs['payload']['recipient_user_ids'], [self.student_user.pk],
        )

    def test_moving_an_event_emits_a_reschedule_not_a_generic_update(self):
        event = self.create_event(self.student_user)
        with patch('apps.agenda.services.notifications.emit_event') as emit:
            with self.captureOnCommitCallbacks(execute=True):
                self.client_for(self.student_user).post(
                    f'{EVENTS_URL}/{event["id"]}/move',
                    {'start': iso(at(2026, 9, 7, 16, 0))},
                    format='json',
                )
        codes = self._codes(emit)
        self.assertIn('agenda.event.rescheduled', codes)
        self.assertNotIn('agenda.event.updated', codes)

    def test_cancelling_notifies_participants(self):
        event = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        with patch('apps.agenda.services.notifications.emit_event') as emit:
            with self.captureOnCommitCallbacks(execute=True):
                self.client_for(self.student_user).delete(
                    f'{EVENTS_URL}/{event["id"]}?mode=cancel',
                )
        self.assertIn('agenda.event.cancelled', self._codes(emit))

    def test_removing_a_participant_notifies_them(self):
        event = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        with patch('apps.agenda.services.notifications.emit_event') as emit:
            with self.captureOnCommitCallbacks(execute=True):
                self.client_for(self.student_user).delete(
                    f'{EVENTS_URL}/{event["id"]}/participants'
                    f'?user_id={self.supervisor_user.pk}',
                )
        removed = next(
            call for call in emit.call_args_list
            if call.kwargs['event_code'] == 'agenda.participant.removed'
        )
        self.assertEqual(
            removed.kwargs['payload']['recipient_user_ids'], [self.supervisor_user.pk],
        )

    def test_a_notification_failure_does_not_fail_the_write(self):
        with patch(
            'apps.agenda.services.notifications.emit_event',
            side_effect=RuntimeError('mail provider down'),
        ):
            with self.captureOnCommitCallbacks(execute=True):
                data = self.create_event(self.student_user)
        self.assertTrue(CalendarEvent.objects.filter(uuid=data['id']).exists())


class RealtimeTests(AgendaTestCase):
    def _groups(self, send) -> set[str]:
        return {call.args[0] for call in send.call_args_list}

    def _actions(self, send) -> list[str]:
        return [call.args[1]['payload']['action'] for call in send.call_args_list]

    def test_creating_an_event_broadcasts_to_every_participant(self):
        with patch('apps.agenda.services.realtime._group_send') as send:
            with self.captureOnCommitCallbacks(execute=True):
                self.create_event(
                    self.student_user, participant_user_ids=[self.supervisor_user.pk],
                )
        self.assertEqual(
            self._groups(send),
            {f'agenda_user_{self.student_user.pk}', f'agenda_user_{self.supervisor_user.pk}'},
        )
        self.assertIn('created', self._actions(send))

    def test_moving_an_event_broadcasts_an_update(self):
        event = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        with patch('apps.agenda.services.realtime._group_send') as send:
            with self.captureOnCommitCallbacks(execute=True):
                self.client_for(self.student_user).post(
                    f'{EVENTS_URL}/{event["id"]}/move',
                    {'start': iso(at(2026, 9, 7, 16, 0))},
                    format='json',
                )
        self.assertIn('updated', self._actions(send))

    def test_the_broadcast_carries_no_event_content(self):
        """Clients refetch through the authorized API; the socket leaks nothing."""
        with patch('apps.agenda.services.realtime._group_send') as send:
            with self.captureOnCommitCallbacks(execute=True):
                self.create_event(self.student_user, title='Confidential subject')
        body = send.call_args_list[0].args[1]
        self.assertNotIn('Confidential subject', str(body))
        self.assertEqual(
            set(body['payload']), {'action', 'event_id', 'start', 'end'},
        )

    def test_a_removed_participant_is_still_told(self):
        event = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        with patch('apps.agenda.services.realtime._group_send') as send:
            with self.captureOnCommitCallbacks(execute=True):
                self.client_for(self.student_user).delete(
                    f'{EVENTS_URL}/{event["id"]}/participants'
                    f'?user_id={self.supervisor_user.pk}',
                )
        self.assertIn(f'agenda_user_{self.supervisor_user.pk}', self._groups(send))


class AuditTests(AgendaTestCase):
    def _codes(self):
        return list(
            HistoryEvent.objects.filter(source_app='agenda').values_list('event_code', flat=True),
        )

    def test_creation_is_audited(self):
        self.create_event(self.student_user)
        self.assertIn('agenda.event.created', self._codes())

    def test_the_actor_is_recorded(self):
        self.create_event(self.student_user)
        entry = HistoryEvent.objects.filter(event_code='agenda.event.created').first()
        self.assertEqual(entry.actor_user_id, self.student_user.pk)

    def test_update_cancel_and_participant_changes_are_audited(self):
        event = self.create_event(self.student_user)
        client = self.client_for(self.student_user)
        client.patch(f'{EVENTS_URL}/{event["id"]}', {'title': 'New name'}, format='json')
        client.post(
            f'{EVENTS_URL}/{event["id"]}/participants',
            {'user_ids': [self.supervisor_user.pk]},
            format='json',
        )
        self.client_for(self.supervisor_user).post(
            f'{EVENTS_URL}/{event["id"]}/respond', {'response': 'DECLINED'}, format='json',
        )
        client.delete(
            f'{EVENTS_URL}/{event["id"]}/participants?user_id={self.supervisor_user.pk}',
        )
        client.delete(f'{EVENTS_URL}/{event["id"]}?mode=cancel')

        codes = self._codes()
        for expected in (
            'agenda.event.updated',
            'agenda.participant.added',
            'agenda.invitation.answered',
            'agenda.participant.removed',
            'agenda.event.cancelled',
        ):
            self.assertIn(expected, codes)

    def test_deletion_is_audited(self):
        event = self.create_event(self.student_user)
        self.client_for(self.student_user).delete(f'{EVENTS_URL}/{event["id"]}')
        self.assertIn('agenda.event.deleted', self._codes())

    def test_no_join_credential_is_ever_written_to_the_audit_log(self):
        self.create_event(
            self.student_user,
            is_online=True,
            participant_user_ids=[self.supervisor_user.pk],
        )
        blob = str(list(HistoryEvent.objects.filter(source_app='agenda').values()))
        self.assertNotIn('tc_meeting_', blob)
        self.assertNotIn('jitsi_room_name', blob)


class ReminderDispatchTests(AgendaTestCase):
    def test_a_reminder_fires_when_its_moment_arrives(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            reminders=[{'minutes_before': 15}],
        )
        with patch('apps.agenda.services.reminders.notify_reminder') as notify:
            sent = dispatch_due_reminders(moment=at(2026, 9, 7, 9, 45))
        self.assertEqual(sent, 1)
        notify.assert_called_once()

    def test_a_reminder_does_not_fire_early(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            reminders=[{'minutes_before': 15}],
        )
        with patch('apps.agenda.services.reminders.notify_reminder'):
            self.assertEqual(dispatch_due_reminders(moment=at(2026, 9, 7, 9, 0)), 0)

    def test_a_reminder_fires_only_once(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            reminders=[{'minutes_before': 15}],
        )
        with patch('apps.agenda.services.reminders.notify_reminder'):
            dispatch_due_reminders(moment=at(2026, 9, 7, 9, 45))
            second_run = dispatch_due_reminders(moment=at(2026, 9, 7, 9, 46))
        self.assertEqual(second_run, 0)
        self.assertEqual(EventReminderDispatch.objects.count(), 1)

    def test_a_recurring_series_reminds_on_each_occurrence(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            reminders=[{'minutes_before': 15}],
            recurrence={'frequency': 'WEEKLY', 'count': 4},
        )
        with patch('apps.agenda.services.reminders.notify_reminder'):
            first = dispatch_due_reminders(moment=at(2026, 9, 7, 9, 45))
            second = dispatch_due_reminders(moment=at(2026, 9, 14, 9, 45))
        self.assertEqual((first, second), (1, 1))
        self.assertEqual(EventReminderDispatch.objects.count(), 2)

    def test_a_cancelled_event_does_not_remind(self):
        event = self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            reminders=[{'minutes_before': 15}],
        )
        self.client_for(self.student_user).delete(f'{EVENTS_URL}/{event["id"]}?mode=cancel')
        with patch('apps.agenda.services.reminders.notify_reminder'):
            self.assertEqual(dispatch_due_reminders(moment=at(2026, 9, 7, 9, 45)), 0)

    def test_declined_invitees_are_left_out_of_the_recipients(self):
        event = self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            reminders=[{'minutes_before': 15}],
            participant_user_ids=[self.supervisor_user.pk],
        )
        self.client_for(self.supervisor_user).post(
            f'{EVENTS_URL}/{event["id"]}/respond', {'response': 'DECLINED'}, format='json',
        )
        with patch('apps.agenda.services.reminders.notify_reminder') as notify:
            dispatch_due_reminders(moment=at(2026, 9, 7, 9, 45))
        self.assertEqual(notify.call_args.args[2], [self.student_user.pk])

    def test_a_catch_up_run_still_delivers(self):
        """A worker that was down for a few minutes must not skip the reminder."""
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            reminders=[{'minutes_before': 15}],
        )
        with patch('apps.agenda.services.reminders.notify_reminder'):
            sent = dispatch_due_reminders(moment=at(2026, 9, 7, 9, 52))
        self.assertEqual(sent, 1)

    def test_an_email_reminder_is_stored_with_its_channel(self):
        data = self.create_event(
            self.student_user, reminders=[{'minutes_before': 60, 'channel': 'EMAIL'}],
        )
        reminder = EventReminder.objects.get(event__uuid=data['id'])
        self.assertEqual(reminder.channel, EventReminder.Channel.EMAIL)


class BusinessContextTests(AgendaTestCase):
    def test_the_internship_context_is_exposed_on_the_event(self):
        data = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        internship = data['related_internship']
        self.assertEqual(internship['assignment_id'], self.assignment.pk)
        self.assertEqual(internship['academic_year'], '2026-2027')

    def test_events_can_be_filtered_by_internship(self):
        self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        data = self.list_range(
            self.student_user,
            at(2026, 9, 1),
            at(2026, 10, 1),
            internship=self.assignment.pk,
        )
        self.assertEqual(len(data['items']), 1)

    def test_a_deleted_internship_leaves_the_event_intact(self):
        data = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        self.assignment.delete()

        event = CalendarEvent.objects.get(uuid=data['id'])
        self.assertIsNone(event.related_assignment_id)

        response = self.client_for(self.student_user).get(f'{EVENTS_URL}/{data["id"]}')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()['data']['related_internship'])

    def test_a_deleted_participant_leaves_the_event_intact(self):
        data = self.create_event(
            self.student_user, participant_user_ids=[self.supervisor_user.pk],
        )
        self.supervisor_user.delete()

        response = self.client_for(self.student_user).get(f'{EVENTS_URL}/{data["id"]}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['participant_count'], 1)


class MetadataEndpointTests(AgendaTestCase):
    def test_metadata_describes_the_vocabulary_the_ui_needs(self):
        response = self.client_for(self.student_user).get('/api/agenda/meta')
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertTrue(data['event_types'])
        self.assertIn('reminder_presets', data)
        self.assertEqual(data['role'], 'STUDENT')
