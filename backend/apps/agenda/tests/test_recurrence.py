"""
Recurring series: expansion and the three edit scopes.

2026-09-07 is a Monday, which every fixture in this module leans on.
"""

from __future__ import annotations

from urllib.parse import urlencode

from apps.agenda.models import CalendarEvent, EventRecurrenceException

from .base import EVENTS_URL, AgendaTestCase, at, iso


class SeriesTestCase(AgendaTestCase):
    """
    Pins the event zone to UTC so expected instants are literal.

    Expansion runs on the event's local wall clock, which is the right
    behaviour but makes expected values depend on the zone's DST history —
    that property is asserted on its own in ``test_scheduling``.
    """

    def event_payload(self, **overrides) -> dict:
        overrides.setdefault('timezone', 'UTC')
        return super().event_payload(**overrides)


class RecurrenceExpansionTests(SeriesTestCase):
    def _starts(self, data) -> list[str]:
        return [item['start'] for item in data['items']]

    def test_weekly_series_is_stored_as_a_single_row(self):
        self.create_event(
            self.student_user,
            recurrence={'frequency': 'WEEKLY', 'count': 4},
        )
        self.assertEqual(CalendarEvent.objects.count(), 1)

    def test_weekly_series_expands_over_the_window(self):
        self.create_event(
            self.student_user,
            title='Weekly review',
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'WEEKLY', 'count': 4},
        )
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 15))
        self.assertEqual(
            self._starts(data),
            [
                iso(at(2026, 9, 7, 10, 0)),
                iso(at(2026, 9, 14, 10, 0)),
                iso(at(2026, 9, 21, 10, 0)),
                iso(at(2026, 9, 28, 10, 0)),
            ],
        )

    def test_a_narrow_window_only_returns_the_occurrences_inside_it(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'WEEKLY', 'count': 4},
        )
        data = self.list_range(self.student_user, at(2026, 9, 14), at(2026, 9, 15))
        self.assertEqual(self._starts(data), [iso(at(2026, 9, 14, 10, 0))])

    def test_occurrences_are_flagged_and_individually_addressable(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'WEEKLY', 'count': 2},
        )
        items = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 1))['items']
        self.assertTrue(all(item['is_recurring'] for item in items))
        self.assertTrue(all(item['is_recurring_instance'] for item in items))
        self.assertEqual(len({item['occurrence_id'] for item in items}), 2)
        self.assertEqual(len({item['id'] for item in items}), 1)

    def test_daily_with_interval(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'DAILY', 'interval': 2, 'count': 3},
        )
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 9, 30))
        self.assertEqual(
            self._starts(data),
            [
                iso(at(2026, 9, 7, 10, 0)),
                iso(at(2026, 9, 9, 10, 0)),
                iso(at(2026, 9, 11, 10, 0)),
            ],
        )

    def test_weekly_on_specific_weekdays(self):
        """Every Monday and Wednesday."""
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'WEEKLY', 'by_weekdays': [0, 2], 'count': 4},
        )
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 9, 30))
        self.assertEqual(
            self._starts(data),
            [
                iso(at(2026, 9, 7, 10, 0)),
                iso(at(2026, 9, 9, 10, 0)),
                iso(at(2026, 9, 14, 10, 0)),
                iso(at(2026, 9, 16, 10, 0)),
            ],
        )

    def test_monthly(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'MONTHLY', 'count': 3},
        )
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 12, 1))
        self.assertEqual(
            self._starts(data),
            [
                iso(at(2026, 9, 7, 10, 0)),
                iso(at(2026, 10, 7, 10, 0)),
                iso(at(2026, 11, 7, 10, 0)),
            ],
        )

    def test_yearly(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'YEARLY', 'count': 2},
        )
        data = self.list_range(self.student_user, at(2027, 8, 1), at(2027, 10, 1))
        self.assertEqual(self._starts(data), [iso(at(2027, 9, 7, 10, 0))])

    def test_until_bounds_the_series(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'WEEKLY', 'until': iso(at(2026, 9, 22, 0, 0))},
        )
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 15))
        self.assertEqual(
            self._starts(data),
            [
                iso(at(2026, 9, 7, 10, 0)),
                iso(at(2026, 9, 14, 10, 0)),
                iso(at(2026, 9, 21, 10, 0)),
            ],
        )

    def test_open_ended_series_is_bounded_by_the_query_window(self):
        self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'WEEKLY'},
        )
        data = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 1))
        self.assertEqual(len(data['items']), 4)

    def test_recurrence_is_echoed_in_the_payload(self):
        created = self.create_event(
            self.student_user, recurrence={'frequency': 'WEEKLY', 'interval': 2, 'count': 5},
        )
        self.assertEqual(created['recurrence']['frequency'], 'WEEKLY')
        self.assertEqual(created['recurrence']['interval'], 2)
        self.assertEqual(created['recurrence']['count'], 5)


