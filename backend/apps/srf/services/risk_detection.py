"""Automated financial risk detection before exam periods."""

from __future__ import annotations

from datetime import timedelta

from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.srf.compliance_models import (
    FinancialComplianceStatus,
    FinancialRiskAlert,
    ProgramExamPeriod,
)
from apps.srf.services.config_engine import get_or_create_restriction_policy, resolve_active_tier
from apps.srf.services.financial_profile import refresh_student_financial_state, set_account_at_risk
from apps.srf.services.srf_notifications import emit_srf_notification


def scan_exam_period_risks() -> dict:
    """
    For active exam periods approaching:
    - mark unpaid students AT_RISK
    - create alerts
    - send warning notifications
    """
    today = timezone.now().date()
    stats = {'periods_checked': 0, 'students_flagged': 0, 'alerts_created': 0}

    policy = get_or_create_restriction_policy()

    periods = ProgramExamPeriod.objects.filter(is_active=True).select_related(
        'filiere', 'academic_year', 'academic_level',
    )
    for period in periods:
        days_until_exam = (period.exam_start - today).days
        tier = resolve_active_tier(days_until_exam)
        warning_days = (
            tier.days_before_exam_start if tier else period.warning_days_before
        )
        warning_start = period.exam_start - timedelta(days=warning_days)
        if today < warning_start or today > period.exam_end:
            continue
        stats['periods_checked'] += 1
        students_qs = StudentProfile.objects.filter(
            filiere=period.filiere,
            academic_year=period.academic_year.code,
            user__is_active=True,
        )
        if period.academic_level_id:
            students_qs = students_qs.filter(academic_level_id=period.academic_level_id)
        students = students_qs.select_related('user', 'financial_account', 'academic_access')

        for student in students:
            account = getattr(student, 'financial_account', None)
            if not account:
                continue
            refresh_student_financial_state(student)
            account.refresh_from_db()

            if account.financial_status in (
                FinancialComplianceStatus.CLEAR,
                FinancialComplianceStatus.PENDING_VALIDATION,
            ):
                if account.financial_status == FinancialComplianceStatus.PENDING_VALIDATION:
                    continue
                continue

            if policy.mark_at_risk_on_warning:
                set_account_at_risk(account)
            stats['students_flagged'] += 1

            severity = (
                tier.severity if tier else FinancialRiskAlert.Severity.HIGH
            )
            msg = (
                'Your financial status must be regularized before exams in order to '
                'maintain academic access.'
            )
            alert, created = FinancialRiskAlert.objects.get_or_create(
                student_profile=student,
                account=account,
                alert_type=FinancialRiskAlert.AlertType.EXAM_RESTRICTION,
                is_resolved=False,
                defaults={
                    'severity': severity,
                    'title': 'Exam period — financial regularization required',
                    'message': msg,
                    'metadata_json': {
                        'exam_period_id': period.pk,
                        'exam_start': str(period.exam_start),
                        'warning_tier_id': tier.pk if tier else None,
                        'days_until_exam': days_until_exam,
                    },
                },
            )
            if created:
                stats['alerts_created'] += 1
                if policy.enable_email_notifications or policy.enable_in_app_notifications:
                    emit_srf_notification(
                        event_code='srf.risk.exam_warning',
                        student=student,
                        title='Financial risk — exams approaching',
                        body=msg,
                        entity_type='exam_period',
                        entity_id=period.pk,
                    )

            convention_blocked = False
            if period.convention_block_date and today >= period.convention_block_date:
                convention_blocked = True
            elif tier and tier.block_convention:
                block_days = tier.convention_block_days_before or tier.days_before_exam_start
                if days_until_exam <= block_days:
                    convention_blocked = True
            elif policy.unpaid_blocks_convention and days_until_exam <= 14:
                convention_blocked = True

            if convention_blocked:
                FinancialRiskAlert.objects.get_or_create(
                    student_profile=student,
                    account=account,
                    alert_type=FinancialRiskAlert.AlertType.CONVENTION_BLOCKED,
                    is_resolved=False,
                    defaults={
                        'severity': FinancialRiskAlert.Severity.MEDIUM,
                        'title': 'Convention de stage blocked',
                        'message': (
                            'Internship convention unavailable until financial '
                            'installments are validated.'
                        ),
                        'metadata_json': {'exam_period_id': period.pk},
                    },
                )

            exam_blocked = (
                (tier and tier.block_exams and today >= period.exam_start)
                or (policy.unpaid_blocks_exams and today >= period.exam_start)
            )
            if exam_blocked:
                FinancialRiskAlert.objects.get_or_create(
                    student_profile=student,
                    account=account,
                    alert_type=FinancialRiskAlert.AlertType.AT_RISK,
                    is_resolved=False,
                    defaults={
                        'severity': FinancialRiskAlert.Severity.CRITICAL,
                        'title': 'Exam access restricted',
                        'message': 'Exam participation blocked until financial clearance.',
                        'metadata_json': {'exam_period_id': period.pk},
                    },
                )

    return stats


def scan_overdue_installments() -> int:
    """Create alerts for overdue installments."""
    from apps.srf.compliance_models import Installment
    from apps.srf.models import FinancialAccount

    today = timezone.now().date()
    count = 0
    overdue = Installment.objects.filter(
        payment_status=Installment.PaymentStatus.OVERDUE,
        due_date__lt=today,
    ).select_related('account__student_profile')

    for inst in overdue:
        student = inst.account.student_profile
        _, created = FinancialRiskAlert.objects.get_or_create(
            student_profile=student,
            account=inst.account,
            alert_type=FinancialRiskAlert.AlertType.INSTALLMENT_OVERDUE,
            is_resolved=False,
            defaults={
                'severity': FinancialRiskAlert.Severity.MEDIUM,
                'title': f'Installment {inst.label} overdue',
                'message': (
                    f'Installment of {inst.amount} MAD was due on {inst.due_date}. '
                    'Please regularize to restore academic access.'
                ),
                'metadata_json': {'installment_id': inst.pk},
            },
        )
        if created:
            count += 1
            emit_srf_notification(
                event_code='srf.installment.overdue',
                student=student,
                title='Installment overdue',
                body=f'Your {inst.label} payment is overdue.',
                entity_type='installment',
                entity_id=inst.pk,
            )
        FinancialAccount.objects.filter(pk=inst.account_id).update(
            financial_status=FinancialComplianceStatus.OVERDUE,
        )
    return count
