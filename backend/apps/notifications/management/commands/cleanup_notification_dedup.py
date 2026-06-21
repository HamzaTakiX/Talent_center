from django.core.management.base import BaseCommand

from apps.notifications.services.security_service import cleanup_expired_dedup


class Command(BaseCommand):
    help = 'Purge expired notification dedup keys'

    def handle(self, *args, **options):
        deleted = cleanup_expired_dedup()
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} expired dedup records'))
