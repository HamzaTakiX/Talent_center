from rest_framework import serializers
from .models import User, UserProfile, StudentProfile, StaffProfile, SupervisorProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Common profile fields for ALL users."""

    class Meta:
        model = UserProfile
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'date_of_birth',
            'gender', 'avatar', 'bio', 'timezone', 'language',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class StudentProfileSerializer(serializers.ModelSerializer):
    """Student-specific fields. Includes personal info from UserProfile."""

    # Personal info from UserProfile (for frontend convenience)
    first_name = serializers.CharField(source='user.profile.first_name', read_only=True)
    last_name = serializers.CharField(source='user.profile.last_name', read_only=True)
    date_of_birth = serializers.DateField(source='user.profile.date_of_birth', read_only=True)
    phone = serializers.CharField(source='user.profile.phone', read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'first_name', 'last_name', 'date_of_birth', 'phone',
            'student_number', 'program_major', 'current_class',
            'enrollment_year', 'expected_graduation_year',
            'linkedin_url', 'professional_summary', 'cv_file',
            'career_objective', 'skills', 'availability', 'start_date', 'city', 'mobility', 'has_applied',
            'identity_confirmed', 'profile_completed',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['identity_confirmed', 'profile_completed', 'created_at', 'updated_at', 'first_name', 'last_name', 'date_of_birth', 'phone']


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

    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    date_of_birth = serializers.DateField(required=True)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)
    program_major = serializers.CharField(max_length=255, required=False, allow_blank=True)
    current_class = serializers.CharField(max_length=100, required=False, allow_blank=True)


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
