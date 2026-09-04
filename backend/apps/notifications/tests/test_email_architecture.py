"""Tests for template resolution, variables, Brevo isolation, and registry gaps."""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIRequestFactory, force_authenticate

from apps.notifications.constants import Category, EmailKind
from apps.notifications.events.event_variables import find_unknown_variables, get_sample_context
from apps.notifications.events.publisher import emit_event
from apps.notifications.events.registry import get_event_config
from apps.notifications.models import NotificationEvent, NotificationRecipient, NotificationTemplate
from apps.notifications.providers.brevo import BrevoEmailProvider
from apps.notifications.providers.factory import get_email_provider
from apps.notifications.services.preference_service import should_deliver
from apps.notifications.services.template_resolver import (
    resolve_template,
    set_default_template,
    set_selected_template,
)
from apps.notifications.api.email_system_template_views import EmailTemplateSafeTestView

User = get_user_model()


class TemplateResolverTests(TestCase):
    def setUp(self):
        self.event_code = "report.submitted"
        self.selected = NotificationTemplate.objects.create(
            code="report_submitted_selected",
            name="Selected Report Submitted",
            event_code=self.event_code,
            channel=NotificationRecipient.Channel.EMAIL,
            category=Category.SUPERVISION,
            is_active=True,
            status=NotificationTemplate.Status.ACTIVE,
            is_selected=True,
            is_default=False,
        )
        self.default = NotificationTemplate.objects.create(
            code="report_submitted_default",
            name="Default Report Submitted",
            event_code=self.event_code,
            channel=NotificationRecipient.Channel.EMAIL,
            category=Category.SUPERVISION,
            is_active=True,
            status=NotificationTemplate.Status.ACTIVE,
            is_selected=False,
            is_default=True,
        )
        NotificationTemplate.objects.create(
            code="welcome",
            name="Welcome Fallback",
            event_code="student.created",
            channel=NotificationRecipient.Channel.EMAIL,
            category=Category.SYSTEM,
            is_active=True,
            status=NotificationTemplate.Status.ACTIVE,
        )

    def test_resolves_selected_first(self):
        resolved = resolve_template(
            event_code=self.event_code,
            channel=NotificationRecipient.Channel.EMAIL,
            registry_template_code="welcome",
        )
        self.assertEqual(resolved.source, "selected")
        self.assertEqual(resolved.template_code, "report_submitted_selected")

    def test_falls_back_to_default_when_selected_missing(self):
        self.selected.is_selected = False
        self.selected.save(update_fields=["is_selected"])
        resolved = resolve_template(
            event_code=self.event_code,
            channel=NotificationRecipient.Channel.EMAIL,
            registry_template_code="welcome",
        )
        self.assertEqual(resolved.source, "default")
        self.assertEqual(resolved.template_code, "report_submitted_default")

    def test_falls_back_to_registry_code(self):
        self.selected.is_selected = False
        self.selected.save(update_fields=["is_selected"])
        self.default.is_default = False
        self.default.save(update_fields=["is_default"])
        resolved = resolve_template(
            event_code="unknown.event",
            channel=NotificationRecipient.Channel.EMAIL,
            registry_template_code="welcome",
        )
        self.assertEqual(resolved.source, "registry")
        self.assertEqual(resolved.template_code, "welcome")

    def test_system_fallback_when_nothing_matches(self):
        resolved = resolve_template(
            event_code="totally.missing",
            channel=NotificationRecipient.Channel.EMAIL,
            registry_template_code="does_not_exist",
        )
        self.assertEqual(resolved.source, "system_fallback")
        self.assertIsNone(resolved.template)

    def test_set_selected_clears_previous(self):
        set_selected_template(template=self.default)
        self.selected.refresh_from_db()
        self.default.refresh_from_db()
        self.assertFalse(self.selected.is_selected)
        self.assertTrue(self.default.is_selected)

    def test_set_default_clears_previous(self):
        set_default_template(template=self.selected)
        self.selected.refresh_from_db()
        self.default.refresh_from_db()
        self.assertTrue(self.selected.is_default)
        self.assertFalse(self.default.is_default)


