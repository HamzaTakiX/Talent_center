"""Serializers for internship offers REST API."""

from rest_framework import serializers

from apps.stage.models import (
    ApplicationStatusHistory,
    InternshipOffer,
    OfferApplication,
    OfferImportHistory,
    OfferImportJob,
    OfferStatusHistory,
    OfferTargetingRule,
    StudentOfferMatchScore,
)
from apps.stage.services.offer_import_service import (
    compute_duplicate_similarity,
    duplicate_offer_days_ago,
)


class InternshipOfferListSerializer(serializers.ModelSerializer):
    company_logo_url = serializers.SerializerMethodField()
    publish_readiness_score = serializers.SerializerMethodField()
    publish_ready = serializers.SerializerMethodField()
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = InternshipOffer
        fields = [
            'uuid', 'title', 'slug', 'company_name', 'company_logo_url', 'location_city',
            'offer_type', 'status', 'is_remote', 'application_deadline',
            'published_at', 'view_count', 'application_count', 'created_at',
            'publish_readiness_score', 'publish_ready',
        ]

    def get_application_count(self, obj) -> int:
        annotated = getattr(obj, 'live_application_count', None)
        if annotated is not None:
            return annotated
        return obj.application_count

    def get_publish_readiness_score(self, obj) -> int | None:
        if obj.status not in (
            InternshipOffer.Status.DRAFT,
            InternshipOffer.Status.PENDING_REVIEW,
        ):
            return None
        from apps.stage.services.offer_service import evaluate_publish_readiness

        return evaluate_publish_readiness(obj)['score']

    def get_publish_ready(self, obj) -> bool | None:
        if obj.status not in (
            InternshipOffer.Status.DRAFT,
            InternshipOffer.Status.PENDING_REVIEW,
        ):
            return None
        from apps.stage.services.offer_service import evaluate_publish_readiness

        return evaluate_publish_readiness(obj)['ready']

    def get_company_logo_url(self, obj) -> str | None:
        if obj.company_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.company_logo.url)
            return obj.company_logo.url

        meta_logo = (obj.metadata_json or {}).get('company_logo')
        if meta_logo:
            return str(meta_logo)

        company = getattr(obj, 'company', None)
        if company and company.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(company.logo.url)
            return company.logo.url

        return None


class OfferTargetingRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferTargetingRule
        fields = ['rule_type', 'value_json', 'is_inclusive', 'priority', 'is_active']


class InternshipOfferDetailSerializer(InternshipOfferListSerializer):
    targeting_rules = OfferTargetingRuleSerializer(many=True, read_only=True)

    class Meta(InternshipOfferListSerializer.Meta):
        fields = InternshipOfferListSerializer.Meta.fields + [
            'description',
            'location_country',
            'is_hybrid',
            'required_skills',
            'preferred_skills',
            'required_languages',
            'min_education_level',
            'duration_months',
            'start_date',
            'end_date',
            'compensation_amount',
            'compensation_currency',
            'compensation_period',
            'external_url',
            'updated_at',
            'metadata_json',
            'targeting_rules',
        ]


class InternshipOfferWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    company_name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    location_city = serializers.CharField(required=False, allow_blank=True, default='')
    location_country = serializers.CharField(required=False, allow_blank=True, default='')
    offer_type = serializers.CharField(required=False, default='INTERNSHIP')
    is_remote = serializers.BooleanField(required=False, default=False)
    is_hybrid = serializers.BooleanField(required=False, default=False)
    application_deadline = serializers.DateTimeField(required=False, allow_null=True)
    required_skills = serializers.ListField(required=False, default=list)
    preferred_skills = serializers.ListField(required=False, default=list)
    compensation_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, allow_null=True,
    )
    compensation_currency = serializers.CharField(required=False, allow_blank=True, default='MAD')
    compensation_period = serializers.CharField(required=False, allow_blank=True, default='NOT_SPECIFIED')
    duration_months = serializers.IntegerField(required=False, allow_null=True)
    start_date = serializers.DateField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)
    required_languages = serializers.ListField(required=False, default=list)
    min_education_level = serializers.CharField(required=False, allow_blank=True, default='')
    metadata_json = serializers.JSONField(required=False, default=dict)
    external_url = serializers.URLField(required=False, allow_blank=True, default='')
    targeting_rules = serializers.ListField(required=False, default=list)
    programs = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    classes = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    levels = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    departments = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    categories = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    internship_types = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class OfferTargetingSelectionSerializer(serializers.Serializer):
    programs = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    classes = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    levels = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    departments = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    categories = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    internship_types = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    targeting_rules = serializers.ListField(required=False, default=list)


class OfferApplicationSerializer(serializers.ModelSerializer):
    student_email = serializers.EmailField(source='student_profile.user.email', read_only=True)
    student_name = serializers.SerializerMethodField()
    student_class = serializers.SerializerMethodField()
    student_field = serializers.SerializerMethodField()
    student_avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = OfferApplication
        fields = [
            'uuid', 'status', 'cover_letter', 'match_score_at_apply',
            'applied_at', 'last_status_change_at', 'student_email',
            'student_name', 'student_class', 'student_field', 'student_avatar_url',
            'reviewer_notes', 'metadata_json',
        ]

    def get_student_name(self, obj) -> str:
        user = obj.student_profile.user
        full_name = user.get_full_name().strip()
        if full_name:
            return full_name
        return user.email.split('@')[0]

    def get_student_class(self, obj) -> str:
        student = obj.student_profile
        class_group = getattr(student, 'class_group', None)
        if class_group and getattr(class_group, 'name', None):
            return class_group.name
        return student.current_class or ''

    def get_student_field(self, obj) -> str:
        student = obj.student_profile
        filiere = getattr(student, 'filiere', None)
        if filiere and getattr(filiere, 'name', None):
            return filiere.name
        return student.program_major or ''

    def get_student_avatar_url(self, obj) -> str | None:
        from apps.stage.services.chat_service import _student_avatar_url

        return _student_avatar_url(obj.student_profile, self.context.get('request'))


