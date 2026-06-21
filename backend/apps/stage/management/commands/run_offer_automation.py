"""Django management commands for internship offers scheduled jobs."""

from django.core.management.base import BaseCommand

from apps.stage.services.jobs import (
    archive_inactive_offers,
    close_expired_offers,
    expire_stale_applications,
    generate_analytics_snapshots,
    recalculate_all_matching,
    send_offer_reminders,
)


class Command(BaseCommand):
    help = 'Run all internship offers automation jobs (cron-friendly).'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true')
        parser.add_argument('--skip-matching', action='store_true')
        parser.add_argument('--skip-reminders', action='store_true')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        results = {
            'expired_offers': close_expired_offers(dry_run=dry_run),
            'archived_offers': archive_inactive_offers() if not dry_run else {'archived': 0},
            'expired_applications': expire_stale_applications() if not dry_run else {'expired_applications': 0},
            'analytics': generate_analytics_snapshots() if not dry_run else {},
        }
        if not options['skip_reminders'] and not dry_run:
            results['reminders'] = send_offer_reminders()
        if not options['skip_matching'] and not dry_run:
            results['matching'] = recalculate_all_matching()
        if not dry_run:
            from apps.stage.services.jobs import monitor_sla, process_recommendations, process_webhooks

            results['sla'] = monitor_sla()
            results['recommendations'] = process_recommendations()
            results['webhooks'] = process_webhooks()
        self.stdout.write(self.style.SUCCESS(str(results)))
