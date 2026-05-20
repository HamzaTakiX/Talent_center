"""
Pre-execution validation for the smart assignment engine.

Returns structured issue codes for i18n on the frontend (no user-facing English here).
"""

from __future__ import annotations

from typing import Any, Optional

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.models import EncadrantProfile
from apps.admin_management.services.internship_resolver import SUPPORTED_PROGRAM_FAMILIES
from apps.admin_management.services.smart_assignment import _internship_type_compatible

from .smart_assignment import (
    EncadrantAnalysis,
    StudentAnalysis,
    analyze_encadrant,
    analyze_student,
    compute_match_score,
    get_available_encadrants_queryset,
    get_eligible_students_queryset,
    resolve_academic_year,
)

SEVERITY_CRITICAL = 'critical'
SEVERITY_WARNING = 'warning'
SEVERITY_INFO = 'info'

ISSUE_NO_ELIGIBLE_STUDENTS = 'NO_ELIGIBLE_STUDENTS'
ISSUE_NO_ENCADRANTS = 'NO_ENCADRANTS'
ISSUE_NO_COMPATIBLE_ENCADRANTS = 'NO_COMPATIBLE_ENCADRANTS'
ISSUE_MISSING_FILIERE = 'MISSING_FILIERE'
ISSUE_MISSING_LEVEL = 'MISSING_LEVEL'
ISSUE_MISSING_ACADEMIC_YEAR = 'MISSING_ACADEMIC_YEAR'
ISSUE_MISSING_INTERNSHIP_TYPE = 'MISSING_INTERNSHIP_TYPE'
ISSUE_UNSUPPORTED_INTERNSHIP_CATEGORY = 'UNSUPPORTED_INTERNSHIP_CATEGORY'
ISSUE_NO_SUPERVISORS_FOR_INTERNSHIP_TYPE = 'NO_SUPERVISORS_FOR_INTERNSHIP_TYPE'
ISSUE_ENCADRANTS_WITHOUT_SUPERVISED_TYPES = 'ENCADRANTS_WITHOUT_SUPERVISED_TYPES'
ISSUE_ALL_ENCADRANTS_OVERLOADED = 'ALL_ENCADRANTS_OVERLOADED'
ISSUE_ALL_MATCHING_ENCADRANTS_INACTIVE = 'ALL_MATCHING_ENCADRANTS_INACTIVE'
ISSUE_EXISTING_ASSIGNMENTS = 'EXISTING_ASSIGNMENTS'
ISSUE_PARTIAL_UNASSIGNABLE = 'PARTIAL_UNASSIGNABLE'

RECOMMENDATION_ADD_STUDENTS = 'ADD_ELIGIBLE_STUDENTS'
RECOMMENDATION_ACTIVATE_ENCADRANTS = 'ACTIVATE_ENCADRANTS'
RECOMMENDATION_ADJUST_SCOPES = 'ADJUST_ENCADRANT_SCOPES'
RECOMMENDATION_COMPLETE_STUDENT_DATA = 'COMPLETE_STUDENT_ACADEMIC_DATA'
RECOMMENDATION_CONFIGURE_SUPERVISED_INTERNSHIP_TYPES = 'CONFIGURE_SUPERVISED_INTERNSHIP_TYPES'
RECOMMENDATION_INCREASE_CAPACITY = 'INCREASE_ENCADRANT_CAPACITY'
RECOMMENDATION_REVIEW_ASSIGNMENT_STRATEGY = 'REVIEW_ASSIGNMENT_STRATEGY'


def _student_brief(sa: StudentAnalysis) -> dict[str, Any]:
    return {
        'student_profile_id': sa.student_profile_id,
        'full_name': sa.full_name,
        'email': sa.email,
        'filiere': sa.filiere_name,
        'level': sa.level_name,
        'sector': sa.sector_name,
        'internship_type': sa.internship_type_name,
        'academic_year': sa.academic_year,
    }


def _encadrant_brief(enc: EncadrantAnalysis) -> dict[str, Any]:
    return {
        'encadrant_profile_id': enc.encadrant_profile_id,
        'full_name': enc.full_name,
        'email': enc.email,
        'current_load': enc.current_load,
        'max_capacity': enc.max_capacity,
        'is_available': enc.is_available,
        'is_active': enc.is_active,
        'specialization_domains': enc.specialization_domains,
    }


