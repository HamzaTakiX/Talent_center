from django.core.management.base import BaseCommand

from apps.announcements.services.publication import (
    process_expired_announcements,
    process_scheduled_publications,
)


class Command(BaseCommand):
    help = 'Process scheduled publications and expired announcements'

    def handle(self, *args, **options):
        scheduled = process_scheduled_publications()
        expired = process_expired_announcements()
        self.stdout.write(self.style.SUCCESS(
            f'Published {scheduled} scheduled, expired {expired} announcements',
        ))
