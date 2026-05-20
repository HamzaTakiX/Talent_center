"""Priority scoring engine for supervision reports."""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from apps.encadrant.models import Report


HIGH_RISK_TYPES = frozenset({
    Report.ReportType.RISK_ALERT,
    Report.ReportType.ATTENDANCE,
    Report.ReportType.COMPANY_ISSUE,
    Report.ReportType.INCIDENT,
})

VALIDATION_TYPES = frozenset({Report.ReportType.VALIDATION, Report.ReportType.FINAL})


def count_recent_risk_alerts(student_profile_id: int, days: int = 90) -> int:
    since = timezone.now() - timedelta(days=days)
    return Report.objects.filter(
        student_profile_id=student_profile_id,
        report_type__in=[
            Report.ReportType.RISK_ALERT,
            Report.ReportType.INCIDENT,
            Report.ReportType.ATTENDANCE,
        ],
        created_at__gte=since,
    ).exclude(status=Report.Status.ARCHIVED).count()


def calculate_priority_score(report: Report) -> int:
    score = 0
    severity_weights = {
        Report.Severity.CRITICAL: 400,
        Report.Severity.HIGH: 250,
        Report.Severity.MEDIUM: 80,
        Report.Severity.LOW: 30,
        Report.Severity.INFO: 0,
    }
    score += severity_weights.get(report.severity, 0)

    if report.is_overdue:
        score += 200

    if report.report_type in HIGH_RISK_TYPES:
        score += 150

    if report.report_type in VALIDATION_TYPES and report.status in (
        Report.Status.SUBMITTED,
        Report.Status.UNDER_REVIEW,
        Report.Status.RESUBMITTED,
        Report.Status.ESCALATED,
        Report.Status.CRITICAL_REVIEW,
        Report.Status.REVIEWED,
    ):
        score += 120

    if report.status in (Report.Status.ESCALATED, Report.Status.CRITICAL_REVIEW):
        score += 180

    if report.student_profile_id:
        repeat = count_recent_risk_alerts(report.student_profile_id)
        if repeat >= 3:
            score += 120
        elif repeat >= 2:
            score += 60

    if report.score is not None and float(report.score) < 40:
        score += 100

    if report.status == Report.Status.REQUIRES_CHANGES:
        score += 50

    return min(score, 1000)


def recalculate_report_priority(report: Report, *, persist: bool = True) -> int:
    from apps.encadrant.services.report_context import sync_overdue_flag

    sync_overdue_flag(report, persist=False)
    score = calculate_priority_score(report)
    report.priority_score = score
    if persist:
        report.save(update_fields=['priority_score', 'is_overdue', 'updated_at'])
    return score


def bulk_recalculate_priorities(queryset=None) -> int:
    qs = queryset if queryset is not None else Report.objects.all()
    updated = 0
    for report in qs.iterator(chunk_size=200):
        recalculate_report_priority(report)
        updated += 1
    return updated
