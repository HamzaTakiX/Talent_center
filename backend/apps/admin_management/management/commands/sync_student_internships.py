"""Backfill auto-resolved internship fields for all student profiles."""

from django.core.management.base import BaseCommand

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.services.internship_resolver import sync_student_internship_from_academics


class Command(BaseCommand):
    help = 'Recompute internship type, duration, and category for every student profile.'

    def handle(self, *args, **options):
        updated = 0
        ambiguous = 0
        qs = StudentProfile.objects.select_related(
            'filiere', 'academic_level', 'academic_sector', 'class_group', 'internship_type',
        )
        for profile in qs.iterator(chunk_size=200):
            resolved = sync_student_internship_from_academics(profile)
            profile.save(
                update_fields=[
                    'internship_type',
                    'internship_duration',
                    'internship_category',
                    'updated_at',
                ],
            )
            updated += 1
            if resolved.ambiguous or (
                profile.academic_level_id and not resolved.internship_type
            ):
                ambiguous += 1
        self.stdout.write(
            self.style.SUCCESS(
                f'Synced {updated} student profile(s); {ambiguous} need manual sector/catalog review.',
            ),
        )
