from django.contrib import admin

from .models import (
    Channel,
    Conversation,
    ConversationParticipant,
    Mention,
    Message,
    MessageAttachment,
    MessageTag,
    Tag,
)


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'channel_type', 'is_archived', 'created_by', 'updated_at')
    list_filter = ('channel_type', 'is_archived')
    search_fields = ('code', 'name', 'description')
    autocomplete_fields = ('created_by',)


class ConversationParticipantInline(admin.TabularInline):
    model = ConversationParticipant
    extra = 0
    fields = ('user', 'role', 'joined_at', 'left_at', 'is_muted', 'last_read_message_id')
    readonly_fields = ('joined_at',)
    autocomplete_fields = ('user',)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'channel', 'conversation_type', 'is_archived', 'last_message_at')
    list_filter = ('conversation_type', 'is_archived')
    search_fields = ('title',)
    autocomplete_fields = ('channel', 'created_by')
    inlines = [ConversationParticipantInline]


@admin.register(ConversationParticipant)
class ConversationParticipantAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'user', 'role', 'joined_at', 'left_at', 'is_muted')
    list_filter = ('role', 'is_muted')
    search_fields = ('user__email',)
    autocomplete_fields = ('conversation', 'user')


class MessageAttachmentInline(admin.TabularInline):
    model = MessageAttachment
    extra = 0
    fields = ('attachment_type', 'file', 'original_filename', 'mime_type', 'file_size_bytes')
    readonly_fields = ('file_size_bytes',)


class MentionInline(admin.TabularInline):
    model = Mention
    extra = 0
    fields = ('mentioned_user', 'offset_start', 'offset_end', 'read_at')
    autocomplete_fields = ('mentioned_user',)


class MessageTagInline(admin.TabularInline):
    model = MessageTag
    extra = 0
    fields = ('tag', 'tagged_by', 'created_at')
    readonly_fields = ('created_at',)
    autocomplete_fields = ('tag', 'tagged_by')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'message_type', 'is_edited', 'created_at')
    list_filter = ('message_type', 'is_edited')
    search_fields = ('body', 'sender__email')
    autocomplete_fields = ('conversation', 'sender', 'parent_message')
    inlines = [MessageAttachmentInline, MentionInline, MessageTagInline]
    date_hierarchy = 'created_at'


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    list_display = ('message', 'attachment_type', 'original_filename', 'file_size_bytes', 'created_at')
    list_filter = ('attachment_type',)
    autocomplete_fields = ('message',)


@admin.register(Mention)
class MentionAdmin(admin.ModelAdmin):
    list_display = ('message', 'mentioned_user', 'read_at', 'created_at')
    list_filter = ('read_at',)
    search_fields = ('mentioned_user__email',)
    autocomplete_fields = ('message', 'mentioned_user')


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'color', 'is_system')
    list_filter = ('is_system',)
    search_fields = ('code', 'name', 'description')


@admin.register(MessageTag)
class MessageTagAdmin(admin.ModelAdmin):
    list_display = ('message', 'tag', 'tagged_by', 'created_at')
    autocomplete_fields = ('message', 'tag', 'tagged_by')
