"""Management command: python manage.py srf_risk_scan"""

from django.core.management.base import BaseCommand

from apps.srf.services.risk_detection import scan_exam_period_risks, scan_overdue_installments


class Command(BaseCommand):
    help = 'Scan overdue installments and exam-period financial risks; create alerts and notifications.'

    def handle(self, *args, **options):
        overdue = scan_overdue_installments()
        exam_stats = scan_exam_period_risks()
        self.stdout.write(
            self.style.SUCCESS(
                f'SRF risk scan complete: overdue_alerts={overdue}, exam_stats={exam_stats}',
            ),
        )
