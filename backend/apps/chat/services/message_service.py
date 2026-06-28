"""Message send, read state, reactions."""

from __future__ import annotations

from typing import Any, Optional

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.accounts_et_roles.models import User

from ..models import ConversationParticipant, Mention, Message, MessageReaction, MessageRead, MessageTag, Tag
from ..permissions import user_can_access_conversation
from .audit_hooks import record_message_sent
from .realtime import (
    publish_conversation_updated,
    publish_inbox_updated,
    publish_message_created,
    publish_read_receipt,
)


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
        .prefetch_related('attachments', 'message_tags__tag', 'reactions', 'mentions', 'read_receipts')
        .order_by('-created_at')
    )
    if user.role == user.RoleChoices.STUDENT:
        # PostgreSQL: exclude(is_internal_note=True) drops rows when the key is missing (NULL).
        qs = qs.exclude(metadata_json__contains={'is_internal_note': True})
        from ..constants import STUDENT_HIDDEN_SMART_ACTIONS

        hidden_event = Q()
        for action_code in STUDENT_HIDDEN_SMART_ACTIONS:
            hidden_event |= Q(
                message_type=Message.MessageType.EVENT,
                metadata_json__smart_action=action_code,
            )
        qs = qs.exclude(hidden_event)
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
    uploaded_files: Optional[list] = None,
) -> Message | None:
    from ..models import Conversation

    conv = Conversation.objects.select_related('context').filter(pk=conversation_id).first()
    if not conv or not user_can_access_conversation(user, conv):
        return None

    files = list(uploaded_files or [])
    trimmed_body = body.strip()
    if not trimmed_body and not files:
        return None

    from .attachment_service import build_attachment_preview_body, create_message_attachments, resolve_message_type_for_attachments

    resolved_type = message_type
    if files:
        resolved_type = resolve_message_type_for_attachments(files, trimmed_body)
    if not trimmed_body and files:
        trimmed_body = build_attachment_preview_body(files[0].name if hasattr(files[0], 'name') else 'file')

    msg = Message.objects.create(
        conversation=conv,
        sender=user,
        body=trimmed_body,
        message_type=resolved_type,
        parent_message_id=parent_message_id,
        metadata_json=metadata or {},
    )

    if files:
        create_message_attachments(msg, files)

    if tag_codes:
        tags = Tag.objects.filter(code__in=tag_codes)
        for tag in tags:
            MessageTag.objects.get_or_create(message=msg, tag=tag, defaults={'tagged_by': user})

    conv.last_message_at = timezone.now()
    conv.save(update_fields=['last_message_at', 'updated_at'])

    ctx = getattr(conv, 'context', None)
    if ctx:
        _sync_workflow_state_after_message(conv, ctx, user)

    ctx = getattr(conv, 'context', None)
    record_message_sent(
        message=msg,
        actor=user,
        module=ctx.module if ctx else 'chat',
        entity_type=ctx.entity_type if ctx else 'conversation',
        entity_id=ctx.entity_id if ctx else conv.pk,
    )

    conv_id = conv.pk
    sender_id = user.pk
    preview = trimmed_body[:200]

    def _publish_realtime() -> None:
        publish_message_created(
            conv_id,
            {'message_id': msg.pk, 'sender_id': sender_id, 'body': preview},
        )

    transaction.on_commit(_publish_realtime)

    def _emit_notification() -> None:
        try:
            from apps.notifications.events.publisher import emit_event

            is_internal = bool((metadata or {}).get('is_internal_note'))
            if not is_internal:
                event_code = 'chat.urgent' if (metadata or {}).get('urgent') else 'chat.message.received'
                emit_event(
                    event_code=event_code,
                    source_app='chat',
                    entity_type='conversation',
                    entity_id=conv_id,
                    payload={
                        'conversation_id': conv_id,
                        'sender_user_id': sender_id,
                        'title': conv.title or 'New message',
                        'body': preview,
                        'action_url': _action_url_for_conversation(conv, user),
                    },
                    actor=user,
                )
        except Exception:
            pass

    transaction.on_commit(_emit_notification)

    _notify_offer_participants(conv, user, trimmed_body, metadata)

    return msg


