"""Main career coach orchestrator — RAG + context + AI + memory."""

from __future__ import annotations

import logging
import threading
import uuid
from collections.abc import Iterator
from typing import Any

from django.contrib.auth import get_user_model
from django.conf import settings

from apps.accounts_et_roles.models import StudentProfile
from apps.career_coach.models import AiConversation
from apps.career_coach.services.ai.base import ChatMessage
from apps.career_coach.services.ai.factory import get_ai_provider
from apps.career_coach.services.context_builder import build_student_context
from apps.career_coach.services.context_cache import get_index_hash, is_context_indexed, mark_context_indexed
from apps.career_coach.services.context_summaries import get_or_build_summaries, summaries_to_prompt_text
from apps.career_coach.services.conversation_memory import (
    get_cached_memory_summary,
    get_recent_history,
    invalidate_memory_summary,
)
from apps.career_coach.services.language_detector import detect_language_hint
from apps.career_coach.services.message_intent import (
    build_casual_reply,
    estimate_num_predict,
    is_casual_message,
    needs_context_retrieval,
    normalize_user_message,
)
from apps.career_coach.services.notification_service import maybe_emit_insight_notifications
from apps.career_coach.services.perf_metrics import PerfTracker
from apps.career_coach.services.prompts import build_minimal_system_prompt, build_system_prompt
from apps.career_coach.services.rag.indexer import index_student_context
from apps.career_coach.services.rag.retriever import retrieve_context
from apps.career_coach.services.session_service import (
    ensure_session,
    list_sessions,
    maybe_set_session_title_from_message,
    touch_session,
)
from apps.career_coach.services.summary_service import invalidate_session_summary
from apps.career_coach.services.text_sanitizer import sanitize_assistant_text

logger = logging.getLogger(__name__)
User = get_user_model()

MAX_HISTORY = getattr(settings, 'CAREER_COACH_MAX_HISTORY', 8)


def get_student(user) -> StudentProfile | None:
    profile = getattr(user, 'student_profile', None)
    if profile is None:
        profile = StudentProfile.objects.filter(user=user).first()
    return profile


def _schedule_rag_index(student_id: int, context: dict[str, Any]) -> None:
    """Index context in a background thread — never blocks chat."""
    ctx_hash = get_index_hash(context)
    if is_context_indexed(student_id, ctx_hash):
        return

    def _run() -> None:
        try:
            index_student_context(student_id, context)
            mark_context_indexed(student_id, ctx_hash)
        except Exception as exc:
            logger.warning('Async RAG indexing failed for student %s: %s', student_id, exc)

    threading.Thread(target=_run, daemon=True).start()


def _schedule_notifications(user, context: dict[str, Any], response_text: str) -> None:
    threading.Thread(
        target=maybe_emit_insight_notifications,
        args=(user, context, response_text),
        daemon=True,
    ).start()


def warmup_student_context(user) -> dict[str, Any] | None:
    """Build student context and schedule RAG indexing (non-blocking)."""
    student = get_student(user)
    if not student:
        return None
    context = build_student_context(student)
    get_or_build_summaries(student.pk, context)
    _schedule_rag_index(student.pk, context)
    return context


def get_conversation_history(user, session_id: uuid.UUID, limit: int = MAX_HISTORY) -> list[AiConversation]:
    return get_recent_history(user, session_id, limit=limit)


def _build_chat_messages(
    history: list[AiConversation],
    user_message: str,
    *,
    memory_summary: str = '',
) -> list[ChatMessage]:
    messages: list[ChatMessage] = []
    if memory_summary:
        messages.append(
            ChatMessage(
                role='system',
                content=f'CONVERSATION SUMMARY (older messages):\n{memory_summary}',
            ),
        )
    for msg in history:
        if msg.role in (AiConversation.Role.USER, AiConversation.Role.ASSISTANT):
            if msg.role == AiConversation.Role.USER and msg.message == user_message:
                continue
            messages.append(ChatMessage(role=msg.role, content=msg.message))
    messages.append(ChatMessage(role='user', content=user_message))
    return messages


