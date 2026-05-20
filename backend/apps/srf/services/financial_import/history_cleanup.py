"""Remove import batches from history (UI list) with safety checks."""

from __future__ import annotations

from typing import Any

from django.db import transaction

from apps.srf.import_models import FinancialImportBatch
from apps.srf.services.financial_import.rollback import rollback_import_batch

ACTIVE_STATUSES = frozenset({
    FinancialImportBatch.Status.PROCESSING,
    FinancialImportBatch.Status.QUEUED,
})

APPLIED_STATUSES = frozenset({
    FinancialImportBatch.Status.COMPLETED,
    FinancialImportBatch.Status.PARTIAL,
})


def batch_requires_force_delete(batch: FinancialImportBatch) -> bool:
    if batch.status not in APPLIED_STATUSES:
        return False
    if batch.rolled_back_at:
        return False
    return batch.import_mode != FinancialImportBatch.ImportMode.DRY_RUN


def validate_batch_deletion(batch: FinancialImportBatch, *, force: bool = False) -> None:
    if batch.status in ACTIVE_STATUSES:
        raise ValueError('Import en cours — suppression impossible.')
    if batch_requires_force_delete(batch) and not force:
        raise ValueError(
            'Cet import a modifié des données. Effectuez un rollback ou confirmez la suppression forcée.',
        )


def _purge_batch_financial_effects(batch: FinancialImportBatch) -> None:
    """Rollback applied import data before removing history entry."""
    if batch.import_mode == FinancialImportBatch.ImportMode.DRY_RUN:
        return
    if batch.status not in APPLIED_STATUSES:
        return
    if batch.rolled_back_at:
        return
    rollback_import_batch(batch, force_retry=True)


@transaction.atomic
def delete_import_batch(
    batch: FinancialImportBatch,
    *,
    force: bool = False,
    purge_financial: bool = False,
) -> None:
    validate_batch_deletion(batch, force=force)
    if purge_financial:
        try:
            _purge_batch_financial_effects(batch)
            batch.refresh_from_db()
        except ValueError as exc:
            if not force:
                raise ValueError(
                    f'Impossible d\'annuler les effets financiers : {exc}',
                ) from exc
    stored = batch.stored_file
    batch.delete()
    if stored:
        try:
            stored.delete(save=False)
        except OSError:
            pass


def clear_import_history(
    *,
    force: bool = False,
    purge_financial: bool = False,
) -> dict[str, Any]:
    deleted = 0
    skipped = 0
    errors: list[str] = []

    for batch in FinancialImportBatch.objects.order_by('-created_at'):
        try:
            delete_import_batch(batch, force=force, purge_financial=purge_financial)
            deleted += 1
        except ValueError as exc:
            skipped += 1
            if len(errors) < 5:
                errors.append(str(exc))

    return {'deleted': deleted, 'skipped': skipped, 'errors': errors}
