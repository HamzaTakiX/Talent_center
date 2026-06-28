from __future__ import annotations

from apps.history.audit import audit
from apps.history.models import HistoryEvent

_REQUEST_EVENT_CODES = {
    'SUBMITTED': 'document.request.submitted',
    'IN_REVIEW': 'document.request.in_review',
    'APPROVED': 'document.request.validated',
    'REJECTED': 'document.request.rejected',
    'FULFILLED': 'document.request.fulfilled',
    'CANCELLED': 'document.request.cancelled',
    'DRAFT': 'document.request.draft',
}


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
        action = 'REJECT'
        severity = HistoryEvent.Severity.WARNING

    doc_label = getattr(request_obj.document_type, 'name', 'Document')
    event_code = _REQUEST_EVENT_CODES.get(new_status, f'document.request.{new_status.lower()}')
    audit.emit(
        module='documents',
        action=action,
        event_code=event_code,
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


def document_service_created(*, document_type, actor=None) -> None:
    audit.emit(
        module='documents',
        action='CREATE',
        event_code='document.service.created',
        summary=f'Document service created: {document_type.name}',
        actor=actor,
        entity_type='document_type',
        entity_id=document_type.pk,
        new_values={'code': document_type.code, 'name': document_type.name},
        metadata={'document_type_code': document_type.code},
    )


def document_service_updated(*, document_type, actor=None, fields: list[str] | None = None) -> None:
    detail = f' ({", ".join(fields)})' if fields else ''
    audit.emit(
        module='documents',
        action='UPDATE',
        event_code='document.service.updated',
        summary=f'Document service updated: {document_type.name}{detail}',
        actor=actor,
        entity_type='document_type',
        entity_id=document_type.pk,
        metadata={'document_type_code': document_type.code, 'fields': fields or []},
    )


def document_template_uploaded(*, document_type, actor=None, file_name: str = '') -> None:
    audit.emit(
        module='documents',
        action='CREATE',
        event_code='document.template.uploaded',
        summary=f'Template uploaded for {document_type.name}: {file_name or "file"}',
        actor=actor,
        entity_type='document_type',
        entity_id=document_type.pk,
        new_values={'file_name': file_name},
        metadata={'document_type_code': document_type.code},
    )


def document_catalog_seeded(*, actor=None, created_count: int = 0) -> None:
    if created_count <= 0:
        return
    audit.emit(
        module='documents',
        action='IMPORT',
        event_code='document.catalog.seeded',
        summary=f'Document catalog seeded ({created_count} service{"s" if created_count != 1 else ""})',
        actor=actor,
        entity_type='document_catalog',
        severity=HistoryEvent.Severity.INFO,
        metadata={'created_count': created_count},
    )
