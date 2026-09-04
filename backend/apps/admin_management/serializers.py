from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts_et_roles.models import Permission, Role, UserOnboardingProgress
from apps.accounts_et_roles.serializers import StudentProfileSerializer, UserProfileSerializer
from apps.admin_management.models import AdminProfile, ClassGroup, Filiere
from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.admin_management.services.scopes import is_super_admin
from apps.admin_management.services.rbac_seed import UI_PERMISSION_TO_CODE, UI_ROLE_TO_CODE
from apps.admin_management.services.encadrants import (
    build_encadrant_scope_payload,
    build_encadrant_specialization_payload,
)
from apps.admin_management.services.supervised_internship_types import (
    build_encadrant_supervised_internship_payload,
    validate_supervised_internship_type_ids,
)
from apps.admin_management.services.specialization_domains import validate_specialization_domain_ids
from apps.admin_management.services.students import student_risk_flags

User = get_user_model()

CODE_TO_UI_ROLE = {v: k for k, v in UI_ROLE_TO_CODE.items()}
CODE_TO_UI_PERMISSION = {v: k for k, v in UI_PERMISSION_TO_CODE.items()}


class FiliereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filiere
        fields = [
            'id', 'code', 'name', 'program_family', 'department', 'is_active',
        ]


class ClassGroupSerializer(serializers.ModelSerializer):
    filiere_code = serializers.CharField(source='filiere.code', read_only=True)
    filiere_name = serializers.CharField(source='filiere.name', read_only=True)
    academic_level_id = serializers.IntegerField(read_only=True, allow_null=True)
    academic_sector_id = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = ClassGroup
        fields = [
            'id', 'code', 'name', 'filiere', 'filiere_code', 'filiere_name',
            'academic_year', 'academic_year_ref', 'level',
            'academic_level_id', 'academic_sector_id',
            'student_capacity', 'is_active',
        ]


class AdminStudentListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    first_name = serializers.CharField(source='profile.first_name', read_only=True, default='')
    last_name = serializers.CharField(source='profile.last_name', read_only=True, default='')
    program_major = serializers.CharField(source='student_profile.program_major', read_only=True, default='')
    filiere_code = serializers.SerializerMethodField()
    current_class = serializers.CharField(source='student_profile.current_class', read_only=True, default='')
    filiere_id = serializers.IntegerField(source='student_profile.filiere_id', read_only=True, allow_null=True)
    class_group_id = serializers.IntegerField(source='student_profile.class_group_id', read_only=True, allow_null=True)
    academic_level_id = serializers.IntegerField(
        source='student_profile.academic_level_id', read_only=True, allow_null=True,
    )
    academic_sector_id = serializers.IntegerField(
        source='student_profile.academic_sector_id', read_only=True, allow_null=True,
    )
    internship_type_id = serializers.IntegerField(
        source='student_profile.internship_type_id', read_only=True, allow_null=True,
    )
    internship_type_name = serializers.SerializerMethodField()
    internship_duration = serializers.CharField(
        source='student_profile.internship_duration', read_only=True, default='',
    )
    internship_category = serializers.CharField(
        source='student_profile.internship_category', read_only=True, default='',
    )
    academic_year = serializers.CharField(source='student_profile.academic_year', read_only=True, default='')
    academic_year_id = serializers.IntegerField(
        source='student_profile.academic_year_ref_id', read_only=True, allow_null=True,
    )
    student_number = serializers.CharField(source='student_profile.student_number', read_only=True, default='')
    identity_confirmed = serializers.BooleanField(source='student_profile.identity_confirmed', read_only=True, default=False)
    profile_completed = serializers.BooleanField(source='student_profile.profile_completed', read_only=True, default=False)
    last_login_at = serializers.DateTimeField(source='last_login', read_only=True, allow_null=True)
    has_credential = serializers.SerializerMethodField()
    risk_flags = serializers.SerializerMethodField()
    onboarding_percent = serializers.SerializerMethodField()
    has_internship_assignment = serializers.SerializerMethodField()
    intelligence = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'first_name', 'last_name',
            'account_status', 'auth_provider', 'platform_access_granted',
            'sso_enabled', 'first_login_completed', 'is_active',
            'program_major', 'filiere_code', 'current_class', 'filiere_id', 'class_group_id',
            'academic_level_id', 'academic_sector_id', 'internship_type_id',
            'internship_type_name', 'internship_duration', 'internship_category',
            'academic_year', 'academic_year_id', 'student_number',
            'identity_confirmed', 'profile_completed',
            'last_login_at', 'created_at',
            'has_credential', 'risk_flags', 'onboarding_percent',
            'has_internship_assignment', 'intelligence', 'avatar_url',
        ]

    def get_filiere_code(self, obj) -> str:
        from .services.filiere_display import program_short_label

        try:
            sp = obj.student_profile
        except Exception:
            return ''
        return program_short_label(
            filiere=getattr(sp, 'filiere', None),
            program_major=sp.program_major or '',
        )

    def get_internship_type_name(self, obj) -> str:
        try:
            sp = obj.student_profile
            if sp.internship_type_id:
                return sp.internship_type.name
        except Exception:
            pass
        return ''

    def get_has_credential(self, obj) -> bool:
        return obj.student_credentials.filter(is_current=True).exists()

    def get_risk_flags(self, obj) -> list[str]:
        return student_risk_flags(obj)

    def get_onboarding_percent(self, obj) -> int:
        try:
            sp = obj.student_profile
        except Exception:
            return 0
        indicator = getattr(sp, 'indicator', None)
        if indicator and indicator.profile_completion_score:
            return indicator.profile_completion_score
        steps = [sp.identity_confirmed, sp.profile_completed]
        return int(sum(1 for s in steps if s) / len(steps) * 100)

    def get_intelligence(self, obj) -> dict | None:
        try:
            sp = obj.student_profile
            indicator = getattr(sp, 'indicator', None)
        except Exception:
            return None
        if indicator is None:
            return None
        return {
            'risk_score': indicator.risk_score,
            'risk_category': indicator.risk_category,
            'engagement_score': indicator.engagement_score,
            'engagement_category': indicator.engagement_category,
            'employability_score': indicator.employability_score,
            'internship_readiness_score': indicator.internship_readiness_score,
            'profile_completion_score': indicator.profile_completion_score,
            'interview_readiness_score': indicator.interview_readiness_score,
            'career_progress_score': indicator.career_progress_score,
            'placement_probability': indicator.placement_probability,
            'health_score': indicator.health_score,
            'health_index': indicator.health_index,
            'is_at_risk': indicator.is_at_risk,
            'computed_at': indicator.computed_at.isoformat() if indicator.computed_at else None,
        }

    def get_has_internship_assignment(self, obj) -> bool:
        if hasattr(obj, 'has_internship_assignment'):
            return bool(obj.has_internship_assignment)
        from .models import Assignment

        try:
            sp = obj.student_profile
        except Exception:
            return False
        return Assignment.objects.filter(
            student_profile=sp,
            is_active=True,
            encadrant_profile__isnull=False,
        ).exists()

    def get_avatar_url(self, obj) -> str | None:
        profile = getattr(obj, 'profile', None)
        if not profile or not profile.avatar:
            return None
        url = profile.avatar.url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(url)
        return url


class AdminStudentDetailSerializer(AdminStudentListSerializer):
    profile = UserProfileSerializer(read_only=True)
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta(AdminStudentListSerializer.Meta):
        fields = AdminStudentListSerializer.Meta.fields + ['profile', 'student_profile']


class CreateStudentSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    student_number = serializers.CharField(max_length=64, required=False, allow_blank=True)
    filiere_id = serializers.IntegerField(required=False, allow_null=True)
    academic_level_id = serializers.IntegerField(required=False, allow_null=True)
    academic_sector_id = serializers.IntegerField(required=False, allow_null=True)
    class_group_id = serializers.IntegerField(required=False, allow_null=True)
    academic_year = serializers.CharField(max_length=16, required=False, allow_blank=True)
    academic_year_id = serializers.IntegerField(required=False, allow_null=True)
    sso_enabled = serializers.BooleanField(required=False, default=False)
    grant_access = serializers.BooleanField(required=False, default=False)


class UpdateStudentAccessSerializer(serializers.Serializer):
    account_status = serializers.ChoiceField(
        choices=User.AccountStatus.choices,
        required=False,
    )
    platform_access_granted = serializers.BooleanField(required=False)
    sso_enabled = serializers.BooleanField(required=False)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)


class UpdateStudentAssignmentSerializer(serializers.Serializer):
    filiere_id = serializers.IntegerField(required=False, allow_null=True)
    academic_level_id = serializers.IntegerField(required=False, allow_null=True)
    academic_sector_id = serializers.IntegerField(required=False, allow_null=True)
    class_group_id = serializers.IntegerField(required=False, allow_null=True)
    academic_year = serializers.CharField(max_length=16, required=False, allow_blank=True)
    academic_year_id = serializers.IntegerField(required=False, allow_null=True)


class UpdateStudentProfileSerializer(serializers.Serializer):
    avatar = serializers.ImageField(required=False, allow_null=True)
    remove_avatar = serializers.BooleanField(required=False, default=False)


class RoleOptionSerializer(serializers.ModelSerializer):
    ui_slug = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ['id', 'code', 'name', 'description', 'ui_slug']

    def get_ui_slug(self, obj) -> str:
        return CODE_TO_UI_ROLE.get(obj.code, '')


class PermissionOptionSerializer(serializers.ModelSerializer):
    ui_key = serializers.SerializerMethodField()

    class Meta:
        model = Permission
        fields = ['id', 'code', 'name', 'description', 'module', 'ui_key']

    def get_ui_key(self, obj) -> str:
        return CODE_TO_UI_PERMISSION.get(obj.code, obj.code)


class AdminScopeSerializer(serializers.Serializer):
    filiere_ids = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    class_group_ids = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    level_ids = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    sector_ids = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    levels = serializers.ListField(child=serializers.CharField(), read_only=True)
    academic_years = serializers.ListField(child=serializers.CharField(), read_only=True)
    filiere_labels = serializers.ListField(child=serializers.CharField(), read_only=True)
    class_group_labels = serializers.ListField(child=serializers.CharField(), read_only=True)


class AdminAdministratorListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    first_name = serializers.CharField(source='profile.first_name', read_only=True, default='')
    last_name = serializers.CharField(source='profile.last_name', read_only=True, default='')
    admin_level = serializers.CharField(source='admin_profile.admin_level', read_only=True, default='STANDARD')
    is_admin_active = serializers.BooleanField(source='admin_profile.is_active', read_only=True, default=True)
    role_slugs = serializers.SerializerMethodField()
    is_super_admin = serializers.SerializerMethodField()
    permission_keys = serializers.SerializerMethodField()
    scopes = serializers.SerializerMethodField()
    last_login_at = serializers.DateTimeField(source='last_login', read_only=True, allow_null=True)
    onboarding_complete = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'first_name', 'last_name',
            'account_status', 'auth_provider', 'platform_access_granted',
            'sso_enabled', 'first_login_completed', 'is_active',
            'admin_level', 'is_admin_active',
            'role_slugs', 'is_super_admin', 'permission_keys', 'scopes',
            'last_login_at', 'onboarding_complete', 'created_at', 'avatar_url',
        ]

    def get_is_super_admin(self, obj) -> bool:
        return is_super_admin(obj)

    def get_role_slugs(self, obj) -> list[str]:
        if is_super_admin(obj):
            return ['super']
        codes = obj.active_role_codes()
        return [CODE_TO_UI_ROLE[c] for c in codes if c in CODE_TO_UI_ROLE]

    def get_permission_keys(self, obj) -> list[str]:
        perms = get_admin_effective_permissions(obj)
        return [CODE_TO_UI_PERMISSION[p] for p in perms if p in CODE_TO_UI_PERMISSION]

    def get_scopes(self, obj) -> dict:
        filiere_ids = []
        class_group_ids = []
        filiere_labels = []
        class_group_labels = []
        for a in obj.admin_role_assignments.filter(is_active=True):
            if a.filiere_id and a.filiere_id not in filiere_ids:
                filiere_ids.append(a.filiere_id)
                filiere_labels.append(a.filiere.name if a.filiere else '')
            if a.class_group_id and a.class_group_id not in class_group_ids:
                class_group_ids.append(a.class_group_id)
                class_group_labels.append(a.class_group.name if a.class_group else '')
        profile = getattr(obj, 'admin_profile', None)
        return {
            'filiere_ids': filiere_ids,
            'class_group_ids': class_group_ids,
            'level_ids': list(profile.scope_level_ids or []) if profile else [],
            'sector_ids': list(profile.scope_sector_ids or []) if profile else [],
            'levels': list(profile.scope_levels or []) if profile else [],
            'academic_years': list(profile.scope_academic_years or []) if profile else [],
            'filiere_labels': filiere_labels,
            'class_group_labels': class_group_labels,
        }

    def get_onboarding_complete(self, obj) -> bool:
        if obj.first_login_completed:
            return True
        pending = UserOnboardingProgress.objects.filter(
            user=obj,
            step__code='ADMIN_WELCOME',
            status__in=[
                UserOnboardingProgress.Status.NOT_STARTED,
                UserOnboardingProgress.Status.IN_PROGRESS,
            ],
        ).exists()
        return not pending

    def get_avatar_url(self, obj) -> str | None:
        profile = getattr(obj, 'profile', None)
        if not profile or not profile.avatar:
            return None
        url = profile.avatar.url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(url)
        return url


class AdminAdministratorDetailSerializer(AdminAdministratorListSerializer):
    profile = UserProfileSerializer(read_only=True)
    notes = serializers.CharField(source='admin_profile.notes', read_only=True, default='')
    permission_codes = serializers.SerializerMethodField()

    class Meta(AdminAdministratorListSerializer.Meta):
        fields = AdminAdministratorListSerializer.Meta.fields + [
            'profile', 'notes', 'permission_codes',
        ]

    def get_permission_codes(self, obj) -> list[str]:
        return sorted(get_admin_effective_permissions(obj))


class CreateAdministratorSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    role_slugs = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    permission_keys = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    filiere_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    class_group_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    levels = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    level_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    sector_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    academic_years = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    sso_enabled = serializers.BooleanField(required=False, default=False)
    account_status = serializers.ChoiceField(
        choices=User.AccountStatus.choices,
        required=False,
        default=User.AccountStatus.PENDING,
    )
    admin_level = serializers.ChoiceField(
        choices=AdminProfile.AdminLevel.choices,
        required=False,
        default=AdminProfile.AdminLevel.STANDARD,
    )
    grant_access = serializers.BooleanField(required=False, default=False)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class UpdateAdministratorSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255, required=False)
    email = serializers.EmailField(required=False)
    role_slugs = serializers.ListField(child=serializers.CharField(), required=False)
    permission_keys = serializers.ListField(child=serializers.CharField(), required=False)
    filiere_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    class_group_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    levels = serializers.ListField(child=serializers.CharField(), required=False)
    level_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    sector_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    academic_years = serializers.ListField(child=serializers.CharField(), required=False)
    sso_enabled = serializers.BooleanField(required=False)
    account_status = serializers.ChoiceField(choices=User.AccountStatus.choices, required=False)
    admin_level = serializers.ChoiceField(choices=AdminProfile.AdminLevel.choices, required=False)
    platform_access_granted = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)


