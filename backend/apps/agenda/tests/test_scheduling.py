"""Conflict detection, timezone handling, drag/drop and availability."""

from __future__ import annotations

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from apps.agenda.models import AvailabilityRule, CalendarEvent
from apps.agenda.services.timezones import all_day_bounds, parse_aware

from .base import CASABLANCA, EVENTS_URL, AgendaTestCase, at, iso

PARIS = ZoneInfo('Europe/Paris')


class ConflictDetectionTests(AgendaTestCase):
    def setUp(self):
        super().setUp()
        self.create_event(
            self.student_user,
            title='Existing meeting',
            start=at(2026, 9, 7, 14, 0),
            end=at(2026, 9, 7, 15, 0),
        )

    def test_overlapping_meeting_is_refused(self):
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(
                title='Overlaps',
                start=at(2026, 9, 7, 14, 30),
                end=at(2026, 9, 7, 15, 30),
            ),
            format='json',
        )
        self.assertEqual(response.status_code, 409)

    def test_conflict_response_is_structured(self):
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(start=at(2026, 9, 7, 14, 30), end=at(2026, 9, 7, 15, 30)),
            format='json',
        )
        body = response.json()
        self.assertFalse(body['success'])
        self.assertEqual(body['errors']['code'], 'scheduling_conflict')
        self.assertTrue(body['errors']['has_blocking_conflicts'])
        self.assertEqual(body['errors']['conflicts'][0]['title'], 'Existing meeting')

    def test_nothing_is_overwritten_when_a_conflict_is_refused(self):
        self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(start=at(2026, 9, 7, 14, 30), end=at(2026, 9, 7, 15, 30)),
            format='json',
        )
        self.assertEqual(CalendarEvent.objects.count(), 1)

    def test_back_to_back_events_do_not_conflict(self):
        """15:00-16:00 immediately after 14:00-15:00 is adjacency, not overlap."""
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(
                title='Right after',
                start=at(2026, 9, 7, 15, 0),
                end=at(2026, 9, 7, 16, 0),
            ),
            format='json',
        )
        self.assertEqual(response.status_code, 201, msg=response.content)

    def test_conflict_can_be_overridden_explicitly(self):
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(
                start=at(2026, 9, 7, 14, 30),
                end=at(2026, 9, 7, 15, 30),
                allow_conflicts=True,
            ),
            format='json',
        )
        self.assertEqual(response.status_code, 201)

    def test_deadlines_do_not_block(self):
        """Non-blocking types may legitimately sit on top of a meeting."""
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(
                title='Report due',
                event_type='DEADLINE',
                start=at(2026, 9, 7, 14, 30),
                end=at(2026, 9, 7, 15, 30),
            ),
            format='json',
        )
        self.assertEqual(response.status_code, 201, msg=response.content)

    def test_conflicts_are_detected_across_participants(self):
        self.create_event(
            self.supervisor_user,
            title='Supervisor busy',
            start=at(2026, 9, 8, 10, 0),
            end=at(2026, 9, 8, 11, 0),
        )
        response = self.client_for(self.student_user).post(
            EVENTS_URL,
            self.event_payload(
                title='Clashes with supervisor',
                start=at(2026, 9, 8, 10, 30),
                end=at(2026, 9, 8, 11, 30),
                participant_user_ids=[self.supervisor_user.pk],
            ),
            format='json',
        )
        self.assertEqual(response.status_code, 409)

    def test_conflict_preflight_endpoint(self):
        response = self.client_for(self.student_user).post(
            '/api/agenda/conflicts',
            {'start': iso(at(2026, 9, 7, 14, 30)), 'end': iso(at(2026, 9, 7, 15, 30))},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['data']['has_conflicts'])

    def test_conflict_preflight_reports_a_free_slot(self):
        response = self.client_for(self.student_user).post(
            '/api/agenda/conflicts',
            {'start': iso(at(2026, 9, 7, 18, 0)), 'end': iso(at(2026, 9, 7, 19, 0))},
            format='json',
        )
        self.assertFalse(response.json()['data']['has_conflicts'])