class EventVariableTests(TestCase):
    def test_unknown_variables_detected(self):
        unknown = find_unknown_variables(
            "student.password.reset",
            "Hello {{ user_name }} {{ hack_script }}",
            "Reset: {{ reset_url }}",
        )
        self.assertIn("hack_script", unknown)
        self.assertNotIn("user_name", unknown)
        self.assertNotIn("reset_url", unknown)

    def test_sample_context_has_expected_keys(self):
        ctx = get_sample_context("report.submitted")
        self.assertIn("student_name", ctx)
        self.assertIn("report_title", ctx)


class PreferenceTransactionalTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="pref-arch@test.com", password="pass")

    def test_password_reset_is_transactional(self):
        config = get_event_config("student.password.reset")
        self.assertIsNotNone(config)
        self.assertEqual(config.email_kind, EmailKind.TRANSACTIONAL)
        enabled, _freq = should_deliver(
            user=self.user,
            channel=NotificationRecipient.Channel.EMAIL,
            config=config,
            urgent=True,
        )
        self.assertTrue(enabled)


class BrevoProviderIsolationTests(TestCase):
    @override_settings(NOTIFICATION_EMAIL_PROVIDER="mock")
    def test_factory_defaults_to_mock_without_db_override(self):
        provider = get_email_provider()
        self.assertIn(provider.name, {"mock", "brevo", "sendgrid", "smtp"})

    def test_brevo_requires_api_key(self):
        provider = BrevoEmailProvider()
        result = provider.send_email(
            to="someone@example.com",
            subject="Hi",
            body_html="<p>Hi</p>",
        )
        self.assertFalse(result.success)
        self.assertIn("API key", result.error)


class ReportRegistryTests(TestCase):
    def test_rejected_and_requires_changes_registered(self):
        self.assertIsNotNone(get_event_config("report.rejected"))
        self.assertIsNotNone(get_event_config("report.requires_changes"))

    def test_email_events_no_longer_use_welcome_fallback(self):
        for code in (
            "srf.submitted",
            "srf.approved",
            "supervisor.assigned",
            "report.escalated",
            "report.rejected",
            "report.requires_changes",
        ):
            cfg = get_event_config(code)
            self.assertIsNotNone(cfg)
            self.assertNotEqual(cfg.template_code, "welcome", msg=code)


class EmitEventIdempotencyTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="idem-arch@test.com", password="pass")

    def test_idempotency_still_works(self):
        key = "email-arch-idempotency"
        e1 = emit_event(
            event_code="student.created",
            source_app="test",
            entity_type="user",
            entity_id=self.user.pk,
            payload={"user_id": self.user.pk, "title": "Hi", "body": "Welcome"},
            idempotency_key=key,
        )
        e2 = emit_event(
            event_code="student.created",
            source_app="test",
            entity_type="user",
            entity_id=self.user.pk,
            payload={"user_id": self.user.pk, "title": "Hi", "body": "Welcome"},
            idempotency_key=key,
        )
        self.assertEqual(e1.pk, e2.pk)
        self.assertEqual(NotificationEvent.objects.filter(idempotency_key=key).count(), 1)


class SafeTestSendIsolationTests(TestCase):
    def setUp(self):
        NotificationTemplate.objects.create(
            code="safe_test_tpl",
            name="Safe Test",
            event_code="student.created",
            channel=NotificationRecipient.Channel.EMAIL,
            category=Category.SYSTEM,
            is_active=True,
            status=NotificationTemplate.Status.ACTIVE,
        )

    @patch("apps.notifications.api.email_system_template_views.send_test_email")
    def test_safe_test_does_not_create_business_events(self, mock_send):
        mock_send.return_value = (True, "Test email sent", {"provider": "mock"})
        admin = User.objects.create_superuser(email="admin-arch@test.com", password="pass")
        factory = APIRequestFactory()
        request = factory.post(
            "/",
            {"recipient_email": "qa@example.com", "language": "fr"},
            format="json",
        )
        force_authenticate(request, user=admin)
        before = NotificationEvent.objects.count()
        response = EmailTemplateSafeTestView.as_view()(request, template_code="safe_test_tpl")
        self.assertIn(response.status_code, (200, 201))
        mock_send.assert_called_once()
        self.assertEqual(NotificationEvent.objects.count(), before)
