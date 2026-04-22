"""DRF serializers for the intelligence layer.

Only read-side serialization is exposed. Writes go through the service
layer so business rules (state transitions, idempotent suggestions,
scoring) stay in one place.
"""

from rest_framework import serializers

from .models import (
    StudentProfileActivityLog,
    StudentProfileBehaviorMetric,
    StudentProfileContext,
    StudentProfileIndicator,
    StudentProfileModuleData,
    StudentProfileModuleRegistry,
    StudentProfileRisk,
    StudentProfileSnapshot,
    StudentProfileStateTransition,
    StudentProfileSuggestion,
)


class StudentProfileIndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfileIndicator
        fields = (
            'student_profile',
            'health_score',
            'engagement_score',
            'risk_score',
            'last_activity_at',
            'is_at_risk',
            'updated_at',
        )
        read_only_fields = fields


class StudentProfileActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfileActivityLog
        fields = (
            'id',
            'student_profile',
            'activity_type',
            'source_app',
            'action_code',
            'metadata_json',
            'created_at',
        )
        read_only_fields = fields


class StudentProfileBehaviorMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfileBehaviorMetric
        fields = (
            'id',
            'student_profile',
            'source_app',
            'login_count',
            'actions_count',
            'average_session_duration',
            'engagement_level',
            'updated_at',
        )
        read_only_fields = fields


class StudentProfileContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfileContext
        fields = (
            'id',
            'student_profile',
            'context_code',
            'source_app',
            'summary_json',
            'status',
            'updated_at',
        )
        read_only_fields = fields


class StudentProfileModuleRegistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfileModuleRegistry
        fields = ('id', 'module_code', 'module_name', 'source_app', 'is_active')
        read_only_fields = fields


class StudentProfileModuleDataSerializer(serializers.ModelSerializer):
    module = StudentProfileModuleRegistrySerializer(read_only=True)

    class Meta:
        model = StudentProfileModuleData
        fields = (
            'id',
            'student_profile',
            'module',
            'summary_json',
            'metrics_json',
            'last_updated_at',
        )
        read_only_fields = fields


class StudentProfileSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfileSuggestion
        fields = (
            'id',
            'student_profile',
            'suggestion_type',
            'title',
            'priority',
            'is_completed',
            'completed_at',
            'metadata_json',
            'created_at',
        )
        read_only_fields = fields


class StudentProfileRiskSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfileRisk
        fields = (
            'id',
            'student_profile',
            'risk_type',
            'risk_level',
            'is_active',
            'details_json',
            'resolved_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class StudentProfileStateTransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfileStateTransition
        fields = (
            'id',
            'student_profile',
            'from_state',
            'to_state',
            'trigger_type',
            'transitioned_at',
            'reason',
        )
        read_only_fields = fields


class StudentProfileSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfileSnapshot
        fields = (
            'id',
            'student_profile',
            'completion_rate',
            'engagement_score',
            'risk_score',
            'snapshot_date',
        )
        read_only_fields = fields


class ProfileDashboardSerializer(serializers.Serializer):
    """Assembled view returned by /dashboard/ — built by the engine."""

    student_profile_id = serializers.IntegerField()
    completion_rate = serializers.IntegerField()
    indicator = StudentProfileIndicatorSerializer(allow_null=True)
    contexts = StudentProfileContextSerializer(many=True)
    modules = serializers.ListField(child=serializers.DictField())
    suggestions = StudentProfileSuggestionSerializer(many=True)
    risks = StudentProfileRiskSerializer(many=True)
    recent_activity = StudentProfileActivityLogSerializer(many=True)


class SearchFilterSerializer(serializers.Serializer):
    """Input validator for the advanced search endpoint."""

    is_at_risk = serializers.BooleanField(required=False)
    min_engagement_score = serializers.IntegerField(required=False, min_value=0, max_value=100)
    max_engagement_score = serializers.IntegerField(required=False, min_value=0, max_value=100)
    min_risk_score = serializers.IntegerField(required=False, min_value=0, max_value=100)
    risk_type = serializers.SlugField(required=False)
    state = serializers.ChoiceField(
        required=False,
        choices=StudentProfileStateTransition.State.choices,
    )
    source_app = serializers.CharField(required=False)
