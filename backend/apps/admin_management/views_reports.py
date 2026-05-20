"""Admin API views for ERMS supervision reports."""

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope
from apps.encadrant.models import Report, ReportComment
from apps.encadrant.permissions import HasReportPermission, ReportObjectPermission
from apps.encadrant.services.report_analytics import build_dashboard_summary, build_report_analytics
from apps.encadrant.services.report_notifications import notify_report_workflow, emit_report_notification
from apps.encadrant.services.report_pdf import render_report_pdf_bytes
from apps.encadrant.services.report_query import (
    apply_report_filters,
    report_detail_queryset,
    reports_list_queryset,
    serialize_report_detail,
    serialize_report_list_item,
)
from apps.encadrant.services.report_workflow import log_event, transition_report
from apps.encadrant.models import ReportWorkflowEvent
from apps.admin_management.services.report_scopes import assert_report_in_scope


def _paginate(qs, request):
    try:
        page = max(1, int(request.query_params.get('page', 1)))
        page_size = min(100, max(1, int(request.query_params.get('page_size', 25))))
    except (TypeError, ValueError):
        page, page_size = 1, 25
    total = qs.count()
    start = (page - 1) * page_size
    items = [serialize_report_list_item(r) for r in qs[start : start + page_size]]
    return {
        'items': items,
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total': total,
            'total_pages': (total + page_size - 1) // page_size if page_size else 0,
        },
    }


class AdminSupervisionReportsDashboardView(APIView):
    permission_classes = [IsAuthenticated, HasReportPermission]
    required_permission = 'reports.access'

    def get(self, request):
        summary = build_dashboard_summary(request.user)
        analytics = build_report_analytics(
            request.user,
            academic_year=request.query_params.get('academic_year'),
        )
        return Response(
            envelope(True, 'OK', data={'summary': summary, 'analytics': analytics}),
            status=status.HTTP_200_OK,
        )


class AdminSupervisionReportsListView(APIView):
    permission_classes = [IsAuthenticated, HasReportPermission]
    required_permission = 'reports.access'

    def get(self, request):
        qs = apply_report_filters(reports_list_queryset(request.user), dict(request.query_params))
        data = _paginate(qs, request)
        return Response(envelope(True, 'OK', data=data), status=status.HTTP_200_OK)


class AdminSupervisionReportDetailView(APIView):
    permission_classes = [IsAuthenticated, HasReportPermission, ReportObjectPermission]
    required_permission = 'reports.access'

    def get(self, request, report_id: int):
        report = get_object_or_404(report_detail_queryset(request.user), pk=report_id)
        return Response(
            envelope(True, 'OK', data=serialize_report_detail(report)),
            status=status.HTTP_200_OK,
        )


class AdminSupervisionReportsAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, HasReportPermission]
    required_permission = 'reports.access'

    def get(self, request):
        data = build_report_analytics(
            request.user,
            academic_year=request.query_params.get('academic_year'),
        )
        return Response(envelope(True, 'OK', data=data), status=status.HTTP_200_OK)


class _ReportActionView(APIView):
    action_name = ''
    required_permission = 'reports.review'

    def post(self, request, report_id: int):
        report = get_object_or_404(report_detail_queryset(request.user), pk=report_id)
        assert_report_in_scope(request.user, report)
        note = (request.data.get('note') or '').strip()
        try:
            report = transition_report(report, self.action_name, actor=request.user, note=note)
        except ValidationError as exc:
            return Response(
                envelope(False, 'Invalid transition', errors=exc.detail),
                status=status.HTTP_400_BAD_REQUEST,
            )
        notify_report_workflow(report, self.action_name, actor=request.user, note=note)
        return Response(
            envelope(True, 'OK', data=serialize_report_detail(report)),
            status=status.HTTP_200_OK,
        )


class AdminSupervisionReportApproveView(_ReportActionView):
    action_name = 'approve'


class AdminSupervisionReportRejectView(_ReportActionView):
    action_name = 'reject'


class AdminSupervisionReportRequestChangesView(_ReportActionView):
    action_name = 'request_changes'


