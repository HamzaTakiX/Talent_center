"""Resolve academic / internship context snapshots for reports."""

from __future__ import annotations

from typing import Optional

from django.utils import timezone

from apps.admin_management.models import AcademicYear, Assignment
from apps.encadrant.models import Report


def _active_assignment(student_profile):
    return (
        Assignment.objects.filter(
            student_profile=student_profile,
            is_active=True,
        )
        .select_related('encadrant_profile', 'class_group')
        .order_by('-created_at')
        .first()
    )


def _current_academic_year():
    return AcademicYear.objects.filter(is_current=True, is_active=True).first()


def apply_academic_snapshot(report: Report, *, persist: bool = True) -> Report:
    """Fill denormalized academic fields from student profile and assignment."""
    sp = report.student_profile
    if sp.filiere_id:
        report.filiere_id = sp.filiere_id
    if sp.academic_level_id:
        report.academic_level_id = sp.academic_level_id
    if sp.academic_sector_id:
        report.academic_sector_id = sp.academic_sector_id
    if sp.class_group_id:
        report.class_group_id = sp.class_group_id
    if sp.internship_type_id:
        report.internship_type_id = sp.internship_type_id

    year = None
    if sp.academic_year_ref_id:
        report.academic_year_id = sp.academic_year_ref_id
        year = sp.academic_year_ref
    else:
        year = _current_academic_year()
        if year:
            report.academic_year_id = year.id

    assignment = report.assignment
    if not assignment:
        assignment = _active_assignment(sp)
        if assignment:
            report.assignment = assignment

    if assignment:
        if assignment.class_group_id and not report.class_group_id:
            report.class_group_id = assignment.class_group_id
        if assignment.encadrant_profile_id and not report.encadrant_profile_id:
            report.encadrant_profile_id = assignment.encadrant_profile_id

    meta = report.metadata_json or {}
    if not report.company_name:
        report.company_name = meta.get('company_name', '') or ''
    if not report.company_city:
        report.company_city = meta.get('company_city', '')

    if persist:
        report.save()
    return report


def sync_overdue_flag(report: Report, *, persist: bool = True) -> bool:
    """Set is_overdue based on due_at and status."""
    now = timezone.now()
    active_statuses = {
        Report.Status.DRAFT,
        Report.Status.SUBMITTED,
        Report.Status.UNDER_REVIEW,
        Report.Status.REQUIRES_CHANGES,
        Report.Status.RESUBMITTED,
        Report.Status.ESCALATED,
        Report.Status.CRITICAL_REVIEW,
        Report.Status.REVIEWED,
    }
    overdue = False
    if report.due_at and report.status in active_statuses and report.due_at < now:
        overdue = True
    elif report.period_end and report.status in active_statuses:
        from datetime import datetime, time
        end_dt = timezone.make_aware(
            datetime.combine(report.period_end, time.max),
            timezone.get_current_timezone(),
        )
        if end_dt < now:
            overdue = True
    report.is_overdue = overdue
    if persist:
        report.save(update_fields=['is_overdue', 'updated_at'])
    return overdue