class TimezoneTests(AgendaTestCase):
    def test_offset_input_is_stored_as_utc(self):
        data = self.create_event(
            self.student_user,
            start='2026-09-07T10:00:00+01:00',
            end='2026-09-07T11:00:00+01:00',
        )
        event = CalendarEvent.objects.get(uuid=data['id'])
        self.assertEqual(event.start_at, at(2026, 9, 7, 9, 0))
        self.assertTrue(event.start_at.tzinfo is not None)

    def test_naive_input_is_read_in_the_event_timezone_not_the_server_one(self):
        data = self.create_event(
            self.student_user,
            start='2026-09-07T10:00:00',
            end='2026-09-07T11:00:00',
            timezone='Europe/Paris',
        )
        event = CalendarEvent.objects.get(uuid=data['id'])
        # Paris is UTC+2 in September.
        self.assertEqual(event.start_at, at(2026, 9, 7, 8, 0))

    def test_stored_values_are_always_aware(self):
        data = self.create_event(self.student_user)
        event = CalendarEvent.objects.get(uuid=data['id'])
        self.assertIsNotNone(event.start_at.tzinfo)
        self.assertIsNotNone(event.end_at.tzinfo)

    def test_all_day_event_snaps_to_local_midnight(self):
        data = self.create_event(
            self.student_user,
            all_day=True,
            start='2026-09-07T13:00:00',
            end='2026-09-07T15:00:00',
            timezone='Europe/Paris',
        )
        event = CalendarEvent.objects.get(uuid=data['id'])
        self.assertEqual(event.start_at.astimezone(PARIS).hour, 0)
        self.assertEqual(event.end_at - event.start_at, timedelta(days=1))

    def test_all_day_bounds_helper_is_dst_safe(self):
        """The spring-forward day in Paris is 23 hours long, not 24."""
        start = parse_aware('2026-03-29T00:00:00', field='start', zone=PARIS)
        snapped_start, snapped_end = all_day_bounds(start, start, PARIS)
        self.assertEqual(snapped_end - snapped_start, timedelta(hours=23))

    def test_a_weekly_series_keeps_its_local_time_across_a_dst_shift(self):
        """
        Casablanca leaves UTC+1 on 2026-09-20.

        "Every Monday at 11:00 local" must stay at 11:00 local afterwards, so
        the UTC instant is what moves — the opposite would drift the meeting an
        hour for everyone in the room.
        """
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),  # 11:00 in Casablanca
            recurrence={'frequency': 'WEEKLY', 'count': 3},
        )
        items = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 1))['items']
        local_hours = {
            datetime.fromisoformat(item['start']).astimezone(CASABLANCA).hour
            for item in items
        }
        self.assertEqual(local_hours, {11})
        self.assertEqual(
            [item['start'] for item in items],
            [
                iso(at(2026, 9, 7, 10, 0)),
                iso(at(2026, 9, 14, 10, 0)),
                iso(at(2026, 9, 21, 11, 0)),
            ],
        )

    def test_event_crossing_midnight_appears_on_both_days(self):
        self.create_event(
            self.student_user,
            title='Overnight hackathon',
            start=at(2026, 9, 7, 22, 0),
            end=at(2026, 9, 8, 3, 0),
        )
        day_one = self.list_range(self.student_user, at(2026, 9, 7), at(2026, 9, 8))
        day_two = self.list_range(self.student_user, at(2026, 9, 8), at(2026, 9, 9))
        self.assertEqual(len(day_one['items']), 1)
        self.assertEqual(len(day_two['items']), 1)


