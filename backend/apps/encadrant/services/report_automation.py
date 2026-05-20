"""Scheduled automation for ERMS."""

from __future__ import annotations

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone

from apps.admin_management.models import Assignment
from apps.encadrant.models import Report, ReportObligation, SupervisedStudent
from apps.encadrant.services.report_context import sync_overdue_flag
from apps.encadrant.services.report_notifications import emit_report_notification
from apps.encadrant.services.report_priority import bulk_recalculate_priorities

User = get_user_model()


def detect_overdue_reports() -> int:
    count = 0
    qs = Report.objects.exclude(
        status__in=[Report.Status.APPROVED, Report.Status.ARCHIVED, Report.Status.DRAFT],
    )
    for report in qs.iterator(chunk_size=100):
        was = report.is_overdue
        sync_overdue_flag(report)
        if report.is_overdue and not was:
            count += 1
            emit_report_notification(
                event_code='report.overdue',
                report=report,
                title='Rapport en retard',
                body=f'Le rapport "{report.title}" est en retard.',
            )
    return count


def detect_missing_reports() -> int:
    """Mark obligations overdue when due date passed without satisfying report."""
    now = timezone.now()
    updated = 0
    for ob in ReportObligation.objects.filter(status=ReportObligation.Status.PENDING, due_at__lt=now):
        ob.status = ReportObligation.Status.OVERDUE
        ob.save(update_fields=['status', 'updated_at'])
        updated += 1
    return updated


def detect_repeated_risk_alerts() -> int:
    since = timezone.now() - timedelta(days=90)
    escalated = 0
    student_ids = (
        Report.objects.filter(
            report_type__in=[Report.ReportType.RISK_ALERT, Report.ReportType.INCIDENT, Report.ReportType.ATTENDANCE],
            created_at__gte=since,
        )
        .exclude(status=Report.Status.ARCHIVED)
        .values('student_profile_id')
        .annotate(c=Count('id'))
        .filter(c__gte=3)
        .values_list('student_profile_id', flat=True)
    )
    for sid in student_ids:
        latest = (
            Report.objects.filter(student_profile_id=sid)
            .exclude(status__in=[Report.Status.ARCHIVED, Report.Status.ESCALATED, Report.Status.CRITICAL_REVIEW])
            .order_by('-created_at')
            .first()
        )
        if latest and latest.severity != Report.Severity.CRITICAL:
            latest.severity = Report.Severity.CRITICAL
            latest.status = Report.Status.ESCALATED
            latest.escalated_at = timezone.now()
            latest.save(update_fields=['severity', 'status', 'escalated_at', 'updated_at'])
            emit_report_notification(
                event_code='report.critical_alert',
                report=latest,
                title='Alerte risque répétée',
                body=f'Étudiant avec {sid}: alertes répétées détectées.',
            )
            escalated += 1
    return escalated


def detect_inactive_supervision(days_without_report: int = 45) -> int:
    """Flag encadrants with active assignments but no recent non-draft report."""
    cutoff = timezone.now() - timedelta(days=days_without_report)
    flagged = 0
    assignments = Assignment.objects.filter(is_active=True, encadrant_profile__isnull=False).select_related(
        'encadrant_profile', 'student_profile',
    )
    for asn in assignments:
        recent = Report.objects.filter(
            encadrant_profile=asn.encadrant_profile,
            student_profile=asn.student_profile,
            updated_at__gte=cutoff,
        ).exclude(status=Report.Status.DRAFT).exists()
        if not recent:
            flagged += 1
    return flagged


def send_obligation_reminders() -> int:
    now = timezone.now()
    sent = 0
    for ob in ReportObligation.objects.filter(
        status__in=[ReportObligation.Status.PENDING, ReportObligation.Status.OVERDUE],
        due_at__lte=now + timedelta(days=7),
        reminder_sent_at__isnull=True,
    ).select_related('encadrant_profile__supervisor_profile__user'):
        user = ob.encadrant_profile.supervisor_profile.user
        emit_report_notification(
            event_code='obligation.reminder',
            report=Report(
                title=f'Obligation {ob.report_type}',
                encadrant_profile=ob.encadrant_profile,
                student_profile=ob.student_profile,
                report_type=ob.report_type,
            ),
            title='Rappel rapport attendu',
            body=f'Un rapport {ob.get_report_type_display()} est attendu avant le {ob.due_at:%d/%m/%Y}.',
            recipient_users=[user],
        )
        ob.reminder_sent_at = now
        ob.save(update_fields=['reminder_sent_at', 'updated_at'])
        sent += 1
    return sent


def run_all_automation() -> dict:
    return {
        'overdue_flagged': detect_overdue_reports(),
        'obligations_overdue': detect_missing_reports(),
        'risk_escalations': detect_repeated_risk_alerts(),
        'inactive_supervision_pairs': detect_inactive_supervision(),
        'reminders_sent': send_obligation_reminders(),
        'priorities_recalculated': bulk_recalculate_priorities(),
    }
