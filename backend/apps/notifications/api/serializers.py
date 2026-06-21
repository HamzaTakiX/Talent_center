from rest_framework import serializers

from apps.notifications.constants import Category
from apps.notifications.models import Notification, NotificationPreference, NotificationRecipient


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = (
            'id', 'notification_type', 'title', 'body', 'icon',
            'action_url', 'payload_json', 'is_read', 'read_at',
            'is_archived', 'created_at',
        )
        read_only_fields = fields


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
