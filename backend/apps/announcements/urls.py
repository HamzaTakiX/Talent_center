from django.urls import path

from .views import (
    AnnouncementActionView,
    AnnouncementAnalyticsView,
    AnnouncementAttachmentUploadView,
    AnnouncementBulkActionView,
    AnnouncementCoverUploadView,
    AnnouncementDashboardView,
    AnnouncementDetailView,
    AnnouncementEngagementView,
    AnnouncementInsightsView,
    AnnouncementListCreateView,
    AnnouncementTypeListView,
    AnnouncementTypeManageView,
    AnnouncementTypeSeedView,
    StudentAnnouncementFeedView,
)

urlpatterns = [
    path('admin/announcements/dashboard', AnnouncementDashboardView.as_view()),
    path('admin/announcements', AnnouncementListCreateView.as_view()),
    path('admin/announcements/bulk', AnnouncementBulkActionView.as_view()),
    path('admin/announcements/analytics', AnnouncementAnalyticsView.as_view()),
    path('admin/announcements/insights', AnnouncementInsightsView.as_view()),
    path('admin/announcements/engagement', AnnouncementEngagementView.as_view()),
    path('admin/announcements/types', AnnouncementTypeListView.as_view()),
    path('admin/announcements/types/seed', AnnouncementTypeSeedView.as_view()),
    path('admin/announcements/types/<int:pk>', AnnouncementTypeManageView.as_view()),
    path('admin/announcements/<uuid:uuid>', AnnouncementDetailView.as_view()),
    path('admin/announcements/<uuid:uuid>/<str:action>', AnnouncementActionView.as_view()),
    path('admin/announcements/<uuid:uuid>/attachments', AnnouncementAttachmentUploadView.as_view()),
    path('admin/announcements/<uuid:uuid>/cover', AnnouncementCoverUploadView.as_view()),
    path('student/announcements/feed', StudentAnnouncementFeedView.as_view()),
]
