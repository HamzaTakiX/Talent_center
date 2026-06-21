from django.urls import path

from apps.notifications.api import admin_views, views

urlpatterns = [
    path('feed/', views.NotificationFeedView.as_view(), name='notification-feed'),
    path('feed/unread-count/', views.NotificationUnreadCountView.as_view(), name='notification-unread-count'),
    path('feed/read-all/', views.NotificationMarkAllReadView.as_view(), name='notification-read-all'),
    path('feed/<int:notification_id>/read/', views.NotificationMarkReadView.as_view(), name='notification-read'),
    path('feed/<int:notification_id>/archive/', views.NotificationArchiveView.as_view(), name='notification-archive'),
    path('preferences/', views.NotificationPreferencesView.as_view(), name='notification-preferences'),
    path('preferences/categories/', views.NotificationCategoriesView.as_view(), name='notification-categories'),
    path('webhooks/sendgrid/', admin_views.SendGridWebhookView.as_view(), name='sendgrid-webhook'),
]
