"""Academic access engine — exams, conventions, internship eligibility."""

from __future__ import annotations

from typing import Any

from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.srf.compliance_models import (
    FinancialComplianceStatus,
    PaymentPlanType,
    StudentAcademicAccess,
)
from apps.srf.models import FinancialAccount
from apps.srf.services.financial_profile import ensure_financial_account, sync_account_amounts
from apps.srf.services.installments import (
    exam_date_for_account,
    installments_due_before_exam_paid,
    required_semester_for_access,
    semester_installments_paid,
)


def recompute_academic_access(
    student: StudentProfile,
    *,
    sync_amounts: bool = True,
) -> StudentAcademicAccess:
    """Compute and persist academic eligibility flags."""
    account = ensure_financial_account(student)
    if sync_amounts:
        sync_account_amounts(account)
    flags = compute_access_flags(account)
    access, _ = StudentAcademicAccess.objects.update_or_create(
        student_profile=student,
        defaults={
            **flags,
            'computed_at': timezone.now(),
        },
    )
    return access


def compute_access_flags(account: FinancialAccount) -> dict[str, Any]:
    """
    Core business rules:
    - An admin BLOCKED hold or a pending validation always blocks access.
    - Installment plans are gated by the policy ``exam_gate_mode``:
        * DUE_TRANCHES → only tranches due on/before the exam must be paid
          (the full year does NOT need to be settled to sit the exam).
        * FULL_CLEARANCE → the whole semester / year must be cleared.
    - FULL-payment plans require the balance to be settled.
    """
    from apps.srf.config_models import SrfRestrictionPolicy
    from apps.srf.services.config_engine import get_or_create_restriction_policy

    student = account.student_profile
    academic_year = account.current_academic_year or student.academic_year or ''
    semester = required_semester_for_access()
    blocking: list[str] = []

    status = account.financial_status
    is_installments = account.payment_plan_type == PaymentPlanType.INSTALLMENTS
    gate_mode = get_or_create_restriction_policy().exam_gate_mode

    if status == FinancialComplianceStatus.BLOCKED:
        blocking.append('financial_status_blocked')
    if status == FinancialComplianceStatus.PENDING_VALIDATION:
        blocking.append('payment_pending_validation')

    if is_installments and gate_mode == SrfRestrictionPolicy.ExamGateMode.DUE_TRANCHES:
        exam_date = exam_date_for_account(account)
        if exam_date is not None:
            if not installments_due_before_exam_paid(account, exam_date):
                blocking.append('tranches_due_before_exam_unpaid')
        elif not semester_installments_paid(account, semester, academic_year):
            # No exam scheduled yet — fall back to the semester gate.
            blocking.append(f'semester_{semester}_installments_unpaid')
    elif is_installments:
        if not semester_installments_paid(account, semester, academic_year):
            blocking.append(f'semester_{semester}_installments_unpaid')
        if status == FinancialComplianceStatus.OVERDUE:
            blocking.append('financial_status_overdue')
    else:
        if account.remaining_amount > 0:
            blocking.append('full_payment_incomplete')
        if status == FinancialComplianceStatus.OVERDUE:
            blocking.append('financial_status_overdue')

    allowed = len(blocking) == 0
    fully_settled = status == FinancialComplianceStatus.CLEAR or account.remaining_amount <= 0

    return {
        'can_take_exams': allowed,
        'can_download_convention': allowed,
        'internship_eligible': allowed,
        'financial_clearance': fully_settled,
        'blocking_reasons': blocking,
        'required_semester': semester,
    }


def get_student_access(student: StudentProfile) -> dict[str, Any]:
    """Return access flags (recompute if stale > 1h or missing)."""
    access = getattr(student, 'academic_access', None)
    account = ensure_financial_account(student)
    sync_amounts = account.payment_plan_type == PaymentPlanType.INSTALLMENTS

    if access is None:
        access = recompute_academic_access(student, sync_amounts=sync_amounts)
        return _access_to_dict(access, student)

    age = (timezone.now() - access.computed_at).total_seconds()
    if age > 3600:
        access = recompute_academic_access(student, sync_amounts=sync_amounts)
    return _access_to_dict(access, student)


def _access_to_dict(access: StudentAcademicAccess, student: StudentProfile) -> dict[str, Any]:
    account = getattr(student, 'financial_account', None)
    return {
        'can_take_exams': access.can_take_exams,
        'can_download_convention': access.can_download_convention,
        'internship_eligible': access.internship_eligible,
        'financial_clearance': access.financial_clearance,
        'blocking_reasons': access.blocking_reasons,
        'required_semester': access.required_semester,
        'financial_status': account.financial_status if account else None,
        'payment_plan_type': account.payment_plan_type if account else None,
        'remaining_amount': str(account.remaining_amount) if account else '0',
    }


def assert_can_take_exams(student: StudentProfile) -> None:
    access = get_student_access(student)
    if not access['can_take_exams']:
        raise PermissionError(
            'Financial clearance required before exams. '
            'Please regularize your payment status.'
        )


def assert_can_download_convention(student: StudentProfile) -> None:
    access = get_student_access(student)
    if not access['can_download_convention']:
        raise PermissionError(
            'Convention de stage unavailable — financial installments for the current '
            'semester must be validated.'
        )
