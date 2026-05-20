"""First SSO login — auto-provision local password and admin profile."""

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from apps.accounts_et_roles.models import StaffProfile, UserOnboardingProgress, UserProfile
from apps.accounts_et_roles.services import ensure_user_profile
from apps.admin_management.models import AdminProfile, EncadrantProfile

from ..providers.base import ProviderIdentity
from .credentials import generate_secure_password, set_student_password
from .security import log_event

User = get_user_model()


@transaction.atomic
def complete_first_sso_login(*, user, actor=None) -> dict:
    """
    On first SSO login for an authorized student:
    - generate enterprise-grade password
    - store hashed + encrypted copy
    - mark first_login_completed
    """
    if user.first_login_completed:
        return {'first_login': False, 'password_generated': False}

    if user.role != User.RoleChoices.STUDENT:
        user.first_login_completed = True
        user.save(update_fields=['first_login_completed', 'updated_at'])
        return {'first_login': True, 'password_generated': False}

    plaintext = generate_secure_password()
    set_student_password(user=user, plaintext=plaintext, generated_by=actor)
    user.first_login_completed = True
    user.save(update_fields=['first_login_completed', 'updated_at'])

    log_event(
        event_type='PASSWORD_CHANGED',
        user=user,
        metadata={'reason': 'first_sso_login_auto_provision'},
    )
    return {'first_login': True, 'password_generated': True}


@transaction.atomic
def complete_first_admin_sso_login(*, user, identity: ProviderIdentity | None = None) -> dict:
    """
    On first SSO login for an authorized administrator:
    - link provider identity
    - provision profiles if missing
    - mark onboarding welcome step complete
    - record last admin login
    """
    if user.first_login_completed:
        if hasattr(user, 'admin_profile'):
            user.admin_profile.last_admin_login_at = timezone.now()
            user.admin_profile.save(update_fields=['last_admin_login_at', 'updated_at'])
        return {'first_login': False, 'password_generated': False}

    if identity and identity.provider_user_id:
        user.auth_provider = identity.provider.value
        user.provider_user_id = identity.provider_user_id
        user.save(update_fields=['auth_provider', 'provider_user_id', 'updated_at'])

    ensure_user_profile(user)
    StaffProfile.objects.get_or_create(user=user)

    admin_profile, _ = AdminProfile.objects.get_or_create(
        user=user,
        defaults={'admin_level': AdminProfile.AdminLevel.STANDARD, 'is_active': True},
    )
    admin_profile.last_admin_login_at = timezone.now()
    admin_profile.save(update_fields=['last_admin_login_at', 'updated_at'])

    profile = ensure_user_profile(user)
    if identity and identity.email and not profile.first_name:
        local_part = identity.email.split('@')[0].replace('.', ' ').replace('_', ' ')
        parts = local_part.split()
        profile.first_name = parts[0].title() if parts else ''
        profile.last_name = ' '.join(p.title() for p in parts[1:]) if len(parts) > 1 else ''
        profile.save()

    progress = UserOnboardingProgress.objects.filter(
        user=user,
        step__code='ADMIN_WELCOME',
    ).first()
    if progress:
        progress.status = UserOnboardingProgress.Status.COMPLETED
        progress.completed_at = timezone.now()
        progress.save(update_fields=['status', 'completed_at', 'updated_at'])

    if user.account_status == User.AccountStatus.AUTHORIZED:
        user.account_status = User.AccountStatus.ACTIVE

    user.first_login_completed = True
    user.save(update_fields=['first_login_completed', 'account_status', 'updated_at'])

    log_event(
        event_type='ADMIN_FIRST_LOGIN',
        user=user,
        metadata={'reason': 'first_sso_admin_provision'},
    )
    return {'first_login': True, 'password_generated': False}


@transaction.atomic
def complete_first_supervisor_sso_login(*, user, identity: ProviderIdentity | None = None) -> dict:
    """
    On first SSO login for an authorized supervisor:
    - link provider identity
    - generate secure local password (stored encrypted for admin reveal)
    - mark first_login_completed and activate account
    """
    if user.first_login_completed:
        return {'first_login': False, 'password_generated': False}

    if identity and identity.provider_user_id:
        user.auth_provider = identity.provider.value
        user.provider_user_id = identity.provider_user_id
        user.save(update_fields=['auth_provider', 'provider_user_id', 'updated_at'])

    profile = ensure_user_profile(user)
    if identity and identity.email and not profile.first_name:
        local_part = identity.email.split('@')[0].replace('.', ' ').replace('_', ' ')
        parts = local_part.split()
        profile.first_name = parts[0].title() if parts else ''
        profile.last_name = ' '.join(p.title() for p in parts[1:]) if len(parts) > 1 else ''
        profile.save()

    from apps.accounts_et_roles.models import SupervisorProfile

    supervisor, _ = SupervisorProfile.objects.get_or_create(user=user)
    EncadrantProfile.objects.get_or_create(
        supervisor_profile=supervisor,
        defaults={'max_concurrent_students': supervisor.student_capacity or 15},
    )

    plaintext = generate_secure_password()
    set_student_password(user=user, plaintext=plaintext)
    user.first_login_completed = True
    if user.account_status == User.AccountStatus.AUTHORIZED:
        user.account_status = User.AccountStatus.ACTIVE
    user.save(update_fields=['first_login_completed', 'account_status', 'updated_at'])

    log_event(
        event_type='SUPERVISOR_FIRST_LOGIN',
        user=user,
        metadata={'reason': 'first_sso_supervisor_provision'},
    )
    return {'first_login': True, 'password_generated': True}
