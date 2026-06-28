"""Academic taxonomy queries for admin scope UI and student forms."""

from __future__ import annotations

from typing import Iterable, Optional

from django.core.cache import cache
from django.db.models import Q

from apps.admin_management.models import (
    AcademicLevel,
    AcademicSector,
    AcademicYear,
    ClassGroup,
    Filiere,
    InternshipType,
)
from apps.admin_management.services.esca_catalog import (
    ESCA_CATALOG_FILIERE_CODES,
    ESCA_PROGRAM_FAMILIES,
)
from apps.admin_management.services.i18n_labels import (
    entity_localized_name,
    management_name_fields,
    request_lang,
)


def _parse_id_list(raw: Optional[str]) -> list[int]:
    if not raw:
        return []
    ids: list[int] = []
    for part in raw.split(','):
        part = part.strip()
        if part.isdigit():
            ids.append(int(part))
    return ids


def parse_filiere_ids_param(request) -> list[int]:
    """Accept `filiere_ids=1,2` or repeated `filiere_id` query params."""
    raw = request.query_params.get('filiere_ids', '')
    ids = _parse_id_list(raw)
    if ids:
        return ids
    single = request.query_params.get('filiere_id')
    if single and str(single).isdigit():
        return [int(single)]
    repeated = request.query_params.getlist('filiere_id')
    return [int(x) for x in repeated if str(x).isdigit()]


def parse_level_ids_param(request) -> list[int]:
    raw = request.query_params.get('level_ids', '') or request.query_params.get('academic_level_ids', '')
    ids = _parse_id_list(raw)
    if ids:
        return ids
    single = request.query_params.get('level_id') or request.query_params.get('academic_level_id')
    if single and str(single).isdigit():
        return [int(single)]
    return []


_FILIERES_CACHE_TTL = 120


def _filieres_cache_key(*, program_family: Optional[str], student_catalog: bool) -> str:
    return f'academic:active_filieres:{program_family or ""}:{int(student_catalog)}'


def invalidate_active_filieres_cache() -> None:
    """Clear active filière list caches (call after catalog mutations)."""
    for student_catalog in (False, True):
        cache.delete(_filieres_cache_key(program_family=None, student_catalog=student_catalog))
        for family in ESCA_PROGRAM_FAMILIES:
            cache.delete(_filieres_cache_key(program_family=family, student_catalog=student_catalog))


def active_filieres(*, program_family: Optional[str] = None, student_catalog: bool = False):
    cache_key = _filieres_cache_key(program_family=program_family, student_catalog=student_catalog)
    cached_ids = cache.get(cache_key)
    if cached_ids is not None:
        return Filiere.objects.filter(pk__in=cached_ids, is_active=True, is_archived=False).order_by(
            'sort_order', 'name',
        )

    qs = Filiere.objects.filter(is_active=True, is_archived=False)
    if student_catalog:
        qs = qs.filter(
            program_family__in=ESCA_PROGRAM_FAMILIES,
            code__in=ESCA_CATALOG_FILIERE_CODES,
        )
    if program_family:
        qs = qs.filter(program_family=program_family)
    ids = list(qs.order_by('sort_order', 'name').values_list('pk', flat=True))
    cache.set(cache_key, ids, _FILIERES_CACHE_TTL)
    return Filiere.objects.filter(pk__in=ids).order_by('sort_order', 'name')


def active_academic_years():
    return AcademicYear.objects.filter(is_active=True).order_by('-start_year')


def active_levels(*, filiere_ids: Optional[Iterable[int]] = None):
    qs = AcademicLevel.objects.filter(is_active=True, is_archived=False).select_related('filiere')
    if filiere_ids:
        qs = qs.filter(filiere_id__in=list(filiere_ids))
    return qs.order_by('filiere__sort_order', 'sort_order', 'year_number')


def active_sectors(*, level_ids: Optional[Iterable[int]] = None):
    qs = AcademicSector.objects.filter(is_active=True).select_related('academic_level')
    if level_ids:
        qs = qs.filter(academic_level_id__in=list(level_ids))
    return qs.order_by('academic_level__sort_order', 'sort_order', 'name')


def active_internship_types(
    *,
    level_ids: Optional[Iterable[int]] = None,
    sector_id: Optional[int] = None,
):
    qs = InternshipType.objects.filter(is_active=True, is_archived=False).select_related(
        'academic_level', 'academic_sector',
    )
    if level_ids:
        qs = qs.filter(academic_level_id__in=list(level_ids))
    if sector_id:
        qs = qs.filter(Q(academic_sector_id=sector_id) | Q(academic_sector__isnull=True))
    else:
        qs = qs.filter(academic_sector__isnull=True)
    return qs.order_by('sort_order', 'name')


