"""Admin student lifecycle — create, authorize, assign, credentials."""

from typing import Optional

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Exists, OuterRef, Q
from django.utils import timezone

from apps.admin_management.models import Assignment

from apps.accounts_et_roles.models import StudentProfile, UserProfile
from apps.accounts_et_roles.services import change_account_status
from apps.admin_management.models import Assignment, ClassGroup, Filiere
from apps.admin_management.services.academic_validation import validate_academic_selection
from apps.authentication.models import StudentCredential
from apps.authentication.services.credentials import (
    generate_secure_password,
    set_student_password,
)
from apps.authentication.services.platform_access import (
    grant_platform_access,
    revoke_platform_access,
)

User = get_user_model()


def _sync_student_academic_fields(
    profile: StudentProfile,
    *,
    filiere=None,
    academic_level=None,
    academic_sector=None,
    internship_type=None,
    internship_duration: str = '',
    internship_category: str = '',
    class_group=None,
    academic_year: str = '',
    academic_year_ref=None,
) -> None:
    if filiere is not None:
        profile.filiere = filiere
        profile.program_major = filiere.name
    if academic_level is not None:
        profile.academic_level = academic_level
        if academic_level.filiere_id and profile.filiere_id is None:
            profile.filiere = academic_level.filiere
            profile.program_major = academic_level.filiere.name
    if academic_sector is not None:
        profile.academic_sector = academic_sector
    if class_group is not None:
        profile.class_group = class_group
        profile.current_class = class_group.name
        if class_group.filiere_id and profile.filiere_id is None:
            profile.filiere = class_group.filiere
            profile.program_major = class_group.filiere.name
        if class_group.academic_level_id and profile.academic_level_id is None:
            profile.academic_level = class_group.academic_level
    if academic_year_ref is not None:
        profile.academic_year_ref = academic_year_ref
        profile.academic_year = academic_year_ref.code
    elif academic_year:
        profile.academic_year = academic_year
    if internship_type is not None:
        profile.internship_type = internship_type
    if internship_duration:
        profile.internship_duration = internship_duration
    elif internship_type is not None and internship_type.duration_hint:
        profile.internship_duration = internship_type.duration_hint
    if internship_category:
        profile.internship_category = internship_category
    elif profile.filiere_id and not profile.internship_category:
        profile.internship_category = (profile.filiere.program_family or '').strip().upper()
    profile.save()


@transaction.atomic
def create_student(
    *,
    email: str,
    first_name: str = '',
    last_name: str = '',
    student_number: str = '',
    filiere_id: Optional[int] = None,
    academic_level_id: Optional[int] = None,
    academic_sector_id: Optional[int] = None,
    class_group_id: Optional[int] = None,
    academic_year: str = '',
    academic_year_id: Optional[int] = None,
    sso_enabled: bool = False,
    grant_access: bool = False,
    created_by=None,
) -> User:
    email = email.strip().lower()
    if User.objects.filter(email__iexact=email).exists():
        raise ValueError('A user with this email already exists.')

    status = User.AccountStatus.AUTHORIZED if grant_access else User.AccountStatus.PENDING
    user = User.objects.create(
        email=email,
        role=User.RoleChoices.STUDENT,
        auth_provider=User.AuthProvider.LOCAL if not sso_enabled else User.AuthProvider.AUTH0,
        account_status=status,
        platform_access_granted=grant_access,
        platform_access_granted_at=timezone.now() if grant_access else None,
        platform_access_granted_by=created_by if grant_access else None,
        sso_enabled=sso_enabled,
        is_active=True,
    )
    user.set_unusable_password()
    user.save(update_fields=['password'])

    UserProfile.objects.create(user=user, first_name=first_name, last_name=last_name)
    profile = StudentProfile.objects.create(
        user=user,
        student_number=student_number or '',
    )

    resolved = validate_academic_selection(
        filiere_id=filiere_id,
        academic_level_id=academic_level_id,
        academic_sector_id=academic_sector_id,
        class_group_id=class_group_id,
        academic_year=academic_year,
        academic_year_id=academic_year_id,
    )
    _sync_student_academic_fields(profile, **resolved)

    class_group = resolved['class_group']
    academic_year = resolved['academic_year']
    if class_group and academic_year:
        Assignment.objects.filter(
            student_profile=profile, academic_year=academic_year, is_active=True,
        ).update(is_active=False)
        Assignment.objects.create(
            student_profile=profile,
            class_group=class_group,
            academic_year=academic_year,
            assigned_by=created_by,
            is_active=True,
        )

    if grant_access:
        plaintext = generate_secure_password()
        set_student_password(user=user, plaintext=plaintext, generated_by=created_by)

    try:
        from apps.history.integrations.students import student_created

        student_created(user=user, profile=profile, actor=created_by)
    except Exception:
        pass

    try:
        from apps.notifications.events.publisher import emit_event

        emit_event(
            event_code='student.created',
            source_app='admin_management',
            entity_type='user',
            entity_id=user.pk,
            payload={
                'user_id': user.pk,
                'title': 'Welcome to Digital Talent Center',
                'body': 'Your student account has been created.',
            },
            actor=created_by,
        )
    except Exception:
        pass

    return user


