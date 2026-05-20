"""Platform encadrant (supervisor) lifecycle — create, scope, access."""

from typing import Optional

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone

from apps.accounts_et_roles.models import SupervisorProfile, UserProfile
from apps.accounts_et_roles.services import change_account_status
from apps.authentication.services.platform_access import grant_platform_access, revoke_platform_access

from ..models import (
    AcademicLevel,
    AcademicSector,
    Assignment,
    ClassGroup,
    EncadrantProfile,
    Filiere,
    SpecializationDomain,
)
from .filiere_display import filiere_codes_for_ids
from .specialization_domains import (
    serialize_specialization_domain,
    sync_encadrant_specialization_domains,
)
from .encadrant_scope import (
    encadrant_scope_gaps,
    encadrant_scope_is_complete,
    normalize_encadrant_scope,
)
from .supervised_internship_types import (
    build_encadrant_supervised_internship_payload,
    get_encadrant_supervised_internship_type_ids,
    sync_encadrant_supervised_internship_types,
)

User = get_user_model()

SUPERVISION_DOMAIN_KEYS = frozenset({
    'web_development',
    'data_science',
    'cybersecurity',
    'ai',
    'cloud',
    'networking',
    'finance',
    'marketing',
    'commerce',
    'hr',
    'supply_chain',
})

ESCA_SSO_EMAIL_SUFFIX = '@groupe-esca.ma'


def _split_full_name(full_name: str) -> tuple[str, str]:
    parts = (full_name or '').strip().split(None, 1)
    if not parts:
        return '', ''
    if len(parts) == 1:
        return parts[0], ''
    return parts[0], parts[1]


def _validate_supervision_domains(domains: list[str]) -> list[str]:
    cleaned = []
    for key in domains or []:
        k = (key or '').strip().lower()
        if k and k in SUPERVISION_DOMAIN_KEYS and k not in cleaned:
            cleaned.append(k)
    return cleaned


def _validate_esca_email(email: str) -> None:
    normalized = (email or '').strip().lower()
    if not normalized.endswith(ESCA_SSO_EMAIL_SUFFIX):
        raise ValueError(
            f'Supervisor email must use the ESCA SSO domain ({ESCA_SSO_EMAIL_SUFFIX}).',
        )


def _sync_encadrant_scopes(
    encadrant: EncadrantProfile,
    *,
    filiere_ids: list[int],
    class_group_ids: list[int],
    level_ids: list[int],
    sector_ids: list[int],
    academic_years: list[str],
) -> None:
    encadrant.scope_filiere_ids = list(filiere_ids or [])
    encadrant.scope_class_group_ids = list(class_group_ids or [])
    encadrant.scope_level_ids = list(level_ids or [])
    encadrant.scope_sector_ids = list(sector_ids or [])
    encadrant.scope_academic_years = list(academic_years or [])
    encadrant.save(
        update_fields=[
            'scope_filiere_ids',
            'scope_class_group_ids',
            'scope_level_ids',
            'scope_sector_ids',
            'scope_academic_years',
            'updated_at',
        ],
    )


def _assigned_student_count(encadrant: EncadrantProfile) -> int:
    return Assignment.objects.filter(
        encadrant_profile=encadrant,
        is_active=True,
    ).count()


def _legacy_domain_keys_to_ids(domain_keys: list[str]) -> list[int]:
    """Map legacy expertise keys to catalog ids where possible."""
    keys = _validate_supervision_domains(domain_keys)
    if not keys:
        return []
    return list(
        SpecializationDomain.objects.filter(code__in=keys, is_active=True).values_list('pk', flat=True),
    )


def build_encadrant_specialization_payload(encadrant: EncadrantProfile, lang: str = '') -> list[dict]:
    domains = encadrant.specialization_domains.filter(is_active=True).order_by('sort_order', 'name')
    if domains.exists():
        return [serialize_specialization_domain(d, lang) for d in domains]
    codes = list(encadrant.expertise_areas or [])
    if not codes:
        return []
    fallback = SpecializationDomain.objects.filter(code__in=codes, is_active=True)
    return [serialize_specialization_domain(d, lang) for d in fallback]


