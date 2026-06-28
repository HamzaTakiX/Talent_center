"""Validation pipeline for financial import rows."""

from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Any, Optional

from apps.accounts_et_roles.models import StudentProfile
from apps.srf.compliance_models import FinancialComplianceStatus, Installment, PaymentPlanType
from apps.srf.import_models import FinancialImportBatch
from apps.srf.models import FinancialAccount

from .column_mapping import apply_mapping_to_row
from .file_security import CHUNK_SIZE


VALID_STATUSES = {c.value for c in FinancialComplianceStatus}
VALID_PLAN_TYPES = {c.value for c in PaymentPlanType}
VALID_INSTALLMENT_STATUSES = {c.value for c in Installment.PaymentStatus}
ACADEMIC_YEAR_RE = __import__('re').compile(r'^\d{4}-\d{4}$')


def _parse_decimal(value: Any) -> Optional[Decimal]:
    if value is None or value == '':
        return None
    try:
        text = str(value).strip().replace(',', '.').replace(' ', '')
        return Decimal(text)
    except (InvalidOperation, ValueError):
        return None


def _resolve_student(mapped: dict[str, Any]) -> Optional[StudentProfile]:
    num = str(mapped.get('student_number') or '').strip()
    email = str(mapped.get('email') or '').strip().lower()
    if num:
        student = StudentProfile.objects.filter(student_number=num).first()
        if student:
            return student
    if email:
        return StudentProfile.objects.filter(user__email__iexact=email).first()
    return None


def validate_row(
    mapped: dict[str, Any],
    *,
    row_number: int,
    academic_year: str,
    import_mode: str,
    seen_keys: set[str],
) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    student_key = ''

    if not mapped.get('student_number') and not mapped.get('email'):
        errors.append('Identifiant étudiant manquant (numéro ou email).')
    else:
        student_key = (
            str(mapped.get('student_number') or '').strip()
            or str(mapped.get('email') or '').strip().lower()
        )
        if student_key in seen_keys:
            errors.append('Doublon dans le fichier importé.')
        else:
            seen_keys.add(student_key)

    student = _resolve_student(mapped) if not errors else None
    if not errors and student is None:
        errors.append('Étudiant introuvable dans la plateforme.')

    year = str(mapped.get('academic_year') or academic_year or '').strip()
    if year and not ACADEMIC_YEAR_RE.match(year):
        warnings.append(f'Année académique inhabituelle : {year}')

    plan = str(mapped.get('payment_plan_type') or '').strip().upper()
    if plan and plan not in VALID_PLAN_TYPES:
        errors.append(f'Type de plan invalide : {plan}')

    status = str(mapped.get('financial_status') or '').strip().upper()
    if status and status not in VALID_STATUSES:
        errors.append(f'Statut financier invalide : {status}')

    total = _parse_decimal(mapped.get('total_amount'))
    paid = _parse_decimal(mapped.get('paid_amount'))
    remaining = _parse_decimal(mapped.get('remaining_amount'))

    if total is not None and total < 0:
        errors.append('Montant total négatif.')
    if paid is not None and paid < 0:
        errors.append('Montant payé négatif.')

    if total is not None and paid is not None and remaining is not None:
        if abs(total - paid - remaining) > Decimal('0.02'):
            warnings.append('Incohérence total / payé / restant.')

    account = None
    if student:
        account = getattr(student, 'financial_account', None)
        if account is None:
            try:
                account = student.financial_account
            except FinancialAccount.DoesNotExist:
                account = None

        if import_mode == FinancialImportBatch.ImportMode.CREATE_ONLY and account:
            errors.append('Compte financier existant (mode création uniquement).')
        elif import_mode == FinancialImportBatch.ImportMode.UPDATE and not account:
            errors.append('Aucun compte financier à mettre à jour.')

        for n in range(1, 5):
            inst_status = str(mapped.get(f'installment_{n}_status') or '').strip().upper()
            if inst_status in {'1', '0', 'OUI', 'NON', 'YES', 'NO', 'PAYE', 'PAYÉ'}:
                continue
            if inst_status and inst_status not in VALID_INSTALLMENT_STATUSES:
                errors.append(f'Statut tranche {n} invalide : {inst_status}')

    conflict = False
    if account and status and account.financial_status != status:
        conflict = True
        warnings.append(
            f'Conflit de statut : actuel={account.financial_status}, import={status}'
        )

    return {
        'row_number': row_number,
        'student_key': student_key,
        'student_id': student.pk if student else None,
        'student_name': (
            f'{student.user.first_name} {student.user.last_name}'.strip()
            if student and student.user
            else ''
        ),
        'account_id': account.pk if account else None,
        'has_account': account is not None,
        'errors': errors,
        'warnings': warnings,
        'conflict': conflict,
        'valid': len(errors) == 0,
        'mapped': mapped,
    }


def run_validation_pipeline(
    batch: FinancialImportBatch,
    rows: list[dict[str, Any]],
    mapping: dict[str, str],
) -> dict[str, Any]:
    seen_keys: set[str] = set()
    results: list[dict[str, Any]] = []
    error_count = 0
    warning_count = 0
    valid_count = 0
    conflict_count = 0
    affected_students: set[int] = set()

    for idx, raw in enumerate(rows, start=2):
        mapped = apply_mapping_to_row(raw, mapping)
        row_result = validate_row(
            mapped,
            row_number=idx,
            academic_year=batch.academic_year,
            import_mode=batch.import_mode,
            seen_keys=seen_keys,
        )
        results.append(row_result)
        if row_result['valid']:
            valid_count += 1
            if row_result.get('student_id'):
                affected_students.add(row_result['student_id'])
        else:
            error_count += 1
        if row_result['warnings']:
            warning_count += 1
        if row_result.get('conflict'):
            conflict_count += 1

    preview_sample = results[:50]
    summary = {
        'total_rows': len(rows),
        'valid_rows': valid_count,
        'error_rows': error_count,
        'warning_rows': warning_count,
        'conflict_rows': conflict_count,
        'affected_students': len(affected_students),
        # Partial import: engine applies only rows marked valid.
        'can_execute': valid_count > 0,
    }

    return {
        'summary': summary,
        'rows': results,
        'preview_sample': preview_sample,
    }
