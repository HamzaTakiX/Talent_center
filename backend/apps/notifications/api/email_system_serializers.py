"""Serializers for email system admin API."""

from rest_framework import serializers

from apps.notifications.models import NotificationTemplate, NotificationTemplateTranslation
from apps.notifications.models_email_config import (
    EmailCategoryConfig,
    EmailProviderConfig,
    EmailSenderIdentity,
    EmailSystemAuditLog,
    PlatformEmailSettings,
)


class PlatformEmailSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformEmailSettings
        fields = (
            'platform_email_enabled',
            'default_sender_name',
            'default_sender_email',
            'reply_to_email',
            'default_language',
        )


class EmailProviderConfigSerializer(serializers.ModelSerializer):
    api_key_masked = serializers.SerializerMethodField()
    has_api_key = serializers.SerializerMethodField()

    class Meta:
        model = EmailProviderConfig
        fields = (
            'provider',
            'api_key',
            'api_key_masked',
            'has_api_key',
            'domain',
            'region',
            'endpoint',
            'smtp_host',
            'smtp_port',
            'smtp_user',
            'smtp_password',
            'smtp_use_tls',
            'status',
            'is_active',
            'last_validated_at',
            'last_error',
        )
        extra_kwargs = {
            'api_key': {'write_only': True, 'required': False, 'allow_blank': True},
            'smtp_password': {'write_only': True, 'required': False, 'allow_blank': True},
        }

    def get_api_key_masked(self, obj) -> str:
        from apps.notifications.services.email_config_service import mask_secret
        return mask_secret(obj.api_key)

    def get_has_api_key(self, obj) -> bool:
        return bool(obj.api_key)


class EmailSenderIdentitySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailSenderIdentity
        fields = (
            'id',
            'display_name',
            'email_address',
            'module',
            'status',
            'is_default',
            'is_verified',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class EmailCategoryConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailCategoryConfig
        fields = (
            'id',
            'category',
            'label',
            'email_enabled',
            'in_app_enabled',
            'digest_enabled',
            'sort_order',
        )
        read_only_fields = ('id', 'category', 'label', 'sort_order')


class EmailTemplateListSerializer(serializers.ModelSerializer):
    languages = serializers.SerializerMethodField()

    class Meta:
        model = NotificationTemplate
        fields = (
            'id',
            'code',
            'channel',
            'category',
            'version',
            'is_active',
            'languages',
        )

    def get_languages(self, obj) -> list[str]:
        return list(obj.translations.values_list('language', flat=True))


class EmailTemplateTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplateTranslation
        fields = (
            'language',
            'subject_template',
            'body_html_template',
            'body_text_template',
        )


class EmailTemplateDetailSerializer(serializers.ModelSerializer):
    translations = EmailTemplateTranslationSerializer(many=True, read_only=True)

    class Meta:
        model = NotificationTemplate
        fields = (
            'id',
            'code',
            'channel',
            'category',
            'version',
            'is_active',
            'translations',
        )


class EmailTemplateUpdateSerializer(serializers.Serializer):
    language = serializers.CharField(max_length=8)
    subject_template = serializers.CharField()
    body_html_template = serializers.CharField(required=False, allow_blank=True)
    body_text_template = serializers.CharField(required=False, allow_blank=True)


class EmailTestSendSerializer(serializers.Serializer):
    recipient_email = serializers.EmailField()
    template_code = serializers.CharField(required=False, allow_blank=True)
    language = serializers.CharField(max_length=8, default='fr')
    subject = serializers.CharField(required=False, allow_blank=True)
    body_html = serializers.CharField(required=False, allow_blank=True)


class PlatformAdvancedSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformEmailSettings
        fields = (
            'rate_limit_email_per_hour',
            'rate_limit_global_per_minute',
            'max_retry_attempts',
            'queue_max_size',
            'digest_schedule',
            'bounce_handling_enabled',
            'unsubscribe_rules_json',
        )


class EmailSystemAuditLogSerializer(serializers.ModelSerializer):
    changed_by_email = serializers.CharField(source='changed_by.email', read_only=True, default='')

    class Meta:
        model = EmailSystemAuditLog
        fields = (
            'id',
            'changed_by_email',
            'changed_at',
            'change_type',
            'field_name',
            'old_value',
            'new_value',
            'metadata_json',
        )