def _notify_offer_participants(conv, sender, body: str, metadata: dict | None) -> None:
    if (metadata or {}).get('is_internal_note'):
        return
    ctx = getattr(conv, 'context', None)
    if not ctx or ctx.module != 'offers' or not ctx.student_user_id:
        return
    if sender.pk == ctx.student_user_id:
        return
    try:
        from apps.accounts_et_roles.models import StudentProfile
        from apps.stage.models import InternshipOffer
        from apps.stage.services.chat_service import offer_uuid_from_context
        from apps.stage.services.notifications import notify_conversation_reply

        student = StudentProfile.objects.select_related('user').filter(user_id=ctx.student_user_id).first()
        offer_uuid = offer_uuid_from_context(ctx)
        if not student or not offer_uuid:
            return
        offer = InternshipOffer.objects.filter(uuid=offer_uuid).first()
        if not offer:
            return
        notify_conversation_reply(student=student, offer=offer, actor=sender, preview=body)
    except Exception:
        pass


def _action_url_for_conversation(conv, user) -> str:
    ctx = getattr(conv, 'context', None)
    if ctx and ctx.module == 'offers':
        snap = ctx.context_snapshot_json or {}
        offer_uuid = snap.get('offer_uuid')
        if user.role == user.RoleChoices.STUDENT and offer_uuid:
            return f'/student/internship-offers/chat?conversation={conv.pk}'
        if offer_uuid:
            return f'/admin/internship-offers/chat?conversation={conv.pk}'
    if ctx and ctx.module == 'srf':
        if user.role == user.RoleChoices.STUDENT:
            return f'/student/srf/chat?conversation={conv.pk}'
        return f'/admin/srf/chat?conversation={conv.pk}'
    if ctx and ctx.module == 'documents':
        if user.role == user.RoleChoices.STUDENT:
            return f'/student/documents/chat?conversation={conv.pk}'
        return f'/admin/documents/chat?conversation={conv.pk}'
    return f'/chat/conversations/{conv.pk}'


def _sync_workflow_state_after_message(conv, ctx, sender) -> None:
    from ..models import ConversationContext

    if ctx.workflow_state == ConversationContext.WorkflowState.RESOLVED:
        _reopen_resolved_conversation(conv, ctx, sender)
        return

    if ctx.workflow_state == ConversationContext.WorkflowState.ARCHIVED:
        return

    if sender.role == sender.RoleChoices.STUDENT:
        ctx.workflow_state = ConversationContext.WorkflowState.WAITING_ADMIN
    elif sender.role in (sender.RoleChoices.ADMIN,) or sender.is_superuser:
        ctx.workflow_state = ConversationContext.WorkflowState.WAITING_STUDENT
    ctx.save(update_fields=['workflow_state', 'updated_at'])


def _reopen_resolved_conversation(conv, ctx, sender) -> None:
    from ..models import ConversationContext, Message

    if sender.role == sender.RoleChoices.STUDENT:
        new_state = ConversationContext.WorkflowState.WAITING_ADMIN
    elif sender.role in (sender.RoleChoices.ADMIN,) or sender.is_superuser:
        new_state = ConversationContext.WorkflowState.WAITING_STUDENT
    else:
        new_state = ConversationContext.WorkflowState.WAITING_ADMIN

    ctx.workflow_state = new_state
    _restore_workflow_status_after_reopen(ctx)
    ctx.save(update_fields=['workflow_state', 'workflow_status', 'updated_at'])

    meta = dict(conv.metadata_json or {})
    meta.pop('resolved', None)
    meta.pop('resolved_at', None)
    meta.pop('resolved_by', None)
    meta.pop('resolution_note', None)
    conv.metadata_json = meta
    conv.save(update_fields=['metadata_json', 'updated_at'])

    event_msg = Message.objects.create(
        conversation=conv,
        sender=sender,
        body='[Action: auto_reopen]',
        message_type=Message.MessageType.EVENT,
        metadata_json={'smart_action': 'auto_reopen', 'triggered_by_user_id': sender.pk},
    )

    conv_id = conv.pk
    workflow_state = new_state

    def _publish_reopen() -> None:
        publish_conversation_updated(
            conv_id,
            {
                'reopened': True,
                'workflow_state': workflow_state,
                'action_code': 'auto_reopen',
            },
        )
        publish_message_created(
            conv_id,
            {
                'message_id': event_msg.pk,
                'sender_id': sender.pk,
                'body': event_msg.body,
                'message_type': 'EVENT',
            },
        )
        publish_inbox_updated(conv_id, {'reopened': True})

    transaction.on_commit(_publish_reopen)


