from django.core.management.base import BaseCommand

from apps.notifications.models import NotificationDigestBatch
from apps.notifications.services.digest_service import send_digests_for_frequency


class Command(BaseCommand):
    help = 'Send daily notification digests'

    def handle(self, *args, **options):
        count = send_digests_for_frequency(NotificationDigestBatch.Frequency.DAILY)
        self.stdout.write(self.style.SUCCESS(f'Sent {count} daily digests'))
