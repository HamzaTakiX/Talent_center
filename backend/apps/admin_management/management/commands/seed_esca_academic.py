from django.core.management.base import BaseCommand

from apps.admin_management.services.esca_academic_seed import seed_esca_academic


class Command(BaseCommand):
    help = (
        'Seed ESCA academic hierarchy (programs, levels, sectors, internship types, '
        'years, and class groups).'
    )

    def handle(self, *args, **options):
        result = seed_esca_academic()
        self.stdout.write(self.style.SUCCESS(f'ESCA academic seed complete: {result}'))
