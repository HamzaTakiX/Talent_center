"""Service catalog — dynamic document service configuration."""

from __future__ import annotations

import os
from copy import deepcopy
from typing import Any

from apps.documents.models import DocumentTemplate, DocumentType
from apps.history.integrations.documents import (
    document_catalog_seeded,
    document_service_created,
    document_service_updated,
    document_template_uploaded,
)

DEFAULT_SERVICE_CONFIG: dict[str, Any] = {
    'availability': {
        'isActive': True,
        'visibleToStudents': True,
        'onlineRequestEnabled': True,
        'physicalOnly': False,
        'autoGenerateEnabled': False,
    },
    'eligibility': {
        'programIds': [],
        'filiereIds': [],
        'levelIds': [],
        'classGroupIds': [],
        'academicYears': [],
        'internshipStudentsOnly': False,
        'finalYearOnly': False,
    },
    'processing': {
        'estimatedHours': 24,
        'slaHours': 48,
        'urgencyRules': '',
        'autoEscalation': True,
        'escalationHours': 36,
    },
    'delivery': {
        'online': {
            'enabled': True,
            'downloadablePdf': True,
            'emailDelivery': False,
            'portalDelivery': True,
        },
        'physical': {
            'enabled': False,
            'pickupRequired': False,
            'reservationRequired': False,
            'signatureRequired': False,
            'appointmentMandatory': False,
        },
    },
    'pickup': {
        'reservationMandatory': False,
        'pickupOffice': '',
        'responsibleService': '',
        'maxReservationsPerDay': 20,
        'openingHours': '09:00-17:00',
        'delayBeforePickupHours': 24,
        'availableSlotCodes': [],
    },
    'requiredAttachments': [],
    'dynamicFields': [],
    'validation': {
        'automatic': False,
        'manual': True,
        'multiStep': False,
        'serviceApprovalRequired': True,
        'srfClearanceRequired': False,
    },
    'workflow': {
        'steps': [
            {'code': 'submitted', 'labelKey': 'admin.documentsModule.workflow.submit', 'enabled': True},
            {'code': 'under_verification', 'labelKey': 'admin.documentsModule.workflow.verify', 'enabled': True},
            {'code': 'validated', 'labelKey': 'admin.documentsModule.workflow.generate', 'enabled': True},
            {'code': 'ready', 'labelKey': 'admin.documentsModule.workflow.ready', 'enabled': True},
            {'code': 'delivered', 'labelKey': 'admin.documentsModule.workflow.delivered', 'enabled': True},
        ],
    },
    'automation': {
        'reminders': True,
        'autoClose': False,
        'escalation': True,
        'notifications': True,
        'expirationDays': None,
    },
}


def merge_config(raw: dict | None) -> dict:
    base = deepcopy(DEFAULT_SERVICE_CONFIG)
    if not raw:
        return base
    for key, val in raw.items():
        if isinstance(val, dict) and isinstance(base.get(key), dict):
            deep_merge(base[key], val)
        else:
            base[key] = val
    return base


def deep_merge(target: dict, source: dict) -> None:
    for k, v in source.items():
        if isinstance(v, dict) and isinstance(target.get(k), dict):
            deep_merge(target[k], v)
        else:
            target[k] = v


def _default_template(dt: DocumentType):
    return (
        dt.templates.filter(is_default=True, is_active=True).exclude(file_template='').first()
        or dt.templates.filter(is_active=True).exclude(file_template='').first()
    )


def _enrich_template_config(dt: DocumentType, cfg: dict) -> dict:
    template_meta = dict(cfg.get('template') or {})
    tpl = _default_template(dt)
    if tpl and tpl.file_template:
        name = os.path.basename(tpl.file_template.name)
        ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
        template_meta.setdefault('fileName', name)
        if ext in ('pdf', 'docx'):
            template_meta.setdefault('fileType', ext)
        try:
            template_meta.setdefault('fileSize', tpl.file_template.size)
        except OSError:
            pass
        template_meta['fileUrl'] = tpl.file_template.url
        template_meta['templateId'] = str(tpl.pk)
    if template_meta:
        return {**cfg, 'template': template_meta}
    return cfg


