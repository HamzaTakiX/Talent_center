"""Contextual conversation lifecycle."""

from __future__ import annotations

from typing import Any, Optional

from django.db import transaction
from django.db.models import Prefetch, Q
from django.utils import timezone

from apps.accounts_et_roles.models import User

from ..models import (
    Channel,
    Conversation,
    ConversationContext,
    ConversationParticipant,
    Message,
)
from .audit_hooks import record_chat_action
from .realtime import publish_conversation_updated, publish_message_created


def get_or_create_contextual_conversation(
    *,
    module: str,
    entity_type: str,
    entity_id: str,
    title: str,
    context_kind: str = ConversationContext.ContextKind.WORKFLOW_THREAD,
    entity_label: str = '',
    workflow_status: str = '',
    urgency: str = ConversationContext.Urgency.NONE,
    student_user: User | None = None,
    is_internal_only: bool = False,
    context_snapshot: Optional[dict[str, Any]] = None,
    participant_users: list[User],
    created_by: User | None = None,
    channel_code: str | None = None,
) -> Conversation:
    existing = (
        Conversation.objects.filter(
            context__module=module,
            context__entity_type=entity_type,
            context__entity_id=str(entity_id),
        )
        .select_related('context')
        .order_by('-last_message_at', '-updated_at', '-id')
        .first()
    )
    if existing:
        return existing

    channel = None
    if channel_code:
        channel = Channel.objects.filter(code=channel_code, is_archived=False).first()

    with transaction.atomic():
        conv = Conversation.objects.create(
            channel=channel,
            title=title,
            conversation_type=Conversation.ConversationType.THREAD
            if context_kind != ConversationContext.ContextKind.DIRECT
            else Conversation.ConversationType.DIRECT,
            created_by=created_by,
            metadata_json={'module': module},
        )
        ConversationContext.objects.create(
            conversation=conv,
            module=module,
            context_kind=context_kind,
            entity_type=entity_type,
            entity_id=str(entity_id),
            entity_label=entity_label,
            workflow_status=workflow_status,
            urgency=urgency,
            student_user=student_user,
            is_internal_only=is_internal_only,
            context_snapshot_json=context_snapshot or {},
        )
        seen = set()
        for user in participant_users:
            if not user or user.pk in seen:
                continue
            seen.add(user.pk)
            ConversationParticipant.objects.create(
                conversation=conv,
                user=user,
                role=ConversationParticipant.Role.OWNER
                if created_by and user.pk == created_by.pk
                else ConversationParticipant.Role.MEMBER,
            )
    return conv


STUDENT_CHAT_MESSAGE_TYPES = (
    Message.MessageType.TEXT,
    Message.MessageType.FILE,
    Message.MessageType.IMAGE,
)


def filter_offer_threads_with_student_messages(qs):
    """Offer inbox threads only after the student asks or sends a message."""
    return qs.filter(
        messages__deleted_at__isnull=True,
        messages__message_type__in=STUDENT_CHAT_MESSAGE_TYPES,
        messages__sender__role=User.RoleChoices.STUDENT,
    ).distinct()


def should_filter_offer_threads_by_student_messages(user: User, *, module: str) -> bool:
    if module != ConversationContext.Module.OFFERS:
        return False
    return user.role in (User.RoleChoices.ADMIN, User.RoleChoices.STUDENT) or user.is_superuser


def apply_platform_admin_inbox_visibility_filters(qs, *, entity_type: str | None = None):
    """
    Admin platform inbox: student/encadrant desk threads only appear after the first message.
    admin_desk threads are unchanged.
    """
    desk_types = ('student_desk', 'student_admin_dm', 'encadrant_desk')

    if entity_type in desk_types:
        return qs.filter(last_message_at__isnull=False)
    if entity_type == 'admin_desk':
        return qs
    if entity_type is None:
        return qs.filter(
            Q(context__entity_type='admin_desk')
            | Q(last_message_at__isnull=False, context__entity_type__in=desk_types)
        )
    return qs


