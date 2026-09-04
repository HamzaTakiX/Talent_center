"""Encadrant academic scope resolution, validation, and repair."""

from __future__ import annotations

from typing import Any, Optional

from django.db.models import Q

from apps.admin_management.models import (
    AcademicLevel,
    AcademicYear,
    ClassGroup,
    EncadrantProfile,
    Filiere,
    InternshipType,
)
from apps.admin_management.services.import_common import parse_csv_list, parse_int
from apps.admin_management.services.supervised_internship_types import (
    get_encadrant_supervised_internship_type_ids,
    sync_encadrant_supervised_internship_types,
)


def encadrant_scope_gaps(encadrant: EncadrantProfile) -> list[str]:
    """Machine codes for missing scope pieces (i18n on frontend)."""
    gaps: list[str] = []
    if not encadrant.scope_filiere_ids:
        gaps.append('PROGRAMS')
    if not encadrant.scope_level_ids:
        gaps.append('LEVELS')
    if not encadrant.scope_academic_years:
        gaps.append('ACADEMIC_YEARS')
    if not get_encadrant_supervised_internship_type_ids(encadrant):
        gaps.append('SUPERVISED_INTERNSHIP_TYPES')
    return gaps


def encadrant_scope_is_complete(encadrant: EncadrantProfile) -> bool:
    return not encadrant_scope_gaps(encadrant)


def filiere_ids_for_encadrant(encadrant: EncadrantProfile) -> list[int]:
    """Programs from scope, or inferred from configured class groups."""
    filiere_ids = list(encadrant.scope_filiere_ids or [])
    if filiere_ids:
        return filiere_ids
    class_group_ids = list(encadrant.scope_class_group_ids or [])
    if not class_group_ids:
        return []
    inferred = list(
        ClassGroup.objects.filter(pk__in=class_group_ids, is_active=True)
        .exclude(filiere_id__isnull=True)
        .values_list('filiere_id', flat=True)
        .distinct(),
    )
    return inferred


def levels_for_filieres(filiere_ids: list[int]) -> list[int]:
    if not filiere_ids:
        return []
    return list(
        AcademicLevel.objects.filter(
            filiere_id__in=filiere_ids,
            is_active=True,
        )
        .order_by('filiere_id', 'sort_order', 'year_number')
        .values_list('pk', flat=True),
    )


def internship_type_ids_for_levels(level_ids: list[int]) -> list[int]:
    if not level_ids:
        return []
    return list(
        InternshipType.objects.filter(
            academic_level_id__in=level_ids,
            is_active=True,
        )
        .order_by('academic_level_id', 'sort_order', 'code')
        .values_list('pk', flat=True)
        .distinct(),
    )


def current_academic_year_codes() -> list[str]:
    current = AcademicYear.objects.filter(is_current=True, is_active=True).first()
    if current:
        return [current.code]
    fallback = AcademicYear.objects.filter(is_active=True).order_by('-start_year').first()
    return [fallback.code] if fallback else []


def resolve_level_ids(
    *,
    filiere_ids: list[int],
    level_ids_raw: Optional[list[int]] = None,
    level_codes_raw: Optional[list[str]] = None,
    infer_if_missing: bool = False,
) -> list[int]:
    ids: list[int] = list(level_ids_raw or [])
    codes = [c.strip().lower() for c in (level_codes_raw or []) if c and str(c).strip()]

    if codes:
        qs = AcademicLevel.objects.filter(is_active=True, code__in=codes)
        if filiere_ids:
            qs = qs.filter(filiere_id__in=filiere_ids)
        for level in qs:
            if level.pk not in ids:
                ids.append(level.pk)
        found_codes = {level.code.lower() for level in qs}
        unknown = [c for c in codes if c not in found_codes]
        if unknown:
            raise ValueError(f'Unknown academic level code(s): {", ".join(unknown)}')

    if ids and filiere_ids:
        valid = set(
            AcademicLevel.objects.filter(
                pk__in=ids,
                filiere_id__in=filiere_ids,
                is_active=True,
            ).values_list('pk', flat=True),
        )
        invalid = [pk for pk in ids if pk not in valid]
        if invalid:
            raise ValueError(
                f'Academic level id(s) {invalid} do not belong to the selected program(s).',
            )

    if not ids and infer_if_missing and filiere_ids:
        ids = levels_for_filieres(filiere_ids)

    return list(dict.fromkeys(ids))


