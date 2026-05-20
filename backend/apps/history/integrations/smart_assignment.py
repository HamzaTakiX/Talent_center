from __future__ import annotations

from apps.history.audit import audit
from apps.history.models import HistoryEvent


def assignment_run_completed(
    *,
    academic_year: str,
    applied_count: int,
    assigned_count: int,
    unassigned_count: int,
    actor=None,
    dry_run: bool = False,
) -> None:
    if dry_run:
        return
    audit.emit(
        module='smart_assignment',
        action='ASSIGN',
        event_code='smart_assignment.executed',
        summary=f'Smart assignment executed: {applied_count} changes ({assigned_count} assigned, {unassigned_count} unassigned)',
        actor=actor,
        entity_type='assignment_run',
        entity_id=None,
        is_automated=False,
        severity=HistoryEvent.Severity.IMPORTANT,
        metadata={
            'academic_year': academic_year,
            'applied_count': applied_count,
            'assigned_count': assigned_count,
            'unassigned_count': unassigned_count,
        },
    )
