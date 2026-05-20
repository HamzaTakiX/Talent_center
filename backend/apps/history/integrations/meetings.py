from __future__ import annotations

from apps.history.audit import audit
from apps.history.models import HistoryEvent


def meeting_status_changed(*, meeting, actor=None, old_status: str = '', new_status: str = '') -> None:
    action_code = 'UPDATE'
    if new_status == 'CANCELLED':
        action_code = 'ARCHIVE'
    elif new_status == 'RESCHEDULED':
        action_code = 'UPDATE'

    audit.emit(
        module='meetings',
        action=action_code,
        event_code=f'meeting.{new_status.lower()}',
        summary=f'Meeting {new_status.lower().replace("_", " ")}',
        actor=actor,
        entity_type='supervision_meeting',
        entity_id=meeting.pk,
        old_values={'status': old_status} if old_status else None,
        new_values={'status': new_status},
        metadata={'student_profile_id': meeting.student_profile_id},
        severity=HistoryEvent.Severity.WARNING if new_status in ('CANCELLED', 'MISSED') else HistoryEvent.Severity.INFO,
    )
