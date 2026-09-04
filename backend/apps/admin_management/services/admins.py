"""Platform administrator lifecycle — create, authorize, scope, RBAC."""

from typing import Optional

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Prefetch, Q
from django.utils import timezone

from apps.accounts_et_roles.search import profile_name_search_q
from apps.accounts_et_roles.models import (
    OnboardingStep,
    Role,
    StaffProfile,
    UserOnboardingProgress,
    UserProfile,
    UserRoleAssignment,
)
from apps.accounts_et_roles.services import assign_role, change_account_status, revoke_role
from apps.authentication.services.credentials import provision_user_password
from apps.authentication.services.platform_access import grant_platform_access, revoke_platform_access
from .microsoft_access_sync import (
    MicrosoftAccessSyncError,
    apply_platform_access_with_microsoft_sync,
    ensure_microsoft_assignment_for_new_user,
)

from ..models import AcademicLevel, AcademicSector, AdminProfile, AdminRoleAssignment, ClassGroup, Filiere
from .rbac_seed import (
    MANAGED_ADMIN_ROLE_CODES,
    UI_PERMISSION_TO_CODE,
    UI_ROLE_TO_CODE,
    seed_admin_rbac,
)
from .scopes import is_super_admin

User = get_user_model()

# Roles the admin management UI may revoke when rewriting an admin's roles.
# Must cover every role this module can grant (including ADMIN_SUPER), otherwise
# narrowing an administrator to one module silently leaves broader roles active.
ADMIN_ROLE_CODES = MANAGED_ADMIN_ROLE_CODES


def _split_full_name(full_name: str) -> tuple[str, str]:
    parts = (full_name or '').strip().split(None, 1)
    if not parts:
        return '', ''
    if len(parts) == 1:
        return parts[0], ''
    return parts[0], parts[1]


#: Read-only marker returned by the API for super admins. Accepted on write so a
#: client can echo back what it read, but it never grants the ADMIN_SUPER role —
#: super admin status comes from AdminProfile.admin_level alone.
_IGNORED_ROLE_SLUGS = frozenset({'super'})


def _ui_roles_to_codes(role_slugs: list[str]) -> list[str]:
    """Map UI role slugs to backend role codes, rejecting unknown slugs.

    Silently dropping unrecognized slugs used to produce administrators with no
    role at all (and therefore no permissions), which is indistinguishable from a
    successful save in the UI.
    """
    codes: list[str] = []
    unknown: list[str] = []
    for slug in role_slugs:
        normalized = str(slug or '').strip().lower()
        if not normalized or normalized in _IGNORED_ROLE_SLUGS:
            continue
        code = UI_ROLE_TO_CODE.get(normalized)
        if not code:
            unknown.append(str(slug))
            continue
        if code not in codes:
            codes.append(code)
    if unknown:
        allowed = ', '.join(sorted(UI_ROLE_TO_CODE))
        raise ValueError(f'Unknown role(s): {", ".join(unknown)}. Allowed roles: {allowed}.')
    return codes


def _ui_permissions_to_codes(permission_keys: list[str]) -> list[str]:
    codes = []
    for key in permission_keys:
        code = UI_PERMISSION_TO_CODE.get(key)
        if code and code not in codes:
            codes.append(code)
    return codes


def _sync_role_assignments(
    user: User,
    role_codes: list[str],
    *,
    assigned_by=None,
) -> None:
    seed_admin_rbac()
    desired = set(role_codes)
    existing = UserRoleAssignment.objects.filter(user=user, is_active=True).select_related('role')
    for assignment in existing:
        if assignment.role.code not in desired and assignment.role.code in ADMIN_ROLE_CODES:
            revoke_role(user, assignment.role, changed_by=assigned_by, reason='admin_profile_update')
    for code in desired:
        role = Role.objects.filter(code=code).first()
        if role:
            assign_role(user, role, assigned_by=assigned_by, reason='admin_profile_update')


