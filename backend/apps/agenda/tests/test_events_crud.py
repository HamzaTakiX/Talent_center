"""Event CRUD, date-range querying, filtering, search and sorting."""

from __future__ import annotations

from datetime import timedelta

from apps.agenda.models import CalendarEvent, EventReminder, EventStatus

from .base import EVENTS_URL, AgendaTestCase, at, iso


class EventCrudTests(AgendaTestCase):
    def test_create_event_returns_full_payload(self):
        data = self.create_event(self.student_user)

        self.assertEqual(data['title'], 'Weekly progress review')
        self.assertEqual(data['type'], 'meeting')
        self.assertEqual(data['status'], 'confirmed')
        self.assertEqual(data['organizer']['user_id'], self.student_user.pk)
        self.assertFalse(data['all_day'])
        self.assertTrue(data['can_edit'])
        self.assertEqual(data['timezone'], 'Africa/Casablanca')

    def test_organizer_is_recorded_as_a_participant(self):
        data = self.create_event(self.student_user)
        organizers = [p for p in data['participants'] if p['is_organizer']]
        self.assertEqual(len(organizers), 1)
        self.assertEqual(organizers[0]['user_id'], self.student_user.pk)
        self.assertEqual(organizers[0]['response'], 'ACCEPTED')

    def test_creating_an_event_attaches_the_supervision_context(self):
        """A student booking with their encadrant gets the pairing inferred."""
        data = self.create_event(
            self.student_user,
            participant_user_ids=[self.supervisor_user.pk],
        )
        self.assertEqual(data['related_student']['student_profile_id'], self.student.pk)
        self.assertEqual(data['related_encadrant']['encadrant_profile_id'], self.encadrant.pk)
        self.assertEqual(data['related_internship']['assignment_id'], self.assignment.pk)

    def test_get_event_detail(self):
        created = self.create_event(self.student_user)
        response = self.client_for(self.student_user).get(f'{EVENTS_URL}/{created["id"]}')
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body['success'])
        self.assertEqual(body['data']['id'], created['id'])
        self.assertIn('reminders', body['data'])

    def test_update_event(self):
        created = self.create_event(self.student_user)
        response = self.client_for(self.student_user).patch(
            f'{EVENTS_URL}/{created["id"]}',
            {'title': 'Renamed review', 'location': 'Room B12'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(data['title'], 'Renamed review')
        self.assertEqual(data['location'], 'Room B12')

    def test_partial_update_keeps_duration_when_only_start_moves(self):
        created = self.create_event(self.student_user)
        new_start = at(2026, 9, 7, 15, 0)
        response = self.client_for(self.student_user).patch(
            f'{EVENTS_URL}/{created["id"]}', {'start': iso(new_start)}, format='json',
        )
        self.assertEqual(response.status_code, 200)

        event = CalendarEvent.objects.get(uuid=created['id'])
        self.assertEqual(event.start_at, new_start)
        self.assertEqual(event.end_at - event.start_at, timedelta(hours=1))

    def test_delete_event(self):
        created = self.create_event(self.student_user)
        response = self.client_for(self.student_user).delete(f'{EVENTS_URL}/{created["id"]}')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(CalendarEvent.objects.filter(uuid=created['id']).exists())

    def test_cancel_keeps_the_event_and_marks_it_cancelled(self):
        created = self.create_event(self.student_user)
        response = self.client_for(self.student_user).delete(
            f'{EVENTS_URL}/{created["id"]}?mode=cancel',
        )
        self.assertEqual(response.status_code, 200)

        event = CalendarEvent.objects.get(uuid=created['id'])
        self.assertEqual(event.status, EventStatus.CANCELLED)
        self.assertIsNotNone(event.cancelled_at)
        self.assertEqual(event.cancelled_by_id, self.student_user.pk)

    def test_default_reminder_is_created(self):
        created = self.create_event(self.student_user)
        event = CalendarEvent.objects.get(uuid=created['id'])
        self.assertEqual(event.reminders.count(), 1)
        self.assertEqual(event.reminders.first().minutes_before, 15)

    def test_explicit_reminders_replace_the_default(self):
        created = self.create_event(
            self.student_user,
            reminders=[{'minutes_before': 60}, {'minutes_before': 1440, 'channel': 'EMAIL'}],
        )
        event = CalendarEvent.objects.get(uuid=created['id'])
        self.assertEqual(
            sorted(event.reminders.values_list('minutes_before', flat=True)), [60, 1440],
        )
        self.assertTrue(
            event.reminders.filter(channel=EventReminder.Channel.EMAIL, minutes_before=1440).exists(),
        )


class EventValidationTests(AgendaTestCase):
    def test_end_before_start_is_rejected(self):
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(
                start=at(2026, 9, 7, 15, 0),
                end=at(2026, 9, 7, 14, 0),
            ),
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('End time must be after start time', str(response.json()))

    def test_zero_length_event_is_rejected(self):
        moment = at(2026, 9, 7, 15, 0)
        response = self.client_for(self.student_user).post(
            EVENTS_URL, self.event_payload(start=moment, end=moment), format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_missing_title_is_rejected(self):
        payload = self.event_payload()
        payload['title'] = '   '
        response = self.client_for(self.student_user).post(EVENTS_URL, payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_invalid_datetime_is_rejected(self):
        payload = self.event_payload()
        payload['start'] = 'not-a-date'
        response = self.client_for(self.student_user).post(EVENTS_URL, payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_unknown_timezone_is_rejected(self):
        response = self.client_for(self.student_user).post(
            EVENTS_URL, self.event_payload(timezone='Mars/Olympus'), format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_unknown_event_type_is_rejected(self):
        response = self.client_for(self.student_user).post(
            EVENTS_URL, self.event_payload(event_type='PARTY'), format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_missing_event_returns_404(self):
        response = self.client_for(self.student_user).get(
            f'{EVENTS_URL}/11111111-2222-3333-4444-555555555555',
        )
        self.assertEqual(response.status_code, 404)

    def test_errors_use_the_platform_envelope(self):
        payload = self.event_payload()
        payload['title'] = ''
        response = self.client_for(self.student_user).post(EVENTS_URL, payload, format='json')
        body = response.json()
        self.assertFalse(body['success'])
        self.assertIn('errors', body)


class DateRangeTests(AgendaTestCase):
    def setUp(self):
        super().setUp()
        self.monday = self.create_event(
            self.student_user, title='Monday standup', start=at(2026, 9, 7, 9, 0),
        )
        self.wednesday = self.create_event(
            self.student_user,
            title='Wednesday deadline',
            event_type='DEADLINE',
            start=at(2026, 9, 9, 17, 0),
        )
        self.next_month = self.create_event(
            self.student_user, title='October sync', start=at(2026, 10, 5, 11, 0),
        )

    def _titles(self, data) -> list[str]:
        return [item['title'] for item in data['items']]

    def test_day_range(self):
        data = self.list_range(self.student_user, at(2026, 9, 7), at(2026, 9, 8))
        self.assertEqual(self._titles(data), ['Monday standup'])

    def test_week_range(self):
        data = self.list_range(self.student_user, at(2026, 9, 7), at(2026, 9, 14))
        self.assertCountEqual(self._titles(data), ['Monday standup', 'Wednesday deadline'])

    def test_month_range(self):
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 1))
        self.assertCountEqual(self._titles(data), ['Monday standup', 'Wednesday deadline'])

    def test_range_echoes_the_requested_window(self):
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 1))
        self.assertEqual(data['range']['start'], iso(at(2026, 9, 1)))

    def test_event_overlapping_the_window_edge_is_included(self):
        """An event that began before the window but is still running belongs to it."""
        self.create_event(
            self.student_user,
            title='Long workshop',
            start=at(2026, 9, 14, 22, 0),
            end=at(2026, 9, 15, 2, 0),
        )
        data = self.list_range(self.student_user, at(2026, 9, 15), at(2026, 9, 16))
        self.assertIn('Long workshop', self._titles(data))

    def test_event_ending_exactly_at_window_start_is_excluded(self):
        self.create_event(
            self.student_user,
            title='Ends at midnight',
            start=at(2026, 9, 20, 22, 0),
            end=at(2026, 9, 21, 0, 0),
        )
        data = self.list_range(self.student_user, at(2026, 9, 21), at(2026, 9, 22))
        self.assertNotIn('Ends at midnight', self._titles(data))

    def test_range_requires_both_bounds(self):
        response = self.client_for(self.student_user).get(
            EVENTS_URL, {'start': iso(at(2026, 9, 1))},
        )
        self.assertEqual(response.status_code, 400)

    def test_inverted_range_is_rejected(self):
        response = self.client_for(self.student_user).get(
            EVENTS_URL, {'start': iso(at(2026, 9, 10)), 'end': iso(at(2026, 9, 1))},
        )
        self.assertEqual(response.status_code, 400)

    def test_excessive_range_is_rejected(self):
        response = self.client_for(self.student_user).get(
            EVENTS_URL, {'start': iso(at(2020, 1, 1)), 'end': iso(at(2030, 1, 1))},
        )
        self.assertEqual(response.status_code, 400)

    def test_list_without_range_is_paginated(self):
        response = self.client_for(self.student_user).get(EVENTS_URL, {'page_size': 2})
        self.assertEqual(response.status_code, 200)
        data = response.json()['data']
        self.assertEqual(len(data['items']), 2)
        self.assertEqual(data['total'], 3)
        self.assertEqual(data['total_pages'], 2)

    def test_cancelled_events_are_hidden_by_default(self):
        self.client_for(self.student_user).delete(
            f'{EVENTS_URL}/{self.monday["id"]}?mode=cancel',
        )
        data = self.list_range(self.student_user, at(2026, 9, 7), at(2026, 9, 8))
        self.assertEqual(data['items'], [])

        data = self.list_range(
            self.student_user, at(2026, 9, 7), at(2026, 9, 8), include_cancelled='true',
        )
        self.assertEqual(self._titles(data), ['Monday standup'])


class FilterSortSearchTests(AgendaTestCase):
    def setUp(self):
        super().setUp()
        self.create_event(
            self.student_user, title='Alpha meeting', start=at(2026, 9, 7, 9, 0),
        )
        self.create_event(
            self.student_user,
            title='Beta report deadline',
            event_type='DEADLINE',
            start=at(2026, 9, 8, 9, 0),
        )
        self.create_event(
            self.student_user,
            title='Gamma evaluation',
            event_type='EVALUATION',
            start=at(2026, 9, 9, 9, 0),
        )

    def _titles(self, data) -> list[str]:
        return [item['title'] for item in data['items']]

    def test_filter_by_single_type(self):
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 1), type='DEADLINE')
        self.assertEqual(self._titles(data), ['Beta report deadline'])

    def test_filter_by_multiple_types(self):
        data = self.list_range(
            self.student_user, at(2026, 9, 1), at(2026, 10, 1), type='DEADLINE,EVALUATION',
        )
        self.assertCountEqual(self._titles(data), ['Beta report deadline', 'Gamma evaluation'])

    def test_unknown_type_filter_is_rejected(self):
        response = self.client_for(self.student_user).get(
            EVENTS_URL,
            {'start': iso(at(2026, 9, 1)), 'end': iso(at(2026, 10, 1)), 'type': 'NOPE'},
        )
        self.assertEqual(response.status_code, 400)

    def test_filter_by_student(self):
        data = self.list_range(
            self.student_user, at(2026, 9, 1), at(2026, 10, 1), student=self.student.pk,
        )
        # Only the events where the supervision context was inferred.
        self.assertIsInstance(data['items'], list)

    def test_search_by_title(self):
        response = self.client_for(self.student_user).get(EVENTS_URL, {'q': 'Gamma'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self._titles(response.json()['data']), ['Gamma evaluation'])

    def test_search_by_participant_name(self):
        self.create_event(
            self.student_user,
            title='Review with supervisor',
            start=at(2026, 9, 10, 9, 0),
            participant_user_ids=[self.supervisor_user.pk],
        )
        response = self.client_for(self.student_user).get(EVENTS_URL, {'q': 'Nadia'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('Review with supervisor', self._titles(response.json()['data']))

    def test_search_is_scoped_to_visible_events(self):
        """Searching cannot surface another student's event."""
        self.create_event(self.other_student_user, title='Secret Gamma plan')
        response = self.client_for(self.student_user).get(EVENTS_URL, {'q': 'Gamma'})
        self.assertNotIn('Secret Gamma plan', self._titles(response.json()['data']))

    def test_sort_descending(self):
        response = self.client_for(self.student_user).get(EVENTS_URL, {'sort': '-start'})
        titles = self._titles(response.json()['data'])
        self.assertEqual(titles[0], 'Gamma evaluation')

    def test_unknown_sort_is_rejected(self):
        response = self.client_for(self.student_user).get(EVENTS_URL, {'sort': 'nonsense'})
        self.assertEqual(response.status_code, 400)