def _prepare_response_context(
    student: StudentProfile,
    message: str,
    mode: str,
    offer_uuid: str | None,
    perf: PerfTracker,
) -> tuple[dict[str, Any], list[str], str, bool]:
    """Load context, RAG chunks, and system prompt based on message intent."""
    use_context = needs_context_retrieval(message, mode)

    if not use_context:
        with perf.track('prompt_construction'):
            lang_hint = detect_language_hint(message)
            return {}, [], build_minimal_system_prompt(mode, language_hint=lang_hint), False

    with perf.track('context_retrieval'):
        context = build_student_context(student, offer_uuid=offer_uuid)
        summaries = get_or_build_summaries(student.pk, context)
        context_text = summaries_to_prompt_text(summaries)

    _schedule_rag_index(student.pk, context)

    retrieved: list[str] = []
    with perf.track('vector_search'):
        ctx_hash = get_index_hash(context)
        if is_context_indexed(student.pk, ctx_hash):
            retrieved = retrieve_context(student.pk, message)

    with perf.track('prompt_construction'):
        lang_hint = detect_language_hint(message)
        system_prompt = build_system_prompt(mode, context_text, retrieved, language_hint=lang_hint)

    return context, retrieved, system_prompt, True


def _generate_assistant_text(
    *,
    context: dict[str, Any],
    message: str,
    mode: str,
    system_prompt: str,
    chat_messages: list[ChatMessage],
    perf: PerfTracker,
    has_context: bool,
) -> tuple[str, str]:
    provider = get_ai_provider()
    num_predict = estimate_num_predict(message, mode, has_context=has_context)

    with perf.track('ai_generation'):
        try:
            response = provider.chat(
                chat_messages,
                system_prompt=system_prompt,
                num_predict=num_predict,
            )
            return sanitize_assistant_text(response.content), response.model
        except Exception as exc:
            logger.warning('Chat generation failed, using fallback: %s', exc)
            return _fallback_response(context, message, mode), 'rule-based'


def _generate_assistant_stream(
    *,
    context: dict[str, Any],
    message: str,
    mode: str,
    system_prompt: str,
    chat_messages: list[ChatMessage],
    perf: PerfTracker,
    has_context: bool,
) -> tuple[Iterator[str], str]:
    """Return token iterator and model label."""
    provider = get_ai_provider()
    num_predict = estimate_num_predict(message, mode, has_context=has_context)

    def _stream() -> Iterator[str]:
        with perf.track('ai_generation'):
            try:
                yield from provider.chat_stream(
                    chat_messages,
                    system_prompt=system_prompt,
                    num_predict=num_predict,
                )
            except Exception as exc:
                logger.exception('Stream failed: %s', exc)
                yield _fallback_response(context, message, mode)

    return _stream(), 'ollama'


def chat(
    user,
    *,
    message: str,
    session_id: uuid.UUID | None = None,
    mode: str = 'career-coach',
    offer_uuid: str | None = None,
) -> dict[str, Any]:
    perf = PerfTracker('chat')
    student = get_student(user)
    if not student:
        raise PermissionError('Student profile required.')

    with perf.track('session_ensure'):
        sid = session_id or uuid.uuid4()
        ensure_session(user, sid, mode=mode)

    intent_message = normalize_user_message(message)
    lang_hint = detect_language_hint(intent_message)
    casual = is_casual_message(intent_message)
    retrieved: list[str] = []
    context: dict[str, Any] = {}
    assistant_text = ''
    model_used = 'casual'

    if casual:
        assistant_text = build_casual_reply(intent_message)
    else:
        context, retrieved, system_prompt, has_context = _prepare_response_context(
            student, intent_message, mode, offer_uuid, perf,
        )
        with perf.track('memory_load'):
            memory_summary = get_cached_memory_summary(user, sid)
            history = get_conversation_history(user, sid)
            chat_messages = _build_chat_messages(history, message, memory_summary=memory_summary)

        assistant_text, model_used = _generate_assistant_text(
            context=context,
            message=intent_message,
            mode=mode,
            system_prompt=system_prompt,
            chat_messages=chat_messages,
            perf=perf,
            has_context=has_context,
        )

    with perf.track('response_delivery'):
        user_msg = AiConversation.objects.create(
            user=user,
            session_id=sid,
            role=AiConversation.Role.USER,
            message=message,
            mode=mode,
            metadata={'language_hint': lang_hint, 'offer_uuid': offer_uuid},
        )
        assistant_msg = AiConversation.objects.create(
            user=user,
            session_id=sid,
            role=AiConversation.Role.ASSISTANT,
            message=assistant_text,
            mode=mode,
            metadata={'model': model_used, 'rag_chunks': len(retrieved), 'perf': perf.as_dict()},
        )

        _schedule_notifications(user, context or {}, assistant_text)
        maybe_set_session_title_from_message(user, sid, message)
        touch_session(user, sid, mode=mode)
        invalidate_session_summary(user, sid)
        invalidate_memory_summary(sid)

    return {
        'session_id': str(sid),
        'user_message_id': user_msg.pk,
        'assistant_message_id': assistant_msg.pk,
        'response': assistant_text,
        'model': model_used,
        'language_hint': lang_hint,
        'rag_chunks_used': len(retrieved),
        'perf': perf.as_dict(),
    }


