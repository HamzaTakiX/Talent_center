from rest_framework import serializers

from apps.history.entity_routes import resolve_entity_path
from apps.history.models import HistoryEvent, HistoryEventTarget, HistoryExportLog, HistoryMetadata


class HistoryMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoryMetadata
        fields = ('key', 'value', 'value_type')


class HistoryTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoryEventTarget
        fields = ('target_entity_type', 'target_entity_id', 'target_role', 'description', 'metadata_json')


class HistoryEventListSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    criticality = serializers.SerializerMethodField()
    old_values = serializers.SerializerMethodField()
    new_values = serializers.SerializerMethodField()
    details = serializers.SerializerMethodField()
    entity_path = serializers.SerializerMethodField()
    metadata = serializers.SerializerMethodField()

    class Meta:
        model = HistoryEvent
        fields = (
            'id',
            'occurred_at',
            'source_app',
            'action_code',
            'event_code',
            'entity_type',
            'entity_id',
            'summary',
            'severity',
            'criticality',
            'actor_user',
            'actor_email',
            'actor_role',
            'actor_name',
            'is_automated',
            'visibility_scope',
            'correlation_id',
            'old_values',
            'new_values',
            'details',
            'entity_path',
            'metadata',
        )

    def get_actor_name(self, obj) -> str:
        if obj.is_automated:
            return 'System'
        if obj.actor_user_id:
            user = obj.actor_user
            full = f'{getattr(user, "first_name", "")} {getattr(user, "last_name", "")}'.strip()
            return full or obj.actor_email or str(obj.actor_user_id)
        return obj.actor_email or 'Unknown'

    def get_criticality(self, obj) -> str:
        if obj.is_automated:
            return 'AUTOMATED'
        if obj.severity in (HistoryEvent.Severity.CRITICAL, HistoryEvent.Severity.ERROR):
            return 'CRITICAL'
        if obj.severity == HistoryEvent.Severity.WARNING:
            return 'IMPORTANT'
        return 'INFO'

    def _payload(self, obj) -> dict:
        return obj.payload_json if isinstance(obj.payload_json, dict) else {}

    def get_old_values(self, obj):
        return self._payload(obj).get('old_values') or {}

    def get_new_values(self, obj):
        return self._payload(obj).get('new_values') or {}

    def get_details(self, obj):
        payload = self._payload(obj)
        return payload.get('details') or payload.get('details_payload') or {}

    def get_metadata(self, obj) -> dict:
        meta = {}
        for entry in obj.metadata_entries.all():
            meta[entry.key] = entry.value
        return meta

    def get_entity_path(self, obj) -> str | None:
        meta = self.get_metadata(obj)
        payload = self._payload(obj)
        merged = {**payload.get('metadata', {}), **meta}
        return resolve_entity_path(obj.entity_type, obj.entity_id, merged)


class HistoryEventDetailSerializer(HistoryEventListSerializer):
    metadata = HistoryMetadataSerializer(source='metadata_entries', many=True, read_only=True)
    targets = HistoryTargetSerializer(many=True, read_only=True)
    payload_json = serializers.JSONField(read_only=True)
    ip_address = serializers.IPAddressField(read_only=True)
    user_agent = serializers.CharField(read_only=True)

    class Meta(HistoryEventListSerializer.Meta):
        fields = HistoryEventListSerializer.Meta.fields + (
            'metadata',
            'targets',
            'payload_json',
            'ip_address',
            'user_agent',
            'session_id',
            'created_at',
        )


class HistoryExportLogSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = HistoryExportLog
        fields = (
            'uuid',
            'export_type',
            'status',
            'record_count',
            'file_size_bytes',
            'filters_json',
            'started_at',
            'completed_at',
            'error_message',
            'download_url',
            'created_at',
        )

    def get_download_url(self, obj) -> str | None:
        if not obj.file:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url
