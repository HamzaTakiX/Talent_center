"""Cross-module inbox unread summary for chat navigation badges."""

from __future__ import annotations

from apps.accounts_et_roles.models import User

from ..models import ConversationContext
from ..permissions import conversations_for_user
from .conversation_service import (
    apply_platform_admin_inbox_visibility_filters,
    filter_offer_threads_with_student_messages,
    should_filter_offer_threads_by_student_messages,
)
from .message_service import batch_unread_counts_for_user
from .platform_chat_service import (
    ADMIN_DESK_ENTITY,
    ENCADRANT_DESK_ENTITY,
    STUDENT_ADMIN_DM,
)

PLATFORM_SCOPED_ENTITY_TYPES = (
    STUDENT_ADMIN_DM,
    ENCADRANT_DESK_ENTITY,
    ADMIN_DESK_ENTITY,
)


def _module_conversation_ids(
    user: User,
    module: str,
    *,
    entity_type: str | None = None,
) -> list[int]:
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
        qs = apply_platform_admin_inbox_visibility_filters(qs, entity_type=entity_type)
    if should_filter_offer_threads_by_student_messages(user, module=module):
        qs = filter_offer_threads_with_student_messages(qs)
    if entity_type:
        qs = qs.filter(context__entity_type=entity_type)
    return list(qs.order_by('-last_message_at', '-updated_at').values_list('pk', flat=True)[:200])


def _summarize_conv_ids(conv_ids: list[int], unread_map: dict[int, int]) -> dict:
    total_unread = sum(unread_map.get(conv_id, 0) for conv_id in conv_ids)
    return {
        'conversation_count': len(conv_ids),
        'unread': total_unread,
    }


def build_inbox_summary(user: User) -> dict:
    """
    Build per-module and platform entity-scoped unread totals for nav badges.
    """
    modules = [choice[0] for choice in ConversationContext.Module.choices]
    module_conv_ids: dict[str, list[int]] = {}
    scoped_conv_ids: dict[str, list[int]] = {}
    all_conv_ids: list[int] = []

    for module in modules:
        conv_ids = _module_conversation_ids(user, module)
        module_conv_ids[module] = conv_ids
        all_conv_ids.extend(conv_ids)

    for entity_type in PLATFORM_SCOPED_ENTITY_TYPES:
        conv_ids = _module_conversation_ids(
            user,
            ConversationContext.Module.PLATFORM,
            entity_type=entity_type,
        )
        scoped_conv_ids[entity_type] = conv_ids
        all_conv_ids.extend(conv_ids)

    unread_map = batch_unread_counts_for_user(user, list(set(all_conv_ids)))

    summary: list[dict] = []
    for module in modules:
        conv_ids = module_conv_ids[module]
        totals = _summarize_conv_ids(conv_ids, unread_map)
        if conv_ids or totals['unread']:
            summary.append({
                'module': module,
                **totals,
            })

    scopes: list[dict] = []
    for entity_type in PLATFORM_SCOPED_ENTITY_TYPES:
        conv_ids = scoped_conv_ids[entity_type]
        totals = _summarize_conv_ids(conv_ids, unread_map)
        if conv_ids or totals['unread']:
            scopes.append({
                'module': ConversationContext.Module.PLATFORM,
                'entity_type': entity_type,
                **totals,
            })

    return {'modules': summary, 'scopes': scopes}