def _issue(
    code: str,
    severity: str,
    *,
    count: int = 0,
    students: Optional[list[dict]] = None,
    encadrants: Optional[list[dict]] = None,
    metadata: Optional[dict] = None,
    recommendation_codes: Optional[list[str]] = None,
) -> dict[str, Any]:
    return {
        'code': code,
        'severity': severity,
        'count': count,
        'students': students or [],
        'encadrants': encadrants or [],
        'metadata': metadata or {},
        'recommendation_codes': recommendation_codes or [],
    }


def _collect_year_student_analyses(
    academic_year: str,
    *,
    excluded_student_ids: Optional[list[int]] = None,
) -> tuple[list[StudentAnalysis], list[StudentAnalysis]]:
    """Return (eligible analyses, all year analyses with active assignment)."""
    excluded = set(excluded_student_ids or [])
    eligible_qs = get_eligible_students_queryset(academic_year)
    eligible_analyses: list[StudentAnalysis] = []

    for sp in eligible_qs:
        if sp.pk in excluded:
            continue
        active_assignment = next((a for a in sp.assignments.all() if a.is_active), None)
        if active_assignment is None:
            continue
        eligible_analyses.append(analyze_student(sp, assignment=active_assignment))

    year_qs = (
        StudentProfile.objects.filter(
            assignments__academic_year=academic_year,
            assignments__is_active=True,
            user__is_active=True,
        )
        .select_related(
            'user',
            'user__profile',
            'filiere',
            'academic_level',
            'academic_sector',
            'class_group',
            'internship_type',
        )
        .prefetch_related(
            'assignments',
        )
        .distinct()
    )
    year_analyses: list[StudentAnalysis] = []
    for sp in year_qs:
        if sp.pk in excluded:
            continue
        active_assignment = next(
            (a for a in sp.assignments.all() if a.academic_year == academic_year and a.is_active),
            None,
        )
        if active_assignment is None:
            continue
        year_analyses.append(analyze_student(sp, assignment=active_assignment))

    return eligible_analyses, year_analyses


def _find_compatible_encadrants(
    student: StudentAnalysis,
    encadrant_analyses: dict[int, EncadrantAnalysis],
    projected_loads: dict[int, int],
) -> list[int]:
    compatible: list[int] = []
    for eid, enc in encadrant_analyses.items():
        max_cap = enc.max_capacity
        if max_cap and projected_loads.get(eid, 0) >= max_cap:
            continue
        score = compute_match_score(
            student,
            enc,
            projected_load=projected_loads.get(eid, 0),
        )
        if score > 0:
            compatible.append(eid)
    return compatible