class EncadrantScopeSerializer(serializers.Serializer):
    filiere_ids = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    class_group_ids = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    level_ids = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    sector_ids = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    academic_years = serializers.ListField(child=serializers.CharField(), read_only=True)
    filiere_labels = serializers.ListField(child=serializers.CharField(), read_only=True)
    filiere_codes = serializers.ListField(child=serializers.CharField(), read_only=True)
    class_group_labels = serializers.ListField(child=serializers.CharField(), read_only=True)
    level_labels = serializers.ListField(child=serializers.CharField(), read_only=True)
    sector_labels = serializers.ListField(child=serializers.CharField(), read_only=True)


class AdminEncadrantListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    first_name = serializers.CharField(source='profile.first_name', read_only=True, default='')
    last_name = serializers.CharField(source='profile.last_name', read_only=True, default='')
    avatar_url = serializers.SerializerMethodField()
    max_students = serializers.IntegerField(
        source='supervisor_profile.encadrant_profile.max_concurrent_students',
        read_only=True,
        default=0,
    )
    current_students = serializers.SerializerMethodField()
    specialization_domains = serializers.SerializerMethodField()
    supervised_internship_types = serializers.SerializerMethodField()
    scopes = serializers.SerializerMethodField()
    is_encadrant_active = serializers.BooleanField(
        source='supervisor_profile.encadrant_profile.is_active',
        read_only=True,
        default=True,
    )
    last_login_at = serializers.DateTimeField(source='last_login', read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'first_name', 'last_name',
            'account_status', 'auth_provider', 'platform_access_granted',
            'sso_enabled', 'first_login_completed', 'is_active',
            'max_students', 'current_students', 'specialization_domains',
            'supervised_internship_types', 'scopes', 'is_encadrant_active', 'last_login_at', 'created_at',
            'avatar_url',
        ]

    def get_current_students(self, obj) -> int:
        annotated = getattr(obj, '_assigned_count', None)
        if annotated is not None:
            return int(annotated)
        try:
            enc = obj.supervisor_profile.encadrant_profile
        except Exception:
            return 0
        return enc.current_workload

    def get_specialization_domains(self, obj) -> list:
        try:
            enc = obj.supervisor_profile.encadrant_profile
            request = self.context.get('request')
            lang = ''
            if request is not None:
                from .services.academic_reference import request_lang
                lang = request_lang(request)
            return build_encadrant_specialization_payload(enc, lang)
        except Exception:
            return []

    def get_supervised_internship_types(self, obj) -> list:
        try:
            enc = obj.supervisor_profile.encadrant_profile
            request = self.context.get('request')
            lang = ''
            if request is not None:
                from .services.academic_reference import request_lang
                lang = request_lang(request)
            return build_encadrant_supervised_internship_payload(enc, lang)
        except Exception:
            return []

    def get_scopes(self, obj) -> dict:
        try:
            enc = obj.supervisor_profile.encadrant_profile
            return build_encadrant_scope_payload(enc)
        except Exception:
            return {
                'filiere_ids': [],
                'class_group_ids': [],
                'level_ids': [],
                'sector_ids': [],
                'academic_years': [],
                'filiere_labels': [],
                'filiere_codes': [],
                'class_group_labels': [],
                'level_labels': [],
                'sector_labels': [],
                'scope_is_complete': False,
                'scope_gaps': ['PROGRAMS', 'LEVELS', 'ACADEMIC_YEARS', 'SUPERVISED_INTERNSHIP_TYPES'],
            }

    def get_avatar_url(self, obj) -> str | None:
        profile = getattr(obj, 'profile', None)
        if not profile or not getattr(profile, 'avatar', None):
            return None
        url = profile.avatar.url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(url)
        return url


