from __future__ import annotations

from apps.history.audit import audit
from apps.history.models import HistoryEvent


def document_request_status_changed(
    *,
    request_obj,
    actor=None,
    old_status: str = '',
    new_status: str = '',
) -> None:
    action = 'UPDATE'
    severity = HistoryEvent.Severity.INFO
    if new_status == 'SUBMITTED':
        action = 'SUBMIT'
    elif new_status == 'APPROVED':
        action = 'VALIDATE'
    elif new_status == 'REJECTED':
        action = 'REVIEW'
        severity = HistoryEvent.Severity.WARNING

    doc_label = getattr(request_obj.document_type, 'name', 'Document')
    audit.emit(
        module='documents',
        action=action,
        event_code=f'document.request.{new_status.lower()}',
        summary=f'Document request {new_status.lower()}: {doc_label}',
        actor=actor,
        entity_type='document_request',
        entity_id=request_obj.pk,
        old_values={'status': old_status} if old_status else None,
        new_values={'status': new_status},
        severity=severity,
        metadata={
            'entity_uuid': str(request_obj.uuid),
            'document_type_id': request_obj.document_type_id,
        },
    )