def run_smart_assignment_precheck(
    *,
    academic_year: str = '',
    excluded_student_ids: Optional[list[int]] = None,
    excluded_encadrant_ids: Optional[list[int]] = None,
    respect_locks: bool = True,
) -> dict[str, Any]:
    year = resolve_academic_year(academic_year)
    excluded_encadrants = set(excluded_encadrant_ids or [])

    student_analyses, year_analyses = _collect_year_student_analyses(
        year,
        excluded_student_ids=excluded_student_ids,
    )

    encadrants_qs = get_available_encadrants_queryset(
        excluded_encadrant_ids=list(excluded_encadrants),
    )
    encadrant_analyses: dict[int, EncadrantAnalysis] = {}
    for enc in encadrants_qs:
        encadrant_analyses[enc.pk] = analyze_encadrant(enc)

    all_encadrants_qs = EncadrantProfile.objects.filter().select_related(
        'supervisor_profile__user__profile',
    ).prefetch_related('specialization_domains', 'supervised_internship_types')
    if excluded_encadrants:
        all_encadrants_qs = all_encadrants_qs.exclude(pk__in=excluded_encadrants)

    projected_loads: dict[int, int] = {eid: enc.current_load for eid, enc in encadrant_analyses.items()}

    issues: list[dict[str, Any]] = []

    if not student_analyses:
        ineligible_count = max(0, len(year_analyses))
        missing_internship = sum(
            1
            for sa in year_analyses
            if not sa.internship_type_id and not sa.internship_type_name
        )
        recommendation_codes = [RECOMMENDATION_ADD_STUDENTS]
        if ineligible_count > 0 and missing_internship == ineligible_count:
            recommendation_codes = [RECOMMENDATION_COMPLETE_STUDENT_DATA]
        issues.append(
            _issue(
                ISSUE_NO_ELIGIBLE_STUDENTS,
                SEVERITY_CRITICAL,
                count=0,
                metadata={
                    'academic_year': year,
                    'year_students_with_assignment': ineligible_count,
                    'missing_internship_type': missing_internship,
                },
                recommendation_codes=recommendation_codes,
            ),
        )

    if not encadrant_analyses:
        issues.append(
            _issue(
                ISSUE_NO_ENCADRANTS,
                SEVERITY_CRITICAL,
                count=0,
                recommendation_codes=[RECOMMENDATION_ACTIVATE_ENCADRANTS],
            ),
        )

    missing_filiere: list[StudentAnalysis] = []
    missing_level: list[StudentAnalysis] = []
    missing_year: list[StudentAnalysis] = []
    missing_internship: list[StudentAnalysis] = []
    unsupported_category: list[StudentAnalysis] = []

    for sa in year_analyses:
        if not sa.filiere_id and not sa.filiere_name:
            missing_filiere.append(sa)
        if not sa.level_id and not sa.level_name:
            missing_level.append(sa)
        if not (sa.academic_year or '').strip():
            missing_year.append(sa)
        if not sa.internship_type_id and not sa.internship_type_name:
            missing_internship.append(sa)
        category = (sa.internship_category or sa.program_family or '').strip().upper()
        if category and category not in SUPPORTED_PROGRAM_FAMILIES:
            unsupported_category.append(sa)

    for code, group in (
        (ISSUE_MISSING_FILIERE, missing_filiere),
        (ISSUE_MISSING_LEVEL, missing_level),
        (ISSUE_MISSING_ACADEMIC_YEAR, missing_year),
        (ISSUE_MISSING_INTERNSHIP_TYPE, missing_internship),
        (ISSUE_UNSUPPORTED_INTERNSHIP_CATEGORY, unsupported_category),
    ):
        if group:
            issues.append(
                _issue(
                    code,
                    SEVERITY_WARNING,
                    count=len(group),
                    students=[_student_brief(s) for s in group[:50]],
                    metadata={'total': len(group), 'truncated': len(group) > 50},
                    recommendation_codes=[RECOMMENDATION_COMPLETE_STUDENT_DATA],
                ),
            )

    already_assigned = [
        sa for sa in student_analyses
        if sa.current_encadrant_id
    ]
    if already_assigned:
        issues.append(
            _issue(
                ISSUE_EXISTING_ASSIGNMENTS,
                SEVERITY_WARNING,
                count=len(already_assigned),
                students=[_student_brief(s) for s in already_assigned[:50]],
                metadata={'total': len(already_assigned), 'truncated': len(already_assigned) > 50},
                recommendation_codes=[RECOMMENDATION_REVIEW_ASSIGNMENT_STRATEGY],
            ),
        )

    encadrants_missing_supervision: list[EncadrantAnalysis] = []
    for enc in encadrant_analyses.values():
        if not enc.supervised_internship_type_ids:
            encadrants_missing_supervision.append(enc)
    if encadrants_missing_supervision:
        issues.append(
            _issue(
                ISSUE_ENCADRANTS_WITHOUT_SUPERVISED_TYPES,
                SEVERITY_WARNING,
                count=len(encadrants_missing_supervision),
                encadrants=[_encadrant_brief(e) for e in encadrants_missing_supervision[:20]],
                metadata={'total': len(encadrants_missing_supervision)},
                recommendation_codes=[RECOMMENDATION_CONFIGURE_SUPERVISED_INTERNSHIP_TYPES],
            ),
        )

    internship_types_without_supervisor: dict[str, list[StudentAnalysis]] = {}
    for sa in student_analyses:
        if not sa.internship_type_id:
            continue
        has_supervisor = any(
            _internship_type_compatible(sa, enc)
            for enc in encadrant_analyses.values()
        )
        if not has_supervisor:
            key = sa.internship_type_name or str(sa.internship_type_id)
            internship_types_without_supervisor.setdefault(key, []).append(sa)

    for type_name, group in internship_types_without_supervisor.items():
        issues.append(
            _issue(
                ISSUE_NO_SUPERVISORS_FOR_INTERNSHIP_TYPE,
                SEVERITY_CRITICAL if len(group) == len(student_analyses) else SEVERITY_WARNING,
                count=len(group),
                students=[_student_brief(s) for s in group[:30]],
                metadata={
                    'internship_type': type_name,
                    'total': len(group),
                    'truncated': len(group) > 30,
                },
                recommendation_codes=[
                    RECOMMENDATION_CONFIGURE_SUPERVISED_INTERNSHIP_TYPES,
                    RECOMMENDATION_ACTIVATE_ENCADRANTS,
                ],
            ),
        )

    if student_analyses and encadrant_analyses:
        students_without_match: list[StudentAnalysis] = []
        students_with_match: list[StudentAnalysis] = []
        matching_encadrant_ids: set[int] = set()

        for sa in student_analyses:
            compatible = _find_compatible_encadrants(sa, encadrant_analyses, projected_loads)
            if compatible:
                students_with_match.append(sa)
                matching_encadrant_ids.update(compatible)
            else:
                students_without_match.append(sa)

        if students_with_match and not students_without_match:
            pass
        elif not students_with_match:
            inactive_matching: list[EncadrantAnalysis] = []
            for enc in all_encadrants_qs:
                enc_a = analyze_encadrant(enc)
                for sa in student_analyses[:5]:
                    if compute_match_score(sa, enc_a, projected_load=enc_a.current_load) > 0:
                        if not enc_a.is_available:
                            inactive_matching.append(enc_a)
                        break

            if inactive_matching and not any(e.is_available for e in encadrant_analyses.values()):
                issues.append(
                    _issue(
                        ISSUE_ALL_MATCHING_ENCADRANTS_INACTIVE,
                        SEVERITY_CRITICAL,
                        count=len(inactive_matching),
                        encadrants=[_encadrant_brief(e) for e in inactive_matching[:20]],
                        recommendation_codes=[RECOMMENDATION_ACTIVATE_ENCADRANTS],
                    ),
                )
            else:
                overloaded_enc: list[EncadrantAnalysis] = []
                for enc in encadrant_analyses.values():
                    max_cap = enc.max_capacity
                    if max_cap and enc.current_load >= max_cap:
                        overloaded_enc.append(enc)

                if overloaded_enc and len(overloaded_enc) == len(encadrant_analyses):
                    issues.append(
                        _issue(
                            ISSUE_ALL_ENCADRANTS_OVERLOADED,
                            SEVERITY_CRITICAL,
                            count=len(overloaded_enc),
                            encadrants=[_encadrant_brief(e) for e in overloaded_enc[:20]],
                            recommendation_codes=[RECOMMENDATION_INCREASE_CAPACITY],
                        ),
                    )
                else:
                    issues.append(
                        _issue(
                            ISSUE_NO_COMPATIBLE_ENCADRANTS,
                            SEVERITY_CRITICAL,
                            count=len(student_analyses),
                            students=[_student_brief(s) for s in student_analyses[:30]],
                            metadata={'eligible_students': len(student_analyses)},
                            recommendation_codes=[
                                RECOMMENDATION_ADJUST_SCOPES,
                                RECOMMENDATION_ACTIVATE_ENCADRANTS,
                            ],
                        ),
                    )
        elif students_without_match:
            issues.append(
                _issue(
                    ISSUE_PARTIAL_UNASSIGNABLE,
                    SEVERITY_WARNING,
                    count=len(students_without_match),
                    students=[_student_brief(s) for s in students_without_match[:30]],
                    metadata={
                        'assignable_count': len(students_with_match),
                        'unassignable_count': len(students_without_match),
                    },
                    recommendation_codes=[RECOMMENDATION_ADJUST_SCOPES],
                ),
            )

        available_with_capacity = [
            enc for enc in encadrant_analyses.values()
            if enc.is_available and (not enc.max_capacity or enc.current_load < enc.max_capacity)
        ]
        if (
            student_analyses
            and encadrant_analyses
            and not available_with_capacity
            and ISSUE_ALL_ENCADRANTS_OVERLOADED not in {i['code'] for i in issues}
        ):
            overloaded = list(encadrant_analyses.values())
            issues.append(
                _issue(
                    ISSUE_ALL_ENCADRANTS_OVERLOADED,
                    SEVERITY_CRITICAL,
                    count=len(overloaded),
                    encadrants=[_encadrant_brief(e) for e in overloaded[:20]],
                    recommendation_codes=[RECOMMENDATION_INCREASE_CAPACITY],
                ),
            )

    blocking = [i for i in issues if i['severity'] == SEVERITY_CRITICAL]
    warnings = [i for i in issues if i['severity'] == SEVERITY_WARNING]

    return {
        'academic_year': year,
        'can_run': len(blocking) == 0 and bool(student_analyses) and bool(encadrant_analyses),
        'has_blocking_errors': len(blocking) > 0,
        'has_warnings': len(warnings) > 0,
        'blocking_count': len(blocking),
        'warning_count': len(warnings),
        'issues': issues,
        'summary': {
            'eligible_students': len(student_analyses),
            'year_students': len(year_analyses),
            'active_encadrants': len(encadrant_analyses),
            'already_assigned': len(already_assigned),
            'missing_data_total': (
                len(missing_filiere)
                + len(missing_level)
                + len(missing_year)
                + len(missing_internship)
            ),
        },
    }
