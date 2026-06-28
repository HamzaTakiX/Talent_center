"""Admin API for Documents Administratifs module."""

import os

from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
from apps.authentication.utils import envelope
from apps.documents.models import DocumentRequest, DocumentType
from apps.documents.services import admin_api
from apps.documents.services import catalog as catalog_service
from apps.documents.services import chat_service as document_chat_service
from apps.documents.services import generation_service
from apps.documents.services import student_api


class DocumentsDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        return Response(envelope(True, 'Dashboard loaded', data=admin_api.dashboard_payload(request)))


class DocumentRequestListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        data = admin_api.paginate_requests(request.query_params.dict(), request=request)
        return Response(envelope(True, 'List loaded', data=data))


class DocumentRequestDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request, uuid):
        req = get_object_or_404(
            DocumentRequest.objects.select_related(*admin_api.LIST_SELECT_RELATED).prefetch_related(
                'fields', 'attachments', 'outputs', 'workflow_steps'
            ),
            uuid=uuid,
        )
        return Response(envelope(True, 'Detail loaded', data=admin_api.detail_payload(req, request)))


class DocumentRequestActionView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def post(self, request, uuid, action):
        req = get_object_or_404(DocumentRequest, uuid=uuid)
        try:
            data = admin_api.perform_request_action(req, action, request.user, request.data)
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=400)
        return Response(envelope(True, f'Action {action} completed', data=data))


class DocumentTypesListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        return Response(envelope(True, 'Types loaded', data=admin_api.types_payload()))


class DocumentResourcesListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        return Response(envelope(True, 'Resources loaded', data=admin_api.resources_payload()))


class DocumentTemplatesListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        return Response(envelope(True, 'Templates loaded', data=admin_api.templates_payload()))


class DocumentWorkflowsListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        return Response(envelope(True, 'Workflows loaded', data=[]))


class DocumentSlaRulesListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        return Response(envelope(True, 'SLA rules loaded', data=[]))


class DocumentAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        return Response(envelope(True, 'Analytics loaded', data=admin_api.analytics_payload()))


class DocumentWorkloadView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        return Response(envelope(True, 'Workload loaded', data=admin_api.workload_payload()))


class DocumentReservationsView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        data = admin_api.reservations_payload(request.query_params.dict())
        return Response(envelope(True, 'Reservations loaded', data=data))


class ServiceCatalogListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.manage'

    def get(self, request):
        return Response(envelope(True, 'Catalog loaded', data=catalog_service.catalog_list()))

    def post(self, request):
        data = catalog_service.catalog_create(request.data, actor=request.user)
        return Response(envelope(True, 'Service created', data=data), status=201)


class ServiceCatalogDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.manage'

    def get(self, request, pk):
        data = catalog_service.catalog_detail(pk)
        if not data:
            return Response(envelope(False, 'Not found'), status=404)
        return Response(envelope(True, 'Service loaded', data=data))

    def patch(self, request, pk):
        data = catalog_service.catalog_update(pk, request.data, actor=request.user)
        if not data:
            return Response(envelope(False, 'Not found'), status=404)
        return Response(envelope(True, 'Service updated', data=data))


class ServiceCatalogTemplateFileView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.manage'

    def get(self, request, pk):
        stored = catalog_service.catalog_template_file(pk)
        if not stored:
            raise Http404('Template file not found')
        return FileResponse(stored.open('rb'), as_attachment=False, filename=os.path.basename(stored.name))

    def post(self, request, pk):
        uploaded = request.FILES.get('file')
        if not uploaded:
            return Response(envelope(False, 'File required'), status=400)
        data = catalog_service.catalog_upload_template_file(pk, uploaded, actor=request.user)
        if not data:
            return Response(envelope(False, 'Not found'), status=404)
        return Response(envelope(True, 'Template uploaded', data=data))


class ServiceCatalogSeedView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.manage'

    def post(self, request):
        n = catalog_service.seed_catalog(actor=request.user)
        return Response(envelope(True, 'Seed complete', data={'created': n}))


class StudentDocumentsOverviewView(APIView):
    """Student documents page — KPI stats and visible service catalog."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)
        return Response(
            envelope(True, 'Documents overview loaded', data=student_api.overview_payload(profile, request)),
        )


class StudentDocumentCatalogDetailView(APIView):
    """Student document service detail — visible catalog entry only."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)
        data = student_api.catalog_detail_payload(profile, pk, request)
        if not data:
            return Response(envelope(False, 'Not found'), status=404)
        return Response(envelope(True, 'Document loaded', data=data))


class StudentDocumentGenerateView(APIView):
    """Instantly generate a document for auto-generate catalog services."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)
        try:
            data = generation_service.generate_document(profile, request.user, pk, request)
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=400)
        return Response(envelope(True, 'Document generated', data=data), status=201)


class StudentDocumentRequestView(APIView):
    """Submit an online document request for a catalog service."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)
        try:
            data = student_api.create_request(profile, request.user, pk, request.data)
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=400)
        return Response(envelope(True, 'Request submitted', data=data), status=201)


class StudentDocumentChatView(APIView):
    """Open or continue a support thread about a catalog document service."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)

        document_type = get_object_or_404(DocumentType, pk=pk, is_active=True)
        data = student_api.catalog_detail_payload(profile, pk, request)
        if not data:
            return Response(envelope(False, 'Document not available'), status=404)

        conv = document_chat_service.get_or_create_document_service_conversation(
            document_type=document_type,
            student=profile,
            created_by=request.user,
            request=request,
        )
        message_body = (request.data.get('message') or '').strip()
        if message_body:
            document_chat_service.send_document_message(
                conversation=conv,
                sender=request.user,
                body=message_body,
            )
        return Response(envelope(True, 'Conversation ready', data={
            'conversation_id': conv.pk,
            'document_service_id': str(document_type.pk),
        }))
