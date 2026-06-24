from rest_framework import serializers

from apps.cv_intelligence.models import CvIntelligenceReport, CvStructuredData


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
