"""Reset SRF financial data (dev / admin recovery after imports)."""

from __future__ import annotations

from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.srf.compliance_models import (
    FinancialRiskAlert,
    Installment,
    PaymentProofSubmission,
    StudentAcademicAccess,
)
from apps.srf.import_models import FinancialImportBatch, FinancialImportSnapshot
from apps.srf.models import (
    CashflowSnapshot,
    ExemptionAndAdjustment,
    FinancialAccount,
    FinancialHold,
    FinancialLine,
    Payment,
    PaymentReceipt,
)

WIPE_CONFIRM_PHRASE = 'VIDER_SRF'


def _delete_import_batches_with_files() -> int:
    deleted = 0
    for batch in FinancialImportBatch.objects.all().iterator():
        stored = batch.stored_file
        batch.delete()
        if stored:
            try:
                stored.delete(save=False)
            except OSError:
                pass
        deleted += 1
    return deleted


@transaction.atomic
def wipe_all_srf_financial_data() -> dict[str, Any]:
    """
    Nuclear reset: ledger lines, payments, installments, proofs, alerts,
    import history, and remove all student financial accounts (empty SRF UI).
    """
    counts: dict[str, int] = {}

    counts['installments'] = Installment.objects.all().delete()[0]
    counts['payment_proofs'] = PaymentProofSubmission.objects.all().delete()[0]
    counts['risk_alerts'] = FinancialRiskAlert.objects.all().delete()[0]
    counts['payment_receipts'] = PaymentReceipt.objects.all().delete()[0]
    counts['payments'] = Payment.objects.all().delete()[0]
    counts['financial_lines'] = FinancialLine.objects.all().delete()[0]
    counts['financial_holds'] = FinancialHold.objects.all().delete()[0]
    counts['exemptions'] = ExemptionAndAdjustment.objects.all().delete()[0]
    counts['cashflow_snapshots'] = CashflowSnapshot.objects.all().delete()[0]

    counts['import_batches_deleted'] = _delete_import_batches_with_files()
    counts['import_snapshots'] = FinancialImportSnapshot.objects.all().delete()[0]
    counts['accounts_deleted'] = FinancialAccount.objects.all().delete()[0]

    access_updated = StudentAcademicAccess.objects.update(
        can_take_exams=True,
        can_download_convention=True,
        internship_eligible=True,
        financial_clearance=True,
        blocking_reasons=[],
        computed_at=timezone.now(),
    )
    counts['academic_access_reset'] = access_updated

    return counts
