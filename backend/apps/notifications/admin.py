from django.contrib import admin

from .models import (
    Notification,
    NotificationEvent,
    NotificationPreference,
    NotificationRecipient,
    NotificationReminder,
)


class NotificationRecipientInline(admin.TabularInline):
    model = NotificationRecipient
    extra = 0
    fields = ('user', 'delivery_channel', 'status', 'attempts', 'sent_at')
    readonly_fields = ('attempts', 'sent_at')
    autocomplete_fields = ('user',)


@admin.register(NotificationEvent)
class NotificationEventAdmin(admin.ModelAdmin):
    list_display = ('event_code', 'source_app', 'entity_type', 'entity_id', 'triggered_by', 'triggered_at')
    list_filter = ('source_app', 'event_code')
    search_fields = ('event_code', 'source_app', 'entity_type')
    readonly_fields = ('triggered_at',)
    autocomplete_fields = ('triggered_by',)
    inlines = [NotificationRecipientInline]
    date_hierarchy = 'triggered_at'


@admin.register(NotificationRecipient)
class NotificationRecipientAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'delivery_channel', 'status', 'attempts', 'sent_at')
    list_filter = ('delivery_channel', 'status')
    search_fields = ('user__email',)
    autocomplete_fields = ('event', 'user')


class NotificationReminderInline(admin.TabularInline):
    model = NotificationReminder
    extra = 0
    fields = ('remind_at', 'status', 'sent_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'notification_type', 'title', 'is_read', 'is_archived', 'created_at')
    list_filter = ('is_read', 'is_archived', 'notification_type')
    search_fields = ('title', 'body', 'recipient__email')
    autocomplete_fields = ('recipient', 'event')
    inlines = [NotificationReminderInline]
    date_hierarchy = 'created_at'


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'channel', 'is_enabled', 'frequency')
    list_filter = ('channel', 'is_enabled', 'frequency')
    search_fields = ('user__email', 'notification_type')
    autocomplete_fields = ('user',)


@admin.register(NotificationReminder)
class NotificationReminderAdmin(admin.ModelAdmin):
    list_display = ('notification', 'remind_at', 'status', 'sent_at')
    list_filter = ('status',)
    autocomplete_fields = ('notification',)
    date_hierarchy = 'remind_at'
