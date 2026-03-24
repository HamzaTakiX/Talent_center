from django.core.exceptions import ObjectDoesNotExist
from .models import User, StudentProfile

def get_user_by_email(email: str) -> User:
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        return None

def get_profile_for_user(user: User) -> StudentProfile:
    try:
        return user.student_profile
    except ObjectDoesNotExist:
        return None