class DragAndDropTests(AgendaTestCase):
    def setUp(self):
        super().setUp()
        self.event = self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            end=at(2026, 9, 7, 11, 0),
        )
        self.move_url = f'{EVENTS_URL}/{self.event["id"]}/move'

    def test_move_to_a_new_time(self):
        response = self.client_for(self.student_user).post(
            self.move_url,
            {'start': iso(at(2026, 9, 7, 15, 0)), 'end': iso(at(2026, 9, 7, 16, 0))},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        event = CalendarEvent.objects.get(uuid=self.event['id'])
        self.assertEqual(event.start_at, at(2026, 9, 7, 15, 0))

    def test_resize_by_moving_only_the_end(self):
        response = self.client_for(self.student_user).patch(
            f'{EVENTS_URL}/{self.event["id"]}',
            {'end': iso(at(2026, 9, 7, 12, 30))},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        event = CalendarEvent.objects.get(uuid=self.event['id'])
        self.assertEqual(event.end_at, at(2026, 9, 7, 12, 30))
        self.assertEqual(event.start_at, at(2026, 9, 7, 10, 0))

    def test_move_to_another_day_by_delta(self):
        response = self.client_for(self.student_user).post(
            self.move_url, {'delta_days': 2}, format='json',
        )
        self.assertEqual(response.status_code, 200)
        event = CalendarEvent.objects.get(uuid=self.event['id'])
        self.assertEqual(event.start_at, at(2026, 9, 9, 10, 0))
        self.assertEqual(event.end_at - event.start_at, timedelta(hours=1))

    def test_move_into_a_conflict_is_refused(self):
        self.create_event(
            self.student_user,
            title='Occupied',
            start=at(2026, 9, 7, 16, 0),
            end=at(2026, 9, 7, 17, 0),
        )
        response = self.client_for(self.student_user).post(
            self.move_url,
            {'start': iso(at(2026, 9, 7, 16, 30)), 'end': iso(at(2026, 9, 7, 17, 30))},
            format='json',
        )
        self.assertEqual(response.status_code, 409)

    def test_move_requires_authorization(self):
        response = self.client_for(self.other_student_user).post(
            self.move_url, {'start': iso(at(2026, 9, 7, 15, 0))}, format='json',
        )
        self.assertEqual(response.status_code, 404)

    def test_invalid_move_datetime_is_rejected(self):
        response = self.client_for(self.student_user).post(
            self.move_url, {'start': 'yesterday'}, format='json',
        )
        self.assertEqual(response.status_code, 400)


class AvailabilityTests(AgendaTestCase):
    def test_set_and_read_weekly_rules(self):
        client = self.client_for(self.student_user)
        response = client.put(
            '/api/agenda/availability',
            {
                'rules': [
                    {'weekday': 0, 'start_time': '09:00', 'end_time': '17:00'},
                    {'weekday': 1, 'start_time': '09:00', 'end_time': '17:00'},
                ],
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(AvailabilityRule.objects.filter(user=self.student_user).count(), 2)

        read = client.get('/api/agenda/availability')
        self.assertEqual(len(read.json()['data']['rules']), 2)

    def test_rule_with_end_before_start_is_rejected(self):
        response = self.client_for(self.student_user).put(
            '/api/agenda/availability',
            {'rules': [{'weekday': 0, 'start_time': '17:00', 'end_time': '09:00'}]},
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_free_busy_excludes_existing_events(self):
        self.client_for(self.student_user).put(
            '/api/agenda/availability',
            {
                'rules': [
                    {'weekday': 0, 'start_time': '09:00', 'end_time': '17:00', 'timezone': 'UTC'},
                ],
            },
            format='json',
        )
        self.create_event(
            self.student_user, start=at(2026, 9, 7, 14, 0), end=at(2026, 9, 7, 15, 0),
        )

        response = self.client_for(self.student_user).get(
            '/api/agenda/availability/free-busy',
            {'start': iso(at(2026, 9, 7)), 'end': iso(at(2026, 9, 8))},
        )
        self.assertEqual(response.status_code, 200)
        me = response.json()['data']['users'][0]
        self.assertEqual(len(me['busy']), 1)
        # 09:00-17:00 minus 14:00-15:00 leaves two free windows.
        self.assertEqual(len(me['free']), 2)

    def test_suggested_slots_avoid_conflicts(self):
        """Student 09-17, encadrant 10-18, busy 14-15 → suggestions skip 14-15."""
        self.client_for(self.student_user).put(
            '/api/agenda/availability',
            {'rules': [
                {'weekday': 0, 'start_time': '09:00', 'end_time': '17:00', 'timezone': 'UTC'},
            ]},
            format='json',
        )
        self.client_for(self.supervisor_user).put(
            '/api/agenda/availability',
            {'rules': [
                {'weekday': 0, 'start_time': '10:00', 'end_time': '18:00', 'timezone': 'UTC'},
            ]},
            format='json',
        )
        self.create_event(
            self.student_user, start=at(2026, 9, 7, 14, 0), end=at(2026, 9, 7, 15, 0),
        )

        response = self.client_for(self.student_user).get(
            '/api/agenda/availability/slots',
            {
                'start': iso(at(2026, 9, 7)),
                'end': iso(at(2026, 9, 8)),
                'users': str(self.supervisor_user.pk),
                'duration_minutes': 30,
                'limit': 50,
            },
        )
        self.assertEqual(response.status_code, 200)
        slots = response.json()['data']['slots']
        self.assertTrue(slots)

        starts = {slot['start'] for slot in slots}
        # Outside the 10:00-17:00 intersection, or inside the busy hour.
        self.assertNotIn(iso(at(2026, 9, 7, 9, 0)), starts)
        self.assertNotIn(iso(at(2026, 9, 7, 14, 0)), starts)
        self.assertNotIn(iso(at(2026, 9, 7, 14, 30)), starts)
        self.assertIn(iso(at(2026, 9, 7, 10, 0)), starts)

    def test_cannot_read_availability_of_an_unrelated_user(self):
        response = self.client_for(self.student_user).get(
            '/api/agenda/availability/free-busy',
            {
                'start': iso(at(2026, 9, 7)),
                'end': iso(at(2026, 9, 8)),
                'users': str(self.other_supervisor_user.pk),
            },
        )
        self.assertEqual(response.status_code, 403)

    def test_availability_exception_blocks_time(self):
        client = self.client_for(self.student_user)
        client.put(
            '/api/agenda/availability',
            {'rules': [
                {'weekday': 0, 'start_time': '09:00', 'end_time': '17:00', 'timezone': 'UTC'},
            ]},
            format='json',
        )
        created = client.post(
            '/api/agenda/availability/exceptions',
            {
                'start': iso(at(2026, 9, 7, 9, 0)),
                'end': iso(at(2026, 9, 7, 12, 0)),
                'reason': 'Medical appointment',
            },
            format='json',
        )
        self.assertEqual(created.status_code, 201)

        response = client.get(
            '/api/agenda/availability/free-busy',
            {'start': iso(at(2026, 9, 7)), 'end': iso(at(2026, 9, 8))},
        )
        working = response.json()['data']['users'][0]['working']
        self.assertEqual(len(working), 1)
        self.assertEqual(working[0]['start'], iso(at(2026, 9, 7, 12, 0)))
