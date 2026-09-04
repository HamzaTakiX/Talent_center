"""
Calendar recipient resolver.

Recipients are read from the participant table rather than taken from the
payload, so an emitter cannot notify someone who is not on the event. The only
payload input honoured is ``recipient_user_ids``, and it is used to *narrow*
the audience (invitation to the new invitees, RSVP back to the organizer) —
never to widen it beyond the event's actual participants.
"""

from __future__ import annotations

from apps.notifications.events.resolvers.base import ResolvedRecipient
from apps.notifications.models import NotificationEvent


def resolve_agenda_participants(event: NotificationEvent) -> list[ResolvedRecipient]:
    from apps.agenda.models import CalendarEvent, EventParticipant

    calendar_event = (
        CalendarEvent.objects
        .select_related('organizer')
        .filter(pk=event.entity_id)
        .first()
    )
    if calendar_event is None:
        return []

    participants = list(
        EventParticipant.objects
        .filter(event_id=calendar_event.pk)
        .select_related('user'),
    )

    by_user = {p.user_id: p for p in participants if p.user_id}
    if calendar_event.organizer_id and calendar_event.organizer_id not in by_user:
        by_user[calendar_event.organizer_id] = None

    payload = event.payload_json or {}
    narrowed = payload.get('recipient_user_ids')
    if narrowed:
        wanted = {int(uid) for uid in narrowed}
        by_user = {uid: p for uid, p in by_user.items() if uid in wanted}

    actor_id = event.triggered_by_id
    recipients: list[ResolvedRecipient] = []
    for user_id, participant in by_user.items():
        # Never notify someone about their own action.
        if actor_id and user_id == actor_id:
            continue
        # A declined invitee stops receiving updates about the event.
        if participant and participant.response == EventParticipant.Response.DECLINED:
            continue

        user = participant.user if participant else calendar_event.organizer
        if user is None or not user.is_active:
            continue
        role = 'organizer' if user_id == calendar_event.organizer_id else 'participant'
        recipients.append(ResolvedRecipient(user, role))

    return recipients