def chat_stream(
    user,
    *,
    message: str,
    session_id: uuid.UUID | None = None,
    mode: str = 'career-coach',
    offer_uuid: str | None = None,
) -> Iterator[dict[str, Any]]:
    """Yield SSE events: {type: token|done|error, ...}."""
    perf = PerfTracker('chat_stream')
    student = get_student(user)
    if not student:
        yield {'type': 'error', 'message': 'Student profile required.'}
        return

    with perf.track('session_ensure'):
        sid = session_id or uuid.uuid4()
        ensure_session(user, sid, mode=mode)

    intent_message = normalize_user_message(message)
    lang_hint = detect_language_hint(intent_message)
    casual = is_casual_message(intent_message)
    retrieved: list[str] = []
    context: dict[str, Any] = {}
    system_prompt = ''

    AiConversation.objects.create(
        user=user,
        session_id=sid,
        role=AiConversation.Role.USER,
        message=message,
        mode=mode,
        metadata={'language_hint': lang_hint, 'offer_uuid': offer_uuid},
    )

    yield {'type': 'session', 'session_id': str(sid)}

    full_text = ''
    model_used = 'casual'

    if casual:
        full_text = build_casual_reply(intent_message)
        yield {'type': 'token', 'content': full_text}
    else:
        context, retrieved, system_prompt, has_context = _prepare_response_context(
            student, intent_message, mode, offer_uuid, perf,
        )
        with perf.track('memory_load'):
            memory_summary = get_cached_memory_summary(user, sid)
            history = get_conversation_history(user, sid)
            chat_messages = _build_chat_messages(history, message, memory_summary=memory_summary)

        token_iter, model_used = _generate_assistant_stream(
            context=context,
            message=intent_message,
            mode=mode,
            system_prompt=system_prompt,
            chat_messages=chat_messages,
            perf=perf,
            has_context=has_context,
        )
        for token in token_iter:
            full_text += token
            yield {'type': 'token', 'content': token}

    full_text = sanitize_assistant_text(full_text)

    with perf.track('response_delivery'):
        assistant_msg = AiConversation.objects.create(
            user=user,
            session_id=sid,
            role=AiConversation.Role.ASSISTANT,
            message=full_text,
            mode=mode,
            metadata={'streaming': True, 'rag_chunks': len(retrieved), 'model': model_used, 'perf': perf.as_dict()},
        )

        _schedule_notifications(user, context or {}, full_text)
        maybe_set_session_title_from_message(user, sid, message)
        touch_session(user, sid, mode=mode)
        invalidate_session_summary(user, sid)
        invalidate_memory_summary(sid)

    yield {
        'type': 'done',
        'assistant_message_id': assistant_msg.pk,
        'response': full_text,
        'language_hint': lang_hint,
        'perf': perf.as_dict(),
    }


def _fallback_response(context: dict, message: str, mode: str) -> str:
    """Rule-based fallback when Ollama is unavailable — uses real data only."""
    cv = context.get('cv') or {}
    profile = context.get('profile') or {}
    offers = context.get('offers') or []
    current = context.get('current_offer')

    lines = [
        "⚠️ L'assistant IA n'est pas disponible pour le moment (Ollama hors ligne). "
        "Voici ce que je peux vous dire à partir de vos données réelles :\n",
    ]

    if cv.get('cv_score') is not None:
        lines.append(f"- Score CV : {int(cv['cv_score'])}/100")
    if cv.get('ats_score') is not None:
        lines.append(f"- Score ATS : {int(cv['ats_score'])}%")

    if cv.get('strengths'):
        lines.append(f"- Points forts : {', '.join(str(s) for s in cv['strengths'][:3])}")
    if cv.get('weaknesses'):
        lines.append(f"- À améliorer : {', '.join(str(w) for w in cv['weaknesses'][:3])}")

    if current:
        lines.append(
            f"- Offre actuelle : {current.get('title')} ({current.get('company')}) — "
            f"match {current.get('match_score')}%"
        )
    elif offers:
        top = offers[0]
        lines.append(
            f"- Meilleure offre : {top.get('title')} ({top.get('company')}) — "
            f"match {int(top.get('match_score', 0))}%"
        )

    if profile.get('skills'):
        lines.append(f"- Compétences : {', '.join(profile['skills'][:8])}")

    lines.append(
        "\nPour des réponses personnalisées, démarrez Ollama avec le modèle qwen3:8b "
        "et rechargez la page."
    )
    return '\n'.join(lines)
