"""Audit hooks — emit history events for internship offers module."""

from __future__ import annotations

from typing import Any, Optional

from apps.history.audit import audit


def record_offer_event(
    *,
    action: str,
    event_code: str,
    summary: str,
    offer_id: int,
    actor=None,
    old_values: Optional[dict[str, Any]] = None,
    new_values: Optional[dict[str, Any]] = None,
    metadata: Optional[dict[str, Any]] = None,
    is_automated: bool = False,
) -> None:
    audit.emit(
        module='internship',
        action=action,
        event_code=event_code,
        summary=summary,
        actor=actor,
        entity_type='internship_offer',
        entity_id=offer_id,
        old_values=old_values,
        new_values=new_values,
        metadata={'offer_id': offer_id, **(metadata or {})},
        is_automated=is_automated,
    )


def record_application_event(
    *,
    action: str,
    event_code: str,
    summary: str,
    application_id: int,
    offer_id: int,
    student_profile_id: int,
    actor=None,
    old_values: Optional[dict[str, Any]] = None,
    new_values: Optional[dict[str, Any]] = None,
    metadata: Optional[dict[str, Any]] = None,
    is_automated: bool = False,
) -> None:
    audit.emit(
        module='internship',
        action=action,
        event_code=event_code,
        summary=summary,
        actor=actor,
        entity_type='offer_application',
        entity_id=application_id,
        old_values=old_values,
        new_values=new_values,
        metadata={
            'application_id': application_id,
            'offer_id': offer_id,
            'student_profile_id': student_profile_id,
            **(metadata or {}),
        },
        is_automated=is_automated,
        targets=[
            {'entity_type': 'internship_offer', 'entity_id': offer_id, 'role': 'offer'},
            {'entity_type': 'student_profile', 'entity_id': student_profile_id, 'role': 'student'},
        ],
    )


def record_import_event(
    *,
    event_code: str,
    summary: str,
    job_id: int,
    actor=None,
    metadata: Optional[dict[str, Any]] = None,
) -> None:
    audit.emit(
        module='internship',
        action='IMPORT',
        event_code=event_code,
        summary=summary,
        actor=actor,
        entity_type='offer_import_job',
        entity_id=job_id,
        metadata={'import_job_id': job_id, **(metadata or {})},
    )