class ApplySerializer(serializers.Serializer):
    cover_letter = serializers.CharField(required=False, allow_blank=True, default='')
    student_cv_id = serializers.IntegerField(required=False, allow_null=True)
    external_confirmation = serializers.BooleanField(required=False, default=False)


class ApplicationActionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default='')
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    interview_details = serializers.DictField(required=False)


class ImportUrlSerializer(serializers.Serializer):
    source_url = serializers.URLField()


class InterviewSimulatorContextRequestSerializer(serializers.Serializer):
    """Payload for building an interview simulation context bundle.

    - offer_uuid: offer inside the platform
    - source_url: external offer URL to extract/preview
    """

    offer_uuid = serializers.UUIDField(required=False, allow_null=True)
    source_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        offer_uuid = attrs.get('offer_uuid')
        source_url = (attrs.get('source_url') or '').strip()
        if not offer_uuid and not source_url:
            # It's allowed to run without an offer, but we need an explicit empty payload.
            # Keep this strict to avoid accidental client bugs.
            raise serializers.ValidationError(
                'Provide at least one of: offer_uuid or source_url.',
            )
        attrs['source_url'] = source_url
        return attrs


class ImportApproveSerializer(serializers.Serializer):
    overrides = serializers.DictField(required=False, default=dict)


class OfferImportHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferImportHistory
        fields = ['step', 'message', 'payload_json', 'created_at']


class OfferImportJobSerializer(serializers.ModelSerializer):
    duplicate_offer_id = serializers.IntegerField(read_only=True, allow_null=True)
    resulting_offer_id = serializers.IntegerField(read_only=True, allow_null=True)
    duplicate_offer_uuid = serializers.SerializerMethodField()
    duplicate_info = serializers.SerializerMethodField()
    parser_used = serializers.SerializerMethodField()
    import_metadata = serializers.SerializerMethodField()
    history = OfferImportHistorySerializer(many=True, read_only=True)

    class Meta:
        model = OfferImportJob
        fields = [
            'uuid', 'source_url', 'detected_platform', 'status',
            'extracted_data', 'normalized_data', 'validation_errors',
            'duplicate_offer_id', 'duplicate_offer_uuid', 'duplicate_info',
            'resulting_offer_id', 'error_message', 'parser_used', 'import_metadata',
            'history', 'created_at', 'completed_at',
        ]
        read_only_fields = fields

    def get_duplicate_offer_uuid(self, obj: OfferImportJob) -> str | None:
        if obj.duplicate_offer_id:
            return str(obj.duplicate_offer.uuid)
        return None

    def get_duplicate_info(self, obj: OfferImportJob) -> dict | None:
        if not obj.duplicate_offer_id:
            return None
        dup = obj.duplicate_offer
        normalized = obj.normalized_data or {}
        similarity = normalized.get('duplicate_similarity')
        if similarity is None:
            similarity = compute_duplicate_similarity(
                title=normalized.get('title', ''),
                company_name=normalized.get('company_name', ''),
                duplicate=dup,
            )
        return {
            'uuid': str(dup.uuid),
            'title': dup.title,
            'company_name': dup.company_name,
            'similarity_percent': similarity,
            'published_days_ago': duplicate_offer_days_ago(dup),
            'status': dup.status,
        }

    def get_parser_used(self, obj: OfferImportJob) -> str:
        normalized = obj.normalized_data or {}
        extracted = obj.extracted_data or {}
        return str(normalized.get('parser_used') or extracted.get('parser_used') or '')

    def get_import_metadata(self, obj: OfferImportJob) -> dict:
        normalized = obj.normalized_data or {}
        return normalized.get('import_metadata') or {}


class MatchScoreSerializer(serializers.ModelSerializer):
    offer_title = serializers.CharField(source='offer.title', read_only=True)
    offer_uuid = serializers.UUIDField(source='offer.uuid', read_only=True)
    company_name = serializers.CharField(source='offer.company_name', read_only=True)
    location_city = serializers.CharField(source='offer.location_city', read_only=True)
    match_reasons = serializers.SerializerMethodField()

    class Meta:
        model = StudentOfferMatchScore
        fields = [
            'score', 'score_breakdown', 'is_recommended', 'computed_at',
            'offer_title', 'offer_uuid', 'company_name', 'location_city', 'match_reasons',
        ]

    def get_match_reasons(self, obj: StudentOfferMatchScore) -> list:
        breakdown = obj.score_breakdown or {}
        reasons = []
        for key, value in breakdown.items():
            if isinstance(value, dict) and value.get('reason'):
                reasons.append({'dimension': key, **value})
        return reasons


class StatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferStatusHistory
        fields = ['previous_status', 'new_status', 'reason', 'is_automated', 'created_at']


class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationStatusHistory
        fields = ['previous_status', 'new_status', 'reason', 'is_automated', 'created_at']
