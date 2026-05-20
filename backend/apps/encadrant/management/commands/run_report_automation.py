from django.core.management.base import BaseCommand

from apps.encadrant.services.report_automation import run_all_automation


class Command(BaseCommand):
    help = 'Run ERMS automation: overdue detection, risk escalation, reminders, priority recalc.'

    def handle(self, *args, **options):
        result = run_all_automation()
        for key, value in result.items():
            self.stdout.write(f'{key}: {value}')
        self.stdout.write(self.style.SUCCESS('ERMS automation completed.'))
