"""Chat recipient resolvers."""

from __future__ import annotations

from django.contrib.auth import get_user_model

from apps.chat.models import ConversationParticipant
from apps.notifications.events.resolvers.base import ResolvedRecipient
from apps.notifications.models import NotificationEvent

User = get_user_model()


def resolve_chat_participants(event: NotificationEvent) -> list[ResolvedRecipient]:
    payload = event.payload_json or {}
    conversation_id = payload.get('conversation_id')
    exclude_user_id = payload.get('sender_user_id') or (event.triggered_by_id if event.triggered_by_id else None)

    if conversation_id:
        participants = (
            ConversationParticipant.objects
            .filter(conversation_id=conversation_id, left_at__isnull=True)
            .select_related('user')
        )
        recipients = []
        for participant in participants:
            if exclude_user_id and participant.user_id == exclude_user_id:
                continue
            recipients.append(ResolvedRecipient(participant.user, 'participant'))
        return recipients

    user_id = payload.get('recipient_user_id')
    if user_id:
        user = User.objects.filter(pk=user_id).first()
        if user:
            return [ResolvedRecipient(user, 'participant')]
    return []
