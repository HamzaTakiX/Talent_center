from rest_framework import serializers

from apps.notifications.constants import Category
from apps.notifications.models import Notification, NotificationPreference, NotificationRecipient
from apps.notifications.services.display_service import (
    derive_category,
    derive_display_type,
    derive_priority,
    derive_source_module,
    requires_action,
)


class NotificationSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    priority = serializers.SerializerMethodField()
    source_module = serializers.SerializerMethodField()
    display_type = serializers.SerializerMethodField()
    requires_action = serializers.SerializerMethodField()
    metadata = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = (
            'id', 'notification_type', 'display_type', 'title', 'body', 'icon',
            'category', 'priority', 'source_module', 'requires_action',
            'action_url', 'payload_json', 'metadata', 'is_read', 'read_at',
            'is_archived', 'created_at',
        )
        read_only_fields = fields

    def get_category(self, obj: Notification) -> str:
        return derive_category(obj)

    def get_priority(self, obj: Notification) -> str:
        return derive_priority(obj)

    def get_source_module(self, obj: Notification) -> str:
        return derive_source_module(obj)

    def get_display_type(self, obj: Notification) -> str:
        return derive_display_type(obj)

    def get_requires_action(self, obj: Notification) -> bool:
        return requires_action(obj)

    def get_metadata(self, obj: Notification) -> dict:
        payload = dict(obj.payload_json or {})
        event = obj.event
        if event:
            payload.setdefault('event_code', event.event_code)
            payload.setdefault('entity_type', event.entity_type)
            payload.setdefault('entity_id', event.entity_id)
        return payload


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ('category', 'channel', 'is_enabled', 'frequency')
        read_only_fields = ('category', 'channel')


class NotificationPreferenceUpdateSerializer(serializers.Serializer):
    category = serializers.ChoiceField(choices=Category.choices)
    channel = serializers.ChoiceField(choices=NotificationRecipient.Channel.choices)
    is_enabled = serializers.BooleanField()
    frequency = serializers.ChoiceField(choices=NotificationPreference.Frequency.choices)


class QueueRecipientSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    event_code = serializers.CharField(source='event.event_code', read_only=True)

    class Meta:
        model = NotificationRecipient
        fields = (
            'id', 'user_email', 'event_code', 'delivery_channel', 'status',
            'template_code', 'attempts', 'last_error', 'next_retry_at', 'created_at',
        )
