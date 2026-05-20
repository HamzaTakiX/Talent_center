"""Role-based visibility filters for history queries."""

from __future__ import annotations

from django.db.models import Q, QuerySet

from apps.accounts_et_roles.models import User
from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.admin_management.services.scopes import filter_students_by_admin_scope, is_super_admin
from apps.encadrant.models import SupervisedStudent
from apps.history.models import HistoryEvent


def user_has_global_history(user) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or is_super_admin(user):
        return True
    if user.role != User.RoleChoices.ADMIN:
        return False
    return 'history.global.access' in get_admin_effective_permissions(user)


def filter_events_for_user(qs: QuerySet, user) -> QuerySet:
    """Narrow queryset to events visible for the authenticated user."""
    if not user or not user.is_authenticated:
        return qs.none()

    if user.is_superuser or user_has_global_history(user):
        return qs

    if user.role == User.RoleChoices.STUDENT:
        return _student_scope(qs, user)

    if user.role == User.RoleChoices.SUPERVISOR:
        return _supervisor_scope(qs, user)

    if user.role == User.RoleChoices.ADMIN:
        return _scoped_admin_scope(qs, user)

    return qs.filter(actor_user=user)


def _student_scope(qs: QuerySet, user) -> QuerySet:
    profile_id = None
    try:
        profile_id = user.student_profile.id
    except Exception:
        pass

    q = Q(actor_user=user) | Q(visibility_scope='self', actor_user=user)
    q |= Q(metadata_entries__key='subject_user_id', metadata_entries__value=str(user.id))

    if profile_id:
        q |= Q(entity_type='student_profile', entity_id=profile_id)
        q |= Q(
            targets__target_entity_type='student_profile',
            targets__target_entity_id=profile_id,
        )

    return qs.filter(q).distinct()


def _supervisor_scope(qs: QuerySet, user) -> QuerySet:
    try:
        enc = user.encadrant_profile
    except Exception:
        return qs.filter(actor_user=user)

    student_ids = list(
        SupervisedStudent.objects.filter(
            encadrant_profile=enc,
            is_active=True,
        ).values_list('student_profile_id', flat=True)
    )

    q = Q(actor_user=user)
    if student_ids:
        q |= Q(entity_type='student_profile', entity_id__in=student_ids)
        q |= Q(
            targets__target_entity_type='student_profile',
            targets__target_entity_id__in=student_ids,
        )
        for sid in student_ids:
            q |= Q(metadata_entries__key='student_profile_id', metadata_entries__value=str(sid))

    return qs.filter(q).distinct()


def _scoped_admin_scope(qs: QuerySet, user) -> QuerySet:
    from apps.accounts_et_roles.models import User as UserModel

    scoped_users = filter_students_by_admin_scope(
        UserModel.objects.filter(role=UserModel.RoleChoices.STUDENT),
        user,
    )
    student_ids = list(
        scoped_users.filter(student_profile__isnull=False).values_list(
            'student_profile_id', flat=True
        )
    )

    if is_super_admin(user):
        return qs

    if not student_ids:
        return qs.filter(actor_user=user)

    q = Q(actor_user=user)
    q |= Q(entity_type='student_profile', entity_id__in=student_ids)
    q |= Q(
        targets__target_entity_type='student_profile',
        targets__target_entity_id__in=student_ids,
    )
    return qs.filter(q).distinct()
