"""SRF notification fan-out via the canonical notifications app."""

from __future__ import annotations

from typing import Iterable, Optional

from django.contrib.auth import get_user_model

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.services.scopes import is_super_admin
from apps.notifications.models import Notification, NotificationEvent, NotificationRecipient

User = get_user_model()


def _finance_admin_users() -> list[User]:
    from apps.admin_management.services.admins import get_admin_effective_permissions

    admins = User.objects.filter(role=User.RoleChoices.ADMIN, is_active=True).select_related(
        'admin_profile',
    )
    result = []
    for admin in admins:
        if is_super_admin(admin):
            result.append(admin)
            continue
        perms = get_admin_effective_permissions(admin)
        if 'finance.manage' in perms:
            result.append(admin)
    return result


def emit_srf_notification(
    *,
    event_code: str,
    student: StudentProfile,
    title: str,
    body: str,
    actor=None,
    recipient_users: Optional[Iterable[User]] = None,
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
    event = NotificationEvent.objects.create(
        event_code=event_code,
        source_app='srf',
        entity_type=entity_type,
        entity_id=entity_id or (account.pk if account else student.pk),
        payload_json=payload,
        triggered_by=actor,
    )

    users: list[User] = []
    if recipient_users is not None:
        users = list(recipient_users)
    elif event_code in ('srf.payment.submitted', 'srf.risk.alert', 'srf.installment.overdue'):
        users = _finance_admin_users()
    elif event_code.startswith('srf.payment.') and student.user:
        users = [student.user]

    seen = set()
    for user in users:
        if not user or user.pk in seen:
            continue
        seen.add(user.pk)
        NotificationRecipient.objects.create(
            event=event,
            user=user,
            delivery_channel=NotificationRecipient.Channel.IN_APP,
            status=NotificationRecipient.Status.SENT,
        )
        Notification.objects.create(
            recipient=user,
            event=event,
            notification_type=event_code,
            title=title,
            body=body,
            action_url=action_url,
            is_read=False,
        )
    return event
