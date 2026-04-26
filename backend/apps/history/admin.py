from django.contrib import admin

from .models import (
    HistoryEvent,
    HistoryEventTarget,
    HistoryExportLog,
    HistoryFilterSaved,
    HistoryMetadata,
    HistoryRetentionRule,
)


class HistoryEventTargetInline(admin.TabularInline):
    model = HistoryEventTarget
    extra = 0
    fields = ('target_role', 'target_entity_type', 'target_entity_id', 'description')
    readonly_fields = ('target_role', 'target_entity_type', 'target_entity_id', 'description')


class HistoryMetadataInline(admin.TabularInline):
    model = HistoryMetadata
    extra = 0
    fields = ('key', 'value', 'value_type')
    readonly_fields = ('key', 'value', 'value_type')


@admin.register(HistoryEvent)
class HistoryEventAdmin(admin.ModelAdmin):
    """Append-only audit projection. Read-only in admin."""

    list_display = (
        'event_code', 'source_app', 'action_code', 'entity_type', 'entity_id',
        'actor_user', 'severity', 'occurred_at',
    )
    list_filter = ('source_app', 'severity', 'action_code')
    search_fields = ('event_code', 'entity_type', 'actor_email', 'session_id')
    readonly_fields = (
        'event_code', 'source_app', 'action_code', 'entity_type', 'entity_id',
        'actor_user', 'actor_email', 'severity', 'payload_json', 'ip_address',
        'user_agent', 'session_id', 'correlation_id', 'occurred_at', 'created_at',
    )
    autocomplete_fields = ('actor_user',)
    inlines = [HistoryEventTargetInline, HistoryMetadataInline]
    date_hierarchy = 'occurred_at'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        # Allow only superusers to delete (e.g. for retention rule manual cleanup).
        return request.user.is_superuser


@admin.register(HistoryEventTarget)
class HistoryEventTargetAdmin(admin.ModelAdmin):
    list_display = ('event', 'target_role', 'target_entity_type', 'target_entity_id', 'description')
    list_filter = ('target_role', 'target_entity_type')
    search_fields = ('target_entity_type', 'description')
    autocomplete_fields = ('event',)


@admin.register(HistoryMetadata)
class HistoryMetadataAdmin(admin.ModelAdmin):
    list_display = ('event', 'key', 'value_type', 'value')
    list_filter = ('value_type',)
    search_fields = ('key', 'value')
    autocomplete_fields = ('event',)


@admin.register(HistoryExportLog)
class HistoryExportLogAdmin(admin.ModelAdmin):
    list_display = ('export_type', 'status', 'requested_by', 'record_count', 'file_size_bytes', 'created_at')
    list_filter = ('export_type', 'status')
    search_fields = ('requested_by__email',)
    readonly_fields = ('uuid', 'started_at', 'completed_at')
    autocomplete_fields = ('requested_by',)
    date_hierarchy = 'created_at'


@admin.register(HistoryFilterSaved)
class HistoryFilterSavedAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_shared', 'use_count', 'last_used_at', 'updated_at')
    list_filter = ('is_shared',)
    search_fields = ('name', 'description', 'owner__email')
    autocomplete_fields = ('owner',)


@admin.register(HistoryRetentionRule)
class HistoryRetentionRuleAdmin(admin.ModelAdmin):
    list_display = (
        'rule_code', 'name', 'retention_days', 'action_on_expiry',
        'entity_type', 'source_app', 'event_code',
        'is_active', 'last_run_at', 'next_run_at', 'last_affected_count',
    )
    list_filter = ('is_active', 'action_on_expiry')
    search_fields = ('rule_code', 'name', 'entity_type', 'source_app', 'event_code')