def list_module_conversations(
    user: User,
    *,
    module: str,
    context_kind: str | None = None,
    entity_type: str | None = None,
    urgency: str | None = None,
    unread_only: bool = False,
    search: str = '',
    include_archived: bool = False,
) -> list[Conversation]:
    from ..permissions import conversations_for_user

    qs = conversations_for_user(user, include_archived=include_archived).filter(context__module=module)
    if (
        not include_archived
        and module == ConversationContext.Module.OFFERS
        and user.role == User.RoleChoices.ADMIN
    ):
        qs = qs.exclude(metadata_json__contains={'admin_inbox_archived': True})
    if (
        not include_archived
        and module == ConversationContext.Module.PLATFORM
        and user.role == User.RoleChoices.ADMIN
    ):
        qs = qs.exclude(metadata_json__contains={'admin_inbox_archived': True})
    if (
        not include_archived
        and module == ConversationContext.Module.ENCADRANT
        and user.role
        in (User.RoleChoices.ADMIN, User.RoleChoices.SUPERVISOR)
    ):
        qs = qs.exclude(metadata_json__contains={'admin_inbox_archived': True})
    if (
        module == ConversationContext.Module.ENCADRANT
        and user.role == User.RoleChoices.SUPERVISOR
        and (not entity_type or entity_type == 'supervision_dm')
    ):
        from apps.encadrant.services.chat_service import sync_supervision_dms_for_encadrant

        sync_supervision_dms_for_encadrant(user)
    if (
        not include_archived
        and module in (ConversationContext.Module.DOCUMENTS, ConversationContext.Module.SRF)
        and user.role == User.RoleChoices.ADMIN
    ):
        qs = qs.exclude(metadata_json__contains={'admin_inbox_archived': True})
    # SRF admin threads are created on demand (student/admin open chat or first message),
    # not by syncing every financial account on each inbox list request.
    if (
        module == ConversationContext.Module.SRF
        and user.role == User.RoleChoices.ADMIN
    ):
        qs = qs.filter(last_message_at__isnull=False)
        qs = qs.filter(context__entity_type='financial_support')
    # Offer threads are created when a student opens chat, but should only appear in
    # inbox lists once the student has actually asked or commented.
    if should_filter_offer_threads_by_student_messages(user, module=module):
        qs = filter_offer_threads_with_student_messages(qs)
    # Student↔admin platform desk threads are created on demand (open chat / first message),
    # not by syncing every active student on each inbox list request.
    if (
        module == ConversationContext.Module.PLATFORM
        and entity_type in ('student_desk', 'student_admin_dm')
        and user.role == User.RoleChoices.STUDENT
    ):
        from .platform_chat_service import sync_student_admin_dms_for_student

        sync_student_admin_dms_for_student(user)
    # Platform desk threads (student / encadrant) are created on demand when admin or
    # student opens chat — never bulk-synced on inbox list load.
    if module == ConversationContext.Module.PLATFORM and user.role == User.RoleChoices.ADMIN:
        qs = apply_platform_admin_inbox_visibility_filters(qs, entity_type=entity_type)
    if (
        module == ConversationContext.Module.PLATFORM
        and entity_type == 'admin_desk'
        and user.role == User.RoleChoices.ADMIN
    ):
        from .platform_chat_service import sync_admin_desk_conversations_for_admin

        sync_admin_desk_conversations_for_admin(user)
    if context_kind:
        qs = qs.filter(context__context_kind=context_kind)
    if entity_type:
        qs = qs.filter(context__entity_type=entity_type)
    if urgency:
        qs = qs.filter(context__urgency=urgency)
    if search.strip():
        q = search.strip()
        qs = qs.filter(
            Q(title__icontains=q)
            | Q(context__entity_label__icontains=q)
            | Q(messages__body__icontains=q)
        ).distinct()
    latest_message_prefetch = Prefetch(
        'messages',
        queryset=Message.objects.filter(
            deleted_at__isnull=True,
            message_type__in=[
                Message.MessageType.TEXT,
                Message.MessageType.FILE,
                Message.MessageType.IMAGE,
            ],
        ).order_by('-created_at')[:1],
        to_attr='_latest_messages',
    )
    qs = qs.prefetch_related(
        'participants__user__profile',
        latest_message_prefetch,
    )
    convs = list(qs.order_by('-last_message_at', '-updated_at')[:200])
    if not unread_only:
        return convs
    from .message_service import batch_unread_counts_for_user

    unread_map = batch_unread_counts_for_user(user, [conv.pk for conv in convs])
    return [conv for conv in convs if unread_map.get(conv.pk, 0) > 0]


