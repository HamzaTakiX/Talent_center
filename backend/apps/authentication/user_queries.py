"""Optimized user query helpers for auth API serialization."""

from __future__ import annotations

from django.contrib.auth import get_user_model

User = get_user_model()


def prefetch_user_for_serialization(user: User) -> User:
    """
    Load a user with all relations required by MeSerializer / UserSerializer
    in a constant number of queries instead of per-field lazy loads.
    """
    if user is None or not getattr(user, 'pk', None):
        return user

    loaded = (
        User.objects.filter(pk=user.pk)
        .select_related(
            'profile',
            'student_profile',
            'student_profile__filiere',
            'student_profile__academic_level',
            'student_profile__academic_sector',
            'student_profile__class_group',
            'student_profile__internship_type',
            'staff_profile',
            'supervisor_profile',
            'admin_profile',
        )
        .prefetch_related(
            'role_assignments__role__role_permissions__permission',
        )
        .first()
    )
    return loaded or user
