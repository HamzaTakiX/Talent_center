"""Document notification helpers."""

from __future__ import annotations

from apps.notifications.events.publisher import emit_event


def notify_document_uploaded(*, document_request, actor=None) -> None:
    emit_event(
        event_code='documents.uploaded',
        source_app='documents',
        entity_type='document_request',
        entity_id=document_request.pk,
        payload={
            'title': f'Document uploaded: {document_request.document_type}',
            'body': 'A new document request requires review.',
            'student_id': document_request.student_profile_id,
        },
        actor=actor,
    )


def notify_document_approved(*, document_request, actor=None) -> None:
    emit_event(
        event_code='documents.approved',
        source_app='documents',
        entity_type='document_request',
        entity_id=document_request.pk,
        payload={
            'title': f'Document approved: {document_request.document_type}',
            'body': 'Your document request has been approved.',
            'student_id': document_request.student_profile_id,
            'action_url': '/student/documents',
        },
        actor=actor,
    )


def notify_document_rejected(*, document_request, reason: str = '', actor=None) -> None:
    emit_event(
        event_code='documents.rejected',
        source_app='documents',
        entity_type='document_request',
        entity_id=document_request.pk,
        payload={
            'title': f'Document rejected: {document_request.document_type}',
            'body': reason or 'Your document request was rejected.',
            'student_id': document_request.student_profile_id,
            'action_url': '/student/documents',
        },
        actor=actor,
    )
