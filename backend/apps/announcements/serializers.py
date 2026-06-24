"""Serializers for announcements admin & student APIs."""

from __future__ import annotations

from rest_framework import serializers

from apps.admin_management.services.academic_reference import request_lang

from .services.targeting_labels import summarize_target_audience
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
    announcementCount = serializers.SerializerMethodField()

    class Meta:
        model = AnnouncementType
        fields = [
            'id', 'code', 'name', 'nameLocalized', 'name_i18n', 'description',
            'icon', 'color', 'default_priority', 'is_active', 'is_system',
            'is_mutable', 'is_bannable', 'is_internship_related',
            'recommendation_weight', 'recommendation_boost', 'stage_relation_id',
            'sort_order', 'announcementCount',
        ]
        read_only_fields = ['id']

    def get_nameLocalized(self, obj) -> str:
        request = self.context.get('request')
        lang = request_lang(request) if request else 'fr'
        return _localized_name(obj, lang)

    def get_announcementCount(self, obj) -> int:
        return getattr(obj, 'announcement_count', None) or obj.announcements.count()


class AnnouncementTypeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementType
        fields = [
            'code', 'name', 'name_i18n', 'description', 'icon', 'color',
            'default_priority', 'is_active', 'is_mutable', 'is_bannable',
            'is_internship_related', 'recommendation_weight', 'recommendation_boost',
            'sort_order',
        ]

    def validate_code(self, value: str) -> str:
        from django.utils.text import slugify
        code = slugify(value or '')
        if not code:
            raise serializers.ValidationError('Invalid code')
        instance = getattr(self, 'instance', None)
        if AnnouncementType.objects.filter(code=code).exclude(pk=getattr(instance, 'pk', None)).exists():
            raise serializers.ValidationError('Code already exists')
        return code

    def validate_name_i18n(self, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError('Must be an object')
        return value


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
    coverImageUrl = serializers.SerializerMethodField()
    audienceCount = serializers.SerializerMethodField()
    engagementRate = serializers.SerializerMethodField()
    createdByName = serializers.SerializerMethodField()
    targetAudienceLabel = serializers.SerializerMethodField()
    scheduleTimezone = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'summary', 'typeCode', 'typeName', 'status', 'priority',
            'target_scope', 'company_name', 'is_pinned', 'publish_start_at',
            'publish_end_at', 'application_deadline', 'published_at', 'coverImageUrl',
            'view_count', 'click_count', 'save_count', 'audienceCount',
            'engagementRate', 'created_at', 'updated_at',
            'createdByName', 'targetAudienceLabel', 'scheduleTimezone',
        ]

    def get_coverImageUrl(self, obj) -> str | None:
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None

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

    def get_createdByName(self, obj) -> str:
        user = obj.created_by
        if not user:
            return ''
        full = f'{user.first_name} {user.last_name}'.strip()
        return full or getattr(user, 'email', '') or str(user)

    def get_targetAudienceLabel(self, obj) -> str:
        return summarize_target_audience(obj)

    def get_scheduleTimezone(self, obj) -> str:
        meta = obj.metadata_json or {}
        return meta.get('schedule_timezone') or 'Africa/Casablanca'


class AnnouncementDetailSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    typeCode = serializers.CharField(source='announcement_type.code', read_only=True)
    typeId = serializers.IntegerField(source='announcement_type_id', read_only=True)
    typeName = serializers.SerializerMethodField()
    createdByName = serializers.SerializerMethodField()
    targetAudienceLabel = serializers.SerializerMethodField()
    engagementRate = serializers.SerializerMethodField()
    targets = AnnouncementTargetSerializer(many=True, read_only=True)
    attachments = AnnouncementAttachmentSerializer(many=True, read_only=True)
    internshipDetails = InternshipDetailsSerializer(source='internship_details', read_only=True)
    coverImageUrl = serializers.SerializerMethodField()
    scheduleTimezone = serializers.SerializerMethodField()
    analytics = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'slug', 'summary', 'body', 'typeCode', 'typeId', 'typeName',
            'status', 'priority', 'target_scope', 'targetAudienceLabel', 'company_name',
            'external_link', 'coverImageUrl', 'scheduleTimezone', 'tags', 'visibility_rules',
            'recommendation_metadata', 'publish_start_at', 'publish_end_at', 'application_deadline',
            'published_at', 'is_pinned', 'allow_comments', 'overrides_mute',
            'overrides_ban', 'view_count', 'click_count', 'save_count',
            'dismiss_count', 'engagementRate', 'createdByName', 'targets', 'attachments',
            'internshipDetails', 'analytics', 'created_at', 'updated_at',
        ]

    def get_coverImageUrl(self, obj) -> str | None:
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None

    def get_scheduleTimezone(self, obj) -> str:
        meta = obj.metadata_json or {}
        return meta.get('schedule_timezone') or 'Africa/Casablanca'

    def get_typeName(self, obj) -> str:
        request = self.context.get('request')
        lang = request_lang(request) if request else 'fr'
        return _localized_name(obj.announcement_type, lang)

    def get_createdByName(self, obj) -> str:
        user = obj.created_by
        if not user:
            return ''
        full = f'{user.first_name} {user.last_name}'.strip()
        return full or getattr(user, 'email', '') or str(user)

    def get_targetAudienceLabel(self, obj) -> str:
        return summarize_target_audience(obj)

    def get_engagementRate(self, obj) -> float:
        if not obj.view_count:
            return 0.0
        return round((obj.click_count + obj.save_count) / obj.view_count * 100, 1)

    def get_analytics(self, obj) -> dict:
        return self.context.get('detail_analytics', {})


