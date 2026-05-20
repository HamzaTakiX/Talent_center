"""Admin API for Documents Administratifs module."""

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
from apps.authentication.utils import envelope
from apps.documents.models import DocumentRequest
from apps.documents.services import admin_api
from apps.documents.services import catalog as catalog_service


class DocumentsDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        return Response(envelope(True, 'Dashboard loaded', data=admin_api.dashboard_payload()))


class DocumentRequestListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request):
        data = admin_api.paginate_requests(request.query_params.dict())
        return Response(envelope(True, 'List loaded', data=data))


class DocumentRequestDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.validate'

    def get(self, request, uuid):
        req = get_object_or_404(DocumentRequest, uuid=uuid)
        item = admin_api._serialize_list_item(req)
        item.update({
            'reason': req.reason,
            'fields': [],
            'attachments': [],
            'workflowSteps': [],
            'validationHistory': [],
            'generatedOutputs': [],
            'insights': ['admin.documentsModule.insights.srfClear'],
        })
        return Response(envelope(True, 'Detail loaded', data=item))


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


class ServiceCatalogListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.manage'

    def get(self, request):
        return Response(envelope(True, 'Catalog loaded', data=catalog_service.catalog_list()))

    def post(self, request):
        data = catalog_service.catalog_create(request.data)
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
        data = catalog_service.catalog_update(pk, request.data)
        if not data:
            return Response(envelope(False, 'Not found'), status=404)
        return Response(envelope(True, 'Service updated', data=data))


class ServiceCatalogSeedView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'documents.manage'

    def post(self, request):
        n = catalog_service.seed_catalog()
        return Response(envelope(True, 'Seed complete', data={'created': n}))
