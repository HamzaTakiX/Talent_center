"""Validate academic hierarchy selections for students and admin scopes."""

from __future__ import annotations

from typing import Optional

from apps.admin_management.models import (
    AcademicLevel,
    AcademicSector,
    AcademicYear,
    ClassGroup,
    Filiere,
)
from apps.admin_management.services.internship_resolver import resolve_internship_type


def validate_academic_selection(
    *,
    filiere_id: Optional[int] = None,
    academic_level_id: Optional[int] = None,
    academic_sector_id: Optional[int] = None,
    internship_type_id: Optional[int] = None,  # ignored — internship is auto-resolved
    class_group_id: Optional[int] = None,
    academic_year: str = '',
    academic_year_id: Optional[int] = None,
) -> dict:
    """
    Resolve and validate FK chain. Returns resolved objects dict.
    Raises ValueError on inconsistent selections.
    """
    filiere = Filiere.objects.filter(pk=filiere_id, is_active=True).first() if filiere_id else None
    level = (
        AcademicLevel.objects.filter(pk=academic_level_id, is_active=True)
        .select_related('filiere')
        .first()
        if academic_level_id
        else None
    )
    sector = (
        AcademicSector.objects.filter(pk=academic_sector_id, is_active=True)
        .select_related('academic_level')
        .first()
        if academic_sector_id
        else None
    )
    class_group = (
        ClassGroup.objects.filter(pk=class_group_id, is_active=True)
        .select_related('filiere', 'academic_level', 'academic_sector')
        .first()
        if class_group_id
        else None
    )
    year_ref = (
        AcademicYear.objects.filter(pk=academic_year_id, is_active=True).first()
        if academic_year_id
        else None
    )

    if filiere and level and level.filiere_id != filiere.id:
        raise ValueError('Academic level does not belong to the selected program.')
    if level and sector and sector.academic_level_id != level.id:
        raise ValueError('Sector does not belong to the selected level.')
    if class_group:
        if filiere and class_group.filiere_id != filiere.id:
            raise ValueError('Class group does not belong to the selected program.')
        if level and class_group.academic_level_id and class_group.academic_level_id != level.id:
            raise ValueError('Class group does not match the selected level.')
        if sector and class_group.academic_sector_id and class_group.academic_sector_id != sector.id:
            raise ValueError('Class group does not match the selected sector.')

    resolved_year = academic_year.strip()
    if year_ref:
        resolved_year = year_ref.code
    elif class_group and not resolved_year:
        resolved_year = class_group.academic_year

    if not filiere and level:
        filiere = level.filiere
    if not level and class_group and class_group.academic_level_id:
        level = class_group.academic_level
    if not sector and class_group and class_group.academic_sector_id:
        sector = class_group.academic_sector
    if not filiere and class_group:
        filiere = class_group.filiere

    resolved_internship = resolve_internship_type(
        filiere=filiere,
        academic_level=level,
        academic_sector=sector,
        class_group=class_group,
    )
    if resolved_internship.ambiguous:
        raise ValueError(
            'Cannot determine internship type automatically — select a specialization sector '
            'or configure master internship types in the academic catalog.',
        )

    return {
        'filiere': filiere,
        'academic_level': level,
        'academic_sector': sector,
        'internship_type': resolved_internship.internship_type,
        'internship_duration': resolved_internship.internship_duration,
        'internship_category': resolved_internship.internship_category,
        'class_group': class_group,
        'academic_year_ref': year_ref,
        'academic_year': resolved_year,
    }
