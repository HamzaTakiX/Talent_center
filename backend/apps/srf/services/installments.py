"""Installment lifecycle — overdue marking, semester requirements, tranche plans."""

from __future__ import annotations

from datetime import date
from decimal import ROUND_HALF_UP, Decimal
from typing import Optional

from django.db.models import Q
from django.utils import timezone

from apps.srf.compliance_models import Installment, ProgramExamPeriod
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


# ============================================================================
# TRANCHE PLAN TEMPLATES (ESCA-style installment schedules)
# ============================================================================

def compute_template_tranche_amounts(template, total_amount: Decimal) -> list[dict]:
    """
    Turn a plan template + a yearly total into a concrete tranche schedule.

    Returns a list of dicts: {label, amount, due_date, semester} so the result
    can be fed straight into ``setup_installment_plan``.

    - EQUAL: the total is divided evenly; rounding remainder lands on the last tranche.
    - CUSTOM: each tranche takes its configured percentage of the total.
    """
    from apps.srf.config_models import SrfInstallmentPlanTemplate

    total = Decimal(total_amount or 0)
    tranches = list(template.tranches.all().order_by('tranche_number'))
    if not tranches:
        return []

    cents = Decimal('0.01')
    rows: list[dict] = []

    if template.split_mode == SrfInstallmentPlanTemplate.SplitMode.CUSTOM:
        running = Decimal('0')
        for idx, tranche in enumerate(tranches):
            if idx == len(tranches) - 1:
                amount = (total - running)
            else:
                amount = (total * (tranche.percentage / Decimal('100'))).quantize(
                    cents, rounding=ROUND_HALF_UP,
                )
                running += amount
            rows.append({
                'label': tranche.label,
                'amount': max(amount, Decimal('0')),
                'due_date': tranche.due_date,
                'semester': tranche.semester,
            })
        return rows

    base = (total / Decimal(len(tranches))).quantize(cents, rounding=ROUND_HALF_UP)
    running = Decimal('0')
    for idx, tranche in enumerate(tranches):
        if idx == len(tranches) - 1:
            amount = total - running
        else:
            amount = base
            running += amount
        rows.append({
            'label': tranche.label,
            'amount': max(amount, Decimal('0')),
            'due_date': tranche.due_date,
            'semester': tranche.semester,
        })
    return rows


def resolve_plan_template_for_account(account: FinancialAccount):
    """
    Pick the most specific active installment-plan template for a student.

    Priority: program+level+year > program+year > program > global default.
    """
    from apps.srf.config_models import SrfInstallmentPlanTemplate

    student = account.student_profile
    qs = SrfInstallmentPlanTemplate.objects.filter(is_active=True)

    candidates = list(
        qs.filter(
            Q(filiere__isnull=True) | Q(filiere_id=student.filiere_id),
        ).filter(
            Q(academic_level__isnull=True) | Q(academic_level_id=student.academic_level_id),
        ).filter(
            Q(academic_year__isnull=True)
            | Q(academic_year__code=account.current_academic_year or student.academic_year or ''),
        ),
    )
    if not candidates:
        return None

    def specificity(tpl) -> int:
        return (
            (1 if tpl.filiere_id else 0)
            + (1 if tpl.academic_level_id else 0)
            + (1 if tpl.academic_year_id else 0)
        )

    candidates.sort(key=specificity, reverse=True)
    return candidates[0]


def apply_installment_template(
    account: FinancialAccount,
    template,
    *,
    total_amount: Decimal,
    academic_year: str,
) -> list[Installment]:
    """Generate a student's installment schedule from a plan template."""
    from apps.srf.services.financial_profile import setup_installment_plan

    tranches = compute_template_tranche_amounts(template, Decimal(total_amount or 0))
    return setup_installment_plan(account, academic_year=academic_year, tranches=tranches)


# ============================================================================
# EXAM-DRIVEN GATING HELPERS
# ============================================================================

def exam_date_for_account(account: FinancialAccount, *, semester: Optional[int] = None) -> Optional[date]:
    """
    Resolve the relevant exam start date for a student's program / level / year.

    Prefers the soonest exam window that has not ended yet; falls back to the most
    recent configured window otherwise.
    """
    student = account.student_profile
    if not getattr(student, 'filiere_id', None):
        return None

    qs = ProgramExamPeriod.objects.filter(is_active=True, filiere_id=student.filiere_id)
    academic_year = account.current_academic_year or student.academic_year or ''
    if academic_year:
        qs = qs.filter(academic_year__code=academic_year)
    if student.academic_level_id:
        qs = qs.filter(Q(academic_level__isnull=True) | Q(academic_level_id=student.academic_level_id))
    if semester is not None:
        qs = qs.filter(semester=semester)

    today = timezone.now().date()
    upcoming = qs.filter(exam_end__gte=today).order_by('exam_start').first()
    if upcoming:
        return upcoming.exam_start
    last = qs.order_by('-exam_start').first()
    return last.exam_start if last else None


def installments_due_before_exam_paid(account: FinancialAccount, exam_date: date) -> bool:
    """
    True if every tranche due on or before ``exam_date`` is PAID or WAIVED.

    This is the core of the "pay tranches before the exam" rule: a student does
    not need the full year settled, only the installments whose deadline falls
    on or before the exam date.
    """
    qs = account.installments.filter(due_date__lte=exam_date)
    if account.current_academic_year:
        year_scoped = qs.filter(academic_year=account.current_academic_year)
        if year_scoped.exists():
            qs = year_scoped
    if not qs.exists():
        return True
    unpaid = qs.exclude(
        payment_status__in=[
            Installment.PaymentStatus.PAID,
            Installment.PaymentStatus.WAIVED,
        ],
    ).exists()
    return not unpaid
