"""Serializers for SRF operations configuration workspace."""

from rest_framework import serializers

from apps.srf.compliance_models import ProgramExamPeriod
from apps.srf.config_models import (
    SrfConfigAuditLog,
    SrfNotificationTemplate,
    SrfRestrictionPolicy,
    SrfWarningTier,
)


class SrfWarningTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = SrfWarningTier
        fields = [
            'id', 'sort_order', 'label', 'days_before_exam_start', 'severity',
            'reminder_interval_days', 'max_reminders', 'cooldown_hours',
            'block_convention', 'convention_block_days_before', 'block_exams',
            'is_active', 'created_at', 'updated_at',
        ]


class SrfRestrictionPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = SrfRestrictionPolicy
        fields = [
            'id', 'singleton_key', 'stop_reminders_on_payment', 'mark_at_risk_on_warning',
            'escalate_unresolved_after_days', 'enable_email_notifications',
            'enable_in_app_notifications', 'enable_critical_alerts',
            'unpaid_blocks_exams', 'unpaid_blocks_convention', 'notes',
            'updated_at',
        ]
        read_only_fields = ['singleton_key']


class SrfNotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SrfNotificationTemplate
        fields = [
            'id', 'code', 'name', 'channel', 'severity',
            'subject_template', 'body_template', 'is_active',
            'created_at', 'updated_at',
        ]


class SrfConfigAuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source='actor.email', read_only=True, default='')

    class Meta:
        model = SrfConfigAuditLog
        fields = [
            'uuid', 'action', 'entity_type', 'entity_id', 'actor_email',
            'message', 'before_json', 'after_json', 'created_at',
        ]


class ProgramExamPeriodConfigSerializer(serializers.ModelSerializer):
    filiere_code = serializers.CharField(source='filiere.code', read_only=True)
    filiere_name = serializers.CharField(source='filiere.name', read_only=True)
    academic_year_code = serializers.CharField(source='academic_year.code', read_only=True)
    academic_level_code = serializers.CharField(
        source='academic_level.code',
        read_only=True,
        allow_null=True,
    )
    academic_level_label = serializers.SerializerMethodField()

    class Meta:
        model = ProgramExamPeriod
        fields = [
            'id', 'filiere', 'filiere_code', 'filiere_name',
            'academic_level', 'academic_level_code', 'academic_level_label',
            'academic_year', 'academic_year_code', 'semester',
            'exam_start', 'exam_end', 'convention_block_date', 'payment_deadline',
            'warning_days_before', 'is_active', 'notes',
            'created_at', 'updated_at',
        ]

    def get_academic_level_label(self, obj) -> str | None:
        level = obj.academic_level
        if not level:
            return None
        return level.name or level.code


class TemplatePreviewSerializer(serializers.Serializer):
    template_id = serializers.IntegerField(required=False, allow_null=True)
    subject_template = serializers.CharField(required=False, allow_blank=True)
    body_template = serializers.CharField(required=False, allow_blank=True)
    variables = serializers.DictField(child=serializers.CharField(), required=False)


class SimulationSerializer(serializers.Serializer):
    days_until_exam = serializers.IntegerField(min_value=0, max_value=365, default=14)
    financial_status = serializers.CharField(default='PARTIAL')
