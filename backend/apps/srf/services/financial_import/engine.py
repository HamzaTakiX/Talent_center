"""Apply validated financial import rows to accounts."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional

from django.db import transaction
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.srf.compliance_models import Installment, PaymentPlanType
from apps.srf.import_models import FinancialImportBatch, FinancialImportSnapshot
from apps.srf.models import FinancialAccount
from apps.srf.services.financial_profile import (
    _derive_compliance_status,
    ensure_financial_account,
    refresh_student_financial_state_after_import,
)

from .audit import log_import_event
from .file_security import CHUNK_SIZE
from .validation import _parse_decimal


def _capture_account_state(account: FinancialAccount) -> dict[str, Any]:
    installments = list(
        account.installments.filter(
            academic_year=account.current_academic_year or '',
        ).values(
            'installment_number', 'amount', 'payment_status', 'due_date', 'academic_year',
        )
    )
    return {
        'account_id': account.pk,
        'total_amount': str(account.total_amount),
        'paid_amount': str(account.paid_amount),
        'remaining_amount': str(account.remaining_amount),
        'financial_status': account.financial_status,
        'payment_plan_type': account.payment_plan_type,
        'current_academic_year': account.current_academic_year,
        'installments': installments,
    }


def _parse_date(value: Any) -> Optional[date]:
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    text = str(value).strip()[:10]
    for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y'):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def _apply_installments_from_row(account: FinancialAccount, mapped: dict[str, Any], year: str) -> None:
    for n in range(1, 5):
        amount = _parse_decimal(mapped.get(f'installment_{n}_amount'))
        if amount is None:
            continue
        status = str(mapped.get(f'installment_{n}_status') or Installment.PaymentStatus.UNPAID).upper()
        due = _parse_date(mapped.get(f'installment_{n}_due_date')) or date.today()
        Installment.objects.update_or_create(
            account=account,
            installment_number=n,
            academic_year=year,
            defaults={
                'label': f'tranche_{n}',
                'amount': amount,
                'due_date': due,
                'payment_status': status,
                'semester': 1 if n <= 2 else 2,
            },
        )


def _get_or_create_import_snapshot(
    batch: FinancialImportBatch,
    account: FinancialAccount,
    student: StudentProfile,
    row_number: int,
) -> FinancialImportSnapshot:
    """One snapshot per account per batch — captures state before any import changes."""
    snap = FinancialImportSnapshot.objects.filter(batch=batch, account=account).first()
    if snap:
        return snap
    return FinancialImportSnapshot.objects.create(
        batch=batch,
        account=account,
        student_profile_id=student.pk,
        before_state_json=_capture_account_state(account),
        row_number=row_number,
    )


def _apply_row_to_account(
    student: StudentProfile,
    mapped: dict[str, Any],
    *,
    batch: FinancialImportBatch,
    dry_run: bool,
) -> FinancialAccount:
    account = ensure_financial_account(student)
    row_number = int(mapped.get('_row_number') or 0)

    if not dry_run:
        snapshot = _get_or_create_import_snapshot(
            batch, account, student, row_number,
        )
    else:
        snapshot = None

    year = str(mapped.get('academic_year') or batch.academic_year or student.academic_year or '').strip()
    if year:
        account.current_academic_year = year

    plan = str(mapped.get('payment_plan_type') or '').strip().upper()
    if plan in PaymentPlanType.values:
        account.payment_plan_type = plan
    elif any(mapped.get(f'installment_{n}_amount') for n in range(1, 5)):
        account.payment_plan_type = PaymentPlanType.INSTALLMENTS

    if not dry_run:
        has_installment_data = any(
            _parse_decimal(mapped.get(f'installment_{n}_amount')) is not None
            for n in range(1, 5)
        )
        effective_year = year or str(
            batch.academic_year or student.academic_year or '',
        ).strip()
        if effective_year and not account.current_academic_year:
            account.current_academic_year = effective_year

        if has_installment_data and effective_year:
            account.payment_plan_type = PaymentPlanType.INSTALLMENTS
            _apply_installments_from_row(account, mapped, effective_year)

        total = _parse_decimal(mapped.get('total_amount'))
        paid = _parse_decimal(mapped.get('paid_amount'))
        remaining = _parse_decimal(mapped.get('remaining_amount'))
        has_flat_amounts = total is not None or paid is not None or remaining is not None

        if has_flat_amounts and not (has_installment_data and effective_year):
            if total is not None:
                account.total_amount = total
            if paid is not None:
                account.paid_amount = paid
            if remaining is not None:
                account.remaining_amount = remaining
            elif total is not None and paid is not None:
                account.remaining_amount = max(total - paid, Decimal('0'))
            if not has_installment_data:
                account.payment_plan_type = PaymentPlanType.FULL

        status = str(mapped.get('financial_status') or '').strip().upper()
        if status:
            account.financial_status = status
        elif has_flat_amounts and not (has_installment_data and effective_year):
            account.financial_status = _derive_compliance_status(account)

        account.save()
        refresh_student_financial_state_after_import(student, account)

        if snapshot:
            snapshot.after_state_json = _capture_account_state(account)
            snapshot.applied = True
            snapshot.row_number = row_number or snapshot.row_number
            snapshot.save(update_fields=['after_state_json', 'applied', 'row_number'])

    return account


def process_import_batch(batch_id: int) -> None:
    """Background worker: process batch in chunks."""
    batch = FinancialImportBatch.objects.get(pk=batch_id)
    validation = batch.validation_json or {}
    rows = validation.get('rows') or []
    valid_rows = [r for r in rows if r.get('valid')]

    dry_run = batch.import_mode == FinancialImportBatch.ImportMode.DRY_RUN
    total = len(valid_rows)
    success = 0
    errors: list[dict[str, Any]] = []

    batch.status = FinancialImportBatch.Status.PROCESSING
    batch.progress_message = 'Traitement en cours…'
    batch.save(update_fields=['status', 'progress_message', 'updated_at'])

    log_import_event(
        batch,
        'EXECUTE',
        actor=batch.started_by,
        ip_address=batch.client_ip,
        user_agent=batch.user_agent,
        message=f'Démarrage import ({total} lignes valides)',
        payload={'dry_run': dry_run, 'total': total},
    )

    for chunk_start in range(0, total, CHUNK_SIZE):
        chunk = valid_rows[chunk_start:chunk_start + CHUNK_SIZE]
        for row_result in chunk:
            row_number = row_result.get('row_number', 0)
            student_id = row_result.get('student_id')
            mapped = dict(row_result.get('mapped') or {})
            mapped['_row_number'] = row_number

            try:
                student = StudentProfile.objects.get(pk=student_id)
                with transaction.atomic():
                    _apply_row_to_account(student, mapped, batch=batch, dry_run=dry_run)
                success += 1
            except Exception as exc:
                errors.append({
                    'row': row_number,
                    'student_id': student_id,
                    'message': str(exc),
                })

        progress = min(100, int(((chunk_start + len(chunk)) / max(total, 1)) * 100))
        batch.progress_percent = progress
        batch.progress_message = f'{chunk_start + len(chunk)} / {total} lignes'
        batch.success_rows = success
        batch.error_rows = len(errors)
        batch.save(
            update_fields=[
                'progress_percent', 'progress_message',
                'success_rows', 'error_rows', 'updated_at',
            ],
        )

    batch.completed_at = timezone.now()
    batch.errors_json = errors
    batch.affected_students = success

    if errors and success == 0:
        batch.status = FinancialImportBatch.Status.FAILED
    elif errors:
        batch.status = FinancialImportBatch.Status.PARTIAL
    else:
        batch.status = FinancialImportBatch.Status.COMPLETED

    batch.progress_percent = 100
    batch.progress_message = 'Terminé'
    batch.save()

    log_import_event(
        batch,
        'COMPLETE',
        actor=batch.started_by,
        ip_address=batch.client_ip,
        message=f'Import terminé : {success} succès, {len(errors)} erreurs',
        payload={'success': success, 'errors': len(errors), 'dry_run': dry_run},
    )
