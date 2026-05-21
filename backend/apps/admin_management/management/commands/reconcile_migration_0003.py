"""Repair partial admin_management.0003_esca_academic_hierarchy on PostgreSQL."""
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.migrations.recorder import MigrationRecorder


class Command(BaseCommand):
    help = (
        'Mark 0003_esca_academic_hierarchy as applied when tables already exist '
        '(after a failed migrate), then optionally run the ESCA seed.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--seed',
            action='store_true',
            help='Run seed_esca_academic() after faking (skipped by --fake).',
        )

    def handle(self, *args, **options):
        migration = ('admin_management', '0003_esca_academic_hierarchy')
        recorder = MigrationRecorder(connection)
        if recorder.migration_qs.filter(app=migration[0], name=migration[1]).exists():
            self.stdout.write(self.style.SUCCESS('0003 already recorded — nothing to do.'))
        else:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT to_regclass('public.admin_management_academiclevel')"
                )
                exists = cursor.fetchone()[0]
            if not exists:
                self.stderr.write(
                    'Table admin_management_academiclevel is missing. '
                    'Run: python manage.py migrate admin_management'
                )
                return
            recorder.record_applied(migration[0], migration[1])
            self.stdout.write(self.style.SUCCESS('Recorded 0003_esca_academic_hierarchy as applied.'))

        if options['seed']:
            from apps.admin_management.services.esca_academic_seed import seed_esca_academic

            seed_esca_academic()
            self.stdout.write(self.style.SUCCESS('ESCA academic seed completed.'))

        self.stdout.write('Next: python manage.py migrate')
