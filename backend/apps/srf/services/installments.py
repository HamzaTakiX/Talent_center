"""Installment lifecycle — overdue marking, semester requirements."""

from __future__ import annotations

from django.utils import timezone

from apps.srf.compliance_models import Installment
from apps.srf.models import FinancialAccount


def mark_overdue_installments(account: FinancialAccount) -> int:
    """Mark UNPAID installments past due_date as OVERDUE."""
    today = timezone.now().date()
    updated = account.installments.filter(
        payment_status=Installment.PaymentStatus.UNPAID,
        due_date__lt=today,
    ).update(payment_status=Installment.PaymentStatus.OVERDUE)
    return updated


def semester_installments_paid(account: FinancialAccount, semester: int, academic_year: str) -> bool:
    """True if all installments for the given semester are PAID or WAIVED."""
    qs = account.installments.filter(semester=semester, academic_year=academic_year)
    if not qs.exists():
        return account.remaining_amount <= 0
    unpaid = qs.exclude(
        payment_status__in=[
            Installment.PaymentStatus.PAID,
            Installment.PaymentStatus.WAIVED,
        ],
    ).exists()
    return not unpaid


def required_semester_for_access() -> int:
    """Default semester gate — semester 1 must be clear for exams/conventions."""
    return 1