def resolve_academic_years(
    years_raw: Optional[list[str]] = None,
    *,
    infer_if_missing: bool = False,
) -> list[str]:
    years = [y.strip() for y in (years_raw or []) if y and str(y).strip()]
    if years:
        known = set(
            AcademicYear.objects.filter(code__in=years, is_active=True).values_list(
                'code',
                flat=True,
            ),
        )
        unknown = [y for y in years if y not in known]
        if unknown:
            raise ValueError(f'Unknown academic year(s): {", ".join(unknown)}')
        return list(dict.fromkeys(years))

    if infer_if_missing:
        inferred = current_academic_year_codes()
        if inferred:
            return inferred
    return []


def resolve_supervised_internship_type_ids(
    *,
    level_ids: list[int],
    type_ids_raw: Optional[list[int]] = None,
    type_codes_raw: Optional[list[str]] = None,
    infer_if_missing: bool = False,
) -> list[int]:
    ids: list[int] = list(type_ids_raw or [])
    codes = [c.strip().lower() for c in (type_codes_raw or []) if c and str(c).strip()]

    if codes:
        qs = InternshipType.objects.filter(is_active=True, code__in=codes)
        if level_ids:
            qs = qs.filter(academic_level_id__in=level_ids)
        for item in qs:
            if item.pk not in ids:
                ids.append(item.pk)
        found = {item.code.lower() for item in qs}
        unknown = [c for c in codes if c not in found]
        if unknown:
            raise ValueError(f'Unknown internship type code(s): {", ".join(unknown)}')

    if ids and level_ids:
        allowed = set(
            InternshipType.objects.filter(
                pk__in=ids,
                is_active=True,
                academic_level_id__in=level_ids,
            ).values_list('pk', flat=True),
        )
        out_of_scope = [pk for pk in ids if pk not in allowed]
        if out_of_scope:
            raise ValueError(
                'One or more supervised internship types do not belong to the selected levels: '
                f'{out_of_scope}',
            )
        ids = [pk for pk in ids if pk in allowed]

    if not ids and infer_if_missing and level_ids:
        ids = internship_type_ids_for_levels(level_ids)

    return list(dict.fromkeys(ids))


def resolve_class_group_ids(
    *,
    filiere_ids: list[int],
    class_group_ids_raw: Optional[list[int]] = None,
    class_group_codes_raw: Optional[list[str]] = None,
) -> list[int]:
    ids: list[int] = list(class_group_ids_raw or [])
    codes = [c.strip() for c in (class_group_codes_raw or []) if c and str(c).strip()]

    for code in codes:
        qs = ClassGroup.objects.filter(is_active=True).filter(
            Q(code__iexact=code) | Q(name__iexact=code),
        )
        if filiere_ids:
            qs = qs.filter(filiere_id__in=filiere_ids)
        group = qs.first()
        if group is None:
            raise ValueError(f'Unknown class group code: {code}')
        if group.pk not in ids:
            ids.append(group.pk)

    return list(dict.fromkeys(ids))


def validate_encadrant_scope(
    *,
    filiere_ids: list[int],
    level_ids: list[int],
    academic_years: list[str],
    supervised_internship_type_ids: list[int],
) -> None:
    if not filiere_ids:
        raise ValueError('At least one program (filière) is required.')
    if not level_ids:
        raise ValueError('At least one academic level is required.')
    if not academic_years:
        raise ValueError('At least one academic year is required.')
    if not supervised_internship_type_ids:
        raise ValueError('At least one supervised internship type is required.')

    active_filieres = Filiere.objects.filter(pk__in=filiere_ids, is_active=True).count()
    if active_filieres != len(set(filiere_ids)):
        raise ValueError('One or more selected programs are invalid or inactive.')

    resolve_level_ids(filiere_ids=filiere_ids, level_ids_raw=level_ids)
    resolve_academic_years(academic_years)


