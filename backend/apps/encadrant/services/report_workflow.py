"""Report workflow state machine with validated transitions."""

from __future__ import annotations

from typing import Optional

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.encadrant.models import Report, ReportVersion, ReportWorkflowEvent
from apps.encadrant.services.report_context import apply_academic_snapshot, sync_overdue_flag
from apps.encadrant.services.report_priority import recalculate_report_priority


# Valid transitions: from_status -> {action: to_status}
TRANSITIONS: dict[str, dict[str, str]] = {
    Report.Status.DRAFT: {
        'submit': Report.Status.SUBMITTED,
    },
    Report.Status.SUBMITTED: {
        'start_review': Report.Status.UNDER_REVIEW,
        'escalate': Report.Status.ESCALATED,
        'approve': Report.Status.APPROVED,
        'reject': Report.Status.REJECTED,
        'request_changes': Report.Status.REQUIRES_CHANGES,
        'archive': Report.Status.ARCHIVED,
    },
    Report.Status.UNDER_REVIEW: {
        'approve': Report.Status.APPROVED,
        'reject': Report.Status.REJECTED,
        'request_changes': Report.Status.REQUIRES_CHANGES,
        'escalate': Report.Status.ESCALATED,
        'archive': Report.Status.ARCHIVED,
    },
    Report.Status.REQUIRES_CHANGES: {
        'resubmit': Report.Status.RESUBMITTED,
        'archive': Report.Status.ARCHIVED,
    },
    Report.Status.RESUBMITTED: {
        'start_review': Report.Status.UNDER_REVIEW,
        'escalate': Report.Status.ESCALATED,
        'approve': Report.Status.APPROVED,
        'reject': Report.Status.REJECTED,
        'request_changes': Report.Status.REQUIRES_CHANGES,
    },
    Report.Status.ESCALATED: {
        'critical_review': Report.Status.CRITICAL_REVIEW,
        'approve': Report.Status.APPROVED,
        'reject': Report.Status.REJECTED,
        'request_changes': Report.Status.REQUIRES_CHANGES,
    },
    Report.Status.CRITICAL_REVIEW: {
        'approve': Report.Status.APPROVED,
        'reject': Report.Status.REJECTED,
        'request_changes': Report.Status.REQUIRES_CHANGES,
    },
    Report.Status.REVIEWED: {
        'approve': Report.Status.APPROVED,
        'reject': Report.Status.REJECTED,
        'request_changes': Report.Status.REQUIRES_CHANGES,
        'escalate': Report.Status.ESCALATED,
        'archive': Report.Status.ARCHIVED,
    },
    Report.Status.APPROVED: {
        'archive': Report.Status.ARCHIVED,
    },
    Report.Status.REJECTED: {
        'archive': Report.Status.ARCHIVED,
        'request_changes': Report.Status.REQUIRES_CHANGES,
    },
}


ACTION_TO_EVENT = {
    'submit': ReportWorkflowEvent.Action.SUBMITTED,
    'resubmit': ReportWorkflowEvent.Action.RESUBMITTED,
    'start_review': ReportWorkflowEvent.Action.UPDATED,
    'approve': ReportWorkflowEvent.Action.APPROVED,
    'reject': ReportWorkflowEvent.Action.REJECTED,
    'request_changes': ReportWorkflowEvent.Action.REQUESTED_CHANGES,
    'escalate': ReportWorkflowEvent.Action.ESCALATED,
    'critical_review': ReportWorkflowEvent.Action.ESCALATED,
    'archive': ReportWorkflowEvent.Action.ARCHIVED,
}


def _next_version_number(report: Report) -> int:
    last = report.versions.order_by('-version_number').values_list('version_number', flat=True).first()
    return (last or 0) + 1


def _snapshot_version(report: Report, user, note: str = '') -> ReportVersion:
    content = {
        'title': report.title,
        'comments': report.comments,
        'evaluation_json': report.evaluation_json,
        'score': str(report.score) if report.score is not None else None,
        'metadata_json': report.metadata_json,
        'severity': report.severity,
    }
    return ReportVersion.objects.create(
        report=report,
        version_number=_next_version_number(report),
        content_json=content,
        change_note=note[:255],
        created_by=user,
    )


def log_event(
    report: Report,
    action: str,
    *,
    actor=None,
    from_status: str = '',
    to_status: str = '',
    note: str = '',
    payload: Optional[dict] = None,
) -> ReportWorkflowEvent:
    return ReportWorkflowEvent.objects.create(
        report=report,
        action=action,
        from_status=from_status or report.status,
        to_status=to_status,
        actor=actor,
        note=note,
        payload_json=payload or {},
    )


def validate_transition(report: Report, action: str) -> str:
    allowed = TRANSITIONS.get(report.status, {})
    to_status = allowed.get(action)
    if not to_status:
        raise ValidationError(
            {'action': f'Transition "{action}" not allowed from status "{report.status}".'},
        )
    return to_status


@transaction.atomic
def transition_report(
    report: Report,
    action: str,
    *,
    actor=None,
    note: str = '',
    auto_critical: bool = True,
) -> Report:
    from_status = report.status
    to_status = validate_transition(report, action)

    if action in ('submit', 'resubmit'):
        apply_academic_snapshot(report, persist=False)
        report.submitted_at = timezone.now()
        _snapshot_version(report, actor, note=note or action)

    if action == 'escalate':
        report.escalated_at = timezone.now()
        report.escalated_by = actor
        if auto_critical and report.severity in (Report.Severity.HIGH, Report.Severity.CRITICAL):
            to_status = Report.Status.CRITICAL_REVIEW

    if action == 'critical_review':
        to_status = Report.Status.CRITICAL_REVIEW

    if action in ('approve', 'reject', 'start_review'):
        report.reviewed_at = timezone.now()
        report.reviewed_by = actor

    if action == 'archive':
        report.archived_at = timezone.now()
        report.archived_by = actor

    report.status = to_status
    report.save()

    sync_overdue_flag(report)
    recalculate_report_priority(report)

    event_action = ACTION_TO_EVENT.get(action, ReportWorkflowEvent.Action.UPDATED)
    log_event(
        report,
        event_action,
        actor=actor,
        from_status=from_status,
        to_status=to_status,
        note=note,
    )
    return report


@transaction.atomic
def create_draft_report(
    *,
    encadrant_profile,
    student_profile,
    report_type: str,
    title: str,
    actor,
    workspace=None,
    **extra_fields,
) -> Report:
    report = Report.objects.create(
        encadrant_profile=encadrant_profile,
        student_profile=student_profile,
        workspace=workspace,
        report_type=report_type,
        title=title,
        status=Report.Status.DRAFT,
        **extra_fields,
    )
    apply_academic_snapshot(report)
    log_event(report, ReportWorkflowEvent.Action.CREATED, actor=actor, to_status=Report.Status.DRAFT)
    recalculate_report_priority(report)
    return report


@transaction.atomic
def update_draft_report(report: Report, actor, **fields) -> Report:
    if report.status not in (Report.Status.DRAFT, Report.Status.REQUIRES_CHANGES):
        raise ValidationError({'status': 'Only draft or requires-changes reports can be edited.'})
    for key, value in fields.items():
        setattr(report, key, value)
    report.save()
    log_event(report, ReportWorkflowEvent.Action.UPDATED, actor=actor, note='Draft updated')
    recalculate_report_priority(report)
    return report
