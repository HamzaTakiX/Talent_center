"""Role-based visibility for contextual chat."""

from __future__ import annotations

from django.db.models import Q, QuerySet

from apps.accounts_et_roles.models import User

from .models import Conversation, ConversationContext, ConversationParticipant


def _user_can_manage_internship_offers(user: User) -> bool:
    from apps.stage.services.permissions import user_can_manage_offers

    return user_can_manage_offers(user)


def _user_can_manage_announcements(user: User) -> bool:
    from apps.announcements.services.chat_service import _user_can_manage_announcements

    return _user_can_manage_announcements(user)


def ensure_conversation_participant(
    conversation: Conversation,
    user: User,
    *,
    role: str = ConversationParticipant.Role.MEMBER,
) -> ConversationParticipant:
    part, _ = ConversationParticipant.objects.get_or_create(
        conversation=conversation,
        user=user,
        defaults={'role': role},
    )
    if part.left_at:
        part.left_at = None
        part.save(update_fields=['left_at', 'updated_at'])
    return part


def user_can_access_conversation(user: User, conversation: Conversation) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    if user.role == User.RoleChoices.ADMIN:
        return _admin_can_access(user, conversation)
    if user.role == User.RoleChoices.SUPERVISOR:
        return _supervisor_can_access(user, conversation)
    if user.role == User.RoleChoices.STUDENT:
        return _student_can_access(user, conversation)
    if user.role == User.RoleChoices.STAFF:
        return ConversationParticipant.objects.filter(
            conversation=conversation,
            user=user,
            left_at__isnull=True,
        ).exists()
    return False


def _student_can_access(user: User, conversation: Conversation) -> bool:
    if not ConversationParticipant.objects.filter(
        conversation=conversation,
        user=user,
        left_at__isnull=True,
    ).exists():
        return False
    ctx = getattr(conversation, 'context', None)
    if ctx and ctx.is_internal_only:
        return False
    return True


def _supervisor_can_access(user: User, conversation: Conversation) -> bool:
    if not ConversationParticipant.objects.filter(
        conversation=conversation,
        user=user,
        left_at__isnull=True,
    ).exists():
        return False
    ctx = getattr(conversation, 'context', None)
    if ctx and ctx.module in (
        ConversationContext.Module.ENCADRANT,
        ConversationContext.Module.MEETINGS,
        ConversationContext.Module.PLATFORM,
    ):
        return True
    if ctx and ctx.is_internal_only:
        return False
    return True


def _admin_can_access(user: User, conversation: Conversation) -> bool:
    if ConversationParticipant.objects.filter(
        conversation=conversation,
        user=user,
        left_at__isnull=True,
    ).exists():
        return True
    ctx = getattr(conversation, 'context', None)
    if ctx and ctx.module == ConversationContext.Module.OFFERS and _user_can_manage_internship_offers(user):
        ensure_conversation_participant(
            conversation,
            user,
            role=ConversationParticipant.Role.ADMIN,
        )
        return True
    if ctx and ctx.module == ConversationContext.Module.ANNOUNCEMENTS and _user_can_manage_announcements(user):
        ensure_conversation_participant(
            conversation,
            user,
            role=ConversationParticipant.Role.ADMIN,
        )
        return True
    return False


def conversations_for_user(user: User, *, include_archived: bool = False) -> QuerySet[Conversation]:
    qs = Conversation.objects.select_related(
        'channel', 'context', 'context__student_user'
    )
    if not include_archived:
        qs = qs.filter(is_archived=False)
    if user.is_superuser:
        return qs

    base = qs.filter(
        participants__user=user,
        participants__left_at__isnull=True,
    )

    if user.role == User.RoleChoices.STUDENT:
        return base.exclude(context__is_internal_only=True).distinct()

    if user.role == User.RoleChoices.SUPERVISOR:
        return base.exclude(
            Q(context__is_internal_only=True)
            & ~Q(
                context__module__in=[
                    ConversationContext.Module.ENCADRANT,
                    ConversationContext.Module.MEETINGS,
                ]
            )
        ).distinct()

    if user.role == User.RoleChoices.ADMIN:
        module_filters: list[str] = []
        if _user_can_manage_internship_offers(user):
            module_filters.append(ConversationContext.Module.OFFERS)
        if _user_can_manage_announcements(user):
            module_filters.append(ConversationContext.Module.ANNOUNCEMENTS)
        if module_filters:
            extra = qs.filter(context__module__in=module_filters)
            return (base | extra).distinct()

    return base.distinct()


def user_can_apply_smart_action(user: User, conversation: Conversation, action_code: str) -> bool:
    """Role-aware guard for POST /conversations/{id}/actions."""
    from .constants import ADMIN_ONLY_SMART_ACTIONS, SMART_ACTION_CODES

    if action_code not in SMART_ACTION_CODES:
        return False
    if not user_can_access_conversation(user, conversation):
        return False
    if user.is_superuser:
        return True
    if user.role == User.RoleChoices.STUDENT:
        ctx = getattr(conversation, 'context', None)
        if (
            action_code in ('archive_conversation', 'unarchive_conversation')
            and ctx
            and ctx.module == ConversationContext.Module.ANNOUNCEMENTS
        ):
            return True
        return False

    ctx = getattr(conversation, 'context', None)

    if action_code in ADMIN_ONLY_SMART_ACTIONS:
        if user.role != User.RoleChoices.ADMIN:
            return False
        if ctx and ctx.module == ConversationContext.Module.OFFERS:
            return _user_can_manage_internship_offers(user)
        if ctx and ctx.module == ConversationContext.Module.ANNOUNCEMENTS:
            return _user_can_manage_announcements(user)
        return ConversationParticipant.objects.filter(
            conversation=conversation,
            user=user,
            left_at__isnull=True,
            role__in=(
                ConversationParticipant.Role.ADMIN,
                ConversationParticipant.Role.OWNER,
            ),
        ).exists()

    return ConversationParticipant.objects.filter(
        conversation=conversation,
        user=user,
        left_at__isnull=True,
    ).exists()
