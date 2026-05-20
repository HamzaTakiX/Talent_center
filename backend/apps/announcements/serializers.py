"""Serializers for announcements admin & student APIs."""

from __future__ import annotations

from rest_framework import serializers

from apps.admin_management.services.academic_reference import request_lang

from .models import (
    Announcement,
    AnnouncementAttachment,
    AnnouncementInternshipDetails,
    AnnouncementPublicationLog,
    AnnouncementTarget,
    AnnouncementType,
    StudentAnnouncementAction,
    StudentAnnouncementBookmark,
    StudentAnnouncementPreference,
)


def _localized_name(obj, lang: str = 'fr') -> str:
    i18n = getattr(obj, 'name_i18n', None) or {}
    if isinstance(i18n, dict) and i18n.get(lang):
        return i18n[lang]
    return obj.name


class AnnouncementTypeSerializer(serializers.ModelSerializer):
    nameLocalized = serializers.SerializerMethodField()

    class Meta:
        model = AnnouncementType
        fields = [
            'id', 'code', 'name', 'nameLocalized', 'name_i18n', 'description',
            'icon', 'color', 'default_priority', 'is_active', 'is_system',
            'is_mutable', 'is_bannable', 'is_internship_related',
            'recommendation_weight', 'recommendation_boost', 'stage_relation_id',
            'sort_order',
        ]
        read_only_fields = ['id']

    def get_nameLocalized(self, obj) -> str:
        request = self.context.get('request')
        lang = request_lang(request) if request else 'fr'
        return _localized_name(obj, lang)


class AnnouncementTargetSerializer(serializers.ModelSerializer):
    filiereId = serializers.IntegerField(source='filiere_id', allow_null=True, required=False)
    classGroupId = serializers.IntegerField(source='class_group_id', allow_null=True, required=False)
    academicLevelId = serializers.IntegerField(source='academic_level_id', allow_null=True, required=False)
    academicYearId = serializers.IntegerField(source='academic_year_id', allow_null=True, required=False)
    academicSectorId = serializers.IntegerField(source='academic_sector_id', allow_null=True, required=False)
    internshipTypeId = serializers.IntegerField(source='internship_type_id', allow_null=True, required=False)

    class Meta:
        model = AnnouncementTarget
        fields = [
            'id', 'target_type', 'filiereId', 'classGroupId', 'academicLevelId',
            'academicYearId', 'academicSectorId', 'internshipTypeId',
            'value_json', 'is_inclusive',
        ]
        read_only_fields = ['id']


class AnnouncementAttachmentSerializer(serializers.ModelSerializer):
    fileUrl = serializers.SerializerMethodField()

    class Meta:
        model = AnnouncementAttachment
        fields = [
            'id', 'kind', 'fileUrl', 'external_url', 'original_filename',
            'file_size_bytes', 'mime_type', 'label', 'sort_order',
        ]
        read_only_fields = ['id', 'fileUrl']

    def get_fileUrl(self, obj) -> str | None:
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class InternshipDetailsSerializer(serializers.ModelSerializer):
    internshipTypeId = serializers.IntegerField(source='internship_type_id', allow_null=True, required=False)
    linkedOfferId = serializers.IntegerField(source='linked_offer_id', allow_null=True, required=False)

    class Meta:
        model = AnnouncementInternshipDetails
        fields = [
            'internshipTypeId', 'internship_type_code', 'duration', 'location',
            'work_mode', 'required_skills', 'technologies', 'languages',
            'recruiter_name', 'recruiter_email', 'company_sector',
            'internship_start_date', 'internship_end_date', 'compensation',
            'offer_status', 'linkedOfferId',
        ]


class AnnouncementListSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    typeCode = serializers.CharField(source='announcement_type.code', read_only=True)
    typeName = serializers.SerializerMethodField()
    audienceCount = serializers.SerializerMethodField()
    engagementRate = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'summary', 'typeCode', 'typeName', 'status', 'priority',
            'target_scope', 'company_name', 'is_pinned', 'publish_start_at',
            'publish_end_at', 'application_deadline', 'published_at',
            'view_count', 'click_count', 'save_count', 'audienceCount',
            'engagementRate', 'created_at', 'updated_at',
        ]

    def get_typeName(self, obj) -> str:
        request = self.context.get('request')
        lang = request_lang(request) if request else 'fr'
        return _localized_name(obj.announcement_type, lang)

    def get_audienceCount(self, obj) -> int | None:
        return self.context.get('audience_counts', {}).get(obj.pk)

    def get_engagementRate(self, obj) -> float:
        if not obj.view_count:
            return 0.0
        return round((obj.click_count + obj.save_count) / obj.view_count * 100, 1)


class AnnouncementDetailSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    typeCode = serializers.CharField(source='announcement_type.code', read_only=True)
    typeId = serializers.IntegerField(source='announcement_type_id', read_only=True)
    targets = AnnouncementTargetSerializer(many=True, read_only=True)
    attachments = AnnouncementAttachmentSerializer(many=True, read_only=True)
    internshipDetails = InternshipDetailsSerializer(source='internship_details', read_only=True)
    coverImageUrl = serializers.SerializerMethodField()
    analytics = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'slug', 'summary', 'body', 'typeCode', 'typeId',
            'status', 'priority', 'target_scope', 'company_name', 'external_link',
            'coverImageUrl', 'tags', 'visibility_rules', 'recommendation_metadata',
            'publish_start_at', 'publish_end_at', 'application_deadline',
            'published_at', 'is_pinned', 'allow_comments', 'overrides_mute',
            'overrides_ban', 'view_count', 'click_count', 'save_count',
            'dismiss_count', 'targets', 'attachments', 'internshipDetails',
            'analytics', 'created_at', 'updated_at',
        ]

    def get_coverImageUrl(self, obj) -> str | None:
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None

    def get_analytics(self, obj) -> dict:
        return self.context.get('detail_analytics', {})


class AnnouncementWriteSerializer(serializers.ModelSerializer):
    announcementTypeCode = serializers.SlugField(write_only=True)
    targets = AnnouncementTargetSerializer(many=True, required=False)
    internshipDetails = InternshipDetailsSerializer(required=False)

    class Meta:
        model = Announcement
        fields = [
            'title', 'summary', 'body', 'announcementTypeCode', 'status', 'priority',
            'target_scope', 'company_name', 'external_link', 'tags',
            'visibility_rules', 'recommendation_metadata',
            'publish_start_at', 'publish_end_at', 'application_deadline',
            'is_pinned', 'allow_comments', 'overrides_mute', 'overrides_ban',
            'targets', 'internshipDetails',
        ]

    def _get_type(self, code: str) -> AnnouncementType:
        try:
            return AnnouncementType.objects.get(code=code)
        except AnnouncementType.DoesNotExist:
            raise serializers.ValidationError({'announcementTypeCode': 'Unknown type'})

    def create(self, validated_data):
        targets_data = validated_data.pop('targets', [])
        internship_data = validated_data.pop('internshipDetails', None)
        type_code = validated_data.pop('announcementTypeCode')
        user = self.context['request'].user
        ann_type = self._get_type(type_code)
        announcement = Announcement.objects.create(
            announcement_type=ann_type,
            created_by=user,
            updated_by=user,
            posted_by=user,
            **validated_data,
        )
        self._save_targets(announcement, targets_data)
        if internship_data:
            AnnouncementInternshipDetails.objects.create(announcement=announcement, **internship_data)
        return announcement

    def update(self, instance, validated_data):
        targets_data = validated_data.pop('targets', None)
        internship_data = validated_data.pop('internshipDetails', None)
        if 'announcementTypeCode' in validated_data:
            instance.announcement_type = self._get_type(validated_data.pop('announcementTypeCode'))
        user = self.context['request'].user
        instance.updated_by = user
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if targets_data is not None:
            instance.targets.all().delete()
            self._save_targets(instance, targets_data)
        if internship_data is not None:
            AnnouncementInternshipDetails.objects.update_or_create(
                announcement=instance,
                defaults=internship_data,
            )
        return instance

    def _save_targets(self, announcement: Announcement, targets_data: list) -> None:
        for t in targets_data:
            AnnouncementTarget.objects.create(announcement=announcement, **t)


class PublicationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementPublicationLog
        fields = ['id', 'action', 'previous_status', 'new_status', 'note', 'created_at']
