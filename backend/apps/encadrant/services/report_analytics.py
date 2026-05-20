"""Analytics aggregations for supervision reports."""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Avg, Count, Q
from django.utils import timezone

from apps.encadrant.models import Report
from apps.admin_management.services.report_scopes import filter_reports_by_admin_scope


def _base_qs(user, *, include_drafts: bool = False):
    qs = Report.objects.all()
    if not include_drafts:
        qs = qs.exclude(status=Report.Status.DRAFT)
    return filter_reports_by_admin_scope(qs, user)


def build_report_analytics(user, *, academic_year: str | None = None) -> dict:
    qs = _base_qs(user)
    if academic_year:
        qs = qs.filter(
            Q(academic_year__code=academic_year) | Q(student_profile__academic_year=academic_year),
        )

    total = qs.count()
    approved = qs.filter(status=Report.Status.APPROVED).count()
    rejected = qs.filter(status=Report.Status.REJECTED).count()
    reviewed = approved + rejected
    validation_rate = round(approved / reviewed, 4) if reviewed else 0.0

    by_internship_type = list(
        qs.filter(internship_type__isnull=False)
        .values('internship_type__code', 'internship_type__name')
        .annotate(count=Count('id'))
        .order_by('-count')[:20]
    )
    for row in by_internship_type:
        row['code'] = row.pop('internship_type__code', '')
        row['label'] = row.pop('internship_type__name', '') or row['code']

    by_encadrant = list(
        qs.values('encadrant_profile_id', 'encadrant_profile__supervisor_profile__user__email')
        .annotate(
            count=Count('id'),
            approved=Count('id', filter=Q(status=Report.Status.APPROVED)),
            overdue=Count('id', filter=Q(is_overdue=True)),
        )
        .order_by('-count')[:30]
    )

    risk_distribution = dict(
        qs.values('severity').annotate(c=Count('id')).values_list('severity', 'c'),
    )

    since = timezone.now() - timedelta(days=90)
    repeat_students = list(
        qs.filter(
            report_type__in=[Report.ReportType.RISK_ALERT, Report.ReportType.ATTENDANCE, Report.ReportType.COMPANY_ISSUE],
            created_at__gte=since,
        )
        .values('student_profile_id', 'student_profile__user__email')
        .annotate(alert_count=Count('id'))
        .filter(alert_count__gte=2)
        .order_by('-alert_count')[:25]
    )

    repeat_companies = list(
        qs.exclude(company_name='')
        .filter(report_type=Report.ReportType.COMPANY_ISSUE)
        .values('company_name')
        .annotate(count=Count('id'))
        .filter(count__gte=2)
        .order_by('-count')[:25]
    )

    delayed_encadrants = list(
        qs.filter(is_overdue=True)
        .values('encadrant_profile_id', 'encadrant_profile__supervisor_profile__user__email')
        .annotate(overdue_count=Count('id'))
        .order_by('-overdue_count')[:25]
    )

    success_qs = qs.filter(report_type__in=[Report.ReportType.VALIDATION, Report.ReportType.FINAL])
    success_total = success_qs.count()
    success_approved = success_qs.filter(status=Report.Status.APPROVED).count()
    internship_success_rate = round(success_approved / success_total, 4) if success_total else 0.0

    return {
        'total': total,
        'approved': approved,
        'rejected': rejected,
        'validation_rate': validation_rate,
        'internship_success_rate': internship_success_rate,
        'by_internship_type': by_internship_type,
        'by_encadrant': by_encadrant,
        'risk_distribution': risk_distribution,
        'repeat_problem_students': repeat_students,
        'repeat_complaint_companies': repeat_companies,
        'delayed_encadrants': delayed_encadrants,
        'critical_count': qs.filter(severity__in=[Report.Severity.HIGH, Report.Severity.CRITICAL]).exclude(
            status=Report.Status.ARCHIVED,
        ).count(),
        'overdue_count': qs.filter(is_overdue=True).count(),
        'pending_validation_count': qs.filter(
            report_type=Report.ReportType.VALIDATION,
            status__in=[
                Report.Status.SUBMITTED,
                Report.Status.UNDER_REVIEW,
                Report.Status.RESUBMITTED,
                Report.Status.ESCALATED,
                Report.Status.CRITICAL_REVIEW,
            ],
        ).count(),
    }


def build_dashboard_summary(user) -> dict:
    qs = _base_qs(user)
    return {
        'total': qs.count(),
        'submitted': qs.filter(status=Report.Status.SUBMITTED).count(),
        'under_review': qs.filter(
            status__in=[
                Report.Status.UNDER_REVIEW,
                Report.Status.REVIEWED,
                Report.Status.RESUBMITTED,
            ],
        ).count(),
        'approved': qs.filter(status=Report.Status.APPROVED).count(),
        'overdue': qs.filter(is_overdue=True).count(),
        'critical': qs.filter(
            severity__in=[Report.Severity.HIGH, Report.Severity.CRITICAL],
        ).exclude(status__in=[Report.Status.ARCHIVED, Report.Status.APPROVED]).count(),
        'risk_alerts': qs.filter(
            report_type__in=[Report.ReportType.RISK_ALERT, Report.ReportType.INCIDENT],
        ).exclude(status=Report.Status.ARCHIVED).count(),
        'pending_validation': qs.filter(
            report_type=Report.ReportType.VALIDATION,
            status__in=[
                Report.Status.SUBMITTED,
                Report.Status.UNDER_REVIEW,
                Report.Status.RESUBMITTED,
                Report.Status.ESCALATED,
                Report.Status.CRITICAL_REVIEW,
            ],
        ).count(),
    }
