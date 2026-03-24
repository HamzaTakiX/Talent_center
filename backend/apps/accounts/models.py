from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model supporting multiple roles and utilizing email
    as the primary unique identifier.
    """
    class RoleChoices(models.TextChoices):
        STUDENT = 'STUDENT', _('Student')
        ADMIN = 'ADMIN', _('Admin')
        # Ready for future roles

    username = None
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.STUDENT,
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class StudentProfile(models.Model):
    """
    Profile specific to Student users, containing onboarding
    information and professional details.
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='student_profile'
    )
    
    # Basic Info
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Academic Info
    program_major = models.CharField(max_length=255, blank=True)
    current_class = models.CharField(max_length=100, blank=True)
    
    # Professional Info
    linkedin_url = models.URLField(max_length=255, blank=True)
    professional_summary = models.TextField(blank=True)
    cv_file = models.FileField(upload_to='cvs/', null=True, blank=True)
    
    # Onboarding Status tracking
    identity_confirmed = models.BooleanField(default=False)
    profile_completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.user.email})"
