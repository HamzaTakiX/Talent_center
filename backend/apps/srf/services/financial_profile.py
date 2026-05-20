"""Financial profile sync — amounts, compliance status, holds."""

from __future__ import annotations

from decimal import Decimal
from typing import Optional

from django.db import transaction
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.srf.compliance_models import (
    FinancialComplianceStatus,
    Installment,
    PaymentPlanType,
)
from apps.srf.models import FinancialAccount, FinancialHold


def ensure_financial_account(student: StudentProfile) -> FinancialAccount:
    """Create financial account for student if missing."""
    account, created = FinancialAccount.objects.get_or_create(
        student_profile=student,
        defaults={
            'account_number': _generate_account_number(student),
            'current_academic_year': student.academic_year or '',
        },
    )
    if created and student.academic_year:
        account.current_academic_year = student.academic_year
        account.save(update_fields=['current_academic_year'])
    return account


def _generate_account_number(student: StudentProfile) -> str:
    num = student.student_number or str(student.pk).zfill(6)
    return f'SRF-{num}'


def sync_account_amounts(account: FinancialAccount) -> FinancialAccount:
    """Recompute total/paid/remaining and financial_status from installments or lines."""
    if account.payment_plan_type == PaymentPlanType.INSTALLMENTS:
        installments = account.installments.filter(
            academic_year=account.current_academic_year or '',
        )
        if not installments.exists():
            installments = account.installments.all()
        total = sum((i.amount for i in installments), Decimal('0'))
        paid = sum(
            (i.amount for i in installments if i.payment_status == Installment.PaymentStatus.PAID),
            Decimal('0'),
        )
    else:
        charges = account.lines.filter(line_type='CHARGE')
        if charges.exists():
            total = sum((line.amount for line in charges), Decimal('0'))
            paid = sum((line.paid_amount for line in charges), Decimal('0'))
        else:
            total = account.total_amount
            paid = account.paid_amount

    account.total_amount = total
    account.paid_amount = paid
    account.remaining_amount = max(total - paid, Decimal('0'))
    account.balance = account.remaining_amount
    account.financial_status = _derive_compliance_status(account)
    account.save(
        update_fields=[
            'total_amount', 'paid_amount', 'remaining_amount',
            'balance', 'financial_status', 'updated_at',
        ],
    )
    return account


def _derive_compliance_status(account: FinancialAccount) -> str:
    from apps.srf.models import PaymentProofSubmission

    pending_proofs = account.payment_proofs.filter(
        status__in=[
            PaymentProofSubmission.Status.PENDING,
            PaymentProofSubmission.Status.UNDER_REVIEW,
        ],
    ).exists()
    if pending_proofs:
        return FinancialComplianceStatus.PENDING_VALIDATION

    if account.student_profile.financial_holds.filter(is_active=True).exists():
        return FinancialComplianceStatus.BLOCKED

    if account.remaining_amount <= 0:
        return FinancialComplianceStatus.CLEAR

    if account.payment_plan_type == PaymentPlanType.INSTALLMENTS:
        overdue = account.installments.filter(
            payment_status=Installment.PaymentStatus.OVERDUE,
        ).exists()
        if overdue:
            return FinancialComplianceStatus.OVERDUE
        if account.paid_amount > 0:
            return FinancialComplianceStatus.PARTIAL
        return FinancialComplianceStatus.OVERDUE

    if account.paid_amount > 0:
        return FinancialComplianceStatus.PARTIAL
    return FinancialComplianceStatus.OVERDUE


@transaction.atomic
def refresh_student_financial_state(student: StudentProfile) -> FinancialAccount:
    """Full refresh: amounts, status, holds, academic access."""
    from apps.srf.services.academic_access import recompute_academic_access
    from apps.srf.services.installments import mark_overdue_installments

    account = ensure_financial_account(student)
    mark_overdue_installments(account)
    sync_account_amounts(account)
    _sync_financial_holds(account)
    recompute_academic_access(student)
    return account


@transaction.atomic
def refresh_student_financial_state_after_import(
    student: StudentProfile,
    account: FinancialAccount,
) -> FinancialAccount:
    """
    Post-import refresh — keep amounts written from the spreadsheet.
    Do not recalculate FULL-plan totals from empty charge lines.
    """
    from apps.srf.services.academic_access import recompute_academic_access
    from apps.srf.services.installments import mark_overdue_installments

    if account.payment_plan_type == PaymentPlanType.INSTALLMENTS:
        mark_overdue_installments(account)
        sync_account_amounts(account)
    else:
        account.balance = account.remaining_amount
        account.save(update_fields=['balance', 'updated_at'])

    _sync_financial_holds(account)
    recompute_academic_access(student, sync_amounts=False)
    return account


