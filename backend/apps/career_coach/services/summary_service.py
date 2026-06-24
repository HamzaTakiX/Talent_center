"""Build and cache important Q&A summaries for coaching sessions."""

from __future__ import annotations

import re
import uuid
from typing import Any

from django.utils import timezone

from apps.career_coach.models import AiCoachSession, AiConversation
from apps.career_coach.services.message_intent import is_career_relevant_message
from apps.career_coach.services.session_service import get_session

_CATEGORY_PATTERNS: dict[str, re.Pattern[str]] = {
    'cv': re.compile(
        r'\b(cv|résumé|resume|ats|rewrite|réécrire|experience|expérience|summary|profil|profile)\b',
        re.IGNORECASE,
    ),
    'internship': re.compile(
        r'\b(stage|internship|offre|offer|candidature|application|emploi|job)\b',
        re.IGNORECASE,
    ),
    'interview': re.compile(
        r'\b(entretien|interview|behavioral|mock|technical|prépar|prepar)\b',
        re.IGNORECASE,
    ),
    'career': re.compile(
        r'\b(carrière|career|strategy|stratégie|roadmap|objectif|goal|conseil|advice)\b',
        re.IGNORECASE,
    ),
    'skills': re.compile(
        r'\b(compétence|competence|skill|skills|missing|améliorer|improve)\b',
        re.IGNORECASE,
    ),
}

_MODE_DEFAULT_CATEGORY = {
    'career-coach': 'career',
    'cv-reviewer': 'cv',
    'ats-expert': 'cv',
    'interview-mentor': 'interview',
    'internship-advisor': 'internship',
}


def _categorize_message(text: str, mode: str) -> str:
    for category, pattern in _CATEGORY_PATTERNS.items():
        if pattern.search(text):
            return category
    return _MODE_DEFAULT_CATEGORY.get(mode, 'career')


def _sanitize_report_text(text: str) -> str:
    if not text:
        return ''
    cleaned = text
    cleaned = re.sub(r'\*\*(.+?)\*\*', r'\1', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'\*(.+?)\*', r'\1', cleaned)
    cleaned = re.sub(r'__(.+?)__', r'\1', cleaned)
    cleaned = cleaned.replace('**', '').replace('__', '')
    cleaned = re.sub(r'^#+\s*', '', cleaned, flags=re.MULTILINE)
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in cleaned.splitlines()]
    cleaned = '\n'.join(line for line in lines if line)
    return re.sub(r'\n{3,}', '\n\n', cleaned.strip())


def _format_answer(text: str, *, max_len: int = 2000) -> str:
    cleaned = _sanitize_report_text(text)
    if not cleaned:
        return ''
    if len(cleaned) <= max_len:
        return cleaned
    cut = cleaned[:max_len]
    if '\n' in cut:
        cut = cut.rsplit('\n', 1)[0]
    elif ' ' in cut:
        cut = cut.rsplit(' ', 1)[0]
    return f'{cut}…'


def _extract_highlights(messages: list[AiConversation]) -> list[dict[str, Any]]:
    highlights: list[dict[str, Any]] = []
    pending_user: AiConversation | None = None

    for message in messages:
        if message.role == AiConversation.Role.USER:
            if is_career_relevant_message(message.message, message.mode):
                pending_user = message
            else:
                pending_user = None
            continue

        if message.role != AiConversation.Role.ASSISTANT or pending_user is None:
            continue

        question = _sanitize_report_text(pending_user.message.strip())
        answer = _format_answer(message.message.strip())
        if not question or not answer:
            pending_user = None
            continue

        highlights.append(
            {
                'category': _categorize_message(question, pending_user.mode or message.mode),
                'question': question,
                'answer_preview': answer,
                'created_at': pending_user.created_at.isoformat(),
            },
        )
        pending_user = None

    return highlights


def _build_key_topics(highlights: list[dict[str, Any]]) -> list[str]:
    order = ['cv', 'internship', 'interview', 'career', 'skills']
    seen: set[str] = set()
    topics: list[str] = []
    for category in order:
        if any(item['category'] == category for item in highlights):
            seen.add(category)
            topics.append(category)
    for item in highlights:
        category = item['category']
        if category not in seen:
            seen.add(category)
            topics.append(category)
    return topics


def invalidate_session_summary(user, session_id: uuid.UUID) -> None:
    AiCoachSession.objects.filter(user=user, session_id=session_id).update(
        chat_summary={},
        chat_summary_message_count=0,
    )


def build_session_summary(
    user,
    session_id: uuid.UUID,
    *,
    force_refresh: bool = False,
) -> dict[str, Any] | None:
    session = get_session(user, session_id)
    if session is None:
        return None

    messages = list(
        AiConversation.objects.filter(
            user=user,
            session_id=session_id,
            role__in=(AiConversation.Role.USER, AiConversation.Role.ASSISTANT),
        ).order_by('created_at'),
    )
    message_count = len(messages)

    if (
        not force_refresh
        and session.chat_summary
        and session.chat_summary_message_count == message_count
    ):
        return session.chat_summary

    highlights = _extract_highlights(messages)
    key_topics = _build_key_topics(highlights)

    payload: dict[str, Any] = {
        'session_id': str(session_id),
        'overview': '',
        'key_topics': key_topics,
        'highlights': highlights,
        'total_messages': message_count,
        'important_count': len(highlights),
        'generated_at': timezone.now().isoformat(),
        'has_important_content': bool(highlights),
    }

    session.chat_summary = payload
    session.chat_summary_message_count = message_count
    session.save(update_fields=['chat_summary', 'chat_summary_message_count', 'updated_at'])
    return payload
