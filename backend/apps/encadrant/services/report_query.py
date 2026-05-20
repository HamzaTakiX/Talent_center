"""Query building and serialization for supervision reports."""

from __future__ import annotations

from django.db.models import Prefetch, Q
from django.utils import timezone

from apps.encadrant.models import Report, ReportComment, ReportWorkflowEvent
from apps.admin_management.services.report_scopes import filter_reports_by_admin_scope


REPORT_LIST_SELECT = (
    'student_profile__user__profile',
    'encadrant_profile__supervisor_profile__user__profile',
    'filiere',
    'academic_level',
    'academic_sector',
    'class_group',
    'academic_year',
    'internship_type',
    'assigned_reviewer__profile',
)


def reports_list_queryset(user):
    return (
        filter_reports_by_admin_scope(Report.objects.all(), user)
        .select_related(*REPORT_LIST_SELECT)
        .prefetch_related('attachments')
    )


def apply_report_filters(qs, params: dict):
    queue = params.get('queue')
    if queue == 'critical':
        qs = qs.filter(
            severity__in=[Report.Severity.HIGH, Report.Severity.CRITICAL],
        ).exclude(status__in=[Report.Status.ARCHIVED, Report.Status.APPROVED])
    elif queue == 'overdue':
        qs = qs.filter(is_overdue=True)
    elif queue == 'pending_validation':
        qs = qs.filter(
            report_type=Report.ReportType.VALIDATION,
            status__in=[
                Report.Status.SUBMITTED,
                Report.Status.UNDER_REVIEW,
                Report.Status.RESUBMITTED,
                Report.Status.ESCALATED,
                Report.Status.CRITICAL_REVIEW,
                Report.Status.REVIEWED,
            ],
        )
    elif queue == 'risk_alerts':
        qs = qs.filter(
            report_type__in=[Report.ReportType.RISK_ALERT, Report.ReportType.INCIDENT],
        ).exclude(status=Report.Status.ARCHIVED)

    if params.get('exclude_drafts', 'true').lower() != 'false':
        qs = qs.exclude(status=Report.Status.DRAFT)

    if report_type := params.get('report_type'):
        qs = qs.filter(report_type=report_type)
    if status := params.get('status'):
        qs = qs.filter(status=status)
    if severity := params.get('severity'):
        qs = qs.filter(severity=severity)
    if filiere_id := params.get('filiere_id'):
        qs = qs.filter(Q(filiere_id=filiere_id) | Q(student_profile__filiere_id=filiere_id))
    if level_id := params.get('academic_level_id'):
        qs = qs.filter(Q(academic_level_id=level_id) | Q(student_profile__academic_level_id=level_id))
    if sector_id := params.get('academic_sector_id'):
        qs = qs.filter(Q(academic_sector_id=sector_id) | Q(student_profile__academic_sector_id=sector_id))
    if encadrant_id := params.get('encadrant_id'):
        qs = qs.filter(encadrant_profile_id=encadrant_id)
    if student_id := params.get('student_id'):
        qs = qs.filter(student_profile_id=student_id)
    if internship_type_id := params.get('internship_type_id'):
        qs = qs.filter(internship_type_id=internship_type_id)
    if academic_year := params.get('academic_year'):
        qs = qs.filter(
            Q(academic_year__code=academic_year) | Q(student_profile__academic_year=academic_year),
        )
    if company := params.get('company'):
        qs = qs.filter(company_name__icontains=company)
    if date_from := params.get('date_from'):
        qs = qs.filter(submitted_at__date__gte=date_from)
    if date_to := params.get('date_to'):
        qs = qs.filter(submitted_at__date__lte=date_to)
    if params.get('overdue') == 'true':
        qs = qs.filter(is_overdue=True)

    search = params.get('search', '').strip()
    if search:
        qs = qs.filter(
            Q(title__icontains=search)
            | Q(company_name__icontains=search)
            | Q(student_profile__user__email__icontains=search)
            | Q(encadrant_profile__supervisor_profile__user__email__icontains=search)
        )

    ordering = params.get('ordering', '-priority_score')
    allowed = {
        '-priority_score', 'priority_score', '-submitted_at', 'submitted_at',
        '-created_at', 'created_at', 'severity', '-severity',
    }
    if ordering in allowed:
        qs = qs.order_by(ordering, '-id')
    else:
        qs = qs.order_by('-priority_score', '-submitted_at', '-id')
    return qs


def report_detail_queryset(user):
    return (
        filter_reports_by_admin_scope(Report.objects.all(), user)
        .select_related(*REPORT_LIST_SELECT, 'assignment', 'reviewed_by__profile', 'escalated_by__profile')
        .prefetch_related(
            Prefetch('workflow_events', queryset=ReportWorkflowEvent.objects.select_related('actor__profile')),
            Prefetch('admin_comments', queryset=ReportComment.objects.select_related('author__profile')),
            'attachments',
            'versions',
        )
    )


def _user_display(user) -> str:
    if user is None:
        return '—'
    profile = getattr(user, 'profile', None)
    if profile:
        name = f'{profile.first_name} {profile.last_name}'.strip()
        if name:
            return name
    return user.email or '—'


