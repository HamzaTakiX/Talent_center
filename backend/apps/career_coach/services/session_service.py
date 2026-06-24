"""AI Career Coach session metadata — list, create, rename, archive, delete."""

from __future__ import annotations

import uuid
from typing import Any

from django.core.cache import cache
from django.db import transaction
from django.db.models import Count, Max
from django.utils import timezone

from apps.career_coach.models import AiCoachSession, AiConversation

SESSION_MODES = {
    'career-coach',
    'cv-reviewer',
    'ats-expert',
    'interview-mentor',
    'internship-advisor',
}


def _derive_title(text: str, *, max_len: int = 48) -> str:
    trimmed = (text or '').strip()
    if not trimmed:
        return ''
    return trimmed if len(trimmed) <= max_len else f'{trimmed[:max_len]}…'


def _sync_cache_key(user_id: int) -> str:
    return f'career_coach:synced:{user_id}'


def sync_sessions_from_messages(user) -> None:
    """Create session rows for legacy message-only conversations."""
    if cache.get(_sync_cache_key(user.pk)):
        return

    message_sessions = (
        AiConversation.objects.filter(user=user)
        .values('session_id')
        .annotate(last_message=Max('created_at'), message_count=Count('id'))
    )
    existing_ids = set(
        AiCoachSession.objects.filter(user=user).values_list('session_id', flat=True),
    )
    missing_ids = [row['session_id'] for row in message_sessions if row['session_id'] not in existing_ids]
    if not missing_ids:
        cache.set(_sync_cache_key(user.pk), True, 300)
        return

    last_by_session: dict[uuid.UUID, AiConversation] = {}
    for message in (
        AiConversation.objects.filter(user=user, session_id__in=missing_ids)
        .order_by('session_id', '-created_at')
        .distinct('session_id')
        .only('session_id', 'mode', 'created_at')
    ):
        last_by_session[message.session_id] = message

    to_create: list[AiCoachSession] = []
    rows_by_id = {row['session_id']: row for row in message_sessions}
    for sid in missing_ids:
        row = rows_by_id.get(sid) or {}
        last = last_by_session.get(sid)
        to_create.append(
            AiCoachSession(
                user=user,
                session_id=sid,
                mode=last.mode if last and last.mode else 'career-coach',
                title='',
                updated_at=row.get('last_message') or timezone.now(),
            ),
        )
    if to_create:
        AiCoachSession.objects.bulk_create(to_create)
    cache.set(_sync_cache_key(user.pk), True, 300)


def get_session(user, session_id: uuid.UUID) -> AiCoachSession | None:
    return AiCoachSession.objects.filter(user=user, session_id=session_id).first()


def ensure_session(
    user,
    session_id: uuid.UUID,
    *,
    mode: str = 'career-coach',
    title: str = '',
) -> AiCoachSession:
    session, created = AiCoachSession.objects.get_or_create(
        user=user,
        session_id=session_id,
        defaults={'mode': mode, 'title': title},
    )
    if not created:
        changed = False
        if mode and session.mode != mode:
            session.mode = mode
            changed = True
        if title and not session.title:
            session.title = title
            changed = True
        if changed:
            session.save(update_fields=['mode', 'title', 'updated_at'])
    return session


def touch_session(user, session_id: uuid.UUID, *, mode: str | None = None) -> None:
    session = ensure_session(user, session_id, mode=mode or 'career-coach')
    session.updated_at = timezone.now()
    update_fields = ['updated_at']
    if mode and session.mode != mode:
        session.mode = mode
        update_fields.append('mode')
    session.save(update_fields=update_fields)


def maybe_set_session_title_from_message(user, session_id: uuid.UUID, message: str) -> None:
    session = get_session(user, session_id)
    if session is None:
        ensure_session(user, session_id, title=_derive_title(message))
        return
    if not session.title:
        title = _derive_title(message)
        if title:
            session.title = title
            session.save(update_fields=['title', 'updated_at'])


