"""Supervision report notification wrappers."""

from __future__ import annotations

from typing import Iterable, Optional

from apps.notifications.events.publisher import emit_event
from apps.notifications.models import NotificationEvent


def emit_report_notification(
    *,
    event_code: str,
    report,
    title: str,
    body: str,
    actor=None,
    recipient_users: Optional[Iterable] = None,
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
        'title': title,
        'body': body,
        'action_url': action_url or f'/admin/encadrant/reports/{report.pk}',
        **(extra_payload or {}),
    }
    if recipient_users is not None:
        payload['recipient_user_ids'] = [u.pk for u in recipient_users if u]
    return emit_event(
        event_code=event_code,
        source_app='encadrant',
        entity_type='supervision_report',
        entity_id=report.pk,
        payload=payload,
        actor=actor,
    )


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
