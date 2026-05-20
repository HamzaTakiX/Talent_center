"""SRF operations workspace — analytics, simulation, tier resolution."""

from __future__ import annotations

from datetime import timedelta
from typing import Any, Optional

from django.db.models import Count, Q
from django.utils import timezone

from apps.srf.compliance_models import (
    FinancialComplianceStatus,
    FinancialRiskAlert,
    ProgramExamPeriod,
)
from apps.srf.config_models import SrfNotificationTemplate, SrfRestrictionPolicy, SrfWarningTier
from apps.srf.models import FinancialAccount, NotificationCampaign


DEFAULT_TEMPLATE_VARS = {
    'student_name': 'Jean Dupont',
    'remaining_amount': '4 500',
    'exam_date': '2026-06-15',
    'program': 'PGE',
    'payment_deadline': '2026-06-01',
    'academic_year': '2025-2026',
    'semester': '1',
}


def get_or_create_restriction_policy() -> SrfRestrictionPolicy:
    policy, _ = SrfRestrictionPolicy.objects.get_or_create(singleton_key='default')
    return policy


def seed_default_warning_tiers() -> None:
    """Bootstrap sensible defaults when workspace is first opened."""
    if SrfWarningTier.objects.exists():
        return
    defaults = [
        {
            'sort_order': 1,
            'label': 'Early awareness',
            'days_before_exam_start': 30,
            'severity': SrfWarningTier.Severity.LOW,
            'reminder_interval_days': 7,
            'max_reminders': 4,
        },
        {
            'sort_order': 2,
            'label': 'Escalation',
            'days_before_exam_start': 10,
            'severity': SrfWarningTier.Severity.HIGH,
            'reminder_interval_days': 2,
            'max_reminders': 5,
            'block_convention': True,
            'convention_block_days_before': 10,
        },
        {
            'sort_order': 3,
            'label': 'Critical pre-exam',
            'days_before_exam_start': 3,
            'severity': SrfWarningTier.Severity.CRITICAL,
            'reminder_interval_days': 1,
            'max_reminders': 3,
            'block_convention': True,
            'convention_block_days_before': 5,
            'block_exams': True,
        },
    ]
    for row in defaults:
        SrfWarningTier.objects.create(**row)


def seed_default_templates() -> None:
    if SrfNotificationTemplate.objects.exists():
        return
    SrfNotificationTemplate.objects.bulk_create([
        SrfNotificationTemplate(
            code='SRF_FIRST_WARNING',
            name='First financial warning',
            channel=SrfNotificationTemplate.Channel.BOTH,
            severity=SrfNotificationTemplate.Severity.WARNING,
            subject_template='Rappel financier — {{program}}',
            body_template=(
                'Bonjour {{student_name}},\n\n'
                'Un solde de {{remaining_amount}} MAD reste dû avant les examens '
                '({{exam_date}}). Merci de régulariser avant le {{payment_deadline}}.'
            ),
        ),
        SrfNotificationTemplate(
            code='SRF_CRITICAL_WARNING',
            name='Critical pre-exam warning',
            channel=SrfNotificationTemplate.Channel.BOTH,
            severity=SrfNotificationTemplate.Severity.CRITICAL,
            subject_template='URGENT — Accès examens {{program}}',
            body_template=(
                '{{student_name}}, votre situation financière bloque l\'accès aux examens '
                'prévus le {{exam_date}}. Solde restant : {{remaining_amount}} MAD.'
            ),
        ),
    ])


def resolve_active_tier(days_until_exam: int) -> Optional[SrfWarningTier]:
    """Pick the most urgent tier whose threshold has been reached."""
    if days_until_exam < 0:
        return None
    tiers = SrfWarningTier.objects.filter(
        is_active=True,
        days_before_exam_start__gte=days_until_exam,
    ).order_by('days_before_exam_start', 'sort_order')
    return tiers.first()


def render_template(text: str, variables: Optional[dict[str, str]] = None) -> str:
    merged = {**DEFAULT_TEMPLATE_VARS, **(variables or {})}
    out = text
    for key, value in merged.items():
        out = out.replace('{{' + key + '}}', str(value))
    return out


