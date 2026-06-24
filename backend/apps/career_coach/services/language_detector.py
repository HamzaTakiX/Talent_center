"""Lightweight language detection for coaching responses."""

from __future__ import annotations

import re

_DARIJA_MARKERS = re.compile(
    r'\b(شنو|واش|بزاف|دابا|غادي|كيفاش|علاش|فين|بغيت|عندي|ماشي|دير|خاصك|واش|بصح|زوين|صافي)\b',
    re.IGNORECASE,
)
_ARABIC = re.compile(r'[\u0600-\u06FF]')
_FRENCH_MARKERS = re.compile(
    r'\b(je|tu|mon|ma|mes|le|la|les|un|une|des|est|sont|pour|avec|comment|pourquoi|stage|cv)\b',
    re.IGNORECASE,
)


def detect_language_hint(text: str) -> str:
    """Return a hint for logging — the LLM handles actual response language."""
    if not text or not text.strip():
        return 'auto'
    if _DARIJA_MARKERS.search(text):
        return 'darija'
    arabic_chars = len(_ARABIC.findall(text))
    if arabic_chars > len(text) * 0.15:
        return 'arabic'
    if _FRENCH_MARKERS.search(text):
        return 'french'
    return 'english'
