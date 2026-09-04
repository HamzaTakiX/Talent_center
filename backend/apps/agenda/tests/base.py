"""
Shared fixture for the calendar suites.

Builds the real identity chain the calendar depends on — User → profile →
EncadrantProfile → Assignment — rather than mocking it, so the tests exercise
the same relationship lookups production does.

Cast:

* ``student`` ↔ ``supervisor``   linked by an active Assignment
* ``other_student`` ↔ ``other_supervisor``  a completely separate pair, used to
  prove isolation
* ``admin``  a super admin
"""

from __future__ import annotations

from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase

from apps.accounts_et_roles.models import StudentProfile, SupervisorProfile, UserProfile
from apps.admin_management.models import Assignment, ClassGroup, EncadrantProfile, Filiere

User = get_user_model()

CASABLANCA = ZoneInfo('Africa/Casablanca')
UTC = ZoneInfo('UTC')

EVENTS_URL = '/api/agenda/events'


def at(year, month, day, hour=0, minute=0, *, tz=UTC) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=tz)


def iso(moment: datetime) -> str:
    return moment.isoformat()


class AgendaTestCase(APITestCase):
    """Base fixture: two supervision pairs plus an admin."""

    def setUp(self):
        self.filiere = Filiere.objects.create(code='GI', name='Genie Informatique')
        self.class_group = ClassGroup.objects.create(
            code='GI-5-A', name='GI 5A', filiere=self.filiere,
        )

        self.student_user, self.student = self._make_student('student@test.com', 'Sara', 'Idrissi')
        self.other_student_user, self.other_student = self._make_student(
            'other-student@test.com', 'Omar', 'Bennani',
        )

        self.supervisor_user, self.encadrant = self._make_supervisor(
            'supervisor@test.com', 'Nadia', 'Alaoui',
        )
        self.other_supervisor_user, self.other_encadrant = self._make_supervisor(
            'other-supervisor@test.com', 'Youssef', 'Tazi',
        )

        self.admin_user = User.objects.create_user(email='admin@test.com', password='pass')
        self.admin_user.role = User.RoleChoices.ADMIN
        self.admin_user.is_superuser = True
        self.admin_user.save()
        UserProfile.objects.create(user=self.admin_user, first_name='Admin', last_name='One')

        self.assignment = Assignment.objects.create(
            student_profile=self.student,
            class_group=self.class_group,
            encadrant_profile=self.encadrant,
            academic_year='2026-2027',
            is_active=True,
        )
        self.other_assignment = Assignment.objects.create(
            student_profile=self.other_student,
            class_group=self.class_group,
            encadrant_profile=self.other_encadrant,
            academic_year='2026-2027',
            is_active=True,
        )

    def _make_student(self, email: str, first: str, last: str):
        user = User.objects.create_user(email=email, password='pass')
        user.role = User.RoleChoices.STUDENT
        user.save()
        UserProfile.objects.create(user=user, first_name=first, last_name=last)
        profile = StudentProfile.objects.create(
            user=user, filiere=self.filiere, class_group=self.class_group,
        )
        return user, profile

    def _make_supervisor(self, email: str, first: str, last: str):
        user = User.objects.create_user(email=email, password='pass')
        user.role = User.RoleChoices.SUPERVISOR
        user.save()
        UserProfile.objects.create(user=user, first_name=first, last_name=last)
        supervisor = SupervisorProfile.objects.create(user=user)
        encadrant = EncadrantProfile.objects.create(supervisor_profile=supervisor)
        return user, encadrant

    def client_for(self, user) -> APIClient:
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    # -- convenience -------------------------------------------------------

    def event_payload(self, **overrides) -> dict:
        """
        Build a create body.

        ``start`` / ``end`` accept a datetime or a raw string, so a test can
        hand over a deliberately odd value (naive, offset-carrying, malformed)
        without the helper trying to do arithmetic on it.
        """
        start = overrides.pop('start', at(2026, 9, 7, 10, 0))
        if 'end' in overrides:
            end = overrides.pop('end')
        elif isinstance(start, datetime):
            end = start + timedelta(hours=1)
        else:
            end = None

        payload = {
            'title': 'Weekly progress review',
            'event_type': 'MEETING',
            'start': iso(start) if isinstance(start, datetime) else start,
            'timezone': 'Africa/Casablanca',
        }
        if end is not None:
            payload['end'] = iso(end) if isinstance(end, datetime) else end
        payload.update(overrides)
        return payload

    def create_event(self, user, **overrides):
        """POST an event and return the parsed data block, failing loudly on error."""
        response = self.client_for(user).post(
            EVENTS_URL, self.event_payload(**overrides), format='json',
        )
        self.assertIn(
            response.status_code, (200, 201),
            msg=f'Unexpected {response.status_code}: {response.content!r}',
        )
        return response.json()['data']

    def list_range(self, user, start: datetime, end: datetime, **params):
        query = {'start': iso(start), 'end': iso(end), **params}
        response = self.client_for(user).get(EVENTS_URL, query)
        self.assertEqual(response.status_code, 200, msg=response.content)
        return response.json()['data']

    @staticmethod
    def today_date() -> date:
        return date(2026, 9, 7)