class AdminSupervisionReportEscalateView(APIView):
    permission_classes = [IsAuthenticated, HasReportPermission, ReportObjectPermission]
    required_permission = 'reports.escalate'

    def post(self, request, report_id: int):
        report = get_object_or_404(report_detail_queryset(request.user), pk=report_id)
        note = (request.data.get('note') or '').strip()
        report = transition_report(report, 'escalate', actor=request.user, note=note)
        notify_report_workflow(report, 'escalate', actor=request.user, note=note)
        return Response(envelope(True, 'OK', data=serialize_report_detail(report)))


class AdminSupervisionReportArchiveView(_ReportActionView):
    action_name = 'archive'
    required_permission = 'reports.review'


class AdminSupervisionReportAssignReviewerView(APIView):
    permission_classes = [IsAuthenticated, HasReportPermission, ReportObjectPermission]
    required_permission = 'reports.assign'

    def post(self, request, report_id: int):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        report = get_object_or_404(report_detail_queryset(request.user), pk=report_id)
        reviewer_id = request.data.get('reviewer_id')
        if not reviewer_id:
            raise ValidationError({'reviewer_id': 'Required.'})
        reviewer = get_object_or_404(User, pk=reviewer_id, role=User.RoleChoices.ADMIN)
        report.assigned_reviewer = reviewer
        if report.status == Report.Status.SUBMITTED:
            report.status = Report.Status.UNDER_REVIEW
        report.save(update_fields=['assigned_reviewer', 'status', 'updated_at'])
        log_event(
            report,
            ReportWorkflowEvent.Action.ASSIGNED_REVIEWER,
            actor=request.user,
            note=f'Assigned to {reviewer.email}',
            payload={'reviewer_id': reviewer.pk},
        )
        return Response(envelope(True, 'OK', data=serialize_report_detail(report)))


class AdminSupervisionReportAddNoteView(APIView):
    permission_classes = [IsAuthenticated, HasReportPermission, ReportObjectPermission]
    required_permission = 'reports.review'

    def post(self, request, report_id: int):
        report = get_object_or_404(report_detail_queryset(request.user), pk=report_id)
        body = (request.data.get('body') or '').strip()
        if not body:
            raise ValidationError({'body': 'Required.'})
        comment = ReportComment.objects.create(
            report=report,
            author=request.user,
            body=body,
            is_internal=request.data.get('is_internal', True),
        )
        log_event(report, ReportWorkflowEvent.Action.NOTE_ADDED, actor=request.user, note=body[:500])
        return Response(
            envelope(True, 'OK', data={'id': comment.pk, 'body': comment.body}),
            status=status.HTTP_201_CREATED,
        )


class AdminSupervisionReportNotifyView(APIView):
    permission_classes = [IsAuthenticated, HasReportPermission, ReportObjectPermission]
    required_permission = 'reports.review'

    def post(self, request, report_id: int):
        report = get_object_or_404(report_detail_queryset(request.user), pk=report_id)
        target = request.data.get('target', 'encadrant')
        users = []
        if target in ('encadrant', 'both'):
            users.append(report.encadrant_profile.supervisor_profile.user)
        if target in ('student', 'both'):
            users.append(report.student_profile.user)
        message = request.data.get('message', f'Notification concernant le rapport "{report.title}".')
        emit_report_notification(
            event_code='report.notified',
            report=report,
            title='Notification rapport',
            body=message,
            actor=request.user,
            recipient_users=users,
        )
        log_event(report, ReportWorkflowEvent.Action.NOTIFIED, actor=request.user, note=message)
        return Response(envelope(True, 'Notification sent.'))


class AdminSupervisionReportExportPdfView(APIView):
    permission_classes = [IsAuthenticated, HasReportPermission, ReportObjectPermission]
    required_permission = 'reports.export'

    def get(self, request, report_id: int):
        report = get_object_or_404(report_detail_queryset(request.user), pk=report_id)
        try:
            pdf = render_report_pdf_bytes(report)
        except RuntimeError as exc:
            return Response(
                envelope(False, str(exc), data={'code': 'pdf_unavailable'}),
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="report-{report_id}.pdf"'
        return response
