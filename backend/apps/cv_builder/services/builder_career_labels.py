"""Resolve program / internship / domain labels for career-coach messages (fr, en, ar)."""

from __future__ import annotations

import re
from typing import Any, Dict, List, Mapping, Optional

from apps.admin_management.services.i18n_labels import localized_label, normalize_lang
from .builder_analysis_messages import msg

# Free-text program_major values sometimes stored without filière i18n
_PROGRAM_MAJOR_ALIASES: Dict[str, Dict[str, str]] = {
    'ingenierie informatique': {
        'fr': 'Ingénierie informatique',
        'en': 'Computer Engineering',
        'ar': 'هندسة المعلوماتية',
    },
    'genie informatique': {
        'fr': 'Génie informatique',
        'en': 'Computer Engineering',
        'ar': 'هندسة المعلوماتية',
    },
    'management': {
        'fr': 'Management',
        'en': 'Management',
        'ar': 'الإدارة',
    },
    'finance': {
        'fr': 'Finance',
        'en': 'Finance',
        'ar': 'المالية',
    },
    'marketing': {
        'fr': 'Marketing',
        'en': 'Marketing',
        'ar': 'التسويق',
    },
    'ressources humaines': {
        'fr': 'Ressources humaines',
        'en': 'Human Resources',
        'ar': 'الموارد البشرية',
    },
    'logistique': {
        'fr': 'Logistique',
        'en': 'Logistics',
        'ar': 'اللوجستيك',
    },
    'commerce international': {
        'fr': 'Commerce international',
        'en': 'International Business',
        'ar': 'التجارة الدولية',
    },
    'audit controle de gestion': {
        'fr': 'Audit & contrôle de gestion',
        'en': 'Audit & management control',
        'ar': 'التدقيق والرقابة الإدارية',
    },
}


def _normalize_lookup_key(text: str) -> str:
    lowered = (text or '').lower().strip()
    lowered = lowered.replace('é', 'e').replace('è', 'e').replace('ê', 'e')
    lowered = lowered.replace('à', 'a').replace('ô', 'o').replace('û', 'u')
    lowered = re.sub(r'\s+', ' ', lowered)
    return lowered


def _program_from_alias(program_major: str, lang: str) -> Optional[str]:
    key = _normalize_lookup_key(program_major)
    if not key:
        return None
    entry = _PROGRAM_MAJOR_ALIASES.get(key)
    if entry:
        return entry.get(lang) or entry.get('fr') or program_major
    for alias_key, translations in _PROGRAM_MAJOR_ALIASES.items():
        if alias_key in key or key in alias_key:
            return translations.get(lang) or translations.get('fr') or program_major
    return None


def resolve_program_label(context: Dict[str, Any], lang: str) -> str:
    lang = normalize_lang(lang)
    filiere_i18n = context.get('filiere_name_i18n') or {}
    filiere_name = context.get('filiere_name') or ''
    sector_i18n = context.get('academic_sector_i18n') or {}
    sector_name = context.get('academic_sector') or ''
    program_major = context.get('program_major') or ''

    if filiere_i18n:
        label = localized_label(filiere_i18n, filiere_name, lang)
        if label:
            return label

    for source in (filiere_name, program_major):
        alias = _program_from_alias(source, lang)
        if alias:
            return alias

    if filiere_name:
        return filiere_name
    if program_major:
        return program_major

    if sector_i18n:
        return localized_label(sector_i18n, sector_name, lang)
    if sector_name:
        return sector_name

    return msg(lang, 'label_program_fallback')


_GENERIC_INTERNSHIP_EN = frozenset({'internship', 'internships', 'internship type'})


def resolve_internship_label(context: Dict[str, Any], lang: str) -> str:
    lang = normalize_lang(lang)
    raw = (context.get('internship_type') or '').strip()
    i18n = context.get('internship_type_i18n')
    if raw or i18n:
        label = localized_label(i18n, raw, lang)
        if label and label.lower() in _GENERIC_INTERNSHIP_EN and lang != 'en':
            return msg(lang, 'label_internship_default')
        if label:
            return label
    return msg(lang, 'label_internship_default')


def resolve_domain_label(context: Dict[str, Any], lang: str) -> str:
    lang = normalize_lang(lang)
    entries: List[Dict[str, Any]] = list(context.get('specialization_domain_entries') or [])
    if entries:
        first = entries[0]
        return localized_label(first.get('name_i18n'), first.get('name', ''), lang)

    sector_i18n = context.get('academic_sector_i18n')
    sector_name = context.get('academic_sector') or ''
    if sector_i18n or sector_name:
        return localized_label(sector_i18n, sector_name, lang)

    return resolve_program_label(context, lang)


def resolve_career_display_labels(context: Dict[str, Any], lang: str) -> Dict[str, str]:
    return {
        'program': resolve_program_label(context, lang),
        'internship': resolve_internship_label(context, lang),
        'domain': resolve_domain_label(context, lang),
    }


def localize_tool_examples(tools: List[str], lang: str) -> str:
    """Keep universal tool names; translate generic labels only."""
    lang = normalize_lang(lang)
    tool_i18n: Dict[str, Dict[str, str]] = {
        'project management': {
            'fr': 'gestion de projet',
            'en': 'project management',
            'ar': 'إدارة المشاريع',
        },
        'financial modeling': {
            'fr': 'modélisation financière',
            'en': 'financial modeling',
            'ar': 'النمذجة المالية',
        },
        'market research': {
            'fr': 'étude de marché',
            'en': 'market research',
            'ar': 'دراسة السوق',
        },
    }
    parts: List[str] = []
    for tool in tools:
        key = tool.lower().strip()
        entry = tool_i18n.get(key)
        if entry:
            parts.append(entry.get(lang) or entry.get('en') or tool)
        else:
            parts.append(tool)
    return ', '.join(parts)