@transaction.atomic
def update_student_access(
    *,
    user: User,
    account_status: Optional[str] = None,
    platform_access_granted: Optional[bool] = None,
    sso_enabled: Optional[bool] = None,
    changed_by=None,
    reason: str = '',
) -> User:
    old_status = user.account_status
    old_access = user.platform_access_granted
    old_sso = user.sso_enabled

    if platform_access_granted is True:
        grant_platform_access(user, granted_by=changed_by)
    elif platform_access_granted is False:
        revoke_platform_access(user)

    if sso_enabled is not None:
        user.sso_enabled = sso_enabled
        user.save(update_fields=['sso_enabled', 'updated_at'])

    if account_status:
        change_account_status(user, account_status, changed_by=changed_by, reason=reason)

    user.refresh_from_db()
    try:
        from apps.history.integrations.students import student_access_updated

        profile, _ = StudentProfile.objects.get_or_create(user=user)
        student_access_updated(
            user=user,
            profile=profile,
            actor=changed_by,
            old_status=old_status,
            new_status=user.account_status,
            platform_access=platform_access_granted if platform_access_granted is not None else None,
            sso_enabled=sso_enabled if sso_enabled is not None else None,
        )
    except Exception:
        pass
    return user


@transaction.atomic
def update_student_assignment(
    *,
    user: User,
    filiere_id: Optional[int] = None,
    academic_level_id: Optional[int] = None,
    academic_sector_id: Optional[int] = None,
    class_group_id: Optional[int] = None,
    academic_year: str = '',
    academic_year_id: Optional[int] = None,
    assigned_by=None,
) -> StudentProfile:
    profile, _ = StudentProfile.objects.get_or_create(user=user)
    resolved = validate_academic_selection(
        filiere_id=filiere_id,
        academic_level_id=academic_level_id,
        academic_sector_id=academic_sector_id,
        class_group_id=class_group_id,
        academic_year=academic_year,
        academic_year_id=academic_year_id,
    )
    _sync_student_academic_fields(profile, **resolved)
    class_group = resolved['class_group']
    academic_year = resolved['academic_year']
    if class_group and academic_year:
        Assignment.objects.filter(
            student_profile=profile, academic_year=academic_year, is_active=True,
        ).update(is_active=False)
        Assignment.objects.create(
            student_profile=profile,
            class_group=class_group,
            academic_year=academic_year,
            assigned_by=assigned_by,
            is_active=True,
        )
    try:
        from apps.history.integrations.students import student_assignment_updated

        student_assignment_updated(user=user, profile=profile, actor=assigned_by)
    except Exception:
        pass
    return profile


