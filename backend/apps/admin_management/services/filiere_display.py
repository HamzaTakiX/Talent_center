"""Short program labels for admin tables (PGE, MRH, ACG-SICG, …)."""

from __future__ import annotations

import re

from apps.admin_management.models import Filiere
from apps.admin_management.services.specialization_domains import MASTER_TRACK_BY_FILIERE_CODE

_FAMILY_SHORT: dict[str, str] = {
    Filiere.ProgramFamily.PGE: 'PGE',
    Filiere.ProgramFamily.LME: 'LME',
    Filiere.ProgramFamily.IBA: 'IBA',
}


def filiere_short_code(filiere: Filiere | None) -> str:
    if filiere is None:
        return ''
    slug = (filiere.code or '').lower()
    track = MASTER_TRACK_BY_FILIERE_CODE.get(slug)
    if track:
        return track
    family_short = _FAMILY_SHORT.get(filiere.program_family or '')
    if family_short:
        return family_short
    if slug.startswith('master-'):
        return slug.removeprefix('master-').upper()
    if slug:
        return slug.upper()
    return ''


def abbrev_from_program_name(name: str) -> str:
    """Extract acronym from stored program_major when filière FK is missing."""
    text = (name or '').strip()
    if not text:
        return ''
    paren = re.search(r'\(([^)]+)\)\s*$', text)
    if paren:
        inner = paren.group(1).strip()
        if re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9-]*', inner) and len(inner) <= 16:
            return inner.upper()
    leading = re.match(r'^([A-Z]{2,}(?:-[A-Z0-9]+)*)\s*[\(-]', text)
    if leading:
        return leading.group(1).upper()
    return text if len(text) <= 16 else text[:16].rstrip()


def program_short_label(*, filiere: Filiere | None = None, program_major: str = '') -> str:
    short = filiere_short_code(filiere)
    if short:
        return short
    return abbrev_from_program_name(program_major)


def filiere_codes_for_ids(filiere_ids: list[int]) -> list[str]:
    if not filiere_ids:
        return []
    codes: list[str] = []
    for filiere in Filiere.objects.filter(pk__in=filiere_ids).order_by('sort_order', 'code'):
        label = filiere_short_code(filiere)
        if label and label not in codes:
            codes.append(label)
    return codes
