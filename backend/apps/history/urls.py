from django.urls import path

from .views import (
    HistoryDashboardView,
    HistoryEntityTimelineView,
    HistoryEventDetailView,
    HistoryEventListView,
    HistoryExportCreateView,
    HistoryExportDownloadView,
    HistoryGlobalCenterView,
)

urlpatterns = [
    path('events', HistoryEventListView.as_view(), name='history-events'),
    path('events/<int:event_id>', HistoryEventDetailView.as_view(), name='history-event-detail'),
    path(
        'entity/<str:entity_type>/<int:entity_id>',
        HistoryEntityTimelineView.as_view(),
        name='history-entity-timeline',
    ),
    path('dashboard', HistoryDashboardView.as_view(), name='history-dashboard'),
    path('center', HistoryGlobalCenterView.as_view(), name='history-center'),
    path('exports', HistoryExportCreateView.as_view(), name='history-exports'),
    path('exports/<uuid:export_uuid>/download', HistoryExportDownloadView.as_view(), name='history-export-download'),
]