def normalize_encadrant_scope(
    *,
    filiere_ids: list[int],
    level_ids: Optional[list[int]] = None,
    level_codes: Optional[list[str]] = None,
    academic_years: Optional[list[str]] = None,
    supervised_internship_type_ids: Optional[list[int]] = None,
    supervised_internship_type_codes: Optional[list[str]] = None,
    class_group_ids: Optional[list[int]] = None,
    class_group_codes: Optional[list[str]] = None,
    infer_missing: bool = False,
    strict: bool = True,
) -> dict[str, Any]:
    """Resolve scope fields; optionally infer missing pieces (import / repair)."""
    resolved_levels = resolve_level_ids(
        filiere_ids=filiere_ids,
        level_ids_raw=level_ids,
        level_codes_raw=level_codes,
        infer_if_missing=infer_missing,
    )
    resolved_years = resolve_academic_years(academic_years, infer_if_missing=infer_missing)
    resolved_types = resolve_supervised_internship_type_ids(
        level_ids=resolved_levels,
        type_ids_raw=supervised_internship_type_ids,
        type_codes_raw=supervised_internship_type_codes,
        infer_if_missing=infer_missing,
    )
    resolved_classes = resolve_class_group_ids(
        filiere_ids=filiere_ids,
        class_group_ids_raw=class_group_ids,
        class_group_codes_raw=class_group_codes,
    )

    if strict:
        validate_encadrant_scope(
            filiere_ids=filiere_ids,
            level_ids=resolved_levels,
            academic_years=resolved_years,
            supervised_internship_type_ids=resolved_types,
        )

    return {
        'filiere_ids': filiere_ids,
        'level_ids': resolved_levels,
        'academic_years': resolved_years,
        'supervised_internship_type_ids': resolved_types,
        'class_group_ids': resolved_classes,
    }


def parse_scope_lists_from_import_row(row: dict[str, Any]) -> dict[str, Any]:
    """Extract raw scope list fields from a normalized import row."""
    level_ids = [parse_int(p) for p in parse_csv_list(row.get('level_ids'))]
    level_ids = [i for i in level_ids if i is not None]
    type_ids = [parse_int(p) for p in parse_csv_list(row.get('supervised_internship_type_ids'))]
    type_ids = [i for i in type_ids if i is not None]
    class_ids = [parse_int(p) for p in parse_csv_list(row.get('class_group_ids'))]
    class_ids = [i for i in class_ids if i is not None]

    return {
        'level_ids': level_ids,
        'level_codes': parse_csv_list(row.get('level_codes')),
        'academic_years': parse_csv_list(row.get('academic_years')),
        'supervised_internship_type_ids': type_ids,
        'supervised_internship_type_codes': parse_csv_list(
            row.get('supervised_internship_type_codes'),
        ),
        'class_group_ids': class_ids,
        'class_group_codes': parse_csv_list(row.get('class_group_codes')),
    }


def repair_encadrant_profile(encadrant: EncadrantProfile, *, dry_run: bool = True) -> bool:
    """Fill missing scope fields on one encadrant. Returns True if changes would apply."""
    filiere_ids = filiere_ids_for_encadrant(encadrant)
    level_ids = list(encadrant.scope_level_ids or [])
    years = list(encadrant.scope_academic_years or [])
    type_ids = get_encadrant_supervised_internship_type_ids(encadrant)
    changed = False

    if filiere_ids and list(encadrant.scope_filiere_ids or []) != filiere_ids:
        changed = True

    if filiere_ids and level_ids:
        valid_level_ids = list(
            AcademicLevel.objects.filter(
                pk__in=level_ids,
                filiere_id__in=filiere_ids,
                is_active=True,
            ).values_list('pk', flat=True),
        )
        if valid_level_ids != level_ids:
            level_ids = valid_level_ids or levels_for_filieres(filiere_ids)
            changed = True
    elif filiere_ids and not level_ids:
        level_ids = levels_for_filieres(filiere_ids)
        changed = True

    if not years:
        inferred_years = current_academic_year_codes()
        if inferred_years:
            years = inferred_years
            changed = True

    if level_ids and not type_ids:
        type_ids = internship_type_ids_for_levels(level_ids)
        if type_ids:
            changed = True

    if not changed:
        return False

    if dry_run:
        return True

    from .encadrants import _sync_encadrant_scopes

    _sync_encadrant_scopes(
        encadrant,
        filiere_ids=filiere_ids,
        class_group_ids=list(encadrant.scope_class_group_ids or []),
        level_ids=level_ids,
        sector_ids=list(encadrant.scope_sector_ids or []),
        academic_years=years,
    )
    if type_ids:
        sync_encadrant_supervised_internship_types(encadrant, type_ids)
    return True


def repair_all_encadrant_scopes(*, dry_run: bool = True) -> dict[str, int]:
    repaired = 0
    scanned = 0
    for encadrant in EncadrantProfile.objects.select_related('supervisor_profile').iterator():
        scanned += 1
        if repair_encadrant_profile(encadrant, dry_run=dry_run):
            repaired += 1
    return {'scanned': scanned, 'repaired': repaired, 'dry_run': dry_run}
