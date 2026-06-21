from django.contrib import admin

from .models import (
    Notification,
    NotificationDeliveryLog,
    NotificationDigestBatch,
    NotificationEvent,
    NotificationEventDedup,
    NotificationPreference,
    NotificationProviderHealth,
    NotificationRateLimit,
    NotificationRecipient,
    NotificationReminder,
    NotificationTemplate,
    NotificationTemplateTranslation,
)


class NotificationRecipientInline(admin.TabularInline):
    model = NotificationRecipient
    extra = 0
    fields = ('user', 'delivery_channel', 'status', 'template_code', 'attempts', 'sent_at')
    readonly_fields = ('attempts', 'sent_at')
    autocomplete_fields = ('user',)


class NotificationTemplateTranslationInline(admin.TabularInline):
    model = NotificationTemplateTranslation
    extra = 0


@admin.register(NotificationEvent)
class NotificationEventAdmin(admin.ModelAdmin):
    list_display = ('event_code', 'source_app', 'status', 'priority', 'entity_type', 'triggered_at')
    list_filter = ('source_app', 'event_code', 'status', 'priority')
    search_fields = ('event_code', 'source_app', 'idempotency_key')
    readonly_fields = ('triggered_at', 'processed_at')
    autocomplete_fields = ('triggered_by',)
    inlines = [NotificationRecipientInline]
    date_hierarchy = 'triggered_at'


@admin.register(NotificationRecipient)
class NotificationRecipientAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'delivery_channel', 'status', 'template_code', 'attempts', 'provider')
    list_filter = ('delivery_channel', 'status', 'provider')
    search_fields = ('user__email', 'template_code', 'provider_message_id')
    autocomplete_fields = ('event', 'user', 'digest_batch')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'notification_type', 'title', 'is_read', 'is_archived', 'created_at')
    list_filter = ('is_read', 'is_archived', 'notification_type')
    search_fields = ('title', 'body', 'recipient__email')
    autocomplete_fields = ('recipient', 'event')


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'channel', 'is_enabled', 'frequency')
    list_filter = ('category', 'channel', 'is_enabled', 'frequency')
    search_fields = ('user__email',)
    autocomplete_fields = ('user',)


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ('code', 'channel', 'category', 'version', 'is_active')
    list_filter = ('channel', 'category', 'is_active')
    search_fields = ('code',)
    inlines = [NotificationTemplateTranslationInline]


@admin.register(NotificationDeliveryLog)
class NotificationDeliveryLogAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'channel', 'status', 'template_code', 'provider', 'attempt_number', 'created_at')
    list_filter = ('channel', 'status', 'provider')
    readonly_fields = ('created_at',)


@admin.register(NotificationDigestBatch)
class NotificationDigestBatchAdmin(admin.ModelAdmin):
    list_display = ('user', 'frequency', 'status', 'period_start', 'period_end', 'sent_at')
    list_filter = ('frequency', 'status')
    search_fields = ('user__email',)


@admin.register(NotificationProviderHealth)
class NotificationProviderHealthAdmin(admin.ModelAdmin):
    list_display = ('provider', 'channel', 'is_healthy', 'consecutive_failures', 'last_success_at')


@admin.register(NotificationEventDedup)
class NotificationEventDedupAdmin(admin.ModelAdmin):
    list_display = ('idempotency_key', 'event', 'expires_at', 'created_at')


@admin.register(NotificationRateLimit)
class NotificationRateLimitAdmin(admin.ModelAdmin):
    list_display = ('user', 'channel', 'template_code', 'count', 'limit_value', 'window_start')


@admin.register(NotificationReminder)
class NotificationReminderAdmin(admin.ModelAdmin):
    list_display = ('notification', 'remind_at', 'status', 'sent_at')
    list_filter = ('status',)
    autocomplete_fields = ('notification',)
