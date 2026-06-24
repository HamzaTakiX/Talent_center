from django.contrib import admin

from .models import AiCoachSession, AiConversation


@admin.register(AiCoachSession)
class AiCoachSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'user', 'title', 'mode', 'is_archived', 'updated_at')
    list_filter = ('is_archived', 'mode', 'updated_at')
    search_fields = ('title', 'user__email', 'session_id')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(AiConversation)
class AiConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_id', 'role', 'mode', 'created_at')
    list_filter = ('role', 'mode', 'created_at')
    search_fields = ('message', 'user__email', 'session_id')
    readonly_fields = ('created_at',)
