"""Notification fan-out for supervision report events."""

from __future__ import annotations

from typing import Iterable, Optional

from django.contrib.auth import get_user_model

from apps.notifications.models import Notification, NotificationEvent, NotificationRecipient
from apps.admin_management.services.scopes import get_admin_scope, is_super_admin

User = get_user_model()


def _admin_users_for_report(report) -> list[User]:
    """Admins with platform access who can see this report's academic scope."""
    from apps.admin_management.services.report_scopes import report_in_admin_scope

    admins = User.objects.filter(role=User.RoleChoices.ADMIN, is_active=True).select_related(
        'admin_profile',
    )
    result = []
    for admin in admins:
        if is_super_admin(admin) or report_in_admin_scope(admin, report):
            result.append(admin)
    return result


def emit_report_notification(
    *,
    event_code: str,
    report,
    title: str,
    body: str,
    actor=None,
    recipient_users: Optional[Iterable[User]] = None,
    action_url: str = '',
    extra_payload: Optional[dict] = None,
) -> NotificationEvent:
    payload = {
        'report_id': report.pk,
        'report_type': report.report_type,
        'status': report.status,
        'severity': report.severity,
        'student_id': report.student_profile_id,
        'encadrant_id': report.encadrant_profile_id,
        **(extra_payload or {}),
    }
    event = NotificationEvent.objects.create(
        event_code=event_code,
        source_app='encadrant',
        entity_type='supervision_report',
        entity_id=report.pk,
        payload_json=payload,
        triggered_by=actor,
    )

    users = list(recipient_users) if recipient_users is not None else []
    if not users and event_code.startswith('report.'):
        if event_code in ('report.submitted', 'report.escalated', 'report.critical_alert', 'report.overdue'):
            users = _admin_users_for_report(report)
        elif event_code in ('report.requires_changes', 'report.approved', 'report.rejected'):
            enc_user = report.encadrant_profile.supervisor_profile.user
            users = [enc_user]

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
            action_url=action_url or f'/admin/encadrant/reports/{report.pk}',
            payload_json=payload,
        )
    return event


def notify_report_submitted(report, actor=None):
    return emit_report_notification(
        event_code='report.submitted',
        report=report,
        title='Nouveau rapport de supervision',
        body=f'Rapport "{report.title}" soumis.',
        actor=actor,
    )


def notify_report_workflow(report, action: str, actor=None, note: str = ''):
    codes = {
        'approve': ('report.approved', 'Rapport approuvé', f'Le rapport "{report.title}" a été approuvé.'),
        'reject': ('report.rejected', 'Rapport rejeté', f'Le rapport "{report.title}" a été rejeté.'),
        'request_changes': ('report.requires_changes', 'Modifications demandées', note or f'Modifications requises pour "{report.title}".'),
        'escalate': ('report.escalated', 'Rapport escaladé', f'Le rapport "{report.title}" a été escaladé.'),
    }
    if action not in codes:
        return None
    code, title, body = codes[action]
    return emit_report_notification(event_code=code, report=report, title=title, body=body, actor=actor)
