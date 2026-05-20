"""Nightly-style job: apply active HistoryRetentionRule policies."""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.history.models import HistoryEvent, HistoryRetentionRule


class Command(BaseCommand):
    help = 'Apply history retention rules (delete/anonymize/archive expired events)'

    def handle(self, *args, **options):
        now = timezone.now()
        for rule in HistoryRetentionRule.objects.filter(is_active=True):
            cutoff = now - timedelta(days=rule.retention_days)
            qs = HistoryEvent.objects.filter(occurred_at__lt=cutoff)
            if rule.source_app:
                qs = qs.filter(source_app=rule.source_app)
            if rule.entity_type:
                qs = qs.filter(entity_type=rule.entity_type)
            if rule.event_code:
                qs = qs.filter(event_code=rule.event_code)
            if rule.rule_code == 'critical-preserve':
                qs = qs.exclude(severity__in=[HistoryEvent.Severity.CRITICAL, HistoryEvent.Severity.ERROR])

            count = qs.count()
            if rule.action_on_expiry == HistoryRetentionRule.ActionOnExpiry.DELETE:
                qs.delete()
            elif rule.action_on_expiry == HistoryRetentionRule.ActionOnExpiry.ANONYMIZE:
                qs.update(
                    actor_email='',
                    actor_user=None,
                    ip_address=None,
                    user_agent='',
                    payload_json={},
                    summary='[anonymized]',
                )
            else:
                qs.update(visibility_scope='archived')

            rule.last_run_at = now
            rule.last_affected_count = count
            rule.save(update_fields=['last_run_at', 'last_affected_count'])
            self.stdout.write(f'{rule.rule_code}: affected {count}')