def serialize_service(dt: DocumentType) -> dict:
    cfg = _enrich_template_config(dt, merge_config(dt.service_config_json))
    proc = cfg.get('processing', {})
    delivery = cfg.get('delivery', {})
    online = delivery.get('online', {})
    physical = delivery.get('physical', {})
    avail = cfg.get('availability', {})
    return {
        'id': str(dt.pk),
        'code': dt.code,
        'name': dt.name,
        'description': dt.description,
        'category': dt.category,
        'iconKey': dt.icon_key or 'file-text',
        'colorTheme': dt.color_theme or 'brand',
        'isActive': dt.is_active and avail.get('isActive', True),
        'config': cfg,
        'slaHours': proc.get('slaHours') or dt.default_validity_days or 48,
        'estimatedHours': proc.get('estimatedHours', 24),
        'onlineEnabled': online.get('enabled', False),
        'physicalEnabled': physical.get('enabled', False),
        'reservationRequired': physical.get('reservationRequired', False),
        'visibleToStudents': avail.get('visibleToStudents', True),
        'autoGenerate': avail.get('autoGenerateEnabled', False),
        'requiresWorkflow': dt.requires_workflow,
    }


def catalog_list() -> list[dict]:
    return [serialize_service(dt) for dt in DocumentType.objects.order_by('name')]


def catalog_detail(pk: int) -> dict | None:
    try:
        return serialize_service(DocumentType.objects.get(pk=pk))
    except DocumentType.DoesNotExist:
        return None


def catalog_template_file(pk: int):
    try:
        dt = DocumentType.objects.get(pk=pk)
    except DocumentType.DoesNotExist:
        return None
    tpl = _default_template(dt)
    if not tpl or not tpl.file_template:
        return None
    return tpl.file_template


def catalog_upload_template_file(pk: int, uploaded_file, *, actor=None) -> dict | None:
    try:
        dt = DocumentType.objects.get(pk=pk)
    except DocumentType.DoesNotExist:
        return None

    name = os.path.basename(uploaded_file.name)
    ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
    tpl_code = f'{dt.code}-tpl'

    tpl = (
        DocumentTemplate.objects.filter(document_type=dt, code=tpl_code).first()
        or _default_template(dt)
    )
    if not tpl:
        tpl = DocumentTemplate(
            document_type=dt,
            code=tpl_code,
            name=f'{dt.name} template',
            is_default=True,
            is_active=True,
        )

    tpl.file_template.save(name, uploaded_file, save=False)
    tpl.is_default = True
    tpl.is_active = True
    tpl.save()

    cfg = merge_config(dt.service_config_json)
    template_meta = dict(cfg.get('template') or {})
    placeholders = template_meta.get('placeholdersFound') or []
    template_meta.update({
        'fileName': name,
        'fileType': ext if ext in ('pdf', 'docx') else template_meta.get('fileType', 'pdf'),
        'fileSize': getattr(uploaded_file, 'size', None) or template_meta.get('fileSize'),
        'validated': template_meta.get('validated', bool(placeholders)),
        'fileUrl': tpl.file_template.url,
        'templateId': str(tpl.pk),
    })
    cfg['template'] = template_meta
    dt.service_config_json = cfg
    dt.save(update_fields=['service_config_json'])

    document_template_uploaded(document_type=dt, actor=actor, file_name=name)
    return serialize_service(dt)


def catalog_create(payload: dict, *, actor=None) -> dict:
    code = payload['code']
    cfg = merge_config(payload.get('config'))
    dt = DocumentType.objects.create(
        code=code,
        name=payload['name'],
        description=payload.get('description', ''),
        category=payload.get('category', DocumentType.Category.OTHER),
        is_active=cfg['availability'].get('isActive', True),
        requires_workflow=not cfg['validation'].get('automatic', False),
        default_validity_days=cfg['processing'].get('slaHours'),
        icon_key=payload.get('iconKey', 'file-text'),
        color_theme=payload.get('colorTheme', 'brand'),
        service_config_json=cfg,
    )
    document_service_created(document_type=dt, actor=actor)
    return serialize_service(dt)


def catalog_update(pk: int, payload: dict, *, actor=None) -> dict | None:
    try:
        dt = DocumentType.objects.get(pk=pk)
    except DocumentType.DoesNotExist:
        return None
    changed_fields = [key for key in ('name', 'description', 'category', 'code', 'iconKey', 'colorTheme', 'config') if key in payload]
    if 'name' in payload:
        dt.name = payload['name']
    if 'description' in payload:
        dt.description = payload['description']
    if 'category' in payload:
        dt.category = payload['category']
    if 'code' in payload and payload['code'] != dt.code:
        dt.code = payload['code']
    if 'iconKey' in payload:
        dt.icon_key = payload['iconKey']
    if 'colorTheme' in payload:
        dt.color_theme = payload['colorTheme']
    if 'config' in payload:
        dt.service_config_json = _enrich_template_config(dt, merge_config(payload['config']))
        avail = dt.service_config_json.get('availability', {})
        dt.is_active = avail.get('isActive', dt.is_active)
        proc = dt.service_config_json.get('processing', {})
        if proc.get('slaHours'):
            dt.default_validity_days = int(proc['slaHours'])
        dt.requires_workflow = not dt.service_config_json.get('validation', {}).get('automatic', False)
    dt.save()
    if changed_fields:
        document_service_updated(document_type=dt, actor=actor, fields=changed_fields)
    return serialize_service(dt)


