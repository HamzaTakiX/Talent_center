"""Encadrant (supervisor) API for supervision reports — backend-ready, no UI yet."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope
from apps.admin_management.models import EncadrantProfile
from apps.encadrant.models import Report, ReportAttachment, ReportTemplate
from apps.encadrant.permissions import IsSupervisor, ReportObjectPermission
from apps.encadrant.services.report_notifications import notify_report_submitted
from apps.encadrant.services.report_query import serialize_report_detail, serialize_report_list_item
from apps.encadrant.services.report_workflow import create_draft_report, transition_report, update_draft_report


def _encadrant_profile(user) -> EncadrantProfile:
    sp = getattr(user, 'supervisor_profile', None)
    if not sp:
        raise PermissionDenied('Supervisor profile required.')
    ep = getattr(sp, 'encadrant_profile', None)
    if not ep:
        raise PermissionDenied('Encadrant profile required.')
    return ep


def _supervised_student_ids(encadrant: EncadrantProfile):
    from apps.admin_management.models import Assignment
    from apps.encadrant.models import SupervisedStudent

    ids = set(
        SupervisedStudent.objects.filter(
            encadrant_profile=encadrant,
            is_active=True,
        ).values_list('student_profile_id', flat=True),
    )
    ids.update(
        Assignment.objects.filter(
            encadrant_profile=encadrant,
            is_active=True,
        ).values_list('student_profile_id', flat=True),
    )
    return ids


class EncadrantReportsListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisor]

    def get(self, request):
        enc = _encadrant_profile(request.user)
        student_ids = _supervised_student_ids(enc)
        qs = Report.objects.filter(encadrant_profile=enc).filter(
            student_profile_id__in=student_ids,
        ).select_related(
            'student_profile__user__profile',
            'filiere',
            'internship_type',
            'academic_year',
        ).order_by('-updated_at')
        if request.query_params.get('status'):
            qs = qs.filter(status=request.query_params['status'])
        items = [serialize_report_list_item(r) for r in qs[:200]]
        return Response(envelope(True, 'OK', data={'items': items}))

    def post(self, request):
        enc = _encadrant_profile(request.user)
        student_id = request.data.get('student_profile_id')
        if not student_id or int(student_id) not in _supervised_student_ids(enc):
            raise PermissionDenied('Student not under your supervision.')
        from apps.accounts_et_roles.models import StudentProfile

        student = get_object_or_404(StudentProfile, pk=student_id)
        report = create_draft_report(
            encadrant_profile=enc,
            student_profile=student,
            report_type=request.data.get('report_type', Report.ReportType.FOLLOW_UP),
            title=request.data.get('title', 'Rapport de supervision'),
            actor=request.user,
            comments=request.data.get('comments', ''),
            severity=request.data.get('severity', Report.Severity.INFO),
            evaluation_json=request.data.get('evaluation_json', {}),
        )
        return Response(
            envelope(True, 'Created', data=serialize_report_detail(report)),
            status=status.HTTP_201_CREATED,
        )


class EncadrantReportDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisor, ReportObjectPermission]

    def get(self, request, report_id: int):
        enc = _encadrant_profile(request.user)
        report = get_object_or_404(Report, pk=report_id, encadrant_profile=enc)
        return Response(envelope(True, 'OK', data=serialize_report_detail(report)))

    def patch(self, request, report_id: int):
        enc = _encadrant_profile(request.user)
        report = get_object_or_404(Report, pk=report_id, encadrant_profile=enc)
        allowed = {
            'title', 'comments', 'evaluation_json', 'severity', 'score',
            'report_type', 'period_start', 'period_end', 'company_name',
            'company_city', 'metadata_json',
        }
        fields = {k: v for k, v in request.data.items() if k in allowed}
        report = update_draft_report(report, request.user, **fields)
        return Response(envelope(True, 'OK', data=serialize_report_detail(report)))


class EncadrantReportSubmitView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisor, ReportObjectPermission]

    def post(self, request, report_id: int):
        enc = _encadrant_profile(request.user)
        report = get_object_or_404(Report, pk=report_id, encadrant_profile=enc)
        action = 'resubmit' if report.status == Report.Status.REQUIRES_CHANGES else 'submit'
        report = transition_report(report, action, actor=request.user, note=request.data.get('note', ''))
        notify_report_submitted(report, actor=request.user)
        return Response(envelope(True, 'Submitted', data=serialize_report_detail(report)))


class EncadrantReportTemplatesView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisor]

    def get(self, request):
        report_type = request.query_params.get('report_type')
        qs = ReportTemplate.objects.filter(is_active=True)
        if report_type:
            qs = qs.filter(report_type=report_type)
        items = [
            {'code': t.code, 'name': t.name, 'reportType': t.report_type, 'schemaJson': t.schema_json}
            for t in qs[:50]
        ]
        return Response(envelope(True, 'OK', data={'items': items}))


class EncadrantReportAttachmentView(APIView):
    permission_classes = [IsAuthenticated, IsSupervisor, ReportObjectPermission]

    def post(self, request, report_id: int):
        enc = _encadrant_profile(request.user)
        report = get_object_or_404(Report, pk=report_id, encadrant_profile=enc)
        if report.status not in (Report.Status.DRAFT, Report.Status.REQUIRES_CHANGES):
            raise ValidationError({'status': 'Cannot attach files after submission.'})
        upload = request.FILES.get('file')
        if not upload:
            raise ValidationError({'file': 'Required.'})
        att = ReportAttachment.objects.create(
            report=report,
            file=upload,
            original_name=upload.name,
            mime_type=getattr(upload, 'content_type', ''),
            size_bytes=upload.size,
            uploaded_by=request.user,
        )
        return Response(
            envelope(True, 'Uploaded', data={'id': att.pk, 'originalName': att.original_name}),
            status=status.HTTP_201_CREATED,
        )
