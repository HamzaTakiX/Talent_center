"""Role-based visibility for contextual chat."""

from __future__ import annotations

from django.db.models import Q, QuerySet

from apps.accounts_et_roles.models import User

from .models import Conversation, ConversationContext, ConversationParticipant


def _user_can_manage_internship_offers(user: User) -> bool:
    from apps.stage.services.permissions import user_can_manage_offers

    return user_can_manage_offers(user)


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
    return False


def conversations_for_user(user: User) -> QuerySet[Conversation]:
    qs = Conversation.objects.filter(is_archived=False).select_related(
        'channel', 'context', 'context__student_user'
    )
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

    if user.role == User.RoleChoices.ADMIN and _user_can_manage_internship_offers(user):
        offer_threads = qs.filter(context__module=ConversationContext.Module.OFFERS)
        return (base | offer_threads).distinct()

    return base.distinct()
