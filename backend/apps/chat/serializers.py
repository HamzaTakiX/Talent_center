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
        profile = getattr(u, 'profile', None)
        if profile:
            from_profile = f'{profile.first_name} {profile.last_name}'.strip()
            if from_profile:
                return from_profile
        return f'{u.first_name} {u.last_name}'.strip() or u.email


class ConversationContextSerializer(serializers.ModelSerializer):
    student_user_id = serializers.IntegerField(allow_null=True, read_only=True)
    company_logo_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    student_avatar_url = serializers.SerializerMethodField()
    student_display_name = serializers.SerializerMethodField()
    announcement_published_at = serializers.SerializerMethodField()
    announcement_publish_end_at = serializers.SerializerMethodField()

    class Meta:
        model = ConversationContext
        fields = (
            'module',
            'context_kind',
            'entity_type',
            'entity_id',
            'entity_label',
            'workflow_status',
            'conversation_type',
            'workflow_state',
            'urgency',
            'assigned_to_id',
            'student_user_id',
            'is_internal_only',
            'context_snapshot_json',
            'company_logo_url',
            'cover_image_url',
            'student_avatar_url',
            'student_display_name',
            'announcement_published_at',
            'announcement_publish_end_at',
        )

    def _resolve_student_profile(self, obj):
        from apps.stage.services.chat_service import resolve_student_for_context

        return resolve_student_for_context(
            student_user_id=obj.student_user_id,
            snapshot=obj.context_snapshot_json or {},
        )

    def get_student_display_name(self, obj) -> str:
        from apps.stage.services.chat_service import resolve_student_display_name_for_context

        return resolve_student_display_name_for_context(
            student_user_id=obj.student_user_id,
            snapshot=obj.context_snapshot_json or {},
        )

    def get_student_avatar_url(self, obj) -> str | None:
        snap = obj.context_snapshot_json or {}
        cached = snap.get('student_avatar_url')
        if cached:
            return str(cached)
        from apps.stage.services.chat_service import _student_avatar_url

        student = self._resolve_student_profile(obj)
        if not student:
            return None
        return _student_avatar_url(student, self.context.get('request'))

    def get_company_logo_url(self, obj) -> str | None:
        snap = obj.context_snapshot_json or {}
        cached = snap.get('company_logo_url')
        if cached:
            return str(cached)
        offer_uuid = snap.get('offer_uuid')
        if not offer_uuid:
            return None
        from apps.stage.models import InternshipOffer

        offer = (
            InternshipOffer.objects.filter(uuid=offer_uuid)
            .select_related('company')
            .first()
        )
        if not offer:
            return None
        from apps.stage.services.chat_service import _offer_company_logo_url

        return _offer_company_logo_url(offer, self.context.get('request'))

    def get_cover_image_url(self, obj) -> str | None:
        snap = obj.context_snapshot_json or {}
        cached = snap.get('cover_image_url')
        if cached:
            request = self.context.get('request')
            value = str(cached)
            if value.startswith('/') and request:
                return request.build_absolute_uri(value)
            return value
        announcement_uuid = snap.get('announcement_uuid')
        if not announcement_uuid:
            return None
        from apps.announcements.models import Announcement

        announcement = Announcement.objects.filter(uuid=announcement_uuid).first()
        if not announcement:
            return None
        from apps.announcements.services.chat_service import _cover_url

        return _cover_url(announcement, self.context.get('request'))

    def _resolve_announcement_from_snapshot(self, obj):
        from apps.chat.models import ConversationContext

        if obj.module != ConversationContext.Module.ANNOUNCEMENTS:
            return None
        snap = obj.context_snapshot_json or {}
        announcement_uuid = snap.get('announcement_uuid')
        if not announcement_uuid:
            return None
        from apps.announcements.models import Announcement

        return (
            Announcement.objects.filter(uuid=announcement_uuid)
            .only('published_at', 'publish_start_at', 'publish_end_at', 'application_deadline', 'created_at')
            .first()
        )

    def get_announcement_published_at(self, obj) -> str | None:
        snap = obj.context_snapshot_json or {}
        cached = snap.get('published_at')
        if cached:
            return str(cached)
        announcement = self._resolve_announcement_from_snapshot(obj)
        if not announcement:
            return None
        dt = announcement.published_at or announcement.publish_start_at or announcement.created_at
        return dt.isoformat() if dt else None

    def get_announcement_publish_end_at(self, obj) -> str | None:
        snap = obj.context_snapshot_json or {}
        cached = snap.get('publish_end_at') or snap.get('application_deadline')
        if cached:
            return str(cached)
        announcement = self._resolve_announcement_from_snapshot(obj)
        if not announcement:
            return None
        dt = announcement.publish_end_at or announcement.application_deadline
        return dt.isoformat() if dt else None


class ConversationListSerializer(serializers.ModelSerializer):
    context = ConversationContextSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    last_preview = serializers.SerializerMethodField()
    last_message_is_own = serializers.SerializerMethodField()
    participants = ParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = (
            'id',
            'title',
            'conversation_type',
            'last_message_at',
            'is_archived',
            'context',
            'unread_count',
            'last_preview',
            'last_message_is_own',
            'participants',
            'metadata_json',
        )

    def get_unread_count(self, obj) -> int:
        unread_map = self.context.get('unread_map')
        if unread_map is not None:
            return unread_map.get(obj.pk, 0)
        user = self.context['request'].user
        return unread_count_for_user(user, obj.pk)

    def get_last_preview(self, obj) -> str:
        latest = getattr(obj, '_latest_messages', None)
        if latest:
            return (latest[0].body or '')[:120]
        body = (
            Message.objects.filter(
                conversation_id=obj.pk,
                deleted_at__isnull=True,
                message_type__in=[
                    Message.MessageType.TEXT,
                    Message.MessageType.FILE,
                    Message.MessageType.IMAGE,
                ],
            )
            .order_by('-created_at')
            .values_list('body', flat=True)
            .first()
        )
        return (body or '')[:120]

    def get_last_message_is_own(self, obj) -> bool:
        request = self.context.get('request')
        if not request or not getattr(request.user, 'is_authenticated', False):
            return False
        latest = getattr(obj, '_latest_messages', None)
        if latest:
            return latest[0].sender_id == request.user.pk
        sender_id = (
            Message.objects.filter(
                conversation_id=obj.pk,
                deleted_at__isnull=True,
                message_type__in=[
                    Message.MessageType.TEXT,
                    Message.MessageType.FILE,
                    Message.MessageType.IMAGE,
                ],
            )
            .order_by('-created_at')
            .values_list('sender_id', flat=True)
            .first()
        )
        return sender_id == request.user.pk if sender_id is not None else False


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
    read_by = serializers.SerializerMethodField()
    delivery_status = serializers.SerializerMethodField()

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
            'read_by',
            'delivery_status',
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

    def get_read_by(self, obj) -> list[dict]:
        return [
            {'user_id': r.user_id, 'read_at': r.read_at.isoformat()}
            for r in obj.read_receipts.all()
        ]

    def get_delivery_status(self, obj) -> str:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'sent'
        if obj.sender_id == request.user.pk:
            others_read = obj.read_receipts.exclude(user_id=request.user.pk).exists()
            return 'read' if others_read else 'delivered'
        own_read = obj.read_receipts.filter(user_id=request.user.pk).exists()
        return 'read' if own_read else 'delivered'


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
