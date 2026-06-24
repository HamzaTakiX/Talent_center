"""Automatic language detection for FR / EN / AR / mixed CVs."""

from __future__ import annotations

import re
from collections import Counter

ARABIC_RE = re.compile(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+')
FRENCH_MARKERS = {
    'le', 'la', 'les', 'de', 'des', 'du', 'et', 'en', 'un', 'une',
    'expérience', 'formation', 'compétences', 'stage', 'étudiant', 'profil',
    'entreprise', 'projet', 'langues', 'diplôme', 'université',
}
ENGLISH_MARKERS = {
    'the', 'and', 'of', 'in', 'to', 'for', 'with', 'experience', 'education',
    'skills', 'internship', 'student', 'profile', 'company', 'project',
    'university', 'degree', 'summary',
}


def detect_languages(text: str) -> list[str]:
    """Return ordered list of detected language codes: fr, en, ar."""
    if not (text or '').strip():
        return ['fr']

    scores: Counter[str] = Counter()
    arabic_chars = len(ARABIC_RE.findall(text))
    if arabic_chars > 5:
        scores['ar'] += arabic_chars

    tokens = re.findall(r'[\wÀ-ÿ]+', text.lower())
    for token in tokens:
        if token in FRENCH_MARKERS:
            scores['fr'] += 2
        if token in ENGLISH_MARKERS:
            scores['en'] += 2

    if not scores:
        return ['fr']

    ordered = [lang for lang, _ in scores.most_common()]
    if len(ordered) == 1:
        return ordered
    return ordered[:3]


def primary_language(text: str) -> str:
    langs = detect_languages(text)
    return langs[0] if langs else 'fr'


def is_mixed(text: str) -> bool:
    return len(detect_languages(text)) > 1
