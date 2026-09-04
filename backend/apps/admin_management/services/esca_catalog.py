"""Official ESCA program catalog (filières seeded for Talent Center)."""

from __future__ import annotations

from typing import FrozenSet

from apps.admin_management.models import Filiere

# Keep in sync with seed_esca_academic() — student onboarding must not list orphan DB rows.
ESCA_CATALOG_FILIERE_CODES: FrozenSet[str] = frozenset(
    {
        'pge',
        'lme',
        'iba',
        'master-fta',
    }
)

ESCA_PROGRAM_FAMILIES: tuple[str, ...] = (
    Filiere.ProgramFamily.PGE,
    Filiere.ProgramFamily.LME,
    Filiere.ProgramFamily.IBA,
    Filiere.ProgramFamily.MASTER,
)
