from django.urls import path

from .views import (
    DocumentAnalyticsView,
    DocumentRequestDetailView,
    DocumentRequestListView,
    DocumentResourcesListView,
    DocumentSlaRulesListView,
    DocumentTemplatesListView,
    DocumentTypesListView,
    DocumentWorkflowsListView,
    DocumentsDashboardView,
    ServiceCatalogDetailView,
    ServiceCatalogListCreateView,
    ServiceCatalogSeedView,
)

urlpatterns = [
    path('admin/documents/dashboard', DocumentsDashboardView.as_view()),
    path('admin/documents/requests', DocumentRequestListView.as_view()),
    path('admin/documents/requests/<uuid:uuid>', DocumentRequestDetailView.as_view()),
    path('admin/documents/types', DocumentTypesListView.as_view()),
    path('admin/documents/workflows', DocumentWorkflowsListView.as_view()),
    path('admin/documents/resources', DocumentResourcesListView.as_view()),
    path('admin/documents/templates', DocumentTemplatesListView.as_view()),
    path('admin/documents/sla-rules', DocumentSlaRulesListView.as_view()),
    path('admin/documents/analytics', DocumentAnalyticsView.as_view()),
    path('admin/documents/catalog', ServiceCatalogListCreateView.as_view()),
    path('admin/documents/catalog/seed', ServiceCatalogSeedView.as_view()),
    path('admin/documents/catalog/<int:pk>', ServiceCatalogDetailView.as_view()),
]
