"""Dashboard metrics for contextual chat modules."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from django.utils import timezone

from apps.accounts_et_roles.models import User
from apps.chat.models import Conversation, ConversationContext, Message
from apps.chat.permissions import conversations_for_user
from apps.chat.services.conversation_service import (
    apply_platform_admin_inbox_visibility_filters,
    filter_offer_threads_with_student_messages,
    should_filter_offer_threads_by_student_messages,
)
from apps.chat.services.message_service import unread_count_for_user


def _waiting_states(last_sender_role: str | None, workflow_state: str) -> tuple[bool, bool]:
    if workflow_state == ConversationContext.WorkflowState.RESOLVED:
        return False, False
    if workflow_state == ConversationContext.WorkflowState.WAITING_STUDENT:
        return False, True
    if workflow_state == ConversationContext.WorkflowState.WAITING_ADMIN:
        return True, False
    if workflow_state == ConversationContext.WorkflowState.ESCALATED:
        return True, False
    if not last_sender_role:
        return workflow_state == ConversationContext.WorkflowState.NEW, False
    if last_sender_role == User.RoleChoices.STUDENT:
        return True, False
    if last_sender_role == User.RoleChoices.ADMIN:
        return False, True
    return False, False


def _last_message_sender_role(conversation: Conversation) -> str | None:
    msg = (
        Message.objects.filter(conversation=conversation, deleted_at__isnull=True)
        .select_related('sender')
        .order_by('-created_at')
        .first()
    )
    if not msg or not msg.sender:
        return None
    return msg.sender.role


def compute_module_metrics(
    user: User,
    *,
    module: str,
    entity_type: str | None = None,
) -> dict[str, Any]:
    qs = (
        conversations_for_user(user)
        .filter(context__module=module, is_archived=False)
        .select_related('context')
    )
    if (
        module == ConversationContext.Module.PLATFORM
        and user.role == User.RoleChoices.ADMIN
    ):
        qs = qs.exclude(metadata_json__contains={'admin_inbox_archived': True})
        qs = apply_platform_admin_inbox_visibility_filters(qs, entity_type=entity_type)
    if entity_type:
        qs = qs.filter(context__entity_type=entity_type)
    if should_filter_offer_threads_by_student_messages(user, module=module):
        qs = filter_offer_threads_with_student_messages(qs)
    if (
        module == ConversationContext.Module.SRF
        and user.role == User.RoleChoices.ADMIN
    ):
        qs = qs.exclude(metadata_json__contains={'admin_inbox_archived': True})
        qs = qs.filter(context__entity_type='financial_support')
        qs = qs.filter(last_message_at__isnull=False)
    convs = list(qs.order_by('-last_message_at')[:500])

    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    open_count = len(convs)
    waiting_admin = 0
    waiting_student = 0
    resolved_today = 0
    unread_total = 0
    response_deltas: list[float] = []
    resolution_deltas: list[float] = []

    offer_activity: dict[str, int] = {}
    company_activity: dict[str, int] = {}
    student_activity: dict[str, int] = {}

    for conv in convs:
        ctx = getattr(conv, 'context', None)
        unread_total += unread_count_for_user(user, conv.pk)
        sender_role = _last_message_sender_role(conv)
        workflow_state = ctx.workflow_state if ctx else ''
        is_waiting_admin, is_waiting_student = _waiting_states(sender_role, workflow_state)
        if is_waiting_admin:
            waiting_admin += 1
        if is_waiting_student:
            waiting_student += 1

        if ctx and ctx.workflow_state == ConversationContext.WorkflowState.RESOLVED:
            resolved_at = conv.updated_at
            if resolved_at and resolved_at >= today_start:
                resolved_today += 1
            if conv.created_at and resolved_at:
                resolution_deltas.append((resolved_at - conv.created_at).total_seconds())

        msgs = list(
            Message.objects.filter(conversation=conv, deleted_at__isnull=True, sender__isnull=False)
            .select_related('sender')
            .order_by('created_at')[:200]
        )
        prev: Message | None = None
        for msg in msgs:
            if prev and prev.sender_id != msg.sender_id:
                delta = (msg.created_at - prev.created_at).total_seconds()
                if prev.sender and prev.sender.role == User.RoleChoices.STUDENT:
                    response_deltas.append(delta)
            prev = msg

        snap = (ctx.context_snapshot_json if ctx else {}) or {}
        offer_title = str(snap.get('offer_title') or conv.title)
        company = str(snap.get('company_name') or '')
        student_name = str(snap.get('student_name') or '')
        msg_count = Message.objects.filter(conversation=conv, deleted_at__isnull=True).count()
        if offer_title:
            offer_activity[offer_title] = offer_activity.get(offer_title, 0) + msg_count
        if company:
            company_activity[company] = company_activity.get(company, 0) + msg_count
        if student_name:
            student_activity[student_name] = student_activity.get(student_name, 0) + msg_count

    avg_response_seconds = sum(response_deltas) / len(response_deltas) if response_deltas else 0
    avg_resolution_seconds = sum(resolution_deltas) / len(resolution_deltas) if resolution_deltas else 0

    def top_n(data: dict[str, int], n: int = 5) -> list[dict[str, Any]]:
        return [{'label': k, 'count': v} for k, v in sorted(data.items(), key=lambda x: -x[1])[:n]]

    return {
        'open_conversations': open_count,
        'waiting_admin': waiting_admin,
        'waiting_student': waiting_student,
        'average_response_time_seconds': round(avg_response_seconds, 1),
        'average_resolution_time_seconds': round(avg_resolution_seconds, 1),
        'resolved_today': resolved_today,
        'unread_messages': unread_total,
        'most_active_offers': top_n(offer_activity),
        'most_active_companies': top_n(company_activity),
        'top_students_by_activity': top_n(student_activity),
    }
