"""ESCA undergraduate internship catalog (11 official types)."""

from __future__ import annotations

from typing import Final

# Slug codes from seed_esca_academic (PGE + LME + IBA only).
ESCA_OFFICIAL_INTERNSHIP_CODES: Final[tuple[str, ...]] = (
    'terrain',
    'application',
    'operationnel',
    'bras-droit',
    'mission-pro',
    'exploration',
    'management',
    'specialite',
    'freshman',
    'sophomore',
    'junior',
)

# Default French labels (canonical display order for dashboards).
ESCA_OFFICIAL_INTERNSHIP_LABELS: Final[dict[str, str]] = {
    'terrain': 'Stage Terrain (1 mois)',
    'application': "Stage d'application (6 semaines)",
    'operationnel': 'Stage Opérationnel (2 mois)',
    'bras-droit': 'Stage Mission Bras Droit (3 mois)',
    'mission-pro': 'Mission Professionnelle (6 mois)',
    'exploration': "Stage d'exploration (1 mois)",
    'management': 'Stage de Management (10 semaines)',
    'specialite': 'Stage de spécialité (3 mois)',
    'freshman': 'Freshman Internship (1 mois)',
    'sophomore': 'Sophomore Internship (2 mois)',
    'junior': 'Junior Internship (3 mois)',
}


def is_official_undergrad_internship_code(code: str | None) -> bool:
    return bool(code) and code in ESCA_OFFICIAL_INTERNSHIP_CODES


def official_internship_label(code: str, fallback: str = '') -> str:
    return ESCA_OFFICIAL_INTERNSHIP_LABELS.get(code, fallback or code)