def admin_ui_status(report: Report) -> str:
    """Presentation bucket for admin UI tables."""
    if report.status == Report.Status.APPROVED:
        return 'Approved'
    if report.is_overdue and report.status not in (Report.Status.APPROVED, Report.Status.ARCHIVED, Report.Status.DRAFT):
        return 'Overdue'
    if report.status in (
        Report.Status.SUBMITTED,
        Report.Status.RESUBMITTED,
    ):
        return 'Submitted'
    if report.status in (
        Report.Status.UNDER_REVIEW,
        Report.Status.REVIEWED,
        Report.Status.REQUIRES_CHANGES,
        Report.Status.ESCALATED,
        Report.Status.CRITICAL_REVIEW,
    ):
        return 'Pending'
    if report.status == Report.Status.REJECTED:
        return 'Pending'
    return 'Submitted'


def serialize_report_list_item(report: Report) -> dict:
    it = report.internship_type
    return {
        'id': str(report.pk),
        'title': report.title,
        'reportType': report.report_type,
        'reportTypeLabel': report.get_report_type_display(),
        'status': report.status,
        'presentationStatus': admin_ui_status(report),
        'severity': report.severity,
        'priorityScore': report.priority_score,
        'isOverdue': report.is_overdue,
        'score': float(report.score) if report.score is not None else None,
        'encadrant': _user_display(report.encadrant_profile.supervisor_profile.user),
        'encadrantId': report.encadrant_profile_id,
        'student': _user_display(report.student_profile.user),
        'studentId': report.student_profile_id,
        'companyName': report.company_name or '—',
        'submittedDate': report.submitted_at.strftime('%d/%m/%Y') if report.submitted_at else '—',
        'dueDate': report.due_at.strftime('%d/%m/%Y') if report.due_at else (
            report.period_end.strftime('%d/%m/%Y') if report.period_end else '—'
        ),
        'filiere': report.filiere.code if report.filiere else (report.student_profile.filiere.code if report.student_profile.filiere else '—'),
        'academicYear': report.academic_year.code if report.academic_year else report.student_profile.academic_year or '—',
        'internshipType': {'code': it.code, 'label': it.name} if it else None,
        'createdAt': report.created_at.isoformat(),
        'updatedAt': report.updated_at.isoformat(),
    }


def serialize_report_detail(report: Report) -> dict:
    base = serialize_report_list_item(report)
    sp = report.student_profile
    base.update({
        'comments': report.comments,
        'evaluationJson': report.evaluation_json,
        'metadataJson': report.metadata_json,
        'periodStart': report.period_start.isoformat() if report.period_start else None,
        'periodEnd': report.period_end.isoformat() if report.period_end else None,
        'internshipPeriodStart': report.internship_period_start.isoformat() if report.internship_period_start else None,
        'internshipPeriodEnd': report.internship_period_end.isoformat() if report.internship_period_end else None,
        'companyCity': report.company_city,
        'reviewedAt': report.reviewed_at.isoformat() if report.reviewed_at else None,
        'reviewedBy': _user_display(report.reviewed_by) if report.reviewed_by else None,
        'assignedReviewer': _user_display(report.assigned_reviewer) if report.assigned_reviewer else None,
        'assignedReviewerId': report.assigned_reviewer_id,
        'studentSummary': {
            'id': sp.pk,
            'displayName': _user_display(sp.user),
            'email': sp.user.email,
            'studentNumber': sp.student_number,
            'filiere': sp.filiere.code if sp.filiere else None,
            'level': sp.academic_level.code if sp.academic_level else None,
            'sector': sp.academic_sector.code if sp.academic_sector else None,
            'classGroup': sp.class_group.code if sp.class_group else None,
        },
        'encadrantSummary': {
            'id': report.encadrant_profile_id,
            'displayName': _user_display(report.encadrant_profile.supervisor_profile.user),
            'email': report.encadrant_profile.supervisor_profile.user.email,
        },
        'attachments': [
            {
                'id': a.pk,
                'originalName': a.original_name,
                'mimeType': a.mime_type,
                'sizeBytes': a.size_bytes,
                'url': a.file.url if a.file else None,
            }
            for a in report.attachments.all()
        ],
        'timeline': [
            {
                'id': e.pk,
                'action': e.action,
                'fromStatus': e.from_status,
                'toStatus': e.to_status,
                'note': e.note,
                'actor': _user_display(e.actor),
                'createdAt': e.created_at.isoformat(),
            }
            for e in report.workflow_events.all()
        ],
        'adminNotes': [
            {
                'id': c.pk,
                'body': c.body,
                'author': _user_display(c.author),
                'isInternal': c.is_internal,
                'createdAt': c.created_at.isoformat(),
            }
            for c in report.admin_comments.all()
        ],
        'versions': [
            {
                'versionNumber': v.version_number,
                'changeNote': v.change_note,
                'createdAt': v.created_at.isoformat(),
            }
            for v in report.versions.all()[:10]
        ],
    })
    return base
