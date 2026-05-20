"""Legacy + compatibility helpers for encadrant reports admin list."""

from __future__ import annotations

from apps.encadrant.models import Report
from apps.encadrant.services.report_query import admin_ui_status, serialize_report_list_item
from apps.admin_management.services.report_scopes import filter_reports_by_admin_scope


def _user_display_name(user) -> str:
    if user is None:
        return '—'
    profile = getattr(user, 'profile', None)
    if profile:
        name = f'{profile.first_name} {profile.last_name}'.strip()
        if name:
            return name
    return getattr(user, 'email', '') or '—'


def _format_date(value) -> str:
    if value is None:
        return '—'
    if hasattr(value, 'strftime'):
        return value.strftime('%d/%m/%Y')
    return str(value)


def admin_ui_status_legacy(report: Report) -> str:
    return admin_ui_status(report)


def serialize_encadrant_report_legacy(report: Report) -> dict:
    """Backward-compatible shape for AdminEncadrantReportListSerializer."""
    item = serialize_report_list_item(report)
    return {
        'id': item['id'],
        'encadrant': item['encadrant'],
        'student': item['student'],
        'report_type': item['reportTypeLabel'],
        'status': item['presentationStatus'],
        'submitted_date': item['submittedDate'],
        'due_date': item['dueDate'],
    }


def list_encadrant_reports_for_admin(user=None) -> list[dict]:
    qs = Report.objects.exclude(status=Report.Status.DRAFT).select_related(
        'encadrant_profile__supervisor_profile__user__profile',
        'student_profile__user__profile',
        'filiere',
        'internship_type',
        'academic_year',
    ).order_by('-priority_score', '-submitted_at', '-created_at')
    if user is not None:
        qs = filter_reports_by_admin_scope(qs, user)
    return [serialize_encadrant_report_legacy(r) for r in qs]
