from __future__ import annotations

from apps.history.audit import audit
from apps.history.models import HistoryEvent


def student_created(*, user, profile, actor=None) -> None:
    name = user.email
    try:
        name = user.profile.full_name or name
    except Exception:
        pass
    audit.emit(
        module='students',
        action='CREATE',
        event_code='student.created',
        summary=f'Student created: {name}',
        actor=actor,
        entity_type='student_profile',
        entity_id=profile.id,
        metadata={'user_id': user.id, 'email': user.email},
    )


def student_access_updated(
    *,
    user,
    profile,
    actor=None,
    old_status: str = '',
    new_status: str = '',
    platform_access: bool | None = None,
    sso_enabled: bool | None = None,
) -> None:
    old_values = {}
    new_values = {}
    if old_status or new_status:
        old_values['account_status'] = old_status
        new_values['account_status'] = new_status
    if platform_access is not None:
        new_values['platform_access_granted'] = platform_access
    if sso_enabled is not None:
        new_values['sso_enabled'] = sso_enabled

    audit.emit(
        module='students',
        action='UPDATE',
        event_code='student.access.updated',
        summary=f'Student access updated: {user.email}',
        actor=actor,
        entity_type='student_profile',
        entity_id=profile.id,
        old_values=old_values or None,
        new_values=new_values or None,
        metadata={'user_id': user.id},
        severity=HistoryEvent.Severity.IMPORTANT if new_status in ('BLOCKED', 'SUSPENDED') else HistoryEvent.Severity.INFO,
    )


def student_assignment_updated(*, user, profile, actor=None) -> None:
    audit.emit(
        module='students',
        action='UPDATE',
        event_code='student.assignment.updated',
        summary=f'Student academic assignment updated: {user.email}',
        actor=actor,
        entity_type='student_profile',
        entity_id=profile.id,
        metadata={'user_id': user.id},
    )
