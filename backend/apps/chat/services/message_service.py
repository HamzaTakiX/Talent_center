"""Message send, read state, reactions."""

from __future__ import annotations

from typing import Any, Optional

from django.db import transaction
from django.utils import timezone

from apps.accounts_et_roles.models import User

from ..models import ConversationParticipant, Mention, Message, MessageReaction, MessageTag, Tag
from ..permissions import user_can_access_conversation
from .audit_hooks import record_message_sent
from .realtime import publish_message_created, publish_read_receipt


def list_messages(
    user: User,
    conversation_id: int,
    *,
    limit: int = 100,
    before_id: int | None = None,
) -> list[Message]:
    from ..models import Conversation

    conv = Conversation.objects.select_related('context').filter(pk=conversation_id).first()
    if not conv or not user_can_access_conversation(user, conv):
        return []
    qs = (
        Message.objects.filter(conversation=conv, deleted_at__isnull=True)
        .select_related('sender')
        .prefetch_related('attachments', 'message_tags__tag', 'reactions', 'mentions')
        .order_by('-created_at')
    )
    if before_id:
        qs = qs.filter(pk__lt=before_id)
    return list(qs[:limit])[::-1]


@transaction.atomic
def send_message(
    *,
    user: User,
    conversation_id: int,
    body: str,
    message_type: str = 'TEXT',
    parent_message_id: int | None = None,
    tag_codes: Optional[list[str]] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> Message | None:
    from ..models import Conversation

    conv = Conversation.objects.select_related('context').filter(pk=conversation_id).first()
    if not conv or not user_can_access_conversation(user, conv):
        return None

    msg = Message.objects.create(
        conversation=conv,
        sender=user,
        body=body.strip(),
        message_type=message_type,
        parent_message_id=parent_message_id,
        metadata_json=metadata or {},
    )

    if tag_codes:
        tags = Tag.objects.filter(code__in=tag_codes)
        for tag in tags:
            MessageTag.objects.get_or_create(message=msg, tag=tag, defaults={'tagged_by': user})

    conv.last_message_at = timezone.now()
    conv.save(update_fields=['last_message_at', 'updated_at'])

    ctx = getattr(conv, 'context', None)
    record_message_sent(
        message=msg,
        actor=user,
        module=ctx.module if ctx else 'chat',
        entity_type=ctx.entity_type if ctx else 'conversation',
        entity_id=ctx.entity_id if ctx else conv.pk,
    )

    publish_message_created(conv.pk, {'message_id': msg.pk, 'sender_id': user.pk})

    try:
        from apps.notifications.events.publisher import emit_event

        event_code = 'chat.urgent' if (metadata or {}).get('urgent') else 'chat.message.received'
        emit_event(
            event_code=event_code,
            source_app='chat',
            entity_type='conversation',
            entity_id=conv.pk,
            payload={
                'conversation_id': conv.pk,
                'sender_user_id': user.pk,
                'title': conv.title or 'New message',
                'body': body.strip()[:200],
                'action_url': f'/chat/conversations/{conv.pk}',
            },
            actor=user,
        )
    except Exception:
        pass

    return msg


def mark_read(user: User, conversation_id: int, message_id: int) -> bool:
    from ..models import Conversation
    from ..permissions import ensure_conversation_participant, user_can_access_conversation

    conv = Conversation.objects.filter(pk=conversation_id).select_related('context').first()
    if not conv or not user_can_access_conversation(user, conv):
        return False

    part = ConversationParticipant.objects.filter(
        conversation_id=conversation_id,
        user=user,
        left_at__isnull=True,
    ).first()
    if not part:
        part = ensure_conversation_participant(conv, user)
    part.last_read_message_id = message_id
    part.save(update_fields=['last_read_message_id', 'updated_at'])
    publish_read_receipt(conversation_id, user.pk, message_id)
    return True


def toggle_reaction(user: User, message_id: int, emoji_code: str) -> dict[str, Any]:
    msg = Message.objects.select_related('conversation').filter(pk=message_id).first()
    if not msg or not user_can_access_conversation(user, msg.conversation):
        return {'ok': False}
    existing = MessageReaction.objects.filter(message=msg, user=user, emoji_code=emoji_code).first()
    if existing:
        existing.delete()
        return {'ok': True, 'added': False}
    MessageReaction.objects.create(message=msg, user=user, emoji_code=emoji_code)
    return {'ok': True, 'added': True}


def unread_count_for_user(user: User, conversation_id: int) -> int:
    from ..models import Conversation
    from ..permissions import ensure_conversation_participant, user_can_access_conversation

    conv = Conversation.objects.filter(pk=conversation_id).select_related('context').first()
    if not conv or not user_can_access_conversation(user, conv):
        return 0

    part = ConversationParticipant.objects.filter(
        conversation_id=conversation_id,
        user=user,
        left_at__isnull=True,
    ).first()
    if not part:
        part = ensure_conversation_participant(conv, user)
    last_read = part.last_read_message_id or 0
    return Message.objects.filter(
        conversation_id=conversation_id,
        deleted_at__isnull=True,
        pk__gt=last_read,
    ).exclude(sender=user).count()
