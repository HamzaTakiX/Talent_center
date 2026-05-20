"""
Automatic ESCA internship type resolution from academic hierarchy.

Students never choose internship type manually — it is derived from
program (filière), academic level, and optional sector (master tracks).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from django.db.models import Q

from apps.admin_management.models import (
    AcademicLevel,
    AcademicSector,
    ClassGroup,
    Filiere,
    InternshipType,
)

SUPPORTED_PROGRAM_FAMILIES = frozenset({
    Filiere.ProgramFamily.PGE,
    Filiere.ProgramFamily.LME,
    Filiere.ProgramFamily.IBA,
    Filiere.ProgramFamily.MASTER,
})


@dataclass
class ResolvedInternship:
    internship_type: Optional[InternshipType]
    internship_duration: str
    internship_category: str
    ambiguous: bool = False


def _program_family(filiere: Optional[Filiere]) -> str:
    if filiere is None:
        return ''
    return (filiere.program_family or '').strip().upper()


def _query_internship_types(
    *,
    level: AcademicLevel,
    sector: Optional[AcademicSector] = None,
) -> list[InternshipType]:
    qs = InternshipType.objects.filter(
        academic_level=level,
        is_active=True,
    ).select_related('academic_level__filiere', 'academic_sector')

    if sector is not None:
        scoped = list(
            qs.filter(
                Q(academic_sector_id=sector.pk) | Q(academic_sector__isnull=True),
            ).order_by('sort_order', 'code'),
        )
        sector_specific = [item for item in scoped if item.academic_sector_id == sector.pk]
        if sector_specific:
            return sector_specific
        return [item for item in scoped if item.academic_sector_id is None]

    return list(qs.filter(academic_sector__isnull=True).order_by('sort_order', 'code'))


def resolve_internship_type(
    *,
    filiere: Optional[Filiere] = None,
    academic_level: Optional[AcademicLevel] = None,
    academic_sector: Optional[AcademicSector] = None,
    class_group: Optional[ClassGroup] = None,
) -> ResolvedInternship:
    """
    Resolve the canonical InternshipType for a student academic context.

    Priority for inferring level/sector/filière: explicit args, then class_group.
    """
    if class_group is not None:
        if filiere is None:
            filiere = class_group.filiere
        if academic_level is None and class_group.academic_level_id:
            academic_level = class_group.academic_level
        if academic_sector is None and class_group.academic_sector_id:
            academic_sector = class_group.academic_sector

    if academic_level is None:
        return ResolvedInternship(
            internship_type=None,
            internship_duration='',
            internship_category=_program_family(filiere),
        )

    if filiere is None:
        filiere = academic_level.filiere

    if academic_sector is None and academic_level.has_sectors:
        # Sector required for multi-track levels when multiple types exist
        pass

    candidates = _query_internship_types(level=academic_level, sector=academic_sector)
    category = _program_family(filiere)

    if not candidates:
        return ResolvedInternship(
            internship_type=None,
            internship_duration='',
            internship_category=category,
        )

    if len(candidates) == 1:
        item = candidates[0]
        return ResolvedInternship(
            internship_type=item,
            internship_duration=item.duration_hint or '',
            internship_category=category,
        )

    # Master programs may expose several types per level (configurable in catalog).
    if category == Filiere.ProgramFamily.MASTER and academic_sector is None:
        return ResolvedInternship(
            internship_type=None,
            internship_duration='',
            internship_category=category,
            ambiguous=True,
        )

    # Prefer sector-specific match when multiple generic types remain.
    item = candidates[0]
    return ResolvedInternship(
        internship_type=item,
        internship_duration=item.duration_hint or '',
        internship_category=category,
        ambiguous=len(candidates) > 1,
    )


def apply_resolved_internship_to_profile(profile, resolved: ResolvedInternship) -> None:
    """Write internship FK and denormalized fields on StudentProfile."""
    profile.internship_type = resolved.internship_type
    profile.internship_duration = resolved.internship_duration
    profile.internship_category = resolved.internship_category


def sync_student_internship_from_academics(profile) -> ResolvedInternship:
    """Recompute internship fields from the student profile academic FKs."""
    resolved = resolve_internship_type(
        filiere=profile.filiere,
        academic_level=profile.academic_level,
        academic_sector=profile.academic_sector,
        class_group=profile.class_group,
    )
    apply_resolved_internship_to_profile(profile, resolved)
    return resolved