def build_encadrant_scope_payload(encadrant: EncadrantProfile) -> dict:
    filiere_ids = list(encadrant.scope_filiere_ids or [])
    class_group_ids = list(encadrant.scope_class_group_ids or [])
    level_ids = list(encadrant.scope_level_ids or [])
    sector_ids = list(encadrant.scope_sector_ids or [])

    filiere_qs = Filiere.objects.filter(pk__in=filiere_ids).order_by('sort_order', 'code')
    filiere_labels = list(filiere_qs.values_list('name', flat=True))
    filiere_codes = filiere_codes_for_ids(filiere_ids)
    class_group_labels = list(
        ClassGroup.objects.filter(pk__in=class_group_ids).values_list('name', flat=True),
    )
    level_labels = list(
        AcademicLevel.objects.filter(pk__in=level_ids).values_list('name', flat=True),
    )
    sector_labels = list(
        AcademicSector.objects.filter(pk__in=sector_ids).values_list('name', flat=True),
    )

    return {
        'filiere_ids': filiere_ids,
        'class_group_ids': class_group_ids,
        'level_ids': level_ids,
        'sector_ids': sector_ids,
        'academic_years': list(encadrant.scope_academic_years or []),
        'filiere_labels': filiere_labels,
        'filiere_codes': filiere_codes,
        'class_group_labels': class_group_labels,
        'level_labels': level_labels,
        'sector_labels': sector_labels,
        'scope_is_complete': encadrant_scope_is_complete(encadrant),
        'scope_gaps': encadrant_scope_gaps(encadrant),
    }


@transaction.atomic
def create_platform_encadrant(
    *,
    full_name: str,
    email: str,
    filiere_ids: Optional[list[int]] = None,
    class_group_ids: Optional[list[int]] = None,
    level_ids: Optional[list[int]] = None,
    sector_ids: Optional[list[int]] = None,
    academic_years: Optional[list[str]] = None,
    specialization_domain_ids: Optional[list[int]] = None,
    specialization_domains: Optional[list[str]] = None,
    supervised_internship_type_ids: Optional[list[int]] = None,
    max_students: int = 15,
    grant_access: bool = False,
    is_active: bool = True,
    created_by=None,
) -> User:
    email = email.strip().lower()
    _validate_esca_email(email)
    if User.objects.filter(email__iexact=email).exists():
        raise ValueError('A user with this email already exists.')

    first_name, last_name = _split_full_name(full_name)
    capacity = max(0, int(max_students or 0))

    status = User.AccountStatus.AUTHORIZED if grant_access else User.AccountStatus.PENDING

    user = User.objects.create(
        email=email,
        role=User.RoleChoices.SUPERVISOR,
        auth_provider=User.AuthProvider.AUTH0,
        account_status=status,
        platform_access_granted=grant_access,
        platform_access_granted_at=timezone.now() if grant_access else None,
        platform_access_granted_by=created_by if grant_access else None,
        sso_enabled=True,
        is_active=True,
    )
    user.set_unusable_password()
    user.save(update_fields=['password'])

    UserProfile.objects.create(user=user, first_name=first_name, last_name=last_name)
    supervisor = SupervisorProfile.objects.create(
        user=user,
        student_capacity=capacity,
        accepting_students=True,
    )
    encadrant = EncadrantProfile.objects.create(
        supervisor_profile=supervisor,
        max_concurrent_students=capacity,
        expertise_areas=[],
        is_active=is_active,
    )
    scope = normalize_encadrant_scope(
        filiere_ids=list(filiere_ids or []),
        level_ids=list(level_ids) if level_ids is not None else None,
        academic_years=list(academic_years) if academic_years is not None else None,
        supervised_internship_type_ids=(
            list(supervised_internship_type_ids)
            if supervised_internship_type_ids is not None
            else None
        ),
        class_group_ids=list(class_group_ids) if class_group_ids is not None else None,
        infer_missing=False,
        strict=True,
    )
    _sync_encadrant_scopes(
        encadrant,
        filiere_ids=scope['filiere_ids'],
        class_group_ids=scope['class_group_ids'],
        level_ids=scope['level_ids'],
        sector_ids=list(sector_ids or []),
        academic_years=scope['academic_years'],
    )
    if specialization_domain_ids is not None:
        sync_encadrant_specialization_domains(encadrant, specialization_domain_ids)
    elif specialization_domains:
        sync_encadrant_specialization_domains(
            encadrant,
            _legacy_domain_keys_to_ids(specialization_domains),
        )
    sync_encadrant_supervised_internship_types(
        encadrant,
        scope['supervised_internship_type_ids'],
    )

    if grant_access:
        grant_platform_access(user, granted_by=created_by)

    return user


