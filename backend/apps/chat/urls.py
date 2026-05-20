from django.urls import path

from .views import (
    ChatChannelListView,
    ChatConversationDetailView,
    ChatConversationListView,
    ChatInboxSummaryView,
    ChatMarkReadView,
    ChatMessageListView,
    ChatReactionView,
    ChatSmartActionView,
    ChatTagListView,
    ChatTypingView,
)

urlpatterns = [
    path('channels', ChatChannelListView.as_view()),
    path('tags', ChatTagListView.as_view()),
    path('inbox/summary', ChatInboxSummaryView.as_view()),
    path('conversations', ChatConversationListView.as_view()),
    path('conversations/<int:conversation_id>', ChatConversationDetailView.as_view()),
    path('conversations/<int:conversation_id>/messages', ChatMessageListView.as_view()),
    path('conversations/<int:conversation_id>/read', ChatMarkReadView.as_view()),
    path('conversations/<int:conversation_id>/typing', ChatTypingView.as_view()),
    path('conversations/<int:conversation_id>/actions', ChatSmartActionView.as_view()),
    path('messages/<int:message_id>/reactions', ChatReactionView.as_view()),
]