def _restore_workflow_status_after_reopen(ctx) -> None:
    from ..models import ConversationContext

    if ctx.workflow_status != 'RESOLVED':
        return

    if ctx.module == ConversationContext.Module.PLATFORM:
        ctx.workflow_status = 'OPEN'
    elif ctx.module == ConversationContext.Module.OFFERS:
        snap = ctx.context_snapshot_json or {}
        ctx.workflow_status = snap.get('application_status') or 'INQUIRY'
    elif ctx.module == ConversationContext.Module.ANNOUNCEMENTS:
        ctx.workflow_status = 'OPEN'
    else:
        ctx.workflow_status = ''


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
    read_up_to = max(part.last_read_message_id or 0, message_id)
    part.last_read_message_id = read_up_to
    part.save(update_fields=['last_read_message_id', 'updated_at'])

    now = timezone.now()
    peer_message_ids = list(
        Message.objects.filter(
            conversation_id=conversation_id,
            pk__lte=read_up_to,
            deleted_at__isnull=True,
        )
        .exclude(sender_id=user.pk)
        .values_list('pk', flat=True)
    )

    if peer_message_ids:
        MessageRead.objects.bulk_create(
            [MessageRead(message_id=mid, user=user, read_at=now) for mid in peer_message_ids],
            ignore_conflicts=True,
        )
        MessageRead.objects.filter(message_id__in=peer_message_ids, user=user).update(read_at=now)

    publish_read_receipt(conversation_id, user.pk, read_up_to)
    publish_inbox_updated(conversation_id, {'reader_user_id': user.pk})
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
    counts = batch_unread_counts_for_user(user, [conversation_id])
    return counts.get(conversation_id, 0)


def batch_unread_counts_for_user(user: User, conversation_ids: list[int]) -> dict[int, int]:
    from django.db.models import Count, F, OuterRef, Q, Subquery
    from django.db.models.functions import Coalesce

    from ..models import Conversation, ConversationParticipant

    if not conversation_ids:
        return {}

    last_read_subq = ConversationParticipant.objects.filter(
        conversation_id=OuterRef('pk'),
        user=user,
        left_at__isnull=True,
    ).values('last_read_message_id')[:1]

    unread_filter = Q(
        messages__deleted_at__isnull=True,
        messages__pk__gt=F('_last_read'),
    ) & ~Q(messages__sender_id=user.pk)

    if user.role == user.RoleChoices.STUDENT:
        from ..constants import STUDENT_HIDDEN_SMART_ACTIONS

        unread_filter &= ~Q(messages__metadata_json__contains={'is_internal_note': True})
        for action_code in STUDENT_HIDDEN_SMART_ACTIONS:
            unread_filter &= ~Q(
                messages__message_type=Message.MessageType.EVENT,
                messages__metadata_json__smart_action=action_code,
            )

    rows = (
        Conversation.objects.filter(pk__in=conversation_ids)
        .annotate(
            _last_read=Coalesce(Subquery(last_read_subq), 0),
        )
        .annotate(
            _unread=Count(
                'messages',
                filter=unread_filter,
            ),
        )
        .values('pk', '_unread')
    )
    return {row['pk']: row['_unread'] for row in rows}
