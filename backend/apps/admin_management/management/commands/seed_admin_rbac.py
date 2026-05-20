from django.core.management.base import BaseCommand

from apps.admin_management.services.rbac_seed import seed_admin_rbac


class Command(BaseCommand):
    help = 'Seed platform administrator roles and permissions.'

    def handle(self, *args, **options):
        result = seed_admin_rbac()
        self.stdout.write(self.style.SUCCESS(f'RBAC seeded: {result}'))
