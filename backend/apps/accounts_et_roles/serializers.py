from datetime import date

from rest_framework import serializers

from core.media_urls import build_absolute_media_url

from .models import User, UserProfile, StudentProfile, StaffProfile, SupervisorProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Common profile fields for ALL users."""

    avatar = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'date_of_birth',
            'gender', 'avatar', 'bio', 'timezone', 'language',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_avatar(self, obj: UserProfile) -> str | None:
        if not obj.avatar:
            return None
        try:
            relative_url = obj.avatar.url
        except (ValueError, AttributeError):
            return None
        return build_absolute_media_url(relative_url, self.context.get('request'))


class StudentProfileSerializer(serializers.ModelSerializer):
    """Student-specific fields. Includes personal info from UserProfile."""

    # Personal info from UserProfile (for frontend convenience)
    first_name = serializers.CharField(source='user.profile.first_name', read_only=True)
    last_name = serializers.CharField(source='user.profile.last_name', read_only=True)
    date_of_birth = serializers.DateField(source='user.profile.date_of_birth', read_only=True)
    phone = serializers.CharField(source='user.profile.phone', read_only=True)
    academic_level_name = serializers.SerializerMethodField()
    academic_sector_name = serializers.SerializerMethodField()
    internship_type_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'first_name', 'last_name', 'date_of_birth', 'phone',
            'student_number', 'program_major', 'current_class',
            'filiere', 'class_group', 'academic_level', 'academic_level_name',
            'academic_sector', 'academic_sector_name',
            'internship_type', 'internship_type_name',
            'internship_duration', 'internship_category',
            'academic_year_ref', 'academic_year',
            'enrollment_year', 'expected_graduation_year',
            'linkedin_url', 'professional_summary', 'cv_file',
            'career_objective', 'skills', 'availability', 'start_date', 'city', 'mobility', 'has_applied',
            'has_internship', 'internship_status_acknowledged',
            'internship_company_name', 'internship_specialization',
            'internship_company_city', 'internship_stage_duration',
            'identity_confirmed', 'profile_completed',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['identity_confirmed', 'profile_completed', 'created_at', 'updated_at', 'first_name', 'last_name', 'date_of_birth', 'phone']

    def _request_lang(self) -> str:
        from apps.admin_management.services.i18n_labels import request_lang

        request = self.context.get('request')
        return request_lang(request) if request else 'fr'

    def get_academic_level_name(self, obj: StudentProfile) -> str:
        level = getattr(obj, 'academic_level', None)
        if not level:
            return ''
        from apps.admin_management.services.i18n_labels import entity_localized_name

        return entity_localized_name(level, self._request_lang())

    def get_academic_sector_name(self, obj: StudentProfile) -> str:
        sector = getattr(obj, 'academic_sector', None)
        if not sector:
            return ''
        from apps.admin_management.services.i18n_labels import entity_localized_name

        return entity_localized_name(sector, self._request_lang())

    def _resolve_internship(self, obj: StudentProfile):
        cache = getattr(self, '_internship_resolve_cache', None)
        if cache is None:
            self._internship_resolve_cache = {}
            cache = self._internship_resolve_cache
        if obj.pk not in cache:
            from apps.admin_management.services.internship_resolver import resolve_internship_type

            cache[obj.pk] = resolve_internship_type(
                filiere=getattr(obj, 'filiere', None),
                academic_level=getattr(obj, 'academic_level', None),
                academic_sector=getattr(obj, 'academic_sector', None),
                class_group=getattr(obj, 'class_group', None),
            )
        return cache[obj.pk]

    def get_internship_type_name(self, obj: StudentProfile) -> str:
        from apps.admin_management.services.i18n_labels import entity_localized_name

        internship_type = getattr(obj, 'internship_type', None)
        if internship_type:
            return entity_localized_name(internship_type, self._request_lang())

        resolved = self._resolve_internship(obj)
        if resolved.internship_type:
            return entity_localized_name(resolved.internship_type, self._request_lang())
        return ''

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not (data.get('internship_duration') or '').strip() or not data.get('internship_type_name'):
            resolved = self._resolve_internship(instance)
            if not (data.get('internship_duration') or '').strip() and resolved.internship_duration:
                data['internship_duration'] = resolved.internship_duration
            if not data.get('internship_type_name') and resolved.internship_type:
                from apps.admin_management.services.i18n_labels import entity_localized_name

                data['internship_type_name'] = entity_localized_name(
                    resolved.internship_type,
                    self._request_lang(),
                )
        return data


class StaffProfileSerializer(serializers.ModelSerializer):
    """Staff-specific fields."""

    class Meta:
        model = StaffProfile
        fields = [
            'id', 'department', 'job_title', 'office_location',
            'phone_extension', 'hire_date', 'employee_number',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class SupervisorProfileSerializer(serializers.ModelSerializer):
    """Supervisor-specific fields."""

    class Meta:
        model = SupervisorProfile
        fields = [
            'id', 'specialization', 'office_location',
            'accepting_students', 'student_capacity',
            'linkedin_url', 'research_interests',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Full user with all profile data."""

    profile = UserProfileSerializer(read_only=True)
    student_profile = StudentProfileSerializer(read_only=True)
    staff_profile = StaffProfileSerializer(read_only=True)
    supervisor_profile = SupervisorProfileSerializer(read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'role', 'account_status', 'auth_provider',
            'full_name', 'profile',
            'student_profile', 'staff_profile', 'supervisor_profile',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'auth_provider']


