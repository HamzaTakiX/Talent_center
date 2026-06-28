from rest_framework import serializers

from apps.cv_intelligence.models import CvIntelligenceReport, CvStructuredData, InterviewConfiguration, InterviewSession


class CvStructuredDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CvStructuredData
        fields = [
            'uuid', 'source_type', 'source_filename', 'detected_languages',
            'structured_json', 'extraction_metadata', 'created_at',
        ]


class CvIntelligenceReportListSerializer(serializers.ModelSerializer):
    score_delta = serializers.IntegerField(read_only=True)

    class Meta:
        model = CvIntelligenceReport
        fields = [
            'uuid', 'source_type', 'status', 'provider', 'global_score',
            'potential_score', 'score_delta', 'detected_languages', 'analyzed_at',
            'cv_hash', 'version', 'is_active',
        ]


class CvIntelligenceReportSummarySerializer(serializers.ModelSerializer):
    """Lightweight metadata for dashboard load — no heavy JSON blobs."""

    class Meta:
        model = CvIntelligenceReport
        fields = [
            'uuid', 'source_type', 'status', 'provider', 'global_score',
            'potential_score', 'ats_score', 'readiness_score', 'analyzed_at',
            'cv_hash', 'version', 'is_active',
        ]


class CvIntelligenceReportDetailSerializer(serializers.ModelSerializer):
    structured_data = CvStructuredDataSerializer(read_only=True)
    score_delta = serializers.IntegerField(read_only=True)
    dashboard = serializers.SerializerMethodField()

    class Meta:
        model = CvIntelligenceReport
        fields = [
            'uuid', 'source_type', 'status', 'provider', 'ai_model',
            'detected_languages', 'global_score', 'skills_score',
            'experience_score', 'education_score', 'formatting_score',
            'ats_score', 'readiness_score', 'potential_score', 'score_delta',
            'semantic_profile_json', 'swot_json', 'ats_analysis_json',
            'score_explanations_json', 'internship_matches_json',
            'missing_skills_json', 'recommended_skills_json',
            'roadmap_json', 'interview_prep_json', 'dashboard_json',
            'structured_data', 'dashboard', 'analyzed_at',
            'cv_hash', 'version', 'is_active',
        ]

    def get_dashboard(self, obj: CvIntelligenceReport) -> dict:
        return obj.dashboard_json or {}


class InterviewSessionStartSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=InterviewSession.Mode.choices)
    offer_uuid = serializers.UUIDField(required=False, allow_null=True)
    external_offer_url = serializers.URLField(
        required=False,
        allow_blank=True,
        allow_null=True,
        max_length=2048,
    )
    external_offer = serializers.DictField(required=False, allow_null=True)
    difficulty = serializers.ChoiceField(
        choices=InterviewConfiguration.Difficulty.choices,
        required=False,
        default=InterviewConfiguration.Difficulty.MEDIUM,
    )
    duration_minutes = serializers.IntegerField(required=False, default=20, min_value=5, max_value=90)
    language = serializers.CharField(required=False, default='fr', max_length=8)
    communication_mode = serializers.ChoiceField(
        choices=InterviewConfiguration.CommunicationMode.choices,
        required=False,
        default=InterviewConfiguration.CommunicationMode.TEXT,
    )
    interview_type = serializers.ChoiceField(
        choices=InterviewConfiguration.InterviewType.choices,
        required=False,
        default=InterviewConfiguration.InterviewType.MIXED,
    )
    recruiter_profile = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        mode = attrs.get('mode')
        offer_uuid = attrs.get('offer_uuid')
        external_offer_url = (attrs.get('external_offer_url') or '').strip()
        external_offer = attrs.get('external_offer')
        if mode == InterviewSession.Mode.OFFER and not (offer_uuid or external_offer_url or external_offer):
            raise serializers.ValidationError('Offer mode requires offer_uuid or external_offer_url.')
        attrs['external_offer_url'] = external_offer_url
        return attrs


class InterviewAnswerSubmitSerializer(serializers.Serializer):
    question_uuid = serializers.UUIDField(required=False, allow_null=True)
    answer = serializers.CharField()


class InterviewAudioTranscribeSerializer(serializers.Serializer):
    audio = serializers.FileField()
    language = serializers.CharField(required=False, allow_blank=True, max_length=12)
