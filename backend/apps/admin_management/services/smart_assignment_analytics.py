"""Internship-type analytics for the smart assignment dashboard."""

from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any

from apps.admin_management.models import EncadrantProfile, InternshipType
from apps.admin_management.services.esca_official_internships import (
    ESCA_OFFICIAL_INTERNSHIP_CODES,
    is_official_undergrad_internship_code,
    official_internship_label,
)
from apps.admin_management.services.internship_resolver import SUPPORTED_PROGRAM_FAMILIES
from apps.admin_management.services.smart_assignment import (
    analyze_encadrant,
    analyze_student,
    get_available_encadrants_queryset,
    get_eligible_students_queryset,
    resolve_academic_year,
)
from apps.admin_management.services.supervised_internship_types import (
    get_encadrant_supervised_internship_type_ids,
)


def _build_active_type_maps() -> tuple[dict[int, str], dict[int, str]]:
    """Map internship type id -> code and id -> display name (active rows only)."""
    id_to_code: dict[int, str] = {}
    id_to_name: dict[int, str] = {}
    for item in InternshipType.objects.filter(is_active=True).only('id', 'code', 'name'):
        id_to_code[item.id] = item.code
        id_to_name[item.id] = item.name
    return id_to_code, id_to_name


def _empty_official_counters() -> tuple[Counter[str], Counter[str]]:
    students = Counter({code: 0 for code in ESCA_OFFICIAL_INTERNSHIP_CODES})
    encadrants = Counter({code: 0 for code in ESCA_OFFICIAL_INTERNSHIP_CODES})
    return students, encadrants


def _official_distribution(counter: Counter[str]) -> list[dict[str, Any]]:
    return [
        {
            'internship_type': official_internship_label(code),
            'internship_type_code': code,
            'count': counter.get(code, 0),
        }
        for code in ESCA_OFFICIAL_INTERNSHIP_CODES
        if counter.get(code, 0) > 0
    ]


def build_smart_assignment_internship_analytics(*, academic_year: str = '') -> dict[str, Any]:
    year = resolve_academic_year(academic_year)
    students_qs = get_eligible_students_queryset(year)
    encadrants_qs = get_available_encadrants_queryset()

    students_by_code, encadrants_by_code = _empty_official_counters()
    students_by_category: Counter[str] = Counter()
    missing_internship = 0
    unsupported_category = 0
    excluded_non_official_students = 0

    id_to_code, id_to_name = _build_active_type_maps()

    for sp in students_qs:
        active_assignment = next((a for a in sp.assignments.all() if a.is_active), None)
        if active_assignment is None:
            continue
        sa = analyze_student(sp, assignment=active_assignment)
        type_code = id_to_code.get(sa.internship_type_id or 0, '')
        if sa.internship_type_name and is_official_undergrad_internship_code(type_code):
            students_by_code[type_code] += 1
        elif sa.internship_type_name:
            excluded_non_official_students += 1
        else:
            missing_internship += 1
        category = (sa.internship_category or sa.program_family or '').strip().upper()
        if category:
            students_by_category[category] += 1
            if category not in SUPPORTED_PROGRAM_FAMILIES:
                unsupported_category += 1
        elif sa.filiere_id:
            unsupported_category += 1

    encadrants_without_types = 0
    total_supervision_slots = 0
    type_to_encadrant_count: dict[int, int] = defaultdict(int)

    for enc in encadrants_qs:
        type_ids = get_encadrant_supervised_internship_type_ids(enc)
        if not type_ids:
            encadrants_without_types += 1
            continue
        for type_id in type_ids:
            code = id_to_code.get(type_id, '')
            if not is_official_undergrad_internship_code(code):
                continue
            encadrants_by_code[code] += 1
            type_to_encadrant_count[type_id] += 1
            total_supervision_slots += 1

    uncovered_types: list[dict[str, Any]] = []
    official_student_type_ids: set[int] = set()
    for sp in students_qs:
        if not sp.internship_type_id:
            continue
        code = id_to_code.get(sp.internship_type_id, '')
        if is_official_undergrad_internship_code(code):
            official_student_type_ids.add(sp.internship_type_id)

    for type_id in official_student_type_ids:
        if type_to_encadrant_count.get(type_id, 0) == 0:
            code = id_to_code.get(type_id, '')
            uncovered_types.append({
                'internship_type_id': type_id,
                'internship_type_code': code,
                'internship_type_name': official_internship_label(
                    code, id_to_name.get(type_id, ''),
                ),
                'student_count': sum(
                    1
                    for sp in students_qs
                    if sp.internship_type_id == type_id
                    and next((a for a in sp.assignments.all() if a.is_active), None)
                ),
            })

    assignment_distribution = []
    for enc in encadrants_qs:
        enc_a = analyze_encadrant(enc)
        assigned_by_type: Counter[str] = Counter()
        for sp in students_qs:
            active_a = next((a for a in sp.assignments.all() if a.is_active), None)
            if not active_a or active_a.encadrant_profile_id != enc.pk:
                continue
            sa = analyze_student(sp, assignment=active_a)
            code = id_to_code.get(sa.internship_type_id or 0, '')
            if sa.internship_type_name and is_official_undergrad_internship_code(code):
                label = official_internship_label(code, sa.internship_type_name)
                assigned_by_type[label] += 1
        assignment_distribution.append({
            'encadrant_profile_id': enc.pk,
            'full_name': enc_a.full_name,
            'by_internship_type': dict(assigned_by_type),
            'total_assigned': sum(assigned_by_type.values()),
        })

    total_students_with_type = sum(students_by_code.values())

    return {
        'academic_year': year,
        'official_internship_type_count': len(ESCA_OFFICIAL_INTERNSHIP_CODES),
        'total_unique_encadrants': encadrants_qs.count(),
        'total_supervision_slots': total_supervision_slots,
        'total_students_with_type': total_students_with_type,
        'excluded_non_official_students': excluded_non_official_students,
        'students_by_internship_type': _official_distribution(students_by_code),
        'students_by_internship_category': [
            {'category': name, 'count': count}
            for name, count in students_by_category.most_common()
        ],
        'encadrants_by_internship_type': _official_distribution(encadrants_by_code),
        'unsupported_internship_categories': unsupported_category,
        'missing_internship_type_students': missing_internship,
        'encadrants_without_supervised_types': encadrants_without_types,
        'uncovered_internship_types': uncovered_types,
        'assignment_distribution': assignment_distribution,
    }
