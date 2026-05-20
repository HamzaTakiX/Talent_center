"""Re-run financial import rollback (e.g. after a failed first attempt)."""

from django.core.management.base import BaseCommand, CommandError

from apps.srf.import_models import FinancialImportBatch
from apps.srf.services.financial_import.rollback import rollback_import_batch


class Command(BaseCommand):
    help = 'Relance le rollback d\'un lot d\'import SRF (force_retry=True).'

    def add_arguments(self, parser):
        parser.add_argument('batch_uuid', type=str, help='UUID du lot FinancialImportBatch')

    def handle(self, *args, **options):
        batch_uuid = options['batch_uuid'].strip()
        try:
            batch = FinancialImportBatch.objects.get(uuid=batch_uuid)
        except FinancialImportBatch.DoesNotExist as exc:
            raise CommandError(f'Lot introuvable : {batch_uuid}') from exc

        actor = batch.started_by
        try:
            result = rollback_import_batch(
                batch,
                actor=actor,
                force_retry=True,
            )
        except ValueError as exc:
            raise CommandError(str(exc)) from exc

        restored = result.get('restored_accounts', 0)
        self.stdout.write(
            self.style.SUCCESS(
                f'Rollback terminé — {restored} compte(s) restauré(s) (lot {batch_uuid}).',
            ),
        )