@transaction.atomic
def update_platform_encadrant(
    *,
    user: User,
    full_name: Optional[str] = None,
    email: Optional[str] = None,
    filiere_ids: Optional[list[int]] = None,
    class_group_ids: Optional[list[int]] = None,
    level_ids: Optional[list[int]] = None,
    sector_ids: Optional[list[int]] = None,
    academic_years: Optional[list[str]] = None,
    specialization_domain_ids: Optional[list[int]] = None,
    specialization_domains: Optional[list[str]] = None,
    supervised_internship_type_ids: Optional[list[int]] = None,
    max_students: Optional[int] = None,
    platform_access_granted: Optional[bool] = None,
    is_active: Optional[bool] = None,
    account_status: Optional[str] = None,
    changed_by=None,
    reason: str = '',
) -> User:
    if user.role != User.RoleChoices.SUPERVISOR:
        raise ValueError('User is not a platform supervisor.')

    supervisor = user.supervisor_profile
    encadrant = supervisor.encadrant_profile

    user_profile = UserProfile.objects.filter(user=user).first()
    if user_profile is None:
        user_profile = UserProfile.objects.create(user=user)

    if full_name is not None:
        first_name, last_name = _split_full_name(full_name)
        user_profile.first_name = first_name
        user_profile.last_name = last_name
        user_profile.save()

    if email is not None and email.lower() != user.email:
        normalized = email.strip().lower()
        _validate_esca_email(normalized)
        if User.objects.filter(email__iexact=normalized).exclude(pk=user.pk).exists():
            raise ValueError('A user with this email already exists.')
        user.email = normalized
        user.save(update_fields=['email', 'updated_at'])

    if specialization_domain_ids is not None:
        sync_encadrant_specialization_domains(encadrant, specialization_domain_ids)
    elif specialization_domains is not None:
        sync_encadrant_specialization_domains(
            encadrant,
            _legacy_domain_keys_to_ids(specialization_domains),
        )

    if supervised_internship_type_ids is not None:
        sync_encadrant_supervised_internship_types(encadrant, supervised_internship_type_ids)

    if max_students is not None:
        capacity = max(0, int(max_students))
        encadrant.max_concurrent_students = capacity
        supervisor.student_capacity = capacity
        encadrant.save(update_fields=['max_concurrent_students', 'updated_at'])
        supervisor.save(update_fields=['student_capacity', 'updated_at'])

    scope_fields_provided = any(
        x is not None
        for x in (
            filiere_ids,
            class_group_ids,
            level_ids,
            sector_ids,
            academic_years,
            supervised_internship_type_ids,
        )
    )
    if scope_fields_provided:
        merged_filieres = (
            list(filiere_ids)
            if filiere_ids is not None
            else list(encadrant.scope_filiere_ids or [])
        )
        scope = normalize_encadrant_scope(
            filiere_ids=merged_filieres,
            level_ids=list(level_ids) if level_ids is not None else list(encadrant.scope_level_ids or []),
            academic_years=(
                list(academic_years)
                if academic_years is not None
                else list(encadrant.scope_academic_years or [])
            ),
            supervised_internship_type_ids=(
                list(supervised_internship_type_ids)
                if supervised_internship_type_ids is not None
                else get_encadrant_supervised_internship_type_ids(encadrant)
            ),
            class_group_ids=(
                list(class_group_ids)
                if class_group_ids is not None
                else list(encadrant.scope_class_group_ids or [])
            ),
            infer_missing=False,
            strict=True,
        )
        _sync_encadrant_scopes(
            encadrant,
            filiere_ids=scope['filiere_ids'],
            class_group_ids=scope['class_group_ids'],
            level_ids=scope['level_ids'],
            sector_ids=(
                list(sector_ids) if sector_ids is not None else list(encadrant.scope_sector_ids or [])
            ),
            academic_years=scope['academic_years'],
        )
        sync_encadrant_supervised_internship_types(
            encadrant,
            scope['supervised_internship_type_ids'],
        )

    if is_active is not None:
        encadrant.is_active = is_active
        user.is_active = is_active
        encadrant.save(update_fields=['is_active', 'updated_at'])
        user.save(update_fields=['is_active', 'updated_at'])

    if account_status is not None and account_status != user.account_status:
        change_account_status(user, account_status, changed_by=changed_by, reason=reason)

    if platform_access_granted is True:
        grant_platform_access(user, granted_by=changed_by)
    elif platform_access_granted is False:
        revoke_platform_access(user)

    encadrant.current_workload = _assigned_student_count(encadrant)
    encadrant.save(update_fields=['current_workload', 'updated_at'])

    user.refresh_from_db()
    return user


def list_encadrants_queryset(*, search: str = '', status: str = ''):
    qs = (
        User.objects.filter(role=User.RoleChoices.SUPERVISOR)
        .select_related(
            'profile',
            'supervisor_profile',
            'supervisor_profile__encadrant_profile',
        )
        .prefetch_related(
            'supervisor_profile__encadrant_profile__specialization_domains',
            'supervisor_profile__encadrant_profile__supervised_internship_types',
        )
        .annotate(
            _assigned_count=Count(
                'supervisor_profile__encadrant_profile__assignments',
                filter=Q(supervisor_profile__encadrant_profile__assignments__is_active=True),
                distinct=True,
            ),
        )
        .order_by('-created_at')
    )

    if search:
        qs = qs.filter(
            Q(email__icontains=search)
            | Q(profile__first_name__icontains=search)
            | Q(profile__last_name__icontains=search)
        )

    if status:
        qs = qs.filter(account_status=status)

    return qs
