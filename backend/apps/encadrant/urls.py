from django.urls import path

from .views_reports import (
    EncadrantReportAttachmentView,
    EncadrantReportDetailView,
    EncadrantReportSubmitView,
    EncadrantReportsListCreateView,
    EncadrantReportTemplatesView,
)

urlpatterns = [
    path('reports', EncadrantReportsListCreateView.as_view(), name='encadrant-reports'),
    path('reports/templates', EncadrantReportTemplatesView.as_view(), name='encadrant-report-templates'),
    path('reports/<int:report_id>', EncadrantReportDetailView.as_view(), name='encadrant-report-detail'),
    path('reports/<int:report_id>/submit', EncadrantReportSubmitView.as_view(), name='encadrant-report-submit'),
    path(
        'reports/<int:report_id>/attachments',
        EncadrantReportAttachmentView.as_view(),
        name='encadrant-report-attachments',
    ),
]
