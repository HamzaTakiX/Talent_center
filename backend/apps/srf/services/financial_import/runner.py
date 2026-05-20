"""Background import execution via daemon threads."""

from __future__ import annotations

import threading

from django.db import connection

from .engine import process_import_batch


def enqueue_import_batch(batch_id: int) -> None:
    """Run import in a background thread (no Celery required)."""

    def _worker():
        connection.close()
        try:
            process_import_batch(batch_id)
        except Exception:
            from apps.srf.import_models import FinancialImportBatch
            from apps.srf.services.financial_import.audit import log_import_event

            batch = FinancialImportBatch.objects.filter(pk=batch_id).first()
            if batch:
                batch.status = FinancialImportBatch.Status.FAILED
                batch.progress_message = 'Échec du traitement'
                batch.save(update_fields=['status', 'progress_message', 'updated_at'])
                log_import_event(
                    batch,
                    'FAIL',
                    actor=batch.started_by,
                    message='Échec critique du traitement',
                )

    thread = threading.Thread(target=_worker, daemon=True, name=f'srf-import-{batch_id}')
    thread.start()
