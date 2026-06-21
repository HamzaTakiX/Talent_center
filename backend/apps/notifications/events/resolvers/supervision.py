"""Supervision / encadrant recipient resolvers."""

from __future__ import annotations

from django.contrib.auth import get_user_model

from apps.encadrant.models import Report
from apps.notifications.events.resolvers.base import ResolvedRecipient
from apps.notifications.models import NotificationEvent

User = get_user_model()


def _get_report(event: NotificationEvent) -> Report | None:
    if event.entity_type == 'supervision_report' and event.entity_id:
        return (
            Report.objects
            .select_related('student_profile__user', 'encadrant_profile__supervisor_profile__user')
            .filter(pk=event.entity_id)
            .first()
        )
    report_id = (event.payload_json or {}).get('report_id')
    if report_id:
        return (
            Report.objects
            .select_related('student_profile__user', 'encadrant_profile__supervisor_profile__user')
            .filter(pk=report_id)
            .first()
        )
    return None


def resolve_supervision_parties(event: NotificationEvent) -> list[ResolvedRecipient]:
    from apps.encadrant.services.report_notifications import _admin_users_for_report

    report = _get_report(event)
    recipients: list[ResolvedRecipient] = []

    if report:
        if report.student_profile.user_id:
            recipients.append(ResolvedRecipient(report.student_profile.user, 'student'))
        enc_user = report.encadrant_profile.supervisor_profile.user
        if enc_user:
            recipients.append(ResolvedRecipient(enc_user, 'supervisor'))
        for admin in _admin_users_for_report(report):
            recipients.append(ResolvedRecipient(admin, 'admin'))
    else:
        payload = event.payload_json or {}
        for user_id in payload.get('recipient_user_ids', []):
            user = User.objects.filter(pk=user_id).first()
            if user:
                recipients.append(ResolvedRecipient(user, 'recipient'))

    seen: set[int] = set()
    result: list[ResolvedRecipient] = []
    for item in recipients:
        if item.user.pk in seen:
            continue
        seen.add(item.user.pk)
        result.append(item)
    return result
