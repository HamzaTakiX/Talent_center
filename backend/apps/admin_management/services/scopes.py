"""Academic scope enforcement for delegated administrators."""

from typing import Optional

from django.contrib.auth import get_user_model
from django.db.models import Q, QuerySet

from apps.admin_management.models import (
    AcademicLevel,
    AcademicSector,
    AdminProfile,
    AdminRoleAssignment,
    ClassGroup,
    Filiere,
)

User = get_user_model()


def is_super_admin(user) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    profile = getattr(user, 'admin_profile', None)
    return profile is not None and profile.admin_level == AdminProfile.AdminLevel.SUPER


def get_admin_scope(user) -> dict:
    """
    Return scope boundaries for an admin user.
    Super admins receive global=True.
    """
    if is_super_admin(user):
        return {
            'global': True,
            'filiere_ids': set(),
            'class_group_ids': set(),
            'level_ids': set(),
            'sector_ids': set(),
            'levels': set(),
            'academic_years': set(),
        }

    profile = getattr(user, 'admin_profile', None)
    assignments = AdminRoleAssignment.objects.filter(
        target_user=user,
        is_active=True,
        revoked_at__isnull=True,
    ).select_related('filiere', 'class_group', 'academic_level', 'academic_sector')

    filiere_ids: set[int] = set()
    class_group_ids: set[int] = set()
    level_ids: set[int] = set()
    sector_ids: set[int] = set()
    levels: set[str] = set()
    academic_years: set[str] = set()

    for a in assignments:
        if a.filiere_id:
            filiere_ids.add(a.filiere_id)
        if a.academic_level_id:
            level_ids.add(a.academic_level_id)
            if a.academic_level:
                levels.add(a.academic_level.code)
        if a.academic_sector_id:
            sector_ids.add(a.academic_sector_id)
        if a.class_group_id:
            class_group_ids.add(a.class_group_id)
            if a.class_group.level:
                levels.add(a.class_group.level)
            elif a.class_group.academic_level_id:
                level_ids.add(a.class_group.academic_level_id)
            if a.class_group.academic_year:
                academic_years.add(a.class_group.academic_year)

    if profile:
        level_ids.update(profile.scope_level_ids or [])
        sector_ids.update(profile.scope_sector_ids or [])
        levels.update(profile.scope_levels or [])
        academic_years.update(profile.scope_academic_years or [])
        if profile.scope_level_ids:
            level_codes = AcademicLevel.objects.filter(
                id__in=profile.scope_level_ids,
            ).values_list('code', flat=True)
            levels.update(level_codes)

    return {
        'global': False,
        'filiere_ids': filiere_ids,
        'class_group_ids': class_group_ids,
        'level_ids': level_ids,
        'sector_ids': sector_ids,
        'levels': levels,
        'academic_years': academic_years,
    }


def admin_has_filiere_access(user, filiere_id: Optional[int]) -> bool:
    if not filiere_id:
        return True
    scope = get_admin_scope(user)
    if scope['global']:
        return True
    if not scope['filiere_ids'] and not scope['class_group_ids']:
        return False
    return filiere_id in scope['filiere_ids']


def admin_has_class_group_access(user, class_group_id: Optional[int]) -> bool:
    if not class_group_id:
        return True
    scope = get_admin_scope(user)
    if scope['global']:
        return True
    if class_group_id in scope['class_group_ids']:
        return True
    cg = ClassGroup.objects.filter(pk=class_group_id).first()
    if cg and cg.filiere_id in scope['filiere_ids']:
        if scope['levels'] and cg.level and cg.level not in scope['levels']:
            return False
        if scope['academic_years'] and cg.academic_year and cg.academic_year not in scope['academic_years']:
            return False
        return True
    return False


def filter_students_by_admin_scope(qs: QuerySet, user) -> QuerySet:
    """Restrict student queryset to the acting admin's academic scope."""
    scope = get_admin_scope(user)
    if scope['global']:
        return qs

    if not scope['filiere_ids'] and not scope['class_group_ids']:
        return qs.none()

    q = Q()
    if scope['filiere_ids']:
        q |= Q(student_profile__filiere_id__in=scope['filiere_ids'])
    if scope['class_group_ids']:
        q |= Q(student_profile__class_group_id__in=scope['class_group_ids'])

    filtered = qs.filter(q).distinct()

    if scope['level_ids']:
        filtered = filtered.filter(
            Q(student_profile__academic_level_id__in=scope['level_ids'])
            | Q(student_profile__class_group__academic_level_id__in=scope['level_ids'])
            | Q(student_profile__academic_level__isnull=True, student_profile__class_group__isnull=True)
        )
    if scope['sector_ids']:
        filtered = filtered.filter(
            Q(student_profile__academic_sector_id__in=scope['sector_ids'])
            | Q(student_profile__class_group__academic_sector_id__in=scope['sector_ids'])
            | Q(student_profile__academic_sector__isnull=True)
        )
    if scope['levels']:
        filtered = filtered.filter(
            Q(student_profile__class_group__level__in=scope['levels'])
            | Q(student_profile__academic_level__code__in=scope['levels'])
            | Q(student_profile__class_group__isnull=True, student_profile__academic_level__isnull=True)
        )
    if scope['academic_years']:
        filtered = filtered.filter(
            Q(student_profile__academic_year__in=scope['academic_years'])
            | Q(student_profile__academic_year='')
        )

    return filtered


def assert_student_in_scope(user, target_user) -> None:
    """Raise PermissionDenied if target student is outside admin scope."""
    from rest_framework.exceptions import PermissionDenied

    if is_super_admin(user):
        return
    sp = getattr(target_user, 'student_profile', None)
    if sp is None:
        return
    if sp.filiere_id and not admin_has_filiere_access(user, sp.filiere_id):
        raise PermissionDenied('Access denied: student is outside your academic scope.')
    if sp.class_group_id and not admin_has_class_group_access(user, sp.class_group_id):
        raise PermissionDenied('Access denied: student class is outside your academic scope.')
    scope = get_admin_scope(user)
    if scope['global']:
        return
    if scope['level_ids'] and sp.academic_level_id and sp.academic_level_id not in scope['level_ids']:
        raise PermissionDenied('Access denied: student level is outside your academic scope.')
    if scope['sector_ids'] and sp.academic_sector_id and sp.academic_sector_id not in scope['sector_ids']:
        raise PermissionDenied('Access denied: student sector is outside your academic scope.')
