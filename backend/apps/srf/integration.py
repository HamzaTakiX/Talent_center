"""
SRF integration hooks for other ERP modules.

Import from here — do not duplicate financial gating logic elsewhere.
"""

from __future__ import annotations

from apps.accounts_et_roles.models import StudentProfile
from apps.srf.services.academic_access import (
    assert_can_download_convention,
    assert_can_take_exams,
    get_student_access,
)
from apps.srf.services.financial_profile import refresh_student_financial_state


def check_internship_eligible(student: StudentProfile) -> tuple[bool, list[str]]:
    """Used by Smart Assignment and stage modules."""
    refresh_student_financial_state(student)
    access = get_student_access(student)
    return access['internship_eligible'], access.get('blocking_reasons', [])


def check_convention_allowed(student: StudentProfile) -> tuple[bool, str]:
    """Used by documents / convention workflow."""
    try:
        assert_can_download_convention(student)
        return True, ''
    except PermissionError as exc:
        return False, str(exc)


def check_exam_eligible(student: StudentProfile) -> tuple[bool, str]:
    try:
        assert_can_take_exams(student)
        return True, ''
    except PermissionError as exc:
        return False, str(exc)


def filter_eligible_students(student_ids: list[int]) -> list[int]:
    """Return subset of student IDs that are internship-eligible."""
    eligible = []
    for sid in student_ids:
        try:
            student = StudentProfile.objects.get(pk=sid)
            ok, _ = check_internship_eligible(student)
            if ok:
                eligible.append(sid)
        except StudentProfile.DoesNotExist:
            continue
    return eligible
