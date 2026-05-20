"""Rollback financial import batches."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.srf.compliance_models import Installment
from apps.srf.import_models import FinancialImportBatch, FinancialImportSnapshot
from apps.srf.models import FinancialAccount
from apps.srf.services.financial_profile import refresh_student_financial_state_after_rollback

from .audit import log_import_event
from .engine import _parse_date


def _snapshots_for_rollback(
    batch: FinancialImportBatch,
    *,
    include_already_rolled_back: bool = False,
) -> list[FinancialImportSnapshot]:
    """Earliest snapshot per account — true pre-import state."""
    by_account: dict[int, FinancialImportSnapshot] = {}
    qs = batch.snapshots.select_related('account', 'account__student_profile').order_by('id')
    if not include_already_rolled_back:
        qs = qs.filter(rolled_back=False)
    for snap in qs:
        if not snap.before_state_json:
            continue
        if snap.account_id not in by_account:
            by_account[snap.account_id] = snap
    return list(by_account.values())


def _parse_installment_due_date(value: Any):
    parsed = _parse_date(value)
    return parsed or timezone.now().date()


def _restore_account_from_snapshot(
    snap: FinancialImportSnapshot,
    batch: FinancialImportBatch,
) -> bool:
    before = snap.before_state_json or {}
    if not before:
        return False

    account = snap.account
    restored_year = str(before.get('current_academic_year') or '').strip()

    account.total_amount = Decimal(str(before.get('total_amount', '0')))
    account.paid_amount = Decimal(str(before.get('paid_amount', '0')))
    account.remaining_amount = Decimal(str(before.get('remaining_amount', '0')))
    account.balance = account.remaining_amount
    account.financial_status = before.get('financial_status') or account.financial_status
    account.payment_plan_type = before.get('payment_plan_type') or account.payment_plan_type
    if restored_year:
        account.current_academic_year = restored_year
    account.save()

    years_to_clear = {y for y in (restored_year, batch.academic_year, account.current_academic_year) if y}
    for year in years_to_clear:
        account.installments.filter(academic_year=year).delete()

    for inst in before.get('installments') or []:
        inst_year = str(inst.get('academic_year') or restored_year or '')
        Installment.objects.create(
            account=account,
            installment_number=int(inst['installment_number']),
            label=f"tranche_{inst['installment_number']}",
            amount=Decimal(str(inst['amount'])),
            due_date=_parse_installment_due_date(inst.get('due_date')),
            academic_year=inst_year,
            payment_status=inst.get('payment_status', Installment.PaymentStatus.UNPAID),
            semester=1 if int(inst['installment_number']) <= 2 else 2,
        )

    student = account.student_profile
    refresh_student_financial_state_after_rollback(student, account, before)

    snap.rolled_back = True
    snap.save(update_fields=['rolled_back'])
    return True


def batch_has_rollback_snapshots(batch: FinancialImportBatch) -> bool:
    return batch.snapshots.exclude(before_state_json={}).exists()


def batch_can_retry_rollback(batch: FinancialImportBatch) -> bool:
    if batch.import_mode == FinancialImportBatch.ImportMode.DRY_RUN:
        return False
    if batch.status != FinancialImportBatch.Status.ROLLED_BACK:
        return False
    return batch_has_rollback_snapshots(batch)


@transaction.atomic
def rollback_import_batch(
    batch: FinancialImportBatch,
    *,
    actor,
    ip_address=None,
    force_retry: bool = False,
) -> dict:
    if batch.import_mode == FinancialImportBatch.ImportMode.DRY_RUN:
        raise ValueError('Impossible d\'annuler un import en mode test.')

    if batch.status == FinancialImportBatch.Status.ROLLED_BACK and not force_retry:
        has_pending = batch.snapshots.filter(rolled_back=False).exclude(before_state_json={}).exists()
        if not has_pending:
            raise ValueError(
                'Ce lot est déjà marqué annulé. Utilisez « Réessayer le rollback » si les données SRF '
                'sont encore incorrectes.',
            )

    if force_retry:
        batch.snapshots.update(rolled_back=False)

    snapshots = _snapshots_for_rollback(
        batch,
        include_already_rolled_back=force_retry,
    )
    if not snapshots:
        raise ValueError(
            'Aucun instantané de restauration pour ce lot. '
            'Les imports antérieurs à la correction ne peuvent pas être annulés automatiquement.',
        )

    restored = 0
    for snap in snapshots:
        if _restore_account_from_snapshot(snap, batch):
            restored += 1

    batch.snapshots.filter(account_id__in=[s.account_id for s in snapshots]).update(rolled_back=True)

    batch.status = FinancialImportBatch.Status.ROLLED_BACK
    batch.rolled_back_at = timezone.now()
    batch.rolled_back_by = actor
    batch.save(update_fields=['status', 'rolled_back_at', 'rolled_back_by', 'updated_at'])

    log_import_event(
        batch,
        'ROLLBACK',
        actor=actor,
        ip_address=ip_address,
        message=f'Rollback : {restored} compte(s) restauré(s)',
        payload={'restored': restored},
    )

    return {'restored_accounts': restored, 'batch_uuid': str(batch.uuid)}
