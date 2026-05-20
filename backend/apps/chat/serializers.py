"""Chat API serializers."""

from __future__ import annotations

from rest_framework import serializers

from apps.accounts_et_roles.models import User

from .models import (
    Channel,
    Conversation,
    ConversationContext,
    ConversationParticipant,
    Message,
    MessageAttachment,
    MessageReaction,
    Tag,
)
from .services.message_service import unread_count_for_user


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'code', 'name', 'color', 'is_system')


class ChannelListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ('id', 'code', 'name', 'description', 'channel_type', 'is_archived')


class ParticipantSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = ConversationParticipant
        fields = ('user_id', 'email', 'full_name', 'role', 'is_muted', 'last_read_message_id')

    def get_full_name(self, obj) -> str:
        u = obj.user
        return f'{u.first_name} {u.last_name}'.strip() or u.email


class ConversationContextSerializer(serializers.ModelSerializer):
    student_user_id = serializers.IntegerField(allow_null=True, read_only=True)

    class Meta:
        model = ConversationContext
        fields = (
            'module',
            'context_kind',
            'entity_type',
            'entity_id',
            'entity_label',
            'workflow_status',
            'urgency',
            'student_user_id',
            'is_internal_only',
            'context_snapshot_json',
        )


class ConversationListSerializer(serializers.ModelSerializer):
    context = ConversationContextSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    last_preview = serializers.SerializerMethodField()
    participants = ParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = (
            'id',
            'title',
            'conversation_type',
            'last_message_at',
            'context',
            'unread_count',
            'last_preview',
            'participants',
            'metadata_json',
        )

    def get_unread_count(self, obj) -> int:
        user = self.context['request'].user
        return unread_count_for_user(user, obj.pk)

    def get_last_preview(self, obj) -> str:
        msg = obj.messages.filter(deleted_at__isnull=True).order_by('-created_at').first()
        if not msg:
            return ''
        return (msg.body or '')[:120]


class MessageAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MessageAttachment
        fields = (
            'id',
            'attachment_type',
            'original_filename',
            'file_size_bytes',
            'mime_type',
            'file_url',
        )

    def get_file_url(self, obj) -> str | None:
        request = self.context.get('request')
        if not obj.file:
            return None
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url


class MessageReactionSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = MessageReaction
        fields = ('user_id', 'emoji_code', 'created_at')


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(allow_null=True, read_only=True)
    sender_name = serializers.SerializerMethodField()
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()
    reactions = MessageReactionSerializer(many=True, read_only=True)
    is_own = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            'id',
            'conversation_id',
            'sender_id',
            'sender_name',
            'parent_message_id',
            'body',
            'message_type',
            'is_edited',
            'created_at',
            'metadata_json',
            'attachments',
            'tags',
            'reactions',
            'is_own',
        )

    def get_sender_name(self, obj) -> str:
        if not obj.sender:
            return 'System'
        return f'{obj.sender.first_name} {obj.sender.last_name}'.strip() or obj.sender.email

    def get_tags(self, obj) -> list[str]:
        return [mt.tag.code for mt in obj.message_tags.select_related('tag').all()]

    def get_is_own(self, obj) -> bool:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.sender_id == request.user.pk


class ConversationCreateSerializer(serializers.Serializer):
    module = serializers.ChoiceField(choices=ConversationContext.Module.choices)
    entity_type = serializers.CharField(max_length=64)
    entity_id = serializers.CharField(max_length=64)
    title = serializers.CharField(max_length=255)
    context_kind = serializers.ChoiceField(
        choices=ConversationContext.ContextKind.choices,
        default=ConversationContext.ContextKind.WORKFLOW_THREAD,
    )
    entity_label = serializers.CharField(max_length=255, required=False, default='')
    workflow_status = serializers.CharField(max_length=64, required=False, default='')
    urgency = serializers.ChoiceField(
        choices=ConversationContext.Urgency.choices,
        required=False,
        default=ConversationContext.Urgency.NONE,
    )
    student_user_id = serializers.IntegerField(required=False, allow_null=True)
    is_internal_only = serializers.BooleanField(default=False)
    context_snapshot_json = serializers.JSONField(required=False, default=dict)
    participant_user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )


class MessageCreateSerializer(serializers.Serializer):
    body = serializers.CharField()
    message_type = serializers.ChoiceField(
        choices=Message.MessageType.choices,
        default=Message.MessageType.TEXT,
    )
    parent_message_id = serializers.IntegerField(required=False, allow_null=True)
    tag_codes = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    metadata_json = serializers.JSONField(required=False, default=dict)


class SmartActionSerializer(serializers.Serializer):
    action_code = serializers.CharField(max_length=64)
    payload = serializers.JSONField(required=False, default=dict)