class UserListSerializer(serializers.ModelSerializer):
    """Minimal user for list views."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'account_status', 'created_at']


# ------------------------------------------------------------------------------
# Onboarding Serializers
# ------------------------------------------------------------------------------

class ConfirmIdentitySerializer(serializers.Serializer):
    """Step 1: Confirm basic identity info (writes to UserProfile and StudentProfile)."""

    MIN_STUDENT_AGE = 16
    MAX_STUDENT_AGE = 80

    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    date_of_birth = serializers.DateField(required=True)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)
    program_major = serializers.CharField(max_length=255, required=False, allow_blank=True)
    current_class = serializers.CharField(max_length=100, required=False, allow_blank=True)
    filiere_id = serializers.IntegerField(required=False, allow_null=True)
    class_group_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_date_of_birth(self, value: date) -> date:
        today = date.today()
        if value > today:
            raise serializers.ValidationError(
                'La date de naissance ne peut pas être dans le futur.'
            )

        age = today.year - value.year - (
            (today.month, today.day) < (value.month, value.day)
        )
        if age < self.MIN_STUDENT_AGE:
            raise serializers.ValidationError(
                f'L\'étudiant doit avoir au moins {self.MIN_STUDENT_AGE} ans.'
            )
        if age > self.MAX_STUDENT_AGE:
            raise serializers.ValidationError(
                'La date de naissance semble incorrecte. Vérifiez la saisie.'
            )
        return value


class CompleteStudentProfileSerializer(serializers.Serializer):
    """Step 2: Complete student-specific profile."""

    program_major = serializers.CharField(max_length=255, required=False, allow_blank=True)
    current_class = serializers.CharField(max_length=100, required=False, allow_blank=True)
    linkedin_url = serializers.URLField(max_length=255, required=False, allow_blank=True)
    professional_summary = serializers.CharField(required=False, allow_blank=True)
    # cv_file handled separately via multipart upload

    # Career & Internship Preferences
    career_objective = serializers.CharField(required=False, allow_blank=True)
    skills = serializers.CharField(required=False, allow_blank=True)  # Comma-separated string
    availability = serializers.CharField(max_length=50, required=False, allow_blank=True)
    start_date = serializers.DateField(required=False, allow_null=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    mobility = serializers.CharField(required=False, allow_blank=True)  # Comma-separated string
    has_applied = serializers.BooleanField(required=False, allow_null=True)


class UpdateInternshipStatusSerializer(serializers.Serializer):
    """Student declares whether they already have an internship."""

    has_internship = serializers.BooleanField()
    internship_company_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    internship_specialization = serializers.CharField(max_length=255, required=False, allow_blank=True)
    internship_company_city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    internship_stage_duration = serializers.CharField(max_length=64, required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs.get('has_internship'):
            required = {
                'internship_company_name': 'Company name is required when you have an internship.',
                'internship_specialization': 'Specialization is required when you have an internship.',
                'internship_company_city': 'City is required when you have an internship.',
                'internship_stage_duration': 'Internship duration is required when you have an internship.',
            }
            errors = {
                field: [message]
                for field, message in required.items()
                if not (attrs.get(field) or '').strip()
            }
            if errors:
                raise serializers.ValidationError(errors)
        return attrs


class CompleteStaffProfileSerializer(serializers.Serializer):
    """Step 2: Complete staff-specific profile."""

    department = serializers.CharField(max_length=128, required=False, allow_blank=True)
    job_title = serializers.CharField(max_length=128, required=False, allow_blank=True)
    office_location = serializers.CharField(max_length=128, required=False, allow_blank=True)
    phone_extension = serializers.CharField(max_length=16, required=False, allow_blank=True)


class CompleteSupervisorProfileSerializer(serializers.Serializer):
    """Step 2: Complete supervisor-specific profile."""

    specialization = serializers.CharField(max_length=255, required=False, allow_blank=True)
    office_location = serializers.CharField(max_length=128, required=False, allow_blank=True)
    linkedin_url = serializers.URLField(max_length=255, required=False, allow_blank=True)
    research_interests = serializers.CharField(required=False, allow_blank=True)