def regenerate_student_password(*, user: User, generated_by=None) -> str:
    plaintext = generate_secure_password()
    set_student_password(user=user, plaintext=plaintext, generated_by=generated_by)
    return plaintext


def student_risk_flags(user: User) -> list[str]:
    flags = []
    if user.role != User.RoleChoices.STUDENT:
        return flags
    if not user.platform_access_granted:
        flags.append('NO_PLATFORM_ACCESS')
    if user.account_status == User.AccountStatus.PENDING:
        flags.append('PENDING_AUTHORIZATION')
    try:
        sp = user.student_profile
        if not sp.identity_confirmed:
            flags.append('IDENTITY_NOT_CONFIRMED')
        if not sp.profile_completed:
            flags.append('PROFILE_INCOMPLETE')
    except StudentProfile.DoesNotExist:
        flags.append('MISSING_STUDENT_PROFILE')
    if user.last_login is None:
        flags.append('NEVER_LOGGED_IN')
    elif (timezone.now() - user.last_login).days > 30:
        flags.append('INACTIVE_30D')
    if not StudentCredential.objects.filter(user=user, is_current=True).exists():
        flags.append('NO_CREDENTIAL_ON_FILE')
    return flags


def student_dashboard_stats(*, acting_user=None) -> dict[str, int]:
    """Aggregate KPI counts for the admin students dashboard."""
    qs = list_students_queryset(acting_user=acting_user)
    total = qs.count()
    active_statuses = [
        User.AccountStatus.AUTHORIZED,
        User.AccountStatus.ACTIVE,
    ]
    active = qs.filter(
        platform_access_granted=True,
        account_status__in=active_statuses,
    ).count()
    inactive = max(0, total - active)

    encadrant_assignment = Assignment.objects.filter(
        student_profile_id=OuterRef('student_profile__pk'),
        is_active=True,
        encadrant_profile__isnull=False,
    )
    with_internship = qs.filter(Exists(encadrant_assignment)).count()
    without_internship = max(0, total - with_internship)

    onboarding_total = 0
    onboarding_sum = 0
    for user in qs.iterator(chunk_size=200):
        try:
            sp = user.student_profile
        except StudentProfile.DoesNotExist:
            continue
        steps = [sp.identity_confirmed, sp.profile_completed]
        percent = int(sum(1 for s in steps if s) / len(steps) * 100)
        onboarding_sum += percent
        onboarding_total += 1

    engagement_percent = int(onboarding_sum / onboarding_total) if onboarding_total else 0

    return {
        'total': total,
        'active': active,
        'inactive': inactive,
        'without_internship': without_internship,
        'with_internship': with_internship,
        'engagement_percent': engagement_percent,
    }


def list_students_queryset(*, search: str = '', status: str = '', acting_user=None):
    from .scopes import filter_students_by_admin_scope

    qs = (
        User.objects
        .filter(role=User.RoleChoices.STUDENT)
        .select_related(
            'profile',
            'student_profile',
            'student_profile__filiere',
            'student_profile__class_group',
            'student_profile__academic_level',
            'student_profile__academic_sector',
            'student_profile__internship_type',
        )
        .prefetch_related('student_credentials')
        .order_by('-created_at')
    )
    if acting_user is not None:
        qs = filter_students_by_admin_scope(qs, acting_user)
    if search:
        q = search.strip().lower()
        qs = qs.filter(
            Q(email__icontains=q)
            | Q(profile__first_name__icontains=q)
            | Q(profile__last_name__icontains=q)
            | Q(student_profile__student_number__icontains=q)
        )
    if status:
        qs = qs.filter(account_status=status)
    return qs


def annotate_students_with_internship_assignment(qs):
    """Annotate queryset with active encadrant assignment (matches dashboard KPI logic)."""
    encadrant_assignment = Assignment.objects.filter(
        student_profile_id=OuterRef('student_profile__pk'),
        is_active=True,
        encadrant_profile__isnull=False,
    )
    return qs.annotate(has_internship_assignment=Exists(encadrant_assignment))
