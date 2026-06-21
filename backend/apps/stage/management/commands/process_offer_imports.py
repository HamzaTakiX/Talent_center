"""Process pending offer import jobs."""

from django.core.management.base import BaseCommand

from apps.stage.models import OfferImportJob
from apps.stage.services.offer_import_service import run_import_extraction


class Command(BaseCommand):
    help = 'Extract data from pending offer import jobs (mock parsers).'

    def handle(self, *args, **options):
        jobs = OfferImportJob.objects.filter(status=OfferImportJob.Status.PENDING)
        count = 0
        for job in jobs:
            run_import_extraction(job)
            count += 1
        self.stdout.write(self.style.SUCCESS(f'Processed {count} import job(s).'))
