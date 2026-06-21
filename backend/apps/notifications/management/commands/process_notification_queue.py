from django.core.management.base import BaseCommand

from apps.notifications.jobs.process_queue import process_notification_batch


class Command(BaseCommand):
    help = 'Process pending notification queue (email/SMS/push)'

    def add_arguments(self, parser):
        parser.add_argument('--batch-size', type=int, default=50)

    def handle(self, *args, **options):
        stats = process_notification_batch(batch_size=options['batch_size'])
        self.stdout.write(self.style.SUCCESS(f'Queue processed: {stats}'))
