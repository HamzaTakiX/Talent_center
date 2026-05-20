"""SRF dashboard analytics for super-admin and finance admins."""

from __future__ import annotations

from decimal import Decimal

from django.db.models import Count, Sum
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.srf.compliance_models import (
    FinancialComplianceStatus,
    FinancialRiskAlert,
    Installment,
    PaymentProofSubmission,
    StudentAcademicAccess,
)
from apps.srf.models import FinancialAccount, Payment


def build_srf_dashboard_summary(academic_year: str = '') -> dict:
    accounts = FinancialAccount.objects.all()
    if academic_year:
        accounts = accounts.filter(current_academic_year=academic_year)

    status_counts = dict(
        accounts.values('financial_status').annotate(c=Count('id')).values_list(
            'financial_status', 'c',
        ),
    )

    pending_validations = PaymentProofSubmission.objects.filter(
        status__in=[
            PaymentProofSubmission.Status.PENDING,
            PaymentProofSubmission.Status.UNDER_REVIEW,
        ],
    ).count()

    overdue_installments = Installment.objects.filter(
        payment_status=Installment.PaymentStatus.OVERDUE,
    ).count()

    blocked_exams = StudentAcademicAccess.objects.filter(can_take_exams=False).count()
    convention_blocked = StudentAcademicAccess.objects.filter(
        can_download_convention=False,
    ).count()
    at_risk = accounts.filter(financial_status=FinancialComplianceStatus.AT_RISK).count()
    unresolved_alerts = FinancialRiskAlert.objects.filter(is_resolved=False).count()

    revenue = Payment.objects.filter(status=Payment.Status.COMPLETED).aggregate(
        total=Sum('amount'),
    )['total'] or Decimal('0')

    total_students = StudentProfile.objects.filter(user__is_active=True).count()
    with_accounts = accounts.count()

    return {
        'total_revenue': str(revenue),
        'total_students': total_students,
        'students_with_accounts': with_accounts,
        'status_distribution': status_counts,
        'pending_validations': pending_validations,
        'overdue_installments': overdue_installments,
        'blocked_from_exams': blocked_exams,
        'convention_restricted': convention_blocked,
        'at_risk_students': at_risk,
        'unresolved_alerts': unresolved_alerts,
        'paid_students': status_counts.get(FinancialComplianceStatus.CLEAR, 0),
        'unpaid_students': (
            status_counts.get(FinancialComplianceStatus.OVERDUE, 0)
            + status_counts.get(FinancialComplianceStatus.PARTIAL, 0)
        ),
        'generated_at': timezone.now().isoformat(),
    }


def build_srf_kpi_cards(academic_year: str = '') -> list[dict]:
    """Always return all KPI cards (0 when no financial accounts)."""
    summary = build_srf_dashboard_summary(academic_year)
    return [
        {'key': 'paid', 'label_key': 'admin.kpi.srf.paidStudents', 'value': summary['paid_students']},
        {'key': 'unpaid', 'label_key': 'admin.kpi.srf.unpaidStudents', 'value': summary['unpaid_students']},
        {
            'key': 'partial',
            'label_key': 'admin.kpi.srf.partiallyPaid',
            'value': summary['status_distribution'].get(FinancialComplianceStatus.PARTIAL, 0),
        },
        {
            'key': 'pending_validation',
            'label_key': 'admin.kpi.srf.pendingValidation',
            'value': summary['pending_validations'],
        },
        {
            'key': 'late',
            'label_key': 'admin.kpi.srf.latePayments',
            'value': summary['overdue_installments'],
        },
        {
            'key': 'blocked',
            'label_key': 'admin.kpi.srf.blockedStudents',
            'value': summary['blocked_from_exams'],
        },
        {
            'key': 'exempted',
            'label_key': 'admin.kpi.srf.exemptedStudents',
            'value': summary['status_distribution'].get(FinancialComplianceStatus.CLEAR, 0),
        },
    ]


def build_payments_by_program(academic_year: str = '') -> list[dict]:
    from django.db.models import F

    qs = Payment.objects.filter(status=Payment.Status.COMPLETED).select_related(
        'account__student_profile__filiere',
    )
    if academic_year:
        qs = qs.filter(account__current_academic_year=academic_year)

    rows = (
        qs.values(program_code=F('account__student_profile__filiere__code'))
        .annotate(total=Sum('amount'), count=Count('id'))
        .order_by('-total')
    )
    return [
        {
            'program': r['program_code'] or 'unknown',
            'total': str(r['total'] or 0),
            'payment_count': r['count'],
        }
        for r in rows
    ]


def build_installment_completion_rate(academic_year: str = '') -> dict:
    qs = Installment.objects.all()
    if academic_year:
        qs = qs.filter(academic_year=academic_year)
    total = qs.count()
    paid = qs.filter(payment_status=Installment.PaymentStatus.PAID).count()
    rate = round((paid / total * 100), 1) if total else 0.0
    return {'total_installments': total, 'paid_installments': paid, 'completion_rate_pct': rate}
