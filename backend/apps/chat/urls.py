from django.urls import path

from .views import (
    ChatAttachmentDownloadView,
    ChatChannelListView,
    ChatContextPanelView,
    ChatConversationDetailView,
    ChatConversationExportView,
    ChatConversationListView,
    ChatInboxSummaryView,
    ChatMarkReadView,
    ChatMessageListView,
    ChatModuleMetricsView,
    ChatPresenceView,
    ChatReactionView,
    ChatSmartActionView,
    ChatTagListView,
    ChatTypingView,
)

urlpatterns = [
    path('channels', ChatChannelListView.as_view()),
    path('tags', ChatTagListView.as_view()),
    path('inbox/summary', ChatInboxSummaryView.as_view()),
    path('modules/<str:module>/metrics', ChatModuleMetricsView.as_view()),
    path('presence/<int:user_id>', ChatPresenceView.as_view()),
    path('conversations', ChatConversationListView.as_view()),
    path('conversations/<int:conversation_id>', ChatConversationDetailView.as_view()),
    path('conversations/<int:conversation_id>/context-panel', ChatContextPanelView.as_view()),
    path('conversations/<int:conversation_id>/export', ChatConversationExportView.as_view()),
    path('conversations/<int:conversation_id>/messages', ChatMessageListView.as_view()),
    path('attachments/<int:attachment_id>/download', ChatAttachmentDownloadView.as_view()),
    path('conversations/<int:conversation_id>/read', ChatMarkReadView.as_view()),
    path('conversations/<int:conversation_id>/typing', ChatTypingView.as_view()),
    path('conversations/<int:conversation_id>/actions', ChatSmartActionView.as_view()),
    path('messages/<int:message_id>/reactions', ChatReactionView.as_view()),
]
