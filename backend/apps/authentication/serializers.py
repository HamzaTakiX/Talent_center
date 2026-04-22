from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.accounts_et_roles.serializers import (
    UserProfileSerializer,
    StudentProfileSerializer,
    StaffProfileSerializer,
    SupervisorProfileSerializer,
)
from .models import LoginSession

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    device_name = serializers.CharField(required=False, allow_blank=True, max_length=128)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
    logout_other_sessions = serializers.BooleanField(required=False, default=False)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)


class MeSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    last_login_at = serializers.DateTimeField(source='last_login', read_only=True)
    profile = UserProfileSerializer(read_only=True)
    student_profile = StudentProfileSerializer(read_only=True)
    staff_profile = StaffProfileSerializer(read_only=True)
    supervisor_profile = SupervisorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'account_status', 'auth_provider',
            'last_login_at', 'full_name', 'role',
            'profile', 'student_profile', 'staff_profile', 'supervisor_profile',
        ]
        read_only_fields = fields


class LoginSessionSerializer(serializers.ModelSerializer):
    current = serializers.SerializerMethodField()

    class Meta:
        model = LoginSession
        fields = [
            'id', 'device_name', 'ip_address', 'user_agent',
            'created_at', 'expires_at', 'revoked_at', 'current',
        ]
        read_only_fields = fields

    def get_current(self, obj) -> bool:
        return obj.jti == self.context.get('current_jti')