def active_class_groups(
    *,
    filiere_ids: Optional[Iterable[int]] = None,
    academic_year: Optional[str] = None,
    class_group_ids: Optional[Iterable[int]] = None,
    level_ids: Optional[Iterable[int]] = None,
    sector_ids: Optional[Iterable[int]] = None,
):
    qs = ClassGroup.objects.filter(is_active=True, is_archived=False).select_related(
        'filiere', 'academic_level', 'academic_sector', 'academic_year_ref',
    )
    if filiere_ids:
        qs = qs.filter(filiere_id__in=list(filiere_ids))
    if academic_year:
        qs = qs.filter(academic_year=academic_year)
    if class_group_ids:
        qs = qs.filter(id__in=list(class_group_ids))
    if level_ids:
        qs = qs.filter(academic_level_id__in=list(level_ids))
    if sector_ids:
        qs = qs.filter(academic_sector_id__in=list(sector_ids))
    return qs.order_by('filiere__name', '-academic_year', 'name')


def distinct_academic_years(*, filiere_ids: Optional[Iterable[int]] = None) -> list[str]:
    """Return year codes — prefer canonical AcademicYear table, fallback to class groups."""
    canonical = list(active_academic_years().values_list('code', flat=True))
    if canonical:
        return canonical
    qs = active_class_groups(filiere_ids=filiere_ids)
    return list(
        qs.exclude(academic_year='')
        .values_list('academic_year', flat=True)
        .distinct()
        .order_by('-academic_year')
    )


def distinct_levels(
    *,
    filiere_ids: Optional[Iterable[int]] = None,
    academic_year: Optional[str] = None,
    class_group_ids: Optional[Iterable[int]] = None,
) -> list[str]:
    """Legacy: level codes for scope filters (from AcademicLevel or ClassGroup)."""
    level_qs = active_levels(filiere_ids=filiere_ids)
    if level_qs.exists():
        return list(level_qs.values_list('code', flat=True).distinct())
    qs = active_class_groups(
        filiere_ids=filiere_ids,
        academic_year=academic_year,
        class_group_ids=class_group_ids,
    )
    return list(
        qs.exclude(level='')
        .values_list('level', flat=True)
        .distinct()
        .order_by('level')
    )


def serialize_filiere(filiere: Filiere, lang: str) -> dict:
    return {
        'id': filiere.id,
        'code': filiere.code,
        **management_name_fields(filiere, lang),
        'program_family': filiere.program_family,
        'department': filiere.department,
        'is_active': filiere.is_active,
    }


def serialize_academic_year(year: AcademicYear) -> dict:
    return {
        'id': year.id,
        'code': year.code,
        'label': year.label or year.code,
        'start_year': year.start_year,
        'end_year': year.end_year,
        'is_current': year.is_current,
        'is_active': year.is_active,
    }


def serialize_level(level: AcademicLevel, lang: str) -> dict:
    return {
        'id': level.id,
        'code': level.code,
        **management_name_fields(level, lang),
        'filiere_id': level.filiere_id,
        'filiere_code': level.filiere.code,
        'year_number': level.year_number,
        'has_sectors': level.has_sectors,
        'sort_order': level.sort_order,
        'is_active': level.is_active,
    }


def serialize_sector(sector: AcademicSector, lang: str) -> dict:
    return {
        'id': sector.id,
        'code': sector.code,
        **management_name_fields(sector, lang),
        'academic_level_id': sector.academic_level_id,
        'level_code': sector.academic_level.code,
        'is_active': sector.is_active,
    }


def serialize_internship_type(item: InternshipType, lang: str) -> dict:
    competencies = []
    for entry in item.competencies or []:
        if not isinstance(entry, dict):
            continue
        name_fr = entry.get('name_fr') or entry.get('name', '')
        name_en = entry.get('name_en') or name_fr
        name_ar = entry.get('name_ar') or name_fr
        i18n = entry.get('name_i18n') or {'en': name_en, 'fr': name_fr, 'ar': name_ar}
        if lang == 'fr':
            label = i18n.get('fr') or name_fr
        elif lang == 'ar':
            label = i18n.get('ar') or name_ar
        else:
            label = i18n.get('en') or name_en
        competencies.append({
            'code': entry.get('code', ''),
            'name': label,
            'name_fr': name_fr,
            'name_en': name_en,
            'name_ar': name_ar,
        })

    return {
        'id': item.id,
        'code': item.code,
        **management_name_fields(item, lang),
        'academic_level_id': item.academic_level_id,
        'academic_sector_id': item.academic_sector_id,
        'duration_hint': item.duration_hint,
        'competencies': competencies,
        'is_active': item.is_active,
    }


def serialize_class_group(cg: ClassGroup, lang: str) -> dict:
    level_label = ''
    if cg.academic_level_id:
        level_label = entity_localized_name(cg.academic_level, lang)
    sector_label = ''
    if cg.academic_sector_id:
        sector_label = entity_localized_name(cg.academic_sector, lang)
    return {
        'id': cg.id,
        'code': cg.code,
        **management_name_fields(cg, lang),
        'filiere': cg.filiere_id,
        'filiere_code': cg.filiere.code,
        'filiere_name': entity_localized_name(cg.filiere, lang),
        'academic_year': cg.academic_year,
        'academic_year_id': cg.academic_year_ref_id,
        'level': cg.level or (cg.academic_level.code if cg.academic_level_id else ''),
        'academic_level_id': cg.academic_level_id,
        'academic_level_label': level_label,
        'academic_sector_id': cg.academic_sector_id,
        'academic_sector_label': sector_label,
        'student_capacity': cg.student_capacity,
        'is_active': cg.is_active,
    }
