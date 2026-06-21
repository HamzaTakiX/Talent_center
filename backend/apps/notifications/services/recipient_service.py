"""Recipient resolution dispatch."""

from __future__ import annotations

from typing import Callable

from apps.notifications.events.registry import EventConfig
from apps.notifications.events.resolvers.announcements import resolve_announcement_audience
from apps.notifications.events.resolvers.base import ResolvedRecipient
from apps.notifications.events.resolvers.chat import resolve_chat_participants
from apps.notifications.events.resolvers.documents import resolve_document_admins, resolve_document_student
from apps.notifications.events.resolvers.internship import (
    resolve_application_parties,
    resolve_internship_admins,
    resolve_student_only,
    resolve_targeted_students_and_admins,
)
from apps.notifications.events.resolvers.srf import resolve_finance_admins, resolve_srf_student_and_admins
from apps.notifications.events.resolvers.students import resolve_actor_only, resolve_user_from_payload
from apps.notifications.events.resolvers.supervision import resolve_supervision_parties
from apps.notifications.models import NotificationEvent

RESOLVER_MAP: dict[str, Callable[[NotificationEvent], list[ResolvedRecipient]]] = {
    'internship_admins': resolve_internship_admins,
    'targeted_students_and_admins': resolve_targeted_students_and_admins,
    'application_parties': resolve_application_parties,
    'student_only': resolve_student_only,
    'finance_admins': resolve_finance_admins,
    'srf_student_and_admins': resolve_srf_student_and_admins,
    'document_student': resolve_document_student,
    'document_admins': resolve_document_admins,
    'announcement_audience': resolve_announcement_audience,
    'chat_participants': resolve_chat_participants,
    'user_from_payload': resolve_user_from_payload,
    'supervision_parties': resolve_supervision_parties,
    'actor_only': resolve_actor_only,
}


def resolve_recipients(event: NotificationEvent, config: EventConfig) -> list[ResolvedRecipient]:
    resolver_name = config.resolver
    resolver = RESOLVER_MAP.get(resolver_name, resolve_user_from_payload)
    return resolver(event)
