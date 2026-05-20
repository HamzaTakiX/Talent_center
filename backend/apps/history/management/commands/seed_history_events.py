"""Seed representative cross-module history events for development/demo."""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.history.models import HistoryEvent, HistoryRetentionRule
from apps.history.services.adapters import emit_domain_event


class Command(BaseCommand):
    help = 'Seed demo history events and default retention rules'

    def handle(self, *args, **options):
        now = timezone.now()
        samples = [
            ('stage', 'CREATE', 'internship.offer.published', 'Internship offer published', 'stage_offer', 101,
             {'status': {'old': 'draft', 'new': 'published'}}, HistoryEvent.Severity.INFO),
            ('announcements', 'PUBLISH', 'announcement.published', 'Announcement published to targeted cohort', 'announcement', 42,
             {'audience': {'old': 'draft', 'new': 'm1_msc'}}, HistoryEvent.Severity.INFO),
            ('documents', 'VALIDATE', 'document.validated', 'Convention document validated', 'document_request', 88,
             {'status': {'old': 'pending', 'new': 'approved'}}, HistoryEvent.Severity.INFO),
            ('srf', 'VALIDATE', 'srf.payment.validated', 'SRF payment proof validated', 'payment_proof', 15,
             {'amount': {'old': 'pending', 'new': 'validated'}}, HistoryEvent.Severity.WARNING),
            ('meetings', 'UPDATE', 'meeting.rescheduled', 'Supervision meeting rescheduled', 'supervision_meeting', 7,
             {'scheduled_at': {'old': '2026-05-01T10:00', 'new': '2026-05-07T14:00'}}, HistoryEvent.Severity.INFO),
            ('smart_assignment', 'ASSIGN', 'smart_assignment.executed', 'Smart assignment batch executed', 'assignment_run', 3,
             {}, HistoryEvent.Severity.INFO),
            ('auth', 'UPDATE', 'user.role.changed', 'Administrator role permissions updated', 'admin_user', 2,
             {'roles': {'old': ['ADMIN_DOCUMENTS'], 'new': ['ADMIN_SUPER']}}, HistoryEvent.Severity.CRITICAL),
            ('notifications', 'CREATE', 'notification.reminder.sent', 'Automated deadline reminder sent', 'notification_batch', 900,
             {}, HistoryEvent.Severity.INFO),
        ]

        created = 0
        for i, (module, action, code, summary, etype, eid, diff, severity) in enumerate(samples):
            emit_domain_event(
                module=module,
                action=action,
                event_code=code,
                summary=summary,
                entity_type=etype,
                entity_id=eid,
                old_values=diff.get('status') or diff.get('scheduled_at') or diff.get('roles') or {},
                new_values=diff.get('amount') or diff.get('audience') or {},
                details=diff,
                severity=severity,
                is_automated=module in ('notifications', 'smart_assignment') and action == 'ASSIGN',
                metadata={'demo_seed': True, 'offset_hours': i},
            )
            HistoryEvent.objects.filter(event_code=code).update(
                occurred_at=now - timedelta(hours=i * 3),
            )
            created += 1

        HistoryRetentionRule.objects.update_or_create(
            rule_code='critical-preserve',
            defaults={
                'name': 'Preserve critical events',
                'description': 'Never auto-delete CRITICAL/ERROR audit rows',
                'source_app': '',
                'entity_type': '',
                'event_code': '',
                'retention_days': 3650,
                'action_on_expiry': HistoryRetentionRule.ActionOnExpiry.ARCHIVE,
                'is_active': True,
            },
        )
        HistoryRetentionRule.objects.update_or_create(
            rule_code='info-standard',
            defaults={
                'name': 'Standard INFO retention',
                'description': 'Purge low-severity operational events after 18 months',
                'retention_days': 540,
                'action_on_expiry': HistoryRetentionRule.ActionOnExpiry.DELETE,
                'is_active': True,
            },
        )

        self.stdout.write(self.style.SUCCESS(f'Seeded {created} history events'))
