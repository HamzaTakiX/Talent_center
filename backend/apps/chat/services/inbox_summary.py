"""Cross-module inbox unread summary for chat navigation badges."""

from __future__ import annotations

from apps.accounts_et_roles.models import User

from ..models import ConversationContext
from ..permissions import conversations_for_user
from .conversation_service import (
    filter_offer_threads_with_student_messages,
    should_filter_offer_threads_by_student_messages,
)
from .message_service import batch_unread_counts_for_user


def _module_conversation_ids(user: User, module: str) -> list[int]:
    """Mirror ChatInboxSummaryView / list_module_conversations ID selection."""
    qs = conversations_for_user(user, include_archived=False).filter(context__module=module)
    if (
        module == ConversationContext.Module.OFFERS
        and user.role == User.RoleChoices.ADMIN
    ):
        qs = qs.exclude(metadata_json__contains={'admin_inbox_archived': True})
    if (
        module == ConversationContext.Module.PLATFORM
        and user.role == User.RoleChoices.ADMIN
    ):
        qs = qs.exclude(metadata_json__contains={'admin_inbox_archived': True})
    if should_filter_offer_threads_by_student_messages(user, module=module):
        qs = filter_offer_threads_with_student_messages(qs)
    return list(qs.order_by('-last_message_at', '-updated_at').values_list('pk', flat=True)[:200])


def build_inbox_summary(user: User) -> list[dict]:
    """
    Build per-module conversation counts and unread totals.

    Output shape is identical to the legacy ChatInboxSummaryView loop.
    """
    modules = [choice[0] for choice in ConversationContext.Module.choices]
    module_conv_ids: dict[str, list[int]] = {}
    all_conv_ids: list[int] = []

    for module in modules:
        conv_ids = _module_conversation_ids(user, module)
        module_conv_ids[module] = conv_ids
        all_conv_ids.extend(conv_ids)

    unread_map = batch_unread_counts_for_user(user, all_conv_ids)

    summary: list[dict] = []
    for module in modules:
        conv_ids = module_conv_ids[module]
        total_unread = sum(unread_map.get(conv_id, 0) for conv_id in conv_ids)
        if conv_ids or total_unread:
            summary.append({
                'module': module,
                'conversation_count': len(conv_ids),
                'unread': total_unread,
            })
    return summary