def build_workspace_analytics() -> dict[str, Any]:
    today = timezone.now().date()
    at_risk = FinancialAccount.objects.filter(
        financial_status=FinancialComplianceStatus.AT_RISK,
    ).count()
    blocked = FinancialAccount.objects.filter(
        financial_status=FinancialComplianceStatus.BLOCKED,
    ).count()
    pending_risks = FinancialRiskAlert.objects.filter(is_resolved=False).count()
    upcoming_periods = ProgramExamPeriod.objects.filter(
        is_active=True,
        exam_start__gte=today,
        exam_start__lte=today + timedelta(days=60),
    ).count()
    active_campaigns = NotificationCampaign.objects.filter(
        status__in=['DRAFT', 'SCHEDULED', 'RUNNING'],
    ).count() if hasattr(NotificationCampaign, 'status') else 0

    approaching_restriction = FinancialAccount.objects.filter(
        Q(financial_status=FinancialComplianceStatus.AT_RISK)
        | Q(financial_status=FinancialComplianceStatus.OVERDUE)
        | Q(financial_status=FinancialComplianceStatus.PARTIAL),
    ).count()

    alerts_by_severity = dict(
        FinancialRiskAlert.objects.filter(is_resolved=False)
        .values('severity')
        .annotate(c=Count('id'))
        .values_list('severity', 'c'),
    )

    return {
        'students_approaching_restriction': approaching_restriction,
        'pending_financial_risks': pending_risks,
        'upcoming_exam_periods': upcoming_periods,
        'active_warning_campaigns': active_campaigns,
        'blocked_students_count': blocked,
        'at_risk_students_count': at_risk,
        'open_alerts_by_severity': alerts_by_severity,
        'active_exam_periods': ProgramExamPeriod.objects.filter(is_active=True).count(),
        'active_warning_tiers': SrfWarningTier.objects.filter(is_active=True).count(),
    }


def simulate_warning_flow(
    *,
    days_until_exam: int,
    financial_status: str = 'PARTIAL',
) -> dict[str, Any]:
    tier = resolve_active_tier(days_until_exam)
    policy = get_or_create_restriction_policy()
    timeline: list[dict[str, Any]] = []
    if tier:
        days_span = tier.days_before_exam_start
        interval = max(tier.reminder_interval_days, 1)
        sent = 0
        day = days_span
        while day >= max(days_until_exam, 0) and (tier.max_reminders is None or sent < tier.max_reminders):
            timeline.append({
                'day_offset': day,
                'severity': tier.severity,
                'action': 'send_reminder',
                'channel': 'email+in_app' if policy.enable_email_notifications else 'in_app',
            })
            sent += 1
            day -= interval
        if tier.block_convention:
            block_day = tier.convention_block_days_before or tier.days_before_exam_start
            timeline.append({
                'day_offset': block_day,
                'severity': 'HIGH',
                'action': 'block_convention',
            })
        if tier.block_exams and days_until_exam <= 0:
            timeline.append({
                'day_offset': 0,
                'severity': 'CRITICAL',
                'action': 'block_exams',
            })
    if policy.mark_at_risk_on_warning and financial_status not in ('CLEAR', 'PENDING_VALIDATION'):
        timeline.insert(0, {
            'day_offset': days_until_exam,
            'severity': 'MEDIUM',
            'action': 'mark_at_risk',
        })
    timeline.sort(key=lambda x: -x['day_offset'])
    return {
        'days_until_exam': days_until_exam,
        'financial_status': financial_status,
        'active_tier': {
            'id': tier.pk,
            'label': tier.label,
            'severity': tier.severity,
        } if tier else None,
        'timeline': timeline,
        'policy': {
            'stop_reminders_on_payment': policy.stop_reminders_on_payment,
            'unpaid_blocks_exams': policy.unpaid_blocks_exams,
            'unpaid_blocks_convention': policy.unpaid_blocks_convention,
        },
    }
