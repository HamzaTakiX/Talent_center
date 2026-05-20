"""Serializers for SRF financial import API."""

from rest_framework import serializers

from apps.srf.import_models import (
    FinancialImportAuditEvent,
    FinancialImportBatch,
    FinancialImportMappingProfile,
)


class FinancialImportBatchSerializer(serializers.ModelSerializer):
    started_by_name = serializers.SerializerMethodField()
    can_rollback = serializers.SerializerMethodField()
    can_retry_rollback = serializers.SerializerMethodField()

    class Meta:
        model = FinancialImportBatch
        fields = [
            'id', 'uuid', 'status', 'import_mode', 'file_format',
            'source_filename', 'file_size_bytes', 'academic_year',
            'total_rows', 'valid_rows', 'error_rows', 'warning_rows',
            'success_rows', 'skipped_rows', 'affected_students',
            'column_mapping_json', 'preview_json', 'validation_json',
            'errors_json', 'progress_percent', 'progress_message',
            'started_by', 'started_by_name', 'started_at', 'completed_at',
            'rolled_back_at', 'can_rollback', 'can_retry_rollback', 'created_at',
        ]
        read_only_fields = fields

    def get_started_by_name(self, obj) -> str:
        if obj.started_by:
            return obj.started_by.get_full_name() or obj.started_by.email
        return ''

    def get_can_rollback(self, obj) -> bool:
        return obj.status in (
            FinancialImportBatch.Status.COMPLETED,
            FinancialImportBatch.Status.PARTIAL,
        ) and obj.import_mode != FinancialImportBatch.ImportMode.DRY_RUN

    def get_can_retry_rollback(self, obj) -> bool:
        from apps.srf.services.financial_import.rollback import batch_can_retry_rollback

        return batch_can_retry_rollback(obj)


class FinancialImportAuditEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = FinancialImportAuditEvent
        fields = [
            'id', 'action', 'actor', 'actor_name', 'ip_address',
            'message', 'payload_json', 'created_at',
        ]

    def get_actor_name(self, obj) -> str:
        if obj.actor:
            return obj.actor.get_full_name() or obj.actor.email
        return ''


class FinancialImportMappingProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialImportMappingProfile
        fields = [
            'id', 'name', 'description', 'source_system',
            'column_mapping_json', 'is_default', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
