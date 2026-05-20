from django.core.management.base import BaseCommand

from apps.announcements.services.seed_types import seed_announcement_types


class Command(BaseCommand):
    help = 'Seed announcement taxonomy types'

    def handle(self, *args, **options):
        result = seed_announcement_types()
        self.stdout.write(self.style.SUCCESS(f'Seeded: {result}'))
