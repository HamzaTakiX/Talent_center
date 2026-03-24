from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from .models import User, StudentProfile

def perform_login(email: str, password: str) -> tuple[User, str]:
    """
    Authenticates the user and returns the user object and a token.
    For this foundational setup, we simulate the token generation.
    In production, hook this up to SimpleJWT or TokenAuthentication.
    """
    user = authenticate(email=email, password=password)
    if not user:
        raise AuthenticationFailed("Invalid email or password.")
    
    # Placeholder for actual token system integration
    token = "placeholder_jwt_token_for_user" 
    
    return user, token

def confirm_identity(user: User, data: dict) -> StudentProfile:
    """
    Updates the identity fields and sets identity_confirmed to True.
    """
    profile, _ = StudentProfile.objects.get_or_create(user=user)
    
    profile.first_name = data.get('first_name', profile.first_name)
    profile.last_name = data.get('last_name', profile.last_name)
    profile.date_of_birth = data.get('date_of_birth', profile.date_of_birth)
    
    profile.identity_confirmed = True
    profile.save()
    return profile

def complete_profile(user: User, data: dict, cv_file=None) -> StudentProfile:
    """
    Updates professional fields, handles CV upload, and sets profile_completed to True.
    """
    profile, _ = StudentProfile.objects.get_or_create(user=user)
    
    profile.program_major = data.get('program_major', profile.program_major)
    profile.current_class = data.get('current_class', profile.current_class)
    profile.linkedin_url = data.get('linkedin_url', profile.linkedin_url)
    profile.professional_summary = data.get('professional_summary', profile.professional_summary)
    
    if cv_file:
        profile.cv_file = cv_file
        
    profile.profile_completed = True
    profile.save()
    return profile
