"""Academic scope filtering for supervision reports (ERMS)."""

from __future__ import annotations

from django.db.models import Q, QuerySet

from apps.encadrant.models import Report
from apps.admin_management.services.scopes import get_admin_scope, is_super_admin


def report_in_admin_scope(user, report: Report) -> bool:
    if is_super_admin(user):
        return True
    scope = get_admin_scope(user)
    if scope['global']:
        return True
    if not scope['filiere_ids'] and not scope['class_group_ids'] and not scope['level_ids']:
        return False

    if report.filiere_id and report.filiere_id in scope['filiere_ids']:
        return True
    if report.class_group_id and report.class_group_id in scope['class_group_ids']:
        return True
    if report.academic_level_id and report.academic_level_id in scope['level_ids']:
        return True
    if report.academic_sector_id and report.academic_sector_id in scope['sector_ids']:
        return True

    sp = report.student_profile
    if sp.filiere_id and sp.filiere_id in scope['filiere_ids']:
        return True
    if sp.class_group_id and sp.class_group_id in scope['class_group_ids']:
        return True
    return False


def filter_reports_by_admin_scope(qs: QuerySet, user) -> QuerySet:
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
        q |= Q(class_group_id__in=scope['class_group_ids']) | Q(student_profile__class_group_id__in=scope['class_group_ids'])
    if scope['level_ids']:
        q |= Q(academic_level_id__in=scope['level_ids']) | Q(student_profile__academic_level_id__in=scope['level_ids'])
    if scope['sector_ids']:
        q |= Q(academic_sector_id__in=scope['sector_ids']) | Q(student_profile__academic_sector_id__in=scope['sector_ids'])
    if scope['academic_years']:
        q |= Q(academic_year__code__in=scope['academic_years']) | Q(student_profile__academic_year__in=scope['academic_years'])

    return qs.filter(q).distinct()


def assert_report_in_scope(user, report: Report) -> None:
    from rest_framework.exceptions import PermissionDenied

    if not report_in_admin_scope(user, report):
        raise PermissionDenied('Access denied: report is outside your academic scope.')