class AdminEncadrantDetailSerializer(AdminEncadrantListSerializer):
    profile = UserProfileSerializer(read_only=True)
    accepting_students = serializers.BooleanField(
        source='supervisor_profile.accepting_students',
        read_only=True,
        default=True,
    )

    class Meta(AdminEncadrantListSerializer.Meta):
        fields = AdminEncadrantListSerializer.Meta.fields + ['profile', 'accepting_students']


class CreateEncadrantSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    filiere_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    class_group_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    level_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    sector_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    academic_years = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    specialization_domain_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    supervised_internship_type_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    max_students = serializers.IntegerField(required=False, default=15, min_value=0)
    sso_enabled = serializers.BooleanField(required=False, default=True)
    grant_access = serializers.BooleanField(required=False, default=False)
    is_active = serializers.BooleanField(required=False, default=True)

    def validate_specialization_domain_ids(self, value):
        try:
            validate_specialization_domain_ids(value or [])
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return value

    def validate_supervised_internship_type_ids(self, value):
        try:
            validate_supervised_internship_type_ids(value or [])
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return value


class UpdateEncadrantSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255, required=False)
    email = serializers.EmailField(required=False)
    filiere_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    class_group_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    level_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    sector_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    academic_years = serializers.ListField(child=serializers.CharField(), required=False)
    specialization_domain_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
    )
    supervised_internship_type_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
    )
    max_students = serializers.IntegerField(required=False, min_value=0)
    platform_access_granted = serializers.BooleanField(required=False)
    sso_enabled = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    account_status = serializers.ChoiceField(choices=User.AccountStatus.choices, required=False)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate_specialization_domain_ids(self, value):
        if value is None:
            return value
        try:
            validate_specialization_domain_ids(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return value

    def validate_supervised_internship_type_ids(self, value):
        if value is None:
            return value
        try:
            validate_supervised_internship_type_ids(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        return value


class UpdateEncadrantProfileSerializer(serializers.Serializer):
    avatar = serializers.ImageField(required=False, allow_null=True)
    remove_avatar = serializers.BooleanField(required=False, default=False)


class SmartAssignmentRunSerializer(serializers.Serializer):
    STRATEGY_FULL = 'full'
    STRATEGY_SKIP_ASSIGNED = 'skip_assigned'
    STRATEGY_UNASSIGNED_ONLY = 'unassigned_only'

    academic_year = serializers.CharField(required=False, allow_blank=True, max_length=16)
    excluded_student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    excluded_encadrant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list,
    )
    respect_locks = serializers.BooleanField(required=False, default=True)
    assignment_strategy = serializers.ChoiceField(
        choices=[STRATEGY_FULL, STRATEGY_SKIP_ASSIGNED, STRATEGY_UNASSIGNED_ONLY],
        required=False,
        default=STRATEGY_FULL,
    )
    confirm_warnings = serializers.BooleanField(required=False, default=False)
    skip_validation = serializers.BooleanField(required=False, default=False)


class SmartAssignmentReassignSerializer(serializers.Serializer):
    student_profile_id = serializers.IntegerField()
    encadrant_profile_id = serializers.IntegerField(required=False, allow_null=True)
    academic_year = serializers.CharField(required=False, allow_blank=True, max_length=16)
    lock = serializers.BooleanField(required=False, allow_null=True)


class SmartAssignmentLockSerializer(serializers.Serializer):
    assignment_id = serializers.IntegerField()
    is_locked = serializers.BooleanField()


class BulkDeleteUsersSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
        max_length=200,
    )


class AdminEncadrantReportListSerializer(serializers.Serializer):
    """Rapport soumis par un encadrant pour un étudiant (liste admin)."""

    id = serializers.CharField()
    encadrant = serializers.CharField()
    student = serializers.CharField()
    report_type = serializers.CharField()
    status = serializers.CharField()
    submitted_date = serializers.CharField()
    due_date = serializers.CharField()
