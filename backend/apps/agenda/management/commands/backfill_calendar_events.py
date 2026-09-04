"""
Project pre-existing supervision meetings into the calendar.

Run once after deploying the calendar so meetings scheduled before it existed
appear in the grid. Idempotent — ``project_meeting`` is get-or-update keyed on
the meeting, so re-running only refreshes.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.agenda.services.integrations import project_meeting
from apps.encadrant.models import Meeting


class Command(BaseCommand):
    help = 'Create calendar events for supervision meetings that predate the calendar.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Report what would be projected without writing.',
        )

    def handle(self, *args, **options):
        meetings = (
            Meeting.objects
            .select_related(
                'student_profile__user',
                'encadrant_profile__supervisor_profile__user',
                'assignment',
            )
            .prefetch_related('students__user')
            .order_by('pk')
        )

        projected = skipped = 0
        for meeting in meetings.iterator(chunk_size=200):
            if options['dry_run']:
                start = meeting.planned_start or meeting.scheduled_at
                if not start or (meeting.metadata_json or {}).get('ad_hoc'):
                    skipped += 1
                    continue
                projected += 1
                continue

            with transaction.atomic():
                if project_meeting(meeting) is None:
                    skipped += 1
                else:
                    projected += 1

        verb = 'Would project' if options['dry_run'] else 'Projected'
        self.stdout.write(
            self.style.SUCCESS(f'{verb} {projected} meeting(s); skipped {skipped}.'),
        )
