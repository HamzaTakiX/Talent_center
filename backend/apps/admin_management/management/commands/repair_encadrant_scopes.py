from django.core.management.base import BaseCommand

from apps.admin_management.services.encadrant_scope import repair_all_encadrant_scopes


class Command(BaseCommand):
    help = (
        'Repair encadrant academic scopes: infer missing levels from programs, '
        'current academic year, and supervised internship types.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Report how many profiles would change without saving.',
        )

    def handle(self, *args, **options):
        dry_run = bool(options['dry_run'])
        result = repair_all_encadrant_scopes(dry_run=dry_run)
        mode = 'dry run' if dry_run else 'applied'
        self.stdout.write(
            self.style.SUCCESS(
                f'Encadrant scope repair ({mode}): scanned={result["scanned"]}, '
                f'updated={result["repaired"]}',
            ),
        )