def apply_smart_action(
    *,
    conversation: Conversation,
    action_code: str,
    actor: User,
    payload: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    from ..constants import SMART_ACTION_CODES

    if action_code not in SMART_ACTION_CODES:
        raise ValueError(f'Unknown action: {action_code}')

    from ..permissions import user_can_apply_smart_action

    if not user_can_apply_smart_action(actor, conversation, action_code):
        raise ValueError('You do not have permission to perform this action.')

    ctx = getattr(conversation, 'context', None)
    meta = payload or {}

    if action_code == 'mark_urgent' and ctx:
        ctx.urgency = ConversationContext.Urgency.CRITICAL
        ctx.workflow_state = ConversationContext.WorkflowState.ESCALATED
        ctx.save(update_fields=['urgency', 'workflow_state', 'updated_at'])

    if action_code == 'escalate' and ctx:
        ctx.urgency = ConversationContext.Urgency.CRITICAL
        ctx.workflow_state = ConversationContext.WorkflowState.ESCALATED
        ctx.save(update_fields=['urgency', 'workflow_state', 'updated_at'])

    if action_code == 'set_priority' and ctx:
        priority = (meta.get('priority') or 'NORMAL').upper()
        if priority in ConversationContext.Urgency.values:
            ctx.urgency = priority
            ctx.save(update_fields=['urgency', 'updated_at'])

    if action_code == 'assign_admin' and ctx:
        assignee_id = meta.get('assignee_user_id') or meta.get('user_id')
        if assignee_id:
            assignee = User.objects.filter(pk=int(assignee_id)).first()
            if assignee:
                ctx.assigned_to = assignee
                ctx.workflow_state = ConversationContext.WorkflowState.ASSIGNED
                ctx.save(update_fields=['assigned_to', 'workflow_state', 'updated_at'])
                ConversationParticipant.objects.update_or_create(
                    conversation=conversation,
                    user=assignee,
                    defaults={'role': ConversationParticipant.Role.ADMIN},
                )
                if ctx.module == ConversationContext.Module.OFFERS:
                    from apps.stage.services import chat_service as offer_chat

                    offer_chat.assign_offer_conversation(conversation, assignee, actor)

    if action_code == 'add_internal_note':
        note = (meta.get('note') or meta.get('body') or '').strip()
        if note:
            Message.objects.create(
                conversation=conversation,
                sender=actor,
                body=note,
                message_type=Message.MessageType.TEXT,
                metadata_json={'is_internal_note': True},
            )
            conversation.last_message_at = timezone.now()
            conversation.save(update_fields=['last_message_at', 'updated_at'])

    if ctx and ctx.module == ConversationContext.Module.OFFERS:
        from apps.stage.services import chat_service as offer_chat

        if action_code == 'mark_resolved':
            ctx.workflow_state = ConversationContext.WorkflowState.RESOLVED
            ctx.save(update_fields=['workflow_state', 'updated_at'])
            offer_chat.resolve_offer_conversation(conversation, actor, meta.get('note', ''))
        elif action_code == 'archive_conversation':
            if actor.role == User.RoleChoices.STUDENT:
                offer_chat.archive_student_offer_conversation(conversation, actor)
            else:
                offer_chat.archive_offer_conversation(conversation, actor)
        elif action_code == 'unarchive_conversation':
            if actor.role == User.RoleChoices.STUDENT:
                offer_chat.unarchive_student_offer_conversation(conversation, actor)
            else:
                offer_chat.unarchive_offer_conversation(conversation, actor)

    if ctx and ctx.module == ConversationContext.Module.ANNOUNCEMENTS:
        from apps.announcements.services import chat_service as announcement_chat

        if action_code == 'mark_resolved':
            announcement_chat.resolve_announcement_conversation(
                conversation, actor, meta.get('note', ''),
            )
        elif action_code == 'archive_conversation':
            if actor.role == User.RoleChoices.STUDENT:
                announcement_chat.archive_student_announcement_conversation(conversation, actor)
            else:
                announcement_chat.archive_announcement_conversation(conversation, actor)
        elif action_code == 'unarchive_conversation':
            if actor.role == User.RoleChoices.STUDENT:
                announcement_chat.unarchive_student_announcement_conversation(conversation, actor)
            else:
                announcement_chat.unarchive_announcement_conversation(conversation, actor)

    if ctx and ctx.module == ConversationContext.Module.PLATFORM:
        from .platform_chat_service import (
            archive_platform_desk_conversation,
            archive_student_platform_desk_conversation,
            resolve_platform_desk_conversation,
            unarchive_platform_desk_conversation,
            unarchive_student_platform_desk_conversation,
        )

        if action_code == 'mark_resolved':
            resolve_platform_desk_conversation(conversation, actor, meta.get('note', ''))
        elif action_code == 'archive_conversation':
            if actor.role == User.RoleChoices.STUDENT:
                archive_student_platform_desk_conversation(conversation, actor)
            else:
                archive_platform_desk_conversation(conversation, actor)
        elif action_code == 'unarchive_conversation':
            if actor.role == User.RoleChoices.STUDENT:
                unarchive_student_platform_desk_conversation(conversation, actor)
            else:
                unarchive_platform_desk_conversation(conversation, actor)

    if ctx and ctx.module == ConversationContext.Module.DOCUMENTS:
        from apps.documents.services import chat_service as document_chat

        if action_code == 'mark_resolved':
            document_chat.resolve_document_conversation(conversation, actor, meta.get('note', ''))
        elif action_code == 'archive_conversation':
            if actor.role == User.RoleChoices.STUDENT:
                document_chat.archive_student_document_conversation(conversation, actor)
            else:
                document_chat.archive_document_conversation(conversation, actor)
        elif action_code == 'unarchive_conversation':
            if actor.role == User.RoleChoices.STUDENT:
                document_chat.unarchive_student_document_conversation(conversation, actor)
            else:
                document_chat.unarchive_document_conversation(conversation, actor)

    if ctx and ctx.module == ConversationContext.Module.SRF:
        from apps.srf.services import chat_service as srf_chat

        if action_code == 'mark_resolved':
            srf_chat.resolve_srf_conversation(conversation, actor, meta.get('note', ''))
        elif action_code == 'archive_conversation':
            if actor.role == User.RoleChoices.STUDENT:
                srf_chat.archive_student_srf_conversation(conversation, actor)
            else:
                srf_chat.archive_srf_conversation(conversation, actor)
        elif action_code == 'unarchive_conversation':
            if actor.role == User.RoleChoices.STUDENT:
                srf_chat.unarchive_student_srf_conversation(conversation, actor)
            else:
                srf_chat.unarchive_srf_conversation(conversation, actor)

    # Supervision DM (student ↔ encadrant): staff-side archive only (never student).
    if ctx and ctx.module == ConversationContext.Module.ENCADRANT:
        from .platform_chat_service import (
            archive_platform_desk_conversation,
            unarchive_platform_desk_conversation,
        )

        if action_code == 'archive_conversation':
            archive_platform_desk_conversation(conversation, actor)
        elif action_code == 'unarchive_conversation':
            unarchive_platform_desk_conversation(conversation, actor)

    record_chat_action(
        action_code=action_code,
        summary=f'Smart action {action_code} on conversation {conversation.pk}',
        actor=actor,
        conversation=conversation,
        metadata=meta,
    )

    event_msg = Message.objects.create(
        conversation=conversation,
        sender=actor,
        body=f'[Action: {action_code}]',
        message_type=Message.MessageType.EVENT,
        metadata_json={'smart_action': action_code, **meta},
    )
    conversation.last_message_at = timezone.now()
    conversation.save(update_fields=['last_message_at', 'updated_at'])

    publish_message_created(
        conversation.pk,
        {
            'message_id': event_msg.pk,
            'sender_id': actor.pk,
            'body': f'[Action: {action_code}]',
            'message_type': 'EVENT',
        },
    )

    publish_conversation_updated(conversation.pk, {'action_code': action_code})

    if action_code == 'mark_resolved':
        _emit_conversation_resolved_notification(conversation, actor)

    return {'action_code': action_code, 'conversation_id': conversation.pk, 'status': 'applied'}


def _emit_conversation_resolved_notification(conversation: Conversation, actor: User) -> None:
    conv_id = conversation.pk
    actor_id = actor.pk

    def _emit() -> None:
        try:
            from apps.notifications.events.publisher import emit_event

            from .message_service import _action_url_for_conversation

            ctx = getattr(conversation, 'context', None)
            recipient = None
            if ctx and ctx.student_user_id and ctx.student_user_id != actor_id:
                recipient = User.objects.filter(pk=ctx.student_user_id).first()

            emit_event(
                event_code='chat.conversation.resolved',
                source_app='chat',
                entity_type='conversation',
                entity_id=conv_id,
                payload={
                    'conversation_id': conv_id,
                    'title': 'Conversation résolue',
                    'body': (
                        'Votre demande a été marquée comme résolue. '
                        "Vous pouvez toujours répondre à cette conversation si vous avez besoin "
                        "d'une assistance supplémentaire."
                    ),
                    'action_url': _action_url_for_conversation(conversation, recipient) if recipient else '',
                },
                actor=actor,
            )
        except Exception:
            pass

    transaction.on_commit(_emit)
