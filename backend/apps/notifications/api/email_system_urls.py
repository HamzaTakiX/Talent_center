from django.urls import path

from apps.notifications.api import email_system_views

urlpatterns = [
    path('', email_system_views.EmailSystemBootstrapView.as_view()),
    path('general/', email_system_views.EmailGeneralSettingsView.as_view()),
    path('provider/', email_system_views.EmailProviderView.as_view()),
    path('provider/validate/', email_system_views.EmailProviderValidateView.as_view()),
    path('provider/connect/', email_system_views.EmailProviderConnectView.as_view()),
    path('provider/disconnect/', email_system_views.EmailProviderDisconnectView.as_view()),
    path('provider/test/', email_system_views.EmailProviderTestView.as_view()),
    path('provider/health/', email_system_views.EmailProviderHealthView.as_view()),
    path('senders/', email_system_views.EmailSenderListCreateView.as_view()),
    path('senders/<int:sender_id>/', email_system_views.EmailSenderDetailView.as_view()),
    path('senders/<int:sender_id>/default/', email_system_views.EmailSenderSetDefaultView.as_view()),
    path('senders/<int:sender_id>/verify/', email_system_views.EmailSenderVerifyView.as_view()),
    path('categories/', email_system_views.EmailCategoryListView.as_view()),
    path('templates/', email_system_views.EmailTemplateListView.as_view()),
    path('templates/<slug:template_code>/', email_system_views.EmailTemplateDetailView.as_view()),
    path('templates/<slug:template_code>/preview/', email_system_views.EmailTemplatePreviewView.as_view()),
    path('templates/<slug:template_code>/test/', email_system_views.EmailTemplateTestView.as_view()),
    path('analytics/', email_system_views.EmailAnalyticsOverviewView.as_view()),
    path('queue/', email_system_views.EmailQueueView.as_view()),
    path('queue/<int:recipient_id>/retry/', email_system_views.EmailQueueRetryView.as_view()),
    path('queue/<int:recipient_id>/cancel/', email_system_views.EmailQueueCancelView.as_view()),
    path('test/', email_system_views.EmailTestCenterView.as_view()),
    path('advanced/', email_system_views.EmailAdvancedSettingsView.as_view()),
    path('audit/', email_system_views.EmailSystemAuditView.as_view()),
]
