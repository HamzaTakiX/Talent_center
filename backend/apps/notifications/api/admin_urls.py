from django.urls import path

from apps.notifications.api import admin_views

urlpatterns = [
    path('queue/', admin_views.AdminNotificationQueueView.as_view()),
    path('failed/', admin_views.AdminNotificationFailedView.as_view()),
    path('failed/<int:recipient_id>/retry/', admin_views.AdminNotificationRetryView.as_view()),
    path('analytics/overview/', admin_views.AdminNotificationAnalyticsOverviewView.as_view()),
    path('analytics/templates/', admin_views.AdminNotificationAnalyticsTemplatesView.as_view()),
    path('providers/health/', admin_views.AdminNotificationProviderHealthView.as_view()),
    path('events/', admin_views.AdminNotificationEventsView.as_view()),
    path('matrix/', admin_views.AdminNotificationEventMatrixView.as_view()),
]