def _sync_admin_scopes(
    user: User,
    *,
    filiere_ids: list[int],
    class_group_ids: list[int],
    levels: list[str],
    level_ids: list[int],
    sector_ids: list[int],
    academic_years: list[str],
    role_codes: list[str],
    granted_by=None,
) -> None:
    AdminRoleAssignment.objects.filter(target_user=user, is_active=True).update(
        is_active=False,
        revoked_at=timezone.now(),
    )

    profile = user.admin_profile
    profile.scope_levels = levels or []
    profile.scope_level_ids = level_ids or []
    profile.scope_sector_ids = sector_ids or []
    profile.scope_academic_years = academic_years or []
    profile.save(
        update_fields=[
            'scope_levels',
            'scope_level_ids',
            'scope_sector_ids',
            'scope_academic_years',
            'updated_at',
        ],
    )

    if not role_codes:
        return

    primary_role = Role.objects.filter(code=role_codes[0]).first()
    if not primary_role:
        return

    seen: set[tuple] = set()
    for cg_id in class_group_ids:
        cg = ClassGroup.objects.filter(pk=cg_id).select_related('filiere').first()
        if not cg:
            continue
        key = (cg.filiere_id, cg_id)
        if key in seen:
            continue
        seen.add(key)
        AdminRoleAssignment.objects.create(
            target_user=user,
            role=primary_role,
            filiere=cg.filiere,
            class_group=cg,
            granted_by=granted_by,
            is_active=True,
        )

    for filiere_id in filiere_ids:
        filiere = Filiere.objects.filter(pk=filiere_id).first()
        if not filiere:
            continue
        key = (filiere_id, None)
        if key in seen:
            continue
        seen.add(key)
        AdminRoleAssignment.objects.create(
            target_user=user,
            role=primary_role,
            filiere=filiere,
            granted_by=granted_by,
            is_active=True,
        )

    for level_id in level_ids:
        level = AcademicLevel.objects.filter(pk=level_id).select_related('filiere').first()
        if not level:
            continue
        AdminRoleAssignment.objects.create(
            target_user=user,
            role=primary_role,
            filiere=level.filiere,
            academic_level=level,
            granted_by=granted_by,
            is_active=True,
        )

    for sector_id in sector_ids:
        sector = AcademicSector.objects.filter(pk=sector_id).select_related('academic_level__filiere').first()
        if not sector:
            continue
        AdminRoleAssignment.objects.create(
            target_user=user,
            role=primary_role,
            filiere=sector.academic_level.filiere,
            academic_level=sector.academic_level,
            academic_sector=sector,
            granted_by=granted_by,
            is_active=True,
        )


def _start_admin_onboarding(user: User) -> None:
    step, _ = OnboardingStep.objects.get_or_create(
        code='ADMIN_WELCOME',
        defaults={
            'name': 'Admin welcome',
            'description': 'Complete first admin login setup',
            'order': 0,
            'is_required': True,
        },
    )
    UserOnboardingProgress.objects.update_or_create(
        user=user,
        step=step,
        defaults={'status': UserOnboardingProgress.Status.NOT_STARTED},
    )


@transaction.atomic
def create_platform_admin(
    *,
    full_name: str,
    email: str,
    role_slugs: list[str],
    permission_keys: list[str],
    filiere_ids: Optional[list[int]] = None,
    class_group_ids: Optional[list[int]] = None,
    levels: Optional[list[str]] = None,
    level_ids: Optional[list[int]] = None,
    sector_ids: Optional[list[int]] = None,
    academic_years: Optional[list[str]] = None,
    sso_enabled: bool = False,
    account_status: str = User.AccountStatus.PENDING,
    admin_level: str = AdminProfile.AdminLevel.STANDARD,
    grant_access: bool = False,
    notes: str = '',
    created_by=None,
) -> User:
    seed_admin_rbac()
    email = email.strip().lower()
    if User.objects.filter(email__iexact=email).exists():
        raise ValueError('A user with this email already exists.')

    first_name, last_name = _split_full_name(full_name)
    role_codes = _ui_roles_to_codes(role_slugs)
    permission_codes = _ui_permissions_to_codes(permission_keys)

    status = account_status
    if grant_access and status == User.AccountStatus.PENDING:
        status = User.AccountStatus.AUTHORIZED

    user = User.objects.create(
        email=email,
        role=User.RoleChoices.ADMIN,
        auth_provider=User.AuthProvider.AUTH0 if sso_enabled else User.AuthProvider.LOCAL,
        account_status=status,
        platform_access_granted=grant_access,
        platform_access_granted_at=timezone.now() if grant_access else None,
        platform_access_granted_by=created_by if grant_access else None,
        sso_enabled=sso_enabled,
        is_active=True,
    )
    provision_user_password(user=user, generated_by=created_by)

    UserProfile.objects.create(user=user, first_name=first_name, last_name=last_name)
    StaffProfile.objects.get_or_create(user=user)
    AdminProfile.objects.create(
        user=user,
        admin_level=admin_level,
        notes=notes,
        extra_permission_codes=permission_codes,
        is_active=True,
    )

    _sync_role_assignments(user, role_codes, assigned_by=created_by)
    _sync_admin_scopes(
        user,
        filiere_ids=filiere_ids or [],
        class_group_ids=class_group_ids or [],
        levels=levels or [],
        level_ids=level_ids or [],
        sector_ids=sector_ids or [],
        academic_years=academic_years or [],
        role_codes=role_codes,
        granted_by=created_by,
    )
    _start_admin_onboarding(user)

    if grant_access:
        grant_platform_access(user, granted_by=created_by)
        try:
            ensure_microsoft_assignment_for_new_user(user, granted_by=created_by)
        except MicrosoftAccessSyncError:
            raise

    return user


