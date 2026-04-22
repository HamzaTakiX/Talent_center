"""Snapshot & restore of a StudentCv.

A version stores a JSON snapshot of the CV as it was. Restoring rebuilds
the sections from the snapshot; the current state is snapshotted first,
so restore is always reversible by a subsequent restore.
"""

from typing import Optional

from django.db import transaction
from django.db.models import Max

from ..models import CvSection, CvTemplate, CvVersion, StudentCv


def _serialize_cv(cv: StudentCv) -> dict:
    """Produce the snapshot payload. Deliberately self-contained (no nested
    serializer imports) so restore doesn't depend on DRF."""
    return {
        'template_id': cv.template_id,
        'template_code': cv.template.code,
        'title': cv.title,
        'status': cv.status,
        'sections': [
            {
                'section_type': s.section_type,
                'label': s.label,
                'order_index': s.order_index,
                'is_visible': s.is_visible,
                'slot_name': s.slot_name,
                'config_json': s.config_json,
                'content_json': s.content_json,
            }
            for s in cv.sections.all().order_by('order_index', 'id')
        ],
    }


@transaction.atomic
def snapshot(cv: StudentCv, *, note: str = '', user=None) -> CvVersion:
    next_number = (
        cv.versions.aggregate(m=Max('version_number'))['m'] or 0
    ) + 1
    return CvVersion.objects.create(
        student_cv=cv,
        version_number=next_number,
        snapshot_json=_serialize_cv(cv),
        change_note=note,
        created_by=user,
    )


@transaction.atomic
def restore(cv: StudentCv, version: CvVersion, *, user=None) -> StudentCv:
    if version.student_cv_id != cv.pk:
        raise ValueError('Version does not belong to this CV.')

    # Auto-snapshot the current state so the restore itself is reversible.
    snapshot(cv, note=f'Auto-snapshot before restoring to v{version.version_number}', user=user)

    payload = version.snapshot_json or {}
    tpl_id = payload.get('template_id')
    if tpl_id and tpl_id != cv.template_id:
        tpl = CvTemplate.objects.filter(pk=tpl_id, is_active=True).first()
        if tpl is not None:
            cv.template = tpl

    cv.title = payload.get('title', cv.title)
    cv.status = payload.get('status', cv.status)
    cv.save()

    cv.sections.all().delete()
    for section in payload.get('sections', []):
        CvSection.objects.create(
            student_cv=cv,
            section_type=section['section_type'],
            label=section.get('label', ''),
            order_index=section.get('order_index', 0),
            is_visible=section.get('is_visible', True),
            slot_name=section.get('slot_name', ''),
            config_json=section.get('config_json', {}),
            content_json=section.get('content_json', {}),
        )
    return cv
