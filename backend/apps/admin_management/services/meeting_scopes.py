"""Academic scope filtering for supervision meetings."""

from __future__ import annotations

from django.db.models import Q, QuerySet

from apps.encadrant.models import Meeting
from apps.admin_management.services.scopes import get_admin_scope, is_super_admin


def meeting_in_admin_scope(user, meeting: Meeting) -> bool:
    if is_super_admin(user):
        return True
    scope = get_admin_scope(user)
    if scope['global']:
        return True
    if not scope['filiere_ids'] and not scope['class_group_ids'] and not scope['level_ids']:
        return False

    if meeting.filiere_id and meeting.filiere_id in scope['filiere_ids']:
        return True
    if meeting.class_group_id and meeting.class_group_id in scope['class_group_ids']:
        return True
    if meeting.academic_level_id and meeting.academic_level_id in scope['level_ids']:
        return True
    if meeting.academic_sector_id and meeting.academic_sector_id in scope['sector_ids']:
        return True

    sp = meeting.student_profile
    if not sp:
        return False
    if sp.filiere_id and sp.filiere_id in scope['filiere_ids']:
        return True
    if sp.class_group_id and sp.class_group_id in scope['class_group_ids']:
        return True
    return False


def filter_meetings_by_admin_scope(qs: QuerySet, user) -> QuerySet:
    if is_super_admin(user):
        return qs
    scope = get_admin_scope(user)
    if scope['global']:
        return qs
    if not scope['filiere_ids'] and not scope['class_group_ids'] and not scope['level_ids']:
        return qs.none()

    q = Q()
    if scope['filiere_ids']:
        q |= Q(filiere_id__in=scope['filiere_ids']) | Q(student_profile__filiere_id__in=scope['filiere_ids'])
    if scope['class_group_ids']:
        q |= Q(class_group_id__in=scope['class_group_ids']) | Q(
            student_profile__class_group_id__in=scope['class_group_ids']
        )
    if scope['level_ids']:
        q |= Q(academic_level_id__in=scope['level_ids']) | Q(
            student_profile__academic_level_id__in=scope['level_ids']
        )
    if scope['sector_ids']:
        q |= Q(academic_sector_id__in=scope['sector_ids']) | Q(
            student_profile__academic_sector_id__in=scope['sector_ids']
        )
    if scope['academic_years']:
        q |= Q(academic_year__code__in=scope['academic_years']) | Q(
            student_profile__academic_year__in=scope['academic_years']
        )

    return qs.filter(q).distinct()


def assert_meeting_in_scope(user, meeting: Meeting) -> None:
    from rest_framework.exceptions import PermissionDenied

    if not meeting_in_admin_scope(user, meeting):
        raise PermissionDenied('Access denied: meeting is outside your academic scope.')