class RecurrenceValidationTests(SeriesTestCase):
    def _post(self, recurrence):
        return self.client_for(self.student_user).post(
            EVENTS_URL, self.event_payload(recurrence=recurrence), format='json',
        )

    def test_unknown_frequency_is_rejected(self):
        self.assertEqual(self._post({'frequency': 'FORTNIGHTLY'}).status_code, 400)

    def test_weekdays_require_weekly(self):
        self.assertEqual(
            self._post({'frequency': 'DAILY', 'by_weekdays': [0]}).status_code, 400,
        )

    def test_out_of_range_weekday_is_rejected(self):
        self.assertEqual(
            self._post({'frequency': 'WEEKLY', 'by_weekdays': [9]}).status_code, 400,
        )

    def test_until_and_count_together_are_rejected(self):
        response = self._post({
            'frequency': 'WEEKLY', 'count': 3, 'until': iso(at(2026, 12, 1)),
        })
        self.assertEqual(response.status_code, 400)

    def test_absurd_interval_is_rejected(self):
        self.assertEqual(
            self._post({'frequency': 'DAILY', 'interval': 5000}).status_code, 400,
        )


class SeriesEditScopeTests(SeriesTestCase):
    def setUp(self):
        super().setUp()
        self.series = self.create_event(
            self.student_user,
            title='Weekly review',
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'WEEKLY', 'count': 4},
        )
        self.detail_url = f'{EVENTS_URL}/{self.series["id"]}'
        self.second = at(2026, 9, 14, 10, 0)

    def _occurrences(self):
        return self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 15))['items']

    def test_editing_the_series_changes_every_occurrence(self):
        response = self.client_for(self.student_user).patch(
            self.detail_url, {'title': 'Renamed series', 'scope': 'series'}, format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            {item['title'] for item in self._occurrences()}, {'Renamed series'},
        )

    def test_editing_one_occurrence_leaves_the_rest_alone(self):
        response = self.client_for(self.student_user).patch(
            self.detail_url,
            {
                'title': 'Just this week',
                'scope': 'this',
                'occurrence_start': iso(self.second),
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200, msg=response.content)

        titles = [item['title'] for item in self._occurrences()]
        self.assertEqual(titles.count('Just this week'), 1)
        self.assertEqual(titles.count('Weekly review'), 3)

    def test_editing_one_occurrence_creates_exactly_one_extra_row(self):
        self.client_for(self.student_user).patch(
            self.detail_url,
            {'title': 'Moved', 'scope': 'this', 'occurrence_start': iso(self.second)},
            format='json',
        )
        self.assertEqual(CalendarEvent.objects.count(), 2)
        self.assertTrue(
            EventRecurrenceException.objects.filter(occurrence_start=self.second).exists(),
        )

    def test_moving_one_occurrence_does_not_duplicate_it(self):
        self.client_for(self.student_user).post(
            f'{self.detail_url}/move',
            {
                'start': iso(at(2026, 9, 15, 16, 0)),
                'end': iso(at(2026, 9, 15, 17, 0)),
                'scope': 'this',
                'occurrence_start': iso(self.second),
            },
            format='json',
        )
        starts = [item['start'] for item in self._occurrences()]
        self.assertNotIn(iso(self.second), starts)
        self.assertIn(iso(at(2026, 9, 15, 16, 0)), starts)
        self.assertEqual(len(starts), 4)

    def test_this_scope_requires_an_occurrence_start(self):
        response = self.client_for(self.student_user).patch(
            self.detail_url, {'title': 'Nope', 'scope': 'this'}, format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_an_occurrence_start_that_is_not_in_the_series_is_rejected(self):
        response = self.client_for(self.student_user).patch(
            self.detail_url,
            {
                'title': 'Nope',
                'scope': 'this',
                'occurrence_start': iso(at(2026, 9, 15, 10, 0)),
            },
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_this_and_following_splits_the_series(self):
        response = self.client_for(self.student_user).patch(
            self.detail_url,
            {
                'title': 'New chapter',
                'scope': 'following',
                'occurrence_start': iso(self.second),
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200, msg=response.content)

        titles = [item['title'] for item in self._occurrences()]
        self.assertEqual(titles.count('Weekly review'), 1)
        self.assertEqual(titles.count('New chapter'), 3)

    def test_unknown_scope_is_rejected(self):
        response = self.client_for(self.student_user).patch(
            self.detail_url, {'title': 'x', 'scope': 'everything'}, format='json',
        )
        self.assertEqual(response.status_code, 400)


class SeriesDeleteScopeTests(SeriesTestCase):
    def setUp(self):
        super().setUp()
        self.series = self.create_event(
            self.student_user,
            start=at(2026, 9, 7, 10, 0),
            recurrence={'frequency': 'WEEKLY', 'count': 4},
        )
        self.detail_url = f'{EVENTS_URL}/{self.series["id"]}'
        self.second = at(2026, 9, 14, 10, 0)

    def _delete(self, **params) -> object:
        return self.client_for(self.student_user).delete(
            f'{self.detail_url}?{urlencode(params)}',
        )

    def _starts(self):
        items = self.list_range(self.student_user, at(2026, 9, 1), at(2026, 10, 15))['items']
        return [item['start'] for item in items]

    def test_deleting_one_occurrence(self):
        response = self._delete(scope='this', occurrence_start=iso(self.second))
        self.assertEqual(response.status_code, 200, msg=response.content)
        starts = self._starts()
        self.assertEqual(len(starts), 3)
        self.assertNotIn(iso(self.second), starts)

    def test_deleting_this_and_following(self):
        response = self._delete(scope='following', occurrence_start=iso(self.second))
        self.assertEqual(response.status_code, 200, msg=response.content)
        self.assertEqual(self._starts(), [iso(at(2026, 9, 7, 10, 0))])

    def test_deleting_the_whole_series(self):
        response = self._delete(scope='series')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self._starts(), [])
        self.assertEqual(CalendarEvent.objects.count(), 0)