def serialize_session(user, session: AiCoachSession) -> dict[str, Any]:
    last = (
        AiConversation.objects.filter(user=user, session_id=session.session_id)
        .order_by('-created_at')
        .first()
    )
    message_count = AiConversation.objects.filter(user=user, session_id=session.session_id).count()
    preview = ''
    if last:
        preview = last.message[:120] + '…' if len(last.message) > 120 else last.message
    elif session.title:
        preview = session.title

    return {
        'session_id': str(session.session_id),
        'title': session.title,
        'mode': session.mode,
        'is_archived': session.is_archived,
        'created_at': session.created_at.isoformat(),
        'updated_at': session.updated_at.isoformat(),
        'last_message_at': last.created_at.isoformat() if last else session.updated_at.isoformat(),
        'message_count': message_count,
        'preview': preview,
        'last_role': last.role if last else None,
    }


def list_sessions(user, *, archived: bool | None = False, limit: int = 50) -> list[dict[str, Any]]:
    sync_sessions_from_messages(user)
    qs = AiCoachSession.objects.filter(user=user)
    if archived is True:
        qs = qs.filter(is_archived=True)
    elif archived is False:
        qs = qs.filter(is_archived=False)
    sessions = list(qs.order_by('-updated_at')[:limit])
    if not sessions:
        return []

    session_ids = [session.session_id for session in sessions]

    counts: dict[uuid.UUID, int] = {
        row['session_id']: row['c']
        for row in AiConversation.objects.filter(user=user, session_id__in=session_ids)
        .values('session_id')
        .annotate(c=Count('id'))
    }

    last_messages: dict[uuid.UUID, AiConversation] = {
        message.session_id: message
        for message in (
            AiConversation.objects.filter(user=user, session_id__in=session_ids)
            .order_by('session_id', '-created_at')
            .distinct('session_id')
            .only('session_id', 'message', 'role', 'created_at')
        )
    }

    results: list[dict[str, Any]] = []
    for session in sessions:
        last = last_messages.get(session.session_id)
        preview = ''
        if last:
            preview = last.message[:120] + '…' if len(last.message) > 120 else last.message
        elif session.title:
            preview = session.title

        results.append({
            'session_id': str(session.session_id),
            'title': session.title,
            'mode': session.mode,
            'is_archived': session.is_archived,
            'created_at': session.created_at.isoformat(),
            'updated_at': session.updated_at.isoformat(),
            'last_message_at': last.created_at.isoformat() if last else session.updated_at.isoformat(),
            'message_count': counts.get(session.session_id, 0),
            'preview': preview,
            'last_role': last.role if last else None,
        })
    return results


def create_session(user, *, mode: str = 'career-coach', title: str = '') -> dict[str, Any]:
    if mode not in SESSION_MODES:
        mode = 'career-coach'
    session = AiCoachSession.objects.create(
        user=user,
        session_id=uuid.uuid4(),
        mode=mode,
        title=title.strip(),
    )
    return {
        'session_id': str(session.session_id),
        'title': session.title,
        'mode': session.mode,
        'is_archived': session.is_archived,
        'created_at': session.created_at.isoformat(),
        'updated_at': session.updated_at.isoformat(),
        'last_message_at': session.updated_at.isoformat(),
        'message_count': 0,
        'preview': '',
        'last_role': None,
    }


def update_session(
    user,
    session_id: uuid.UUID,
    *,
    title: str | None = None,
    mode: str | None = None,
    is_archived: bool | None = None,
) -> dict[str, Any] | None:
    session = get_session(user, session_id)
    if session is None:
        sync_sessions_from_messages(user)
        session = get_session(user, session_id)
    if session is None:
        return None

    update_fields: list[str] = []
    if title is not None:
        session.title = title.strip()
        update_fields.append('title')
    if mode is not None and mode in SESSION_MODES:
        session.mode = mode
        update_fields.append('mode')
    if is_archived is not None:
        session.is_archived = is_archived
        update_fields.append('is_archived')

    if not update_fields:
        return serialize_session(user, session)

    session.updated_at = timezone.now()
    update_fields.append('updated_at')
    session.save(update_fields=update_fields)
    return serialize_session(user, session)


@transaction.atomic
def delete_session(user, session_id: uuid.UUID) -> bool:
    deleted_messages, _ = AiConversation.objects.filter(user=user, session_id=session_id).delete()
    deleted_sessions, _ = AiCoachSession.objects.filter(user=user, session_id=session_id).delete()
    cache.delete(_sync_cache_key(user.pk))
    return deleted_messages > 0 or deleted_sessions > 0