class AnnouncementWriteSerializer(serializers.ModelSerializer):
    announcementTypeCode = serializers.SlugField(write_only=True)
    targets = AnnouncementTargetSerializer(many=True, required=False)
    internshipDetails = InternshipDetailsSerializer(required=False)
    schedule_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    schedule_time = serializers.TimeField(write_only=True, required=False, allow_null=True)
    schedule_timezone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Announcement
        fields = [
            'title', 'summary', 'body', 'announcementTypeCode', 'status', 'priority',
            'target_scope', 'company_name', 'external_link', 'tags',
            'visibility_rules', 'recommendation_metadata',
            'publish_start_at', 'publish_end_at', 'application_deadline',
            'is_pinned', 'allow_comments', 'overrides_mute', 'overrides_ban',
            'targets', 'internshipDetails', 'metadata_json',
            'schedule_date', 'schedule_time', 'schedule_timezone',
        ]

    def validate(self, attrs):
        from apps.announcements.services.publication import (
            build_scheduled_datetime,
            validate_future_publish_start,
        )

        schedule_date = attrs.pop('schedule_date', None)
        schedule_time = attrs.pop('schedule_time', None)
        schedule_timezone = (attrs.pop('schedule_timezone', None) or '').strip()

        status = attrs.get('status', getattr(self.instance, 'status', None))
        publish_start_at = attrs.get(
            'publish_start_at',
            getattr(self.instance, 'publish_start_at', None),
        )

        if schedule_date and schedule_time:
            tz_name = schedule_timezone or 'Africa/Casablanca'
            attrs['publish_start_at'] = build_scheduled_datetime(
                schedule_date.isoformat(),
                schedule_time.strftime('%H:%M'),
                tz_name,
            )
            publish_start_at = attrs['publish_start_at']
            meta = dict((self.instance.metadata_json if self.instance else {}) or {})
            meta['schedule_timezone'] = tz_name
            attrs['metadata_json'] = meta
        elif schedule_timezone:
            meta = dict((self.instance.metadata_json if self.instance else attrs.get('metadata_json')) or {})
            meta['schedule_timezone'] = schedule_timezone
            attrs['metadata_json'] = meta

        if status == Announcement.Status.SCHEDULED:
            if not publish_start_at:
                raise serializers.ValidationError({
                    'publish_start_at': 'A future publish date and time are required.',
                })
            try:
                validate_future_publish_start(publish_start_at)
            except ValueError as exc:
                raise serializers.ValidationError({'publish_start_at': str(exc)}) from exc

        publish_end_at = attrs.get(
            'publish_end_at',
            getattr(self.instance, 'publish_end_at', None),
        )
        if self.instance is None and not publish_end_at:
            raise serializers.ValidationError({
                'publish_end_at': 'Expiration date is required.',
            })

        return attrs

    def _get_type(self, code: str) -> AnnouncementType:
        try:
            return AnnouncementType.objects.get(code=code)
        except AnnouncementType.DoesNotExist:
            raise serializers.ValidationError({'announcementTypeCode': 'Unknown type'})

    def create(self, validated_data):
        from apps.announcements.services.publication import (
            publish_announcement,
            schedule_announcement,
        )

        targets_data = validated_data.pop('targets', [])
        internship_data = validated_data.pop('internshipDetails', None)
        type_code = validated_data.pop('announcementTypeCode')
        user = self.context['request'].user
        ann_type = self._get_type(type_code)
        requested_status = validated_data.get('status', Announcement.Status.DRAFT)
        publish_on_create = requested_status == Announcement.Status.PUBLISHED
        schedule_on_create = requested_status == Announcement.Status.SCHEDULED
        if publish_on_create or schedule_on_create:
            validated_data['status'] = Announcement.Status.DRAFT
        announcement = Announcement.objects.create(
            announcement_type=ann_type,
            created_by=user,
            updated_by=user,
            posted_by=user,
            **validated_data,
        )
        if not announcement.published_at and not schedule_on_create:
            announcement.published_at = announcement.created_at
            announcement.save(update_fields=['published_at'])
        self._save_targets(announcement, targets_data)
        if internship_data:
            AnnouncementInternshipDetails.objects.create(announcement=announcement, **internship_data)
        if schedule_on_create:
            schedule_announcement(announcement, user)
        elif publish_on_create:
            publish_announcement(announcement, user)
        return announcement

    def update(self, instance, validated_data):
        from apps.announcements.services.publication import modify_schedule, schedule_announcement

        targets_data = validated_data.pop('targets', None)
        internship_data = validated_data.pop('internshipDetails', None)
        if 'announcementTypeCode' in validated_data:
            instance.announcement_type = self._get_type(validated_data.pop('announcementTypeCode'))
        user = self.context['request'].user
        instance.updated_by = user
        previous_publish_start = instance.publish_start_at
        previous_status = instance.status
        new_status = validated_data.get('status', instance.status)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if (
            new_status == Announcement.Status.SCHEDULED
            and previous_status != Announcement.Status.SCHEDULED
        ):
            schedule_announcement(instance, user)
        elif (
            previous_status == Announcement.Status.SCHEDULED
            and instance.status == Announcement.Status.SCHEDULED
            and previous_publish_start != instance.publish_start_at
        ):
            modify_schedule(instance, user, previous_publish_start_at=previous_publish_start)
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
