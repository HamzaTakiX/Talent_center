from rest_framework import serializers
from .models import User, StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'first_name', 'last_name', 'date_of_birth',
            'program_major', 'current_class', 'linkedin_url',
            'professional_summary', 'cv_file',
            'identity_confirmed', 'profile_completed'
        ]
        read_only_fields = ['identity_confirmed', 'profile_completed']

class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'student_profile']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class ConfirmIdentitySerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['first_name', 'last_name', 'date_of_birth']

class CompleteProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'program_major', 'current_class', 'linkedin_url', 
            'professional_summary', 'cv_file'
        ]
