"""Notification system unit tests."""

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from apps.notifications.events.publisher import emit_event
from apps.notifications.events.resolvers.internship import resolve_internship_admins
from apps.notifications.models import Notification, NotificationEvent, NotificationRecipient
from apps.notifications.services.preference_service import should_deliver
from apps.notifications.events.registry import get_event_config
from apps.notifications.services.queue_service import mark_failed

User = get_user_model()


class NotificationEngineTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='student@test.com', password='pass')
        self.user.role = User.RoleChoices.STUDENT
        self.user.save()

    @override_settings(NOTIFICATIONS_EMAIL_ENABLED=True)
    def test_emit_event_creates_in_app_notification(self):
        event = emit_event(
            event_code='student.password.reset',
            source_app='authentication',
            entity_type='user',
            entity_id=self.user.pk,
            payload={
                'user_id': self.user.pk,
                'reset_url': 'http://localhost/reset',
                'ttl_minutes': 30,
                'title': 'Reset',
                'body': 'Reset your password',
            },
        )
        self.assertIsInstance(event, NotificationEvent)
        self.assertTrue(NotificationRecipient.objects.filter(user=self.user).exists())

    def test_idempotency_prevents_duplicate_events(self):
        key = 'test-dedup-key'
        e1 = emit_event(
            event_code='student.created',
            source_app='test',
            entity_type='user',
            entity_id=self.user.pk,
            payload={'user_id': self.user.pk, 'title': 'Hi', 'body': 'Welcome'},
            idempotency_key=key,
        )
        e2 = emit_event(
            event_code='student.created',
            source_app='test',
            entity_type='user',
            entity_id=self.user.pk,
            payload={'user_id': self.user.pk, 'title': 'Hi', 'body': 'Welcome'},
            idempotency_key=key,
        )
        self.assertEqual(e1.pk, e2.pk)


class PreferenceServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='pref@test.com', password='pass')

    def test_default_email_enabled(self):
        config = get_event_config('internship.offer.published')
        enabled, freq = should_deliver(
            user=self.user,
            channel=NotificationRecipient.Channel.EMAIL,
            config=config,
        )
        self.assertTrue(enabled)


class QueueRetryTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='queue@test.com', password='pass')
        self.event = NotificationEvent.objects.create(
            event_code='test.event',
            source_app='test',
        )

    def test_mark_failed_schedules_retry(self):
        recipient = NotificationRecipient.objects.create(
            event=self.event,
            user=self.user,
            delivery_channel=NotificationRecipient.Channel.EMAIL,
            status=NotificationRecipient.Status.PROCESSING,
            attempts=1,
        )
        mark_failed(recipient, error='SMTP error')
        recipient.refresh_from_db()
        self.assertEqual(recipient.status, NotificationRecipient.Status.RETRY_SCHEDULED)
        self.assertIsNotNone(recipient.next_retry_at)


class InternshipResolverTests(TestCase):
    def test_internship_admins_resolver_empty_without_admins(self):
        event = NotificationEvent.objects.create(event_code='internship.offer.published', source_app='stage')
        result = resolve_internship_admins(event)
        self.assertIsInstance(result, list)