@transaction.atomic
def update_platform_admin(
    *,
    user: User,
    full_name: Optional[str] = None,
    email: Optional[str] = None,
    role_slugs: Optional[list[str]] = None,
    permission_keys: Optional[list[str]] = None,
    filiere_ids: Optional[list[int]] = None,
    class_group_ids: Optional[list[int]] = None,
    levels: Optional[list[str]] = None,
    level_ids: Optional[list[int]] = None,
    sector_ids: Optional[list[int]] = None,
    academic_years: Optional[list[str]] = None,
    sso_enabled: Optional[bool] = None,
    account_status: Optional[str] = None,
    admin_level: Optional[str] = None,
    platform_access_granted: Optional[bool] = None,
    is_active: Optional[bool] = None,
    notes: Optional[str] = None,
    changed_by=None,
    reason: str = '',
) -> User:
    if user.role != User.RoleChoices.ADMIN:
        raise ValueError('User is not a platform administrator.')

    if is_super_admin(user):
        raise ValueError('Super administrator accounts cannot be modified.')

    profile = user.admin_profile
    user_profile = UserProfile.objects.filter(user=user).first()
    if user_profile is None:
        user_profile = UserProfile.objects.create(user=user)

    if full_name is not None:
        first_name, last_name = _split_full_name(full_name)
        user_profile.first_name = first_name
        user_profile.last_name = last_name
        user_profile.save()

    if email is not None and email.lower() != user.email:
        if User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
            raise ValueError('A user with this email already exists.')
        user.email = email.lower()
        user.save(update_fields=['email', 'updated_at'])

    if role_slugs is not None:
        role_codes = _ui_roles_to_codes(role_slugs)
        _sync_role_assignments(user, role_codes, assigned_by=changed_by)
        _sync_admin_scopes(
            user,
            filiere_ids=filiere_ids or [],
            class_group_ids=class_group_ids or [],
            levels=levels or [],
            level_ids=level_ids or [],
            sector_ids=sector_ids or [],
            academic_years=academic_years or [],
            role_codes=role_codes,
            granted_by=changed_by,
        )
    elif any(
        x is not None
        for x in (filiere_ids, class_group_ids, levels, level_ids, sector_ids, academic_years)
    ):
        active_codes = list(
            user.role_assignments.filter(is_active=True).values_list('role__code', flat=True)
        )
        _sync_admin_scopes(
            user,
            filiere_ids=filiere_ids or [],
            class_group_ids=class_group_ids or [],
            levels=levels or [],
            level_ids=level_ids or [],
            sector_ids=sector_ids or [],
            academic_years=academic_years or [],
            role_codes=active_codes,
            granted_by=changed_by,
        )

    if permission_keys is not None:
        profile.extra_permission_codes = _ui_permissions_to_codes(permission_keys)
        profile.save(update_fields=['extra_permission_codes', 'updated_at'])

    if notes is not None:
        profile.notes = notes
        profile.save(update_fields=['notes', 'updated_at'])

    if admin_level is not None:
        profile.admin_level = admin_level
        profile.save(update_fields=['admin_level', 'updated_at'])

    if is_active is not None:
        profile.is_active = is_active
        user.is_active = is_active
        profile.save(update_fields=['is_active', 'updated_at'])
        user.save(update_fields=['is_active', 'updated_at'])

    if sso_enabled is not None:
        user.sso_enabled = sso_enabled
        user.save(update_fields=['sso_enabled', 'updated_at'])

    if account_status is not None and account_status != user.account_status:
        change_account_status(user, account_status, changed_by=changed_by, reason=reason)

    if platform_access_granted is True:
        apply_platform_access_with_microsoft_sync(
            user, grant=True, granted_by=changed_by,
        )
    elif platform_access_granted is False:
        apply_platform_access_with_microsoft_sync(
            user, grant=False, granted_by=changed_by,
        )

    user.refresh_from_db()
    return user


def list_administrators_queryset(*, search: str = '', status: str = '', role: str = ''):
    qs = (
        User.objects.filter(role=User.RoleChoices.ADMIN)
        .select_related('profile', 'admin_profile')
        .prefetch_related(
            Prefetch(
                'role_assignments',
                queryset=UserRoleAssignment.objects.filter(is_active=True).select_related('role'),
            ),
            Prefetch(
                'admin_role_assignments',
                queryset=AdminRoleAssignment.objects.filter(is_active=True).select_related(
                    'filiere', 'class_group', 'role',
                ),
            ),
        )
        .order_by('-created_at')
    )

    if search:
        q = search.strip()
        qs = qs.filter(
            Q(email__icontains=q)
            | profile_name_search_q(
                q,
                first_name_field='profile__first_name',
                last_name_field='profile__last_name',
            )
        )

    if status:
        qs = qs.filter(account_status=status)

    if role:
        code = UI_ROLE_TO_CODE.get(role, role)
        qs = qs.filter(role_assignments__role__code=code, role_assignments__is_active=True)

    return qs.distinct()


def get_admin_effective_permissions(user: User) -> set[str]:
    cached = getattr(user, '_tc_admin_effective_permissions', None)
    if cached is not None:
        return cached
    perms = user.permission_codes()
    profile = getattr(user, 'admin_profile', None)
    if profile and profile.extra_permission_codes:
        perms |= set(profile.extra_permission_codes)
    user._tc_admin_effective_permissions = perms
    return perms


def user_can_manage_admins(user) -> bool:
    if is_super_admin(user):
        return True
    return 'admins.manage' in get_admin_effective_permissions(user)
