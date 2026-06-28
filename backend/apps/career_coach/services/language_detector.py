"""Lightweight language detection for coaching responses."""

from __future__ import annotations

import re

_DARIJA_MARKERS = re.compile(
    r'\b(شنو|واش|بزاف|دابا|غادي|كيفاش|علاش|فين|بغيت|عندي|ماشي|دير|خاصك|واش|بصح|زوين|صافي)\b',
    re.IGNORECASE,
)
_ARABIC = re.compile(r'[\u0600-\u06FF]')
_FRENCH_MARKERS = re.compile(
    r'\b(je|tu|vous|mon|ma|mes|ton|ta|le|la|les|un|une|des|est|sont|pour|avec|comment|pourquoi|'
    r'quel|quelle|quels|quelles|améliorer|améliore|profil|bonjour|salut|merci|stage)\b',
    re.IGNORECASE,
)
_ENGLISH_MARKERS = re.compile(
    r"\b(i|my|me|you|your|the|how|what|why|when|where|can|could|should|would|improve|help|"
    r"please|thanks|hello|hi|hey|profile|advice|recommend)\b",
    re.IGNORECASE,
)
_FRENCH_ACCENTS = re.compile(r'[àâäæçéèêëîïôùûüœ]', re.IGNORECASE)


def detect_language_hint(text: str) -> str:
    """Detect the user's message language for response matching."""
    if not text or not text.strip():
        return 'auto'
    if _DARIJA_MARKERS.search(text):
        return 'darija'
    arabic_chars = len(_ARABIC.findall(text))
    if arabic_chars > len(text) * 0.15:
        return 'arabic'
    if _FRENCH_ACCENTS.search(text):
        return 'french'

    french_hits = len(_FRENCH_MARKERS.findall(text))
    english_hits = len(_ENGLISH_MARKERS.findall(text))
    if french_hits > english_hits:
        return 'french'
    if english_hits > french_hits:
        return 'english'
    if french_hits > 0:
        return 'french'
    return 'english'


def build_language_instruction(language_hint: str) -> str:
    """Hard constraint appended to the system prompt."""
    instructions = {
        'english': (
            'RESPONSE LANGUAGE: ENGLISH ONLY.\n'
            'The user wrote in English. Reply entirely in English.\n'
            'Do not answer in French or Arabic, even if profile/CV context is in another language.'
        ),
        'french': (
            'RESPONSE LANGUAGE: FRENCH ONLY.\n'
            "The user wrote in French. Reply entirely in French.\n"
            'Do not answer in English or Arabic, even if profile/CV context is in another language.'
        ),
        'arabic': (
            'RESPONSE LANGUAGE: ARABIC ONLY.\n'
            'The user wrote in Arabic. Reply entirely in Arabic (MSA or Moroccan Arabic matching their style).\n'
            'Do not answer in French or English.'
        ),
        'darija': (
            'RESPONSE LANGUAGE: MOROCCAN DARIJA.\n'
            'The user wrote in Darija. Reply in natural Moroccan Darija.\n'
            'French/English job terms are fine when natural; do not switch to full French or English replies.'
        ),
        'auto': (
            'RESPONSE LANGUAGE: MATCH THE USER.\n'
            'Reply in the same language as the user\'s latest message.'
        ),
    }
    return instructions.get(language_hint, instructions['auto'])
