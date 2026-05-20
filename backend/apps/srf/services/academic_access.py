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
    - Semester 1 installments must be paid for exams & conventions.
    - BLOCKED / OVERDUE → no exams, no convention, no internship.
    - CLEAR or fully paid FULL plan → full access.
    """
    student = account.student_profile
    academic_year = account.current_academic_year or student.academic_year or ''
    semester = required_semester_for_access()
    blocking: list[str] = []

    status = account.financial_status
    if status in (FinancialComplianceStatus.BLOCKED, FinancialComplianceStatus.OVERDUE):
        blocking.append('financial_status_blocked_or_overdue')

    if account.payment_plan_type == PaymentPlanType.INSTALLMENTS:
        if not semester_installments_paid(account, semester, academic_year):
            blocking.append(f'semester_{semester}_installments_unpaid')
    elif account.remaining_amount > 0:
        blocking.append('full_payment_incomplete')

    if status == FinancialComplianceStatus.PENDING_VALIDATION:
        blocking.append('payment_pending_validation')

    has_blocks = len(blocking) > 0
    financially_clear = status == FinancialComplianceStatus.CLEAR

    fully_settled = financially_clear or account.remaining_amount <= 0
    allowed = not has_blocks and fully_settled

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
