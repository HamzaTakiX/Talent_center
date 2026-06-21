"""SRF notification wrappers — delegate to centralized emit_event()."""

from __future__ import annotations

from typing import Iterable, Optional

from apps.accounts_et_roles.models import StudentProfile
from apps.notifications.events.publisher import emit_event
from apps.notifications.models import NotificationEvent


def emit_srf_notification(
    *,
    event_code: str,
    student: StudentProfile,
    title: str,
    body: str,
    actor=None,
    recipient_users: Optional[Iterable] = None,
    action_url: str = '/admin/srf',
    entity_type: str = 'financial_account',
    entity_id: Optional[int] = None,
    extra_payload: Optional[dict] = None,
) -> NotificationEvent:
    account = getattr(student, 'financial_account', None)
    payload = {
        'student_id': student.pk,
        'student_email': student.user.email,
        'financial_status': account.financial_status if account else None,
        'title': title,
        'body': body,
        'action_url': action_url,
        **(extra_payload or {}),
    }
    if recipient_users is not None:
        payload['recipient_user_ids'] = [u.pk for u in recipient_users if u]
    return emit_event(
        event_code=event_code,
        source_app='srf',
        entity_type=entity_type,
        entity_id=entity_id or (account.pk if account else student.pk),
        payload=payload,
        actor=actor,
    )
