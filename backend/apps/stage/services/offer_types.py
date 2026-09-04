"""Canonical resolution of free-form internship type tokens to InternshipOffer.OfferType.

Offer type reaches the API from three independent sources that use different
vocabularies:

* the admin create/edit studio, which lists the school's academic
  ``admin_management.InternshipType`` rows (slug codes such as ``terrain``,
  ``mission-pro``, ``bras-droit``);
* the text parser, which emits its own lowercase tokens (``pfe``, ``summer``,
  ``observation``);
* the URL import normalizer, which already emits canonical values.

``InternshipOffer.offer_type`` is a ``CharField(max_length=16)`` restricted to
``OfferType.choices``, so any of those tokens either corrupts the row or
overflows the column. Everything must pass through :func:`resolve_offer_type`.
"""

from __future__ import annotations

from apps.stage.models import InternshipOffer

OfferType = InternshipOffer.OfferType

#: Exact matches, checked before the substring pass below.
_EXACT_TOKENS: dict[str, str] = {
    'pfe': OfferType.PFE,
    'pfa': OfferType.PFA,
    'internship': OfferType.INTERNSHIP,
    'stage': OfferType.INTERNSHIP,
    'alternance': OfferType.ALTERNANCE,
    'apprentissage': OfferType.ALTERNANCE,
    'job': OfferType.JOB,
    'emploi': OfferType.JOB,
    'cdi': OfferType.JOB,
    'cdd': OfferType.JOB,
    'other': OfferType.OTHER,
    'autre': OfferType.OTHER,
    # ESCA academic catalog slugs (see esca_official_internships).
    'terrain': OfferType.INTERNSHIP,
    'application': OfferType.INTERNSHIP,
    'operationnel': OfferType.INTERNSHIP,
    'bras-droit': OfferType.INTERNSHIP,
    'mission-pro': OfferType.INTERNSHIP,
    'exploration': OfferType.INTERNSHIP,
    'management': OfferType.INTERNSHIP,
    'specialite': OfferType.INTERNSHIP,
    'freshman': OfferType.INTERNSHIP,
    'sophomore': OfferType.INTERNSHIP,
    'junior': OfferType.INTERNSHIP,
    # Text-parser tokens.
    'summer': OfferType.INTERNSHIP,
    'observation': OfferType.INTERNSHIP,
    'initiation': OfferType.INTERNSHIP,
}

#: Ordered substring probes for labels ("Stage de fin d'études", "Contrat CDI"…).
#: Order matters: the most specific token has to win.
_SUBSTRING_TOKENS: tuple[tuple[str, str], ...] = (
    ('pfe', OfferType.PFE),
    ("fin d'etudes", OfferType.PFE),
    ('fin detudes', OfferType.PFE),
    ('fin d etudes', OfferType.PFE),
    ('pfa', OfferType.PFA),
    ("fin d'annee", OfferType.PFA),
    ('fin dannee', OfferType.PFA),
    ('alternance', OfferType.ALTERNANCE),
    ('apprentissage', OfferType.ALTERNANCE),
    ('cdi', OfferType.JOB),
    ('cdd', OfferType.JOB),
    ('emploi', OfferType.JOB),
    ('recrutement', OfferType.JOB),
    ('job', OfferType.JOB),
    ('stage', OfferType.INTERNSHIP),
    ('intern', OfferType.INTERNSHIP),
)

_VALID_VALUES = frozenset(OfferType.values)

_ACCENT_MAP = str.maketrans({
    'à': 'a', 'â': 'a', 'ä': 'a',
    'ç': 'c',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'î': 'i', 'ï': 'i',
    'ô': 'o', 'ö': 'o',
    'ù': 'u', 'û': 'u', 'ü': 'u',
    'ÿ': 'y',
    '’': "'", '‘': "'",
})


def _normalize_token(value: object) -> str:
    return str(value or '').strip().lower().translate(_ACCENT_MAP)


def resolve_offer_type(value: object, *, default: str = OfferType.INTERNSHIP) -> str:
    """Best-effort mapping of any incoming type token to a valid OfferType value.

    Never raises and never returns a value that would violate the column
    constraints; unrecognized non-empty tokens fall back to ``default``.
    """
    token = _normalize_token(value)
    if not token:
        return default

    upper = token.upper()
    if upper in _VALID_VALUES:
        return upper

    exact = _EXACT_TOKENS.get(token)
    if exact:
        return exact

    for needle, offer_type in _SUBSTRING_TOKENS:
        if needle in token:
            return offer_type

    return default


def is_canonical_offer_type(value: object) -> bool:
    return _normalize_token(value).upper() in _VALID_VALUES
