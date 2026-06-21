"""Student / user recipient resolvers."""

from __future__ import annotations

from django.contrib.auth import get_user_model

from apps.accounts_et_roles.models import StudentProfile
from apps.notifications.events.resolvers.base import ResolvedRecipient
from apps.notifications.models import NotificationEvent

User = get_user_model()


def resolve_user_from_payload(event: NotificationEvent) -> list[ResolvedRecipient]:
    payload = event.payload_json or {}
    recipients: list[ResolvedRecipient] = []
    seen: set[int] = set()

    def add(user, role: str = 'user') -> None:
        if user and user.pk not in seen:
            seen.add(user.pk)
            recipients.append(ResolvedRecipient(user, role))

    for user_id in payload.get('recipient_user_ids', []):
        add(User.objects.filter(pk=user_id).first())
    user_id = (
        payload.get('user_id')
        or payload.get('recipient_user_id')
        or (event.entity_id if event.entity_type == 'user' else None)
    )
    if user_id:
        add(User.objects.filter(pk=user_id).first())

    student_id = payload.get('student_id') or payload.get('student_profile_id')
    if student_id:
        student = StudentProfile.objects.select_related('user').filter(pk=student_id).first()
        if student and student.user_id:
            add(student.user, 'student')

    if event.triggered_by_id:
        add(event.triggered_by, 'actor')
    return recipients


def resolve_actor_only(event: NotificationEvent) -> list[ResolvedRecipient]:
    if event.triggered_by_id:
        return [ResolvedRecipient(event.triggered_by, 'actor')]
    return []
