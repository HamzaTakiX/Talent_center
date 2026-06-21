from django.http import FileResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.pagination import paginate_queryset, paginated_payload
from apps.authentication.utils import envelope
from apps.history.models import HistoryEvent, HistoryExportLog
from apps.history.permissions import (
    history_export_permissions,
    history_global_permissions,
    history_read_permissions,
)
from apps.history.serializers import (
    HistoryEventDetailSerializer,
    HistoryEventListSerializer,
    HistoryExportLogSerializer,
)
from apps.history.services.analytics import build_audit_dashboard, build_dashboard, build_insights
from apps.history.services.export import create_csv_export
from apps.history.services.queries import apply_list_filters, base_queryset, entity_timeline
from apps.history.services.visibility import filter_events_for_user


class HistoryEventListView(APIView):
    permission_classes = history_read_permissions()

    def get(self, request):
        qs = apply_list_filters(base_queryset(request.user), request.query_params)
        items, meta = paginate_queryset(qs, request, default_page_size=25, max_page_size=100)
        ser = HistoryEventListSerializer(items, many=True)
        return Response(envelope(True, 'History loaded', data=paginated_payload(ser.data, meta)))


class HistoryEventDetailView(APIView):
    permission_classes = history_read_permissions()

    def get(self, request, event_id: int):
        qs = filter_events_for_user(HistoryEvent.objects.all(), request.user)
        event = qs.filter(pk=event_id).prefetch_related('metadata_entries', 'targets').first()
        if not event:
            return Response(envelope(False, 'Event not found'), status=404)
        ser = HistoryEventDetailSerializer(event, context={'request': request})
        return Response(envelope(True, 'Event detail', data=ser.data))


class HistoryEntityTimelineView(APIView):
    """Local history for a specific entity."""

    permission_classes = history_read_permissions()

    def get(self, request, entity_type: str, entity_id: int):
        qs = entity_timeline(request.user, entity_type, int(entity_id))
        items, meta = paginate_queryset(qs, request, default_page_size=50, max_page_size=200)
        ser = HistoryEventListSerializer(items, many=True)
        return Response(envelope(True, 'Entity timeline', data=paginated_payload(ser.data, meta)))


class HistoryDashboardView(APIView):
    permission_classes = history_read_permissions()

    def get(self, request):
        kpi = (request.query_params.get('kpi') or request.query_params.get('kpi_key') or '').strip() or None
        lite = (request.query_params.get('lite') or '').lower() in ('1', 'true', 'yes')
        if lite:
            return Response(envelope(True, 'Dashboard', data=build_audit_dashboard(request.user, kpi=kpi)))
        return Response(envelope(True, 'Dashboard', data=build_dashboard(request.user, kpi=kpi)))


class HistoryExportCreateView(APIView):
    permission_classes = history_export_permissions()

    def post(self, request):
        export_type = (request.data.get('export_type') or 'CSV').upper()
        if export_type != 'CSV':
            return Response(envelope(False, 'Only CSV export is supported currently'), status=400)
        filters = request.data.get('filters') or {}
        try:
            export_log = create_csv_export(request.user, filters=filters)
        except Exception as exc:
            return Response(envelope(False, str(exc)), status=500)
        ser = HistoryExportLogSerializer(export_log, context={'request': request})
        return Response(envelope(True, 'Export ready', data=ser.data), status=201)


class HistoryExportDownloadView(APIView):
    permission_classes = history_export_permissions()

    def get(self, request, export_uuid):
        export_log = HistoryExportLog.objects.filter(
            uuid=export_uuid,
            requested_by=request.user,
        ).first()
        if not export_log or not export_log.file:
            return Response(envelope(False, 'Export not found'), status=404)
        return FileResponse(export_log.file.open('rb'), as_attachment=True, filename=export_log.file.name)


class HistoryInsightsView(APIView):
    permission_classes = history_read_permissions()

    def get(self, request):
        return Response(
            envelope(True, 'Insights', data={'items': build_insights(request.user)}),
        )


class HistoryGlobalCenterView(APIView):
    """Combined payload for admin history center (dashboard + first page)."""

    permission_classes = history_read_permissions()

    def get(self, request):
        qs = apply_list_filters(base_queryset(request.user), request.query_params)
        items, meta = paginate_queryset(qs, request, default_page_size=25, max_page_size=100)
        ser = HistoryEventListSerializer(items, many=True)
        kpi = (request.query_params.get('kpi') or request.query_params.get('kpi_key') or '').strip()
        return Response(
            envelope(
                True,
                'History center',
                data={
                    'dashboard': build_dashboard(
                        request.user,
                        queryset=filter_events_for_user(HistoryEvent.objects.all(), request.user),
                        kpi=kpi or None,
                    ),
                    'timeline': paginated_payload(ser.data, meta),
                },
            )
        )
