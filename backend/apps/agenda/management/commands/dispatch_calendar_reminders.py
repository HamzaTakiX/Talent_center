"""Fire due calendar reminders. Intended for a per-minute external scheduler."""

from django.core.management.base import BaseCommand

from apps.agenda.services.reminders import DEFAULT_GRACE_MINUTES, dispatch_due_reminders


class Command(BaseCommand):
    help = 'Dispatch calendar event reminders whose moment has arrived.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--grace-minutes',
            type=int,
            default=DEFAULT_GRACE_MINUTES,
            help='How far back to look for reminders a previous run may have missed.',
        )

    def handle(self, *args, **options):
        sent = dispatch_due_reminders(grace_minutes=options['grace_minutes'])
        self.stdout.write(self.style.SUCCESS(f'Dispatched {sent} calendar reminder(s).'))
