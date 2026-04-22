"""DRF serializers for cv_builder.

Write operations go through ``services/``; serializers are used mainly
for validation and to shape read responses consistently.
"""

from rest_framework import serializers

from .constants import CvStatus, SectionType
from .models import (
    CvAiAnalysis,
    CvAsset,
    CvSection,
    CvShareLink,
    CvTemplate,
    CvVersion,
    StudentCv,
)


# ---- Templates ---------------------------------------------------------------

class CvTemplateSerializer(serializers.ModelSerializer):
    preview_image = serializers.ImageField(read_only=True, use_url=True)

    class Meta:
        model = CvTemplate
        fields = (
            'id', 'code', 'name', 'description', 'category',
            'preview_image', 'layout_schema', 'style_schema',
            'is_default', 'is_active', 'created_at', 'updated_at',
        )
        read_only_fields = fields


# ---- Sections ----------------------------------------------------------------

class CvSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CvSection
        fields = (
            'id', 'student_cv', 'section_type', 'label',
            'order_index', 'is_visible', 'slot_name',
            'config_json', 'content_json',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'student_cv', 'order_index', 'created_at', 'updated_at')


class CvSectionCreateSerializer(serializers.Serializer):
    section_type = serializers.ChoiceField(choices=SectionType.choices)
    label = serializers.CharField(max_length=128, required=False, allow_blank=True)
    slot_name = serializers.CharField(max_length=64, required=False, allow_blank=True)


class CvSectionUpdateSerializer(serializers.Serializer):
    label = serializers.CharField(max_length=128, required=False)
    is_visible = serializers.BooleanField(required=False)
    slot_name = serializers.CharField(max_length=64, required=False, allow_blank=True)
    config_json = serializers.JSONField(required=False)
    content_json = serializers.JSONField(required=False)


class ReorderSectionsSerializer(serializers.Serializer):
    order = serializers.ListField(child=serializers.IntegerField(min_value=1), allow_empty=False)


# ---- Assets ------------------------------------------------------------------

class CvAssetSerializer(serializers.ModelSerializer):
    file = serializers.FileField(use_url=True)

    class Meta:
        model = CvAsset
        fields = ('id', 'student_cv', 'asset_type', 'file', 'metadata_json',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'student_cv', 'created_at', 'updated_at')


# ---- Versions ----------------------------------------------------------------

class CvVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CvVersion
        fields = ('id', 'version_number', 'change_note', 'snapshot_json',
                  'created_by', 'created_at')
        read_only_fields = fields


class CvVersionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CvVersion
        fields = ('id', 'version_number', 'change_note', 'created_by', 'created_at')
        read_only_fields = fields


class SaveVersionSerializer(serializers.Serializer):
    change_note = serializers.CharField(max_length=255, required=False, allow_blank=True)


# ---- AI analysis -------------------------------------------------------------

class CvAiAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = CvAiAnalysis
        fields = ('id', 'score', 'provider', 'suggestions_json', 'strengths_json',
                  'weaknesses_json', 'raw_response_json', 'analyzed_at')
        read_only_fields = fields


# ---- Student CV --------------------------------------------------------------

class StudentCvListSerializer(serializers.ModelSerializer):
    template_code = serializers.CharField(source='template.code', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)

    class Meta:
        model = StudentCv
        fields = (
            'id', 'uuid', 'title', 'slug', 'status', 'is_primary',
            'current_score', 'template', 'template_code', 'template_name',
            'last_analyzed_at', 'last_exported_at',
            'created_at', 'updated_at',
        )
        read_only_fields = fields


class StudentCvDetailSerializer(serializers.ModelSerializer):
    template = CvTemplateSerializer(read_only=True)
    sections = CvSectionSerializer(many=True, read_only=True)
    assets = CvAssetSerializer(many=True, read_only=True)

    class Meta:
        model = StudentCv
        fields = (
            'id', 'uuid', 'title', 'slug', 'status', 'is_primary',
            'current_score', 'template', 'sections', 'assets',
            'last_analyzed_at', 'last_exported_at',
            'created_at', 'updated_at',
        )
        read_only_fields = fields


class StudentCvCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=160, required=False, allow_blank=True)
    template_id = serializers.IntegerField(required=False)


class StudentCvUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=160, required=False)
    status = serializers.ChoiceField(choices=CvStatus.choices, required=False)


class SwitchTemplateSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()


# ---- Share links -------------------------------------------------------------

class CvShareLinkSerializer(serializers.ModelSerializer):
    share_url = serializers.SerializerMethodField()

    class Meta:
        model = CvShareLink
        fields = (
            'id', 'token', 'label', 'is_active', 'expires_at',
            'view_count', 'last_viewed_at', 'share_url',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'token', 'view_count', 'last_viewed_at',
            'share_url', 'created_at', 'updated_at',
        )

    def get_share_url(self, obj: CvShareLink) -> str:
        from django.conf import settings
        base = getattr(settings, 'CV_PUBLIC_SHARE_BASE_URL', '').rstrip('/')
        return f'{base}/{obj.token}' if base else obj.token


class CreateShareLinkSerializer(serializers.Serializer):
    label = serializers.CharField(max_length=128, required=False, allow_blank=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)


class UpdateShareLinkSerializer(serializers.Serializer):
    label = serializers.CharField(max_length=128, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)


class PublicCvSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CvSection
        fields = ('id', 'section_type', 'label', 'order_index',
                  'slot_name', 'config_json', 'content_json')
        read_only_fields = fields


class PublicCvSerializer(serializers.ModelSerializer):
    template = CvTemplateSerializer(read_only=True)
    sections = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentCv
        fields = ('uuid', 'title', 'template', 'sections', 'owner_name')
        read_only_fields = fields

    def get_sections(self, obj: StudentCv):
        visible = obj.sections.filter(is_visible=True).order_by('order_index', 'id')
        return PublicCvSectionSerializer(visible, many=True).data

    def get_owner_name(self, obj: StudentCv) -> str:
        user = obj.student_profile.user
        full = (getattr(user, 'get_full_name', lambda: '')() or '').strip()
        return full or getattr(user, 'email', '') or ''