SEED_SERVICES = [
    {
        'code': 'attestation-scolarite',
        'name': 'Attestation de scolarité',
        'description': 'Certificat de scolarité pour démarches administratives ou employeur.',
        'category': 'ATTESTATION',
        'iconKey': 'graduation-cap',
        'colorTheme': 'blue',
        'config': {
            'availability': {
                'autoGenerateEnabled': True,
                'onlineRequestEnabled': True,
            },
            'processing': {'estimatedHours': 24, 'slaHours': 48},
            'delivery': {
                'online': {'enabled': True, 'downloadablePdf': True, 'portalDelivery': True},
                'physical': {'enabled': True, 'pickupRequired': True},
            },
        },
    },
    {
        'code': 'convention-stage',
        'name': 'Convention de stage',
        'description': 'Convention tripartite entre école, étudiant et entreprise.',
        'category': 'CONVENTION',
        'iconKey': 'briefcase',
        'colorTheme': 'violet',
        'config': {
            'eligibility': {'internshipStudentsOnly': True},
            'processing': {'estimatedHours': 72, 'slaHours': 72},
            'delivery': {
                'online': {'enabled': True},
                'physical': {
                    'enabled': True,
                    'reservationRequired': True,
                    'signatureRequired': True,
                    'appointmentMandatory': True,
                },
            },
            'pickup': {
                'reservationMandatory': True,
                'responsibleService': 'Stages',
                'pickupOffice': 'Bureau stages — Bât. C',
            },
            'requiredAttachments': [
                {'code': 'company_letter', 'labelKey': 'catalog.attachments.companyLetter', 'required': True},
                {'code': 'internship_offer', 'labelKey': 'catalog.attachments.internshipOffer', 'required': True},
            ],
            'dynamicFields': [
                {'name': 'company_name', 'labelKey': 'admin.documentsModule.fields.companyName', 'type': 'text', 'required': True},
                {'name': 'start_date', 'labelKey': 'admin.documentsModule.fields.startDate', 'type': 'date', 'required': True},
            ],
            'validation': {'srfClearanceRequired': True, 'multiStep': True},
        },
    },
    {
        'code': 'releve-notes',
        'name': 'Relevé de notes',
        'description': 'Relevé officiel des notes par semestre.',
        'category': 'REPORT',
        'iconKey': 'file-spreadsheet',
        'colorTheme': 'emerald',
        'config': {
            'processing': {'estimatedHours': 24, 'slaHours': 24},
            'delivery': {'online': {'enabled': True, 'downloadablePdf': True}},
            'validation': {'automatic': True, 'manual': False},
        },
    },
    {
        'code': 'duplicata-diplome',
        'name': 'Duplicata de diplôme',
        'description': 'Demande de duplicata — retrait physique uniquement.',
        'category': 'CERTIFICATE',
        'iconKey': 'award',
        'colorTheme': 'amber',
        'config': {
            'availability': {'physicalOnly': True, 'onlineRequestEnabled': True},
            'processing': {'estimatedHours': 168, 'slaHours': 168},
            'delivery': {
                'online': {'enabled': False},
                'physical': {'enabled': True, 'pickupRequired': True, 'reservationRequired': True},
            },
            'requiredAttachments': [
                {'code': 'id_copy', 'labelKey': 'catalog.attachments.idCopy', 'required': True},
                {'code': 'payment_proof', 'labelKey': 'catalog.attachments.paymentProof', 'required': True},
            ],
        },
    },
]


def seed_catalog(*, actor=None) -> int:
    created = 0
    for item in SEED_SERVICES:
        if DocumentType.objects.filter(code=item['code']).exists():
            dt = DocumentType.objects.get(code=item['code'])
            if not dt.service_config_json:
                dt.service_config_json = merge_config(item.get('config'))
                dt.icon_key = item.get('iconKey', dt.icon_key)
                dt.color_theme = item.get('colorTheme', dt.color_theme)
                dt.save()
                document_service_updated(document_type=dt, actor=actor, fields=['config'])
            continue
        catalog_create(item, actor=actor)
        created += 1
    document_catalog_seeded(actor=actor, created_count=created)
    return created
