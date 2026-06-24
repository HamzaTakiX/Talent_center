"""Lightweight message intent — skip slow LLM for casual chat."""

from __future__ import annotations

import re

from django.conf import settings

from apps.career_coach.services.language_detector import detect_language_hint

_OFFER_CONTEXT_BLOCK = re.compile(r'\[OFFER_CONTEXT\][\s\S]*?\[/OFFER_CONTEXT\]\s*', re.IGNORECASE)

_CAREER_KEYWORDS = re.compile(
    r'\b('
    r'cv|résumé|resume|stage|internship|offre|offer|entretien|interview|ats|'
    r'compétence|competence|skill|skills|candidature|application|lettre|cover|'
    r'carrière|career|objectif|goal|roadmap|strategy|stratégie|match|score|'
    r'analyse|analysis|améliorer|improve|rewrite|réécrire|conseil|advice|'
    r'profil|profile|emploi|job|recrutement|hiring'
    r')\b',
    re.IGNORECASE,
)

_DEEP_ANALYSIS_KEYWORDS = re.compile(
    r'\b('
    r'analyse|analysis|analyser|analyze|évaluer|evaluate|détaill|detailed|'
    r'rewrite|réécrire|roadmap|stratégie|strategy|pourquoi|why|explain|'
    r'compare|comparer|review|revoir|améliorer|improve|plan|'
    r'points?\s+forts|weaknesses?|faiblesses?|strengths?'
    r')\b',
    re.IGNORECASE,
)

_CASUAL_EXACT = {
    'hi',
    'hello',
    'hey',
    'heya',
    'heelo',
    'helo',
    'hola',
    'yo',
    'salut',
    'bonjour',
    'bonsoir',
    'coucou',
    'cc',
    'thanks',
    'thank you',
    'thx',
    'merci',
    'ok',
    'okay',
    'oui',
    'yes',
    'no',
    'non',
    'salam',
    'marhaba',
    'howdy',
    "what's up",
    'whats up',
    'sup',
    'good morning',
    'good afternoon',
    'good evening',
    'good night',
    'bonne nuit',
    'bonne journee',
    'bonne journée',
    'ca va',
    'ça va',
    'comment ca va',
    'comment ça va',
    'how are you',
    'nice to meet you',
    'pleased to meet you',
    'bye',
    'goodbye',
    'see you',
    'au revoir',
    'a bientot',
    'à bientôt',
}

_CASUAL_REPLIES = {
    'french': (
        "Salut ! Je suis votre coach carrière. "
        "Posez-moi une question sur votre CV, vos offres de stage ou votre stratégie."
    ),
    'english': (
        "Hi! I'm your career coach. "
        "Ask me about your CV, internship offers, or your career strategy."
    ),
    'arabic': (
        "مرحباً! أنا مدربك المهني. "
        "اسألني عن سيرتك الذاتية أو عروض التدريب أو استراتيجيتك المهنية."
    ),
    'darija': (
        "Salam! Ana coach dyalek. "
        "Sawalni 3la CV dyalek, les offres de stage, wla stratégie dyalek."
    ),
    'auto': (
        "Hi! I'm your career coach. "
        "Ask me about your CV, internship offers, or your career strategy."
    ),
}


def normalize_user_message(message: str) -> str:
    """Strip offer grounding blocks before intent classification."""
    return _OFFER_CONTEXT_BLOCK.sub('', message or '').strip()


def is_casual_message(message: str) -> bool:
    text = normalize_user_message(message)
    if not text or _CAREER_KEYWORDS.search(text):
        return False

    normalized = re.sub(r'[\s!?.؟،]+$', '', text.lower()).strip()
    if normalized in _CASUAL_EXACT:
        return True

    words = normalized.split()
    if len(words) <= 3 and len(normalized) <= 28:
        joined = ' '.join(words)
        if joined in _CASUAL_EXACT:
            return True

    return False


def needs_context_retrieval(message: str, mode: str | None = None) -> bool:
    """True when the message requires CV/offers/RAG context (not casual chat)."""
    text = normalize_user_message(message)
    if not text or is_casual_message(text):
        return False
    return is_career_relevant_message(text, mode)


def is_career_relevant_message(message: str, mode: str | None = None) -> bool:
    text = normalize_user_message(message)
    if not text or is_casual_message(text):
        return False
    if _CAREER_KEYWORDS.search(text):
        return True
    if mode in {'cv-reviewer', 'ats-expert', 'interview-mentor', 'internship-advisor'}:
        return len(text) >= 12
    return False


def is_deep_analysis_message(message: str) -> bool:
    text = normalize_user_message(message)
    return bool(text and _DEEP_ANALYSIS_KEYWORDS.search(text))


def estimate_num_predict(message: str, mode: str | None = None, *, has_context: bool = False) -> int:
    """Token budget tuned to message depth — keeps Ollama responses fast."""
    ceiling = getattr(settings, 'CAREER_COACH_NUM_PREDICT', 220)
    if not has_context:
        return min(ceiling, 90)
    if is_deep_analysis_message(message) or mode in {'cv-reviewer', 'ats-expert'}:
        return min(ceiling, 180)
    return min(ceiling, 130)


def build_casual_reply(message: str) -> str:
    lang = detect_language_hint(message)
    return _CASUAL_REPLIES.get(lang, _CASUAL_REPLIES['auto'])
