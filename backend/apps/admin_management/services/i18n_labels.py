"""Resolve localized labels from JSON i18n dicts on academic entities."""

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