@transaction.atomic
def refresh_student_financial_state_after_rollback(
    student: StudentProfile,
    account: FinancialAccount,
    before_state: dict,
) -> FinancialAccount:
    """Post-rollback refresh — do not overwrite restored flat amounts from charge lines."""
    from apps.srf.services.academic_access import recompute_academic_access
    from apps.srf.services.installments import mark_overdue_installments

    if account.payment_plan_type == PaymentPlanType.INSTALLMENTS:
        mark_overdue_installments(account)
        sync_account_amounts(account)
    else:
        account.financial_status = before_state.get('financial_status') or account.financial_status
        account.balance = account.remaining_amount
        account.save(
            update_fields=['financial_status', 'balance', 'updated_at'],
        )

    _sync_financial_holds(account)
    recompute_academic_access(student)
    return account


def _sync_financial_holds(account: FinancialAccount) -> None:
    """Activate or release payment holds based on compliance status."""
    student = account.student_profile
    blocked_statuses = {
        FinancialComplianceStatus.OVERDUE,
        FinancialComplianceStatus.BLOCKED,
    }
    should_block = account.financial_status in blocked_statuses

    active_payment_hold = FinancialHold.objects.filter(
        student_profile=student,
        hold_type=FinancialHold.HoldType.PAYMENT,
        is_active=True,
    ).first()

    if should_block and not active_payment_hold:
        FinancialHold.objects.create(
            student_profile=student,
            hold_type=FinancialHold.HoldType.PAYMENT,
            reason='Unpaid tuition or overdue installments — academic access restricted.',
            amount_threshold=account.remaining_amount,
            is_active=True,
        )
    elif not should_block and active_payment_hold:
        active_payment_hold.is_active = False
        active_payment_hold.released_at = timezone.now()
        active_payment_hold.save(update_fields=['is_active', 'released_at', 'updated_at'])

    if account.financial_status == FinancialComplianceStatus.BLOCKED:
        FinancialHold.objects.get_or_create(
            student_profile=student,
            hold_type=FinancialHold.HoldType.DOCUMENT,
            is_active=True,
            defaults={
                'reason': 'Convention de stage blocked — financial clearance required.',
            },
        )
    else:
        FinancialHold.objects.filter(
            student_profile=student,
            hold_type=FinancialHold.HoldType.DOCUMENT,
            is_active=True,
        ).update(is_active=False, released_at=timezone.now())


def set_account_at_risk(account: FinancialAccount) -> None:
    if account.financial_status != FinancialComplianceStatus.BLOCKED:
        account.financial_status = FinancialComplianceStatus.AT_RISK
        account.save(update_fields=['financial_status', 'updated_at'])


def setup_installment_plan(
    account: FinancialAccount,
    *,
    academic_year: str,
    tranches: list[dict],
) -> list[Installment]:
    """Create installment schedule. Each tranche: {amount, due_date, semester, label?}."""
    account.payment_plan_type = PaymentPlanType.INSTALLMENTS
    account.current_academic_year = academic_year
    account.save(update_fields=['payment_plan_type', 'current_academic_year', 'updated_at'])

    account.installments.filter(academic_year=academic_year).delete()
    created = []
    for idx, tranche in enumerate(tranches, start=1):
        inst = Installment.objects.create(
            account=account,
            installment_number=idx,
            label=tranche.get('label') or f'tranche_{idx}',
            amount=tranche['amount'],
            due_date=tranche['due_date'],
            semester=tranche.get('semester', 1),
            academic_year=academic_year,
        )
        created.append(inst)
    sync_account_amounts(account)
    return created


def setup_full_payment(
    account: FinancialAccount,
    *,
    total_amount: Decimal,
    academic_year: Optional[str] = None,
) -> FinancialAccount:
    account.payment_plan_type = PaymentPlanType.FULL
    if academic_year:
        account.current_academic_year = academic_year
    account.total_amount = total_amount
    account.remaining_amount = total_amount
    account.save(
        update_fields=[
            'payment_plan_type', 'current_academic_year',
            'total_amount', 'remaining_amount', 'updated_at',
        ],
    )
    sync_account_amounts(account)
    return account
