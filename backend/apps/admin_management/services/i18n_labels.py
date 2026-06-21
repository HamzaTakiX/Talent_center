"""Resolve localized labels from bilingual name fields on academic entities."""

from __future__ import annotations

from typing import Any, Mapping, Optional

SUPPORTED_LANGS = ('fr', 'en', 'ar')
DEFAULT_LANG = 'fr'


def normalize_lang(lang: Optional[str]) -> str:
    if not lang:
        return DEFAULT_LANG
    base = lang.lower().split('-')[0]
    return base if base in SUPPORTED_LANGS else DEFAULT_LANG


def localized_label(
    i18n: Optional[Mapping[str, Any]],
    fallback: str,
    lang: Optional[str] = None,
) -> str:
    if not i18n:
        return fallback
    normalized = normalize_lang(lang)
    for key in (normalized, DEFAULT_LANG, 'en', 'fr', 'ar'):
        value = i18n.get(key)
        if value:
            return str(value)
    return fallback


def entity_localized_name(entity, lang: Optional[str] = None) -> str:
    """Pick the best display label from name_fr, name_en, name_i18n, and name."""
    normalized = normalize_lang(lang)
    name_fr = (getattr(entity, 'name_fr', None) or '').strip()
    name_en = (getattr(entity, 'name_en', None) or '').strip()
    i18n = getattr(entity, 'name_i18n', None) or {}
    fallback = (getattr(entity, 'name', None) or '').strip()

    if normalized == 'fr':
        candidates = [name_fr, i18n.get('fr'), name_en, i18n.get('en'), fallback]
    elif normalized == 'en':
        candidates = [name_en, i18n.get('en'), name_fr, i18n.get('fr'), fallback]
    elif normalized == 'ar':
        candidates = [i18n.get('ar'), name_en, i18n.get('en'), name_fr, fallback]
    else:
        candidates = [name_fr, name_en, fallback]

    for value in candidates:
        if value:
            return str(value)
    return fallback or name_en or name_fr or ''


def bilingual_name_payload(data: Mapping[str, Any]) -> tuple[str, str]:
    """Extract French and English names from request payload."""
    name_fr = str(data.get('name_fr') or '').strip()
    name_en = str(data.get('name_en') or '').strip()
    legacy = str(data.get('name') or '').strip()
    if not name_en and legacy:
        name_en = legacy
    if not name_fr and not name_en and legacy:
        name_en = legacy
    return name_fr, name_en


def apply_bilingual_names_to_entity(entity, data: Mapping[str, Any]) -> None:
    """Persist name_fr, name_en, canonical name, and sync name_i18n when provided."""
    if 'name_fr' not in data and 'name_en' not in data and 'name' not in data:
        return

    name_fr, name_en = bilingual_name_payload(data)
    if name_fr:
        entity.name_fr = name_fr
    if name_en:
        entity.name_en = name_en

    entity.name = name_en or name_fr or (getattr(entity, 'name', None) or '')

    if hasattr(entity, 'name_i18n'):
        i18n = dict(getattr(entity, 'name_i18n', None) or {})
        if entity.name_fr:
            i18n['fr'] = entity.name_fr
        if entity.name_en:
            i18n['en'] = entity.name_en
        entity.name_i18n = i18n


def management_name_fields(entity, lang: Optional[str] = None) -> dict[str, str]:
    """Expose localized name plus raw bilingual fields for admin forms."""
    i18n = getattr(entity, 'name_i18n', None) or {}
    name_fr = (getattr(entity, 'name_fr', None) or '').strip() or str(i18n.get('fr') or '').strip()
    name_en = (
        (getattr(entity, 'name_en', None) or '').strip()
        or str(i18n.get('en') or '').strip()
        or (getattr(entity, 'name', None) or '').strip()
    )
    return {
        'name': entity_localized_name(entity, lang),
        'name_fr': name_fr,
        'name_en': name_en,
    }


def request_lang(request) -> str:
    if request is None:
        return DEFAULT_LANG
    explicit = request.query_params.get('lang', '').strip()
    if explicit:
        return normalize_lang(explicit)
    header = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
    if header:
        return normalize_lang(header.split(',')[0])
    return DEFAULT_LANG
