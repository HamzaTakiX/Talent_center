"""Student documents API — catalog and request stats."""

from __future__ import annotations

import os

from django.db.models import Prefetch, Q
from django.utils import timezone

from core.media_urls import build_absolute_media_url

from apps.documents.models import DocumentOutput, DocumentRequest, DocumentType, Reservation
from apps.documents.services import catalog as catalog_service
from apps.documents.services.generation_service import auto_generate_enabled
from apps.documents.services.admin_api import (
    LIST_SELECT_RELATED,
    PENDING_STATUSES,
    STATUS_MAP,
    _serialize_list_item,
)

ACTIVE_RESERVATION_STATUSES = [
    Reservation.Status.PENDING,
    Reservation.Status.APPROVED,
    Reservation.Status.CHECKED_IN,
]

VALIDATED_STATUSES = [
    DocumentRequest.Status.APPROVED,
    DocumentRequest.Status.FULFILLED,
]


def _student_requests_qs(profile):
    user = profile.user
    return DocumentRequest.objects.filter(
        Q(target_student_profile=profile) | Q(requested_by=user),
    ).exclude(status=DocumentRequest.Status.DRAFT)


def stats_payload(profile) -> dict:
    qs = _student_requests_qs(profile)
    user = profile.user
    reserved = Reservation.objects.filter(
        Q(reserved_by=user) | Q(reserved_for_user=user),
        status__in=ACTIVE_RESERVATION_STATUSES,
    ).count()
    return {
        'total': qs.count(),
        'pending': qs.filter(status__in=PENDING_STATUSES).count(),
        'validated': qs.filter(status__in=VALIDATED_STATUSES).count(),
        'reserved': reserved,
    }


def _empty_student_request() -> dict:
    return {
        'hasRequest': False,
        'canRequestNew': True,
        'isPending': False,
        'hasGeneratedOutput': False,
        'mode': 'manual_request',
        'canGenerate': False,
    }


def _serialize_student_request(req: DocumentRequest, http_request=None) -> dict:
    is_pending = req.status in PENDING_STATUSES
    result = {
        'hasRequest': True,
        'canRequestNew': not is_pending,
        'isPending': is_pending,
        'hasGeneratedOutput': False,
        'status': STATUS_MAP.get(req.status, str(req.status).lower()),
        'reference': f'DOC-{req.pk:06d}',
        'requestId': str(req.uuid),
        'submittedAt': req.submitted_at.isoformat() if req.submitted_at else None,
    }
    output = req.outputs.order_by('-generated_at').first()
    if output and output.file:
        result['hasGeneratedOutput'] = True
        result['generatedOutput'] = {
            'fileName': os.path.basename(output.file.name),
            'fileUrl': build_absolute_media_url(output.file.url, http_request),
            'generatedAt': output.generated_at.isoformat(),
        }
    return result


def _student_request_by_document_type(profile, http_request=None) -> dict[int, dict]:
    qs = (
        _student_requests_qs(profile)
        .select_related('document_type')
        .prefetch_related(
            Prefetch('outputs', queryset=DocumentOutput.objects.order_by('-generated_at')),
        )
        .order_by('document_type_id', '-submitted_at', '-created_at')
    )
    result: dict[int, dict] = {}
    for req in qs:
        if req.document_type_id not in result:
            result[req.document_type_id] = _serialize_student_request(req, http_request)
    return result


def _enrich_student_request_summary(item: dict, summary: dict) -> dict:
    enriched = dict(summary)
    try:
        document_type_id = int(item['id'])
    except (TypeError, ValueError, KeyError):
        return enriched

    if auto_generate_enabled(item):
        enriched['mode'] = 'auto_generate'
        enriched['canRequestNew'] = False
        enriched['isPending'] = False
        try:
            document_type = DocumentType.objects.get(pk=document_type_id)
            template = catalog_service._default_template(document_type)
            has_template = bool(template and template.file_template)
        except DocumentType.DoesNotExist:
            has_template = False
        enriched['canGenerate'] = has_template and not enriched.get('hasGeneratedOutput', False)
    else:
        enriched['mode'] = 'manual_request'
        enriched['canGenerate'] = False
    return enriched


def _attach_student_request(item: dict, request_map: dict[int, dict]) -> dict:
    try:
        document_type_id = int(item['id'])
    except (TypeError, ValueError, KeyError):
        return {**item, 'studentRequest': _empty_student_request()}
    summary = request_map.get(document_type_id) or _empty_student_request()
    return {**item, 'studentRequest': _enrich_student_request_summary(item, summary)}


def catalog_payload(profile, http_request=None) -> list[dict]:
    request_map = _student_request_by_document_type(profile, http_request)
    return [
        _attach_student_request(item, request_map)
        for item in catalog_service.catalog_list()
        if item.get('visibleToStudents') and item.get('isActive')
    ]


def overview_payload(profile, http_request=None) -> dict:
    return {
        'stats': stats_payload(profile),
        'catalog': catalog_payload(profile, http_request),
    }


def catalog_detail_payload(profile, pk: int, http_request=None) -> dict | None:
    data = catalog_service.catalog_detail(pk)
    if not data or not data.get('visibleToStudents') or not data.get('isActive'):
        return None
    request_map = _student_request_by_document_type(profile, http_request)
    return _attach_student_request(data, request_map)


def _resolve_delivery_method(config: dict) -> str:
    delivery = config.get('delivery') or {}
    online = delivery.get('online') or {}
    physical = delivery.get('physical') or {}
    if physical.get('enabled') and not online.get('enabled'):
        return 'pickup'
    return 'digital'


def create_request(profile, user, pk: int, payload: dict | None = None) -> dict:
    data = catalog_detail_payload(profile, pk)
    if not data:
        raise ValueError('Document not available')

    if auto_generate_enabled(data):
        raise ValueError('This document is generated instantly — use the generate action instead')

    config = data.get('config') or {}
    availability = config.get('availability') or {}
    if not availability.get('onlineRequestEnabled', True):
        raise ValueError('Online request is not enabled for this document')

    try:
        document_type = DocumentType.objects.get(pk=pk, is_active=True)
    except DocumentType.DoesNotExist:
        raise ValueError('Document not available')

    if DocumentRequest.objects.filter(
        target_student_profile=profile,
        document_type=document_type,
        status__in=PENDING_STATUSES,
    ).exists():
        raise ValueError('A pending request already exists for this document')

    payload = payload or {}
    reason = (payload.get('reason') or '').strip()

    req = DocumentRequest.objects.create(
        document_type=document_type,
        template=catalog_service._default_template(document_type),
        requested_by=user,
        target_user=user,
        target_student_profile=profile,
        status=DocumentRequest.Status.SUBMITTED,
        submitted_at=timezone.now(),
        reason=reason,
        metadata_json={
            'deliveryMethod': _resolve_delivery_method(config),
            'catalogServiceId': str(pk),
        },
    )

    req = DocumentRequest.objects.select_related(*LIST_SELECT_RELATED).get(pk=req.pk)
    return _serialize_list_item(req)
