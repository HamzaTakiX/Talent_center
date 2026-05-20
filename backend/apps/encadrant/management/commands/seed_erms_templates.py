from django.core.management.base import BaseCommand

from apps.encadrant.models import Report, ReportTemplate


TEMPLATES = [
    ('follow-up-default', 'Rapport de suivi', Report.ReportType.FOLLOW_UP),
    ('mid-term-default', 'Évaluation mi-parcours', Report.ReportType.MID_TERM),
    ('final-default', 'Évaluation finale', Report.ReportType.FINAL),
    ('risk-alert-default', 'Alerte risque', Report.ReportType.RISK_ALERT),
    ('validation-default', 'Validation de stage', Report.ReportType.VALIDATION),
]


class Command(BaseCommand):
    help = 'Seed default ERMS report templates.'

    def handle(self, *args, **options):
        created = 0
        for code, name, report_type in TEMPLATES:
            _, was_created = ReportTemplate.objects.update_or_create(
                code=code,
                defaults={
                    'name': name,
                    'report_type': report_type,
                    'schema_json': {'sections': ['comments', 'score', 'evaluation']},
                    'is_active': True,
                },
            )
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'ERMS templates: {created} created, {len(TEMPLATES)} total.'))
