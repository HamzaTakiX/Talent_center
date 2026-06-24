"""Batch recompute student intelligence scores — suitable for cron/Celery beat."""

from django.core.management.base import BaseCommand

from apps.profile_intelligence.services.student_intelligence_service import recompute_students_batch


class Command(BaseCommand):
    help = 'Recompute stored intelligence scores for all (or selected) students.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--student-id',
            type=int,
            action='append',
            dest='student_ids',
            help='Recompute only these student profile IDs (repeatable).',
        )

    def handle(self, *args, **options):
        student_ids = options.get('student_ids')
        count = recompute_students_batch(student_ids)
        self.stdout.write(self.style.SUCCESS(f'Recomputed intelligence for {count} student(s).'))
