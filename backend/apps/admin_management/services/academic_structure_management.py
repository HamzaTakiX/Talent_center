"""CRUD, impact analysis, and audit for the Academic Structure Management module."""

from __future__ import annotations

from typing import Any, Optional

from django.db import transaction
from django.db.models import Count, Q
from django.utils.text import slugify
from rest_framework.exceptions import ValidationError

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.models import (
    AcademicLevel,
    AcademicSector,
    AcademicStructureAuditLog,
    ClassGroup,
    Filiere,
    InternshipType,
    WorkMode,
)
from apps.admin_management.services.academic_reference import (
    active_class_groups,
    active_filieres,
    active_internship_types,
    active_levels,
    serialize_class_group,
    serialize_filiere,
    serialize_internship_type,
    serialize_level,
)
from apps.admin_management.services.i18n_labels import (
    apply_bilingual_names_to_entity,
    bilingual_name_payload,
    entity_localized_name,
    management_name_fields,
    request_lang,
)
from apps.announcements.models import Announcement
from apps.stage.models import InternshipOffer, OfferApplication, OfferTargetingRule


def _audit(
    *,
    entity_type: str,
    entity_id: int,
    entity_label: str,
    action: str,
    actor,
    old_values: dict | None = None,
    new_values: dict | None = None,
    summary: str = '',
) -> None:
    AcademicStructureAuditLog.objects.create(
        entity_type=entity_type,
        entity_id=entity_id,
        entity_label=entity_label,
        action=action,
        actor=actor,
        old_values=old_values or {},
        new_values=new_values or {},
        summary=summary or f'{entity_type} {action.lower()}',
    )


def _serialize_work_mode(wm: WorkMode, lang: str) -> dict:
    return {
        'id': wm.id,
        'code': wm.code,
        **management_name_fields(wm, lang),
        'description': wm.description,
        'sort_order': wm.sort_order,
        'is_active': wm.is_active,
        'is_archived': wm.is_archived,
    }


def _management_filiere_qs(*, include_archived: bool = False):
    qs = Filiere.objects.all()
    if not include_archived:
        qs = qs.filter(is_archived=False)
    return qs.order_by('sort_order', 'code')


def _management_level_qs(*, include_archived: bool = False, filiere_id: Optional[int] = None):
    qs = AcademicLevel.objects.select_related('filiere')
    if not include_archived:
        qs = qs.filter(is_archived=False)
    if filiere_id:
        qs = qs.filter(filiere_id=filiere_id)
    return qs.order_by('filiere__sort_order', 'sort_order', 'year_number')


def _management_class_qs(*, include_archived: bool = False):
    qs = ClassGroup.objects.select_related(
        'filiere', 'academic_level', 'academic_sector', 'academic_year_ref',
    )
    if not include_archived:
        qs = qs.filter(is_archived=False)
    return qs.order_by('-academic_year', 'filiere__name', 'code')


def _management_internship_qs(*, include_archived: bool = False):
    qs = InternshipType.objects.select_related(
        'academic_level__filiere', 'academic_sector',
    )
    if not include_archived:
        qs = qs.filter(is_archived=False)
    return qs.order_by(
        'academic_level__filiere__sort_order',
        'academic_level__sort_order',
        'sort_order',
    )


def _management_work_mode_qs(*, include_archived: bool = False):
    qs = WorkMode.objects.all()
    if not include_archived:
        qs = qs.filter(is_archived=False)
    return qs.order_by('sort_order', 'name')


def serialize_management_filiere(f: Filiere, lang: str) -> dict:
    data = serialize_filiere(f, lang)
    data.update({
        'description': f.description,
        'sort_order': f.sort_order,
        'is_archived': f.is_archived,
    })
    return data


def serialize_management_level(level: AcademicLevel, lang: str) -> dict:
    data = serialize_level(level, lang)
    data.update({
        'filiere_name': entity_localized_name(level.filiere, lang),
        'is_archived': level.is_archived,
    })
    return data


def serialize_management_class(cg: ClassGroup, lang: str) -> dict:
    data = serialize_class_group(cg, lang)
    data['is_archived'] = cg.is_archived
    return data


def serialize_management_internship(item: InternshipType, lang: str) -> dict:
    data = serialize_internship_type(item, lang)
    data.update({
        'filiere_id': item.academic_level.filiere_id,
        'filiere_code': item.academic_level.filiere.code,
        'filiere_name': entity_localized_name(
            item.academic_level.filiere,
            lang,
        ),
        'level_code': item.academic_level.code,
        'level_name': entity_localized_name(item.academic_level, lang),
        'sort_order': item.sort_order,
        'is_archived': item.is_archived,
    })
    return data


def _assert_can_permanently_delete(entity_type: str, entity_id: int) -> dict[str, int]:
    impact = compute_entity_impact(entity_type, entity_id)
    if impact.get('total', 0) > 0:
        raise ValidationError(
            {'detail': 'This entity cannot be deleted because it is still referenced by active data.'},
        )

    if entity_type == 'FILIERE':
        if AcademicLevel.objects.filter(filiere_id=entity_id).exists():
            raise ValidationError(
                {'detail': 'Delete all academic levels for this track before permanent removal.'},
            )
        if ClassGroup.objects.filter(filiere_id=entity_id).exists():
            raise ValidationError(
                {'detail': 'Delete all classes for this track before permanent removal.'},
            )
    elif entity_type == 'ACADEMIC_LEVEL':
        if ClassGroup.objects.filter(academic_level_id=entity_id).exists():
            raise ValidationError(
                {'detail': 'Delete all classes for this level before permanent removal.'},
            )
        if InternshipType.objects.filter(academic_level_id=entity_id).exists():
            raise ValidationError(
                {'detail': 'Delete all internship framework entries for this level before permanent removal.'},
            )
        if AcademicSector.objects.filter(academic_level_id=entity_id).exists():
            raise ValidationError(
                {'detail': 'Delete all sectors for this level before permanent removal.'},
            )

    return impact


def compute_entity_impact(entity_type: str, entity_id: int) -> dict[str, int]:
    """Return usage counts before archive/deactivate."""
    impact: dict[str, int] = {
        'students': 0,
        'offers': 0,
        'applications': 0,
        'announcements': 0,
        'meetings': 0,
        'documents': 0,
    }

    if entity_type == 'FILIERE':
        impact['students'] = StudentProfile.objects.filter(filiere_id=entity_id).count()
        impact['offers'] = _count_offers_for_filiere(entity_id)
    elif entity_type == 'ACADEMIC_LEVEL':
        impact['students'] = StudentProfile.objects.filter(academic_level_id=entity_id).count()
        impact['offers'] = _count_offers_for_level(entity_id)
    elif entity_type == 'CLASS_GROUP':
        impact['students'] = StudentProfile.objects.filter(class_group_id=entity_id).count()
        impact['offers'] = _count_offers_for_class(entity_id)
    elif entity_type == 'INTERNSHIP_TYPE':
        impact['students'] = StudentProfile.objects.filter(internship_type_id=entity_id).count()
        impact['offers'] = _count_offers_for_internship_type(entity_id)
    elif entity_type == 'WORK_MODE':
        pass

    impact['applications'] = OfferApplication.objects.filter(
        student_profile__filiere_id=entity_id,
    ).count() if entity_type == 'FILIERE' else 0

    if entity_type == 'ACADEMIC_LEVEL':
        impact['applications'] = OfferApplication.objects.filter(
            student_profile__academic_level_id=entity_id,
        ).count()
    elif entity_type == 'CLASS_GROUP':
        impact['applications'] = OfferApplication.objects.filter(
            student_profile__class_group_id=entity_id,
        ).count()
    elif entity_type == 'INTERNSHIP_TYPE':
        impact['applications'] = OfferApplication.objects.filter(
            student_profile__internship_type_id=entity_id,
        ).count()

    try:
        impact['announcements'] = Announcement.objects.filter(
            is_active=True,
        ).count() if entity_type in ('FILIERE', 'ACADEMIC_LEVEL') else 0
    except Exception:
        pass

    impact['total'] = sum(v for k, v in impact.items() if k != 'total')
    return impact


def _count_offers_for_filiere(filiere_id: int) -> int:
    filiere = Filiere.objects.filter(pk=filiere_id).first()
    if not filiere:
        return 0
    code = filiere.code.lower()
    name = filiere.name.lower()
    count = 0
    for rule in OfferTargetingRule.objects.filter(
        rule_type=OfferTargetingRule.RuleType.FILIERE,
        is_active=True,
    ).select_related('offer'):
        payload = rule.value_json or {}
        codes = {str(c).lower() for c in payload.get('filiere_codes', [])}
        labels = {str(l).lower() for l in payload.get('labels', [])}
        ids = payload.get('filiere_ids', [])
        if filiere_id in ids or code in codes | labels or name in labels:
            count += 1
    return count


def _count_offers_for_level(level_id: int) -> int:
    level = AcademicLevel.objects.filter(pk=level_id).first()
    if not level:
        return 0
    code = level.code.lower()
    count = 0
    for rule in OfferTargetingRule.objects.filter(
        rule_type=OfferTargetingRule.RuleType.LEVEL,
        is_active=True,
    ):
        payload = rule.value_json or {}
        codes = {str(c).lower() for c in payload.get('level_codes', [])}
        ids = payload.get('level_ids', [])
        if level_id in ids or code in codes:
            count += 1
    return count


def _count_offers_for_class(class_id: int) -> int:
    cg = ClassGroup.objects.filter(pk=class_id).first()
    if not cg:
        return 0
    code = cg.code.lower()
    count = 0
    for rule in OfferTargetingRule.objects.filter(
        rule_type=OfferTargetingRule.RuleType.CLASS_GROUP,
        is_active=True,
    ):
        payload = rule.value_json or {}
        codes = {str(c).lower() for c in payload.get('class_codes', [])}
        ids = payload.get('class_group_ids', [])
        if class_id in ids or code in codes:
            count += 1
    return count


def _count_offers_for_internship_type(type_id: int) -> int:
    count = 0
    for rule in OfferTargetingRule.objects.filter(is_active=True):
        payload = rule.value_json or {}
        ids = payload.get('internship_type_ids', [])
        if type_id in ids:
            count += 1
    return count


def list_audit_log(*, limit: int = 50) -> list[dict]:
    rows = AcademicStructureAuditLog.objects.select_related('actor').order_by('-created_at')[:limit]
    return [
        {
            'id': row.id,
            'entity_type': row.entity_type,
            'entity_id': row.entity_id,
            'entity_label': row.entity_label,
            'action': row.action,
            'actor_email': getattr(row.actor, 'email', '') if row.actor_id else '',
            'old_values': row.old_values,
            'new_values': row.new_values,
            'summary': row.summary,
            'created_at': row.created_at.isoformat() if row.created_at else '',
        }
        for row in rows
    ]


def seed_default_work_modes() -> None:
    defaults = [
        ('remote', 'Remote', {'en': 'Remote', 'fr': 'À distance', 'ar': 'عن بُعد'}, 1),
        ('hybrid', 'Hybrid', {'en': 'Hybrid', 'fr': 'Hybride', 'ar': 'مختلط'}, 2),
        ('onsite', 'On-Site', {'en': 'On-Site', 'fr': 'Sur site', 'ar': 'في الموقع'}, 3),
        ('flexible', 'Flexible', {'en': 'Flexible', 'fr': 'Flexible', 'ar': 'مرن'}, 4),
    ]
    for code, name, i18n, order in defaults:
        WorkMode.objects.update_or_create(
            code=code,
            defaults={
                'name': name,
                'name_fr': i18n.get('fr', ''),
                'name_en': i18n.get('en', name),
                'name_i18n': i18n,
                'sort_order': order,
                'is_active': True,
                'is_archived': False,
            },
        )


@transaction.atomic
def create_filiere(*, actor, data: dict[str, Any], lang: str) -> dict:
    code = slugify(data.get('code') or data.get('name_en') or data.get('name', ''))[:64]
    name_fr, name_en = bilingual_name_payload(data)
    obj = Filiere(
        code=code,
        name=name_en or name_fr,
        name_fr=name_fr,
        name_en=name_en,
        description=data.get('description', ''),
        program_family=(data.get('program_family') or '').upper(),
        sort_order=int(data.get('sort_order') or 0),
        is_active=data.get('is_active', True),
    )
    apply_bilingual_names_to_entity(obj, data)
    obj.save()
    _audit(
        entity_type='FILIERE',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.CREATED,
        actor=actor,
        new_values=serialize_management_filiere(obj, lang),
        summary=f'Academic track created: {obj.name}',
    )
    return serialize_management_filiere(obj, lang)


@transaction.atomic
def update_filiere(*, actor, filiere_id: int, data: dict[str, Any], lang: str) -> dict:
    obj = Filiere.objects.get(pk=filiere_id)
    old = serialize_management_filiere(obj, lang)
    if 'description' in data:
        obj.description = data['description']
    if 'program_family' in data:
        obj.program_family = (data['program_family'] or '').upper()
    if 'sort_order' in data:
        obj.sort_order = int(data['sort_order'])
    if 'is_active' in data:
        obj.is_active = bool(data['is_active'])
    apply_bilingual_names_to_entity(obj, data)
    obj.save()
    new = serialize_management_filiere(obj, lang)
    _audit(
        entity_type='FILIERE',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.UPDATED,
        actor=actor,
        old_values=old,
        new_values=new,
        summary=f'Academic track updated: {obj.name}',
    )
    return new


@transaction.atomic
def archive_filiere(*, actor, filiere_id: int, lang: str) -> dict:
    obj = Filiere.objects.get(pk=filiere_id)
    impact = compute_entity_impact('FILIERE', filiere_id)
    obj.is_archived = True
    obj.is_active = False
    obj.save(update_fields=['is_archived', 'is_active', 'updated_at'])
    _audit(
        entity_type='FILIERE',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.ARCHIVED,
        actor=actor,
        new_values={'impact': impact},
        summary=f'Academic track archived: {obj.name}',
    )
    return {'entity': serialize_management_filiere(obj, lang), 'impact': impact}


@transaction.atomic
def create_level(*, actor, data: dict[str, Any], lang: str) -> dict:
    filiere = Filiere.objects.get(pk=data['filiere_id'])
    code = slugify(data.get('code') or data.get('name_en') or data.get('name', ''))[:64]
    name_fr, name_en = bilingual_name_payload(data)
    obj = AcademicLevel(
        filiere=filiere,
        code=code,
        name=name_en or name_fr,
        name_fr=name_fr,
        name_en=name_en,
        year_number=int(data.get('year_number') or data.get('sort_order') or 1),
        sort_order=int(data.get('sort_order') or 0),
        is_active=data.get('is_active', True),
    )
    apply_bilingual_names_to_entity(obj, data)
    obj.save()
    _audit(
        entity_type='ACADEMIC_LEVEL',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.CREATED,
        actor=actor,
        new_values=serialize_management_level(obj, lang),
        summary=f'Academic level created: {obj.name}',
    )
    return serialize_management_level(obj, lang)


@transaction.atomic
def update_level(*, actor, level_id: int, data: dict[str, Any], lang: str) -> dict:
    obj = AcademicLevel.objects.select_related('filiere').get(pk=level_id)
    old = serialize_management_level(obj, lang)
    for field in ('code', 'year_number', 'sort_order', 'is_active'):
        if field in data:
            setattr(obj, field, data[field])
    apply_bilingual_names_to_entity(obj, data)
    obj.save()
    new = serialize_management_level(obj, lang)
    _audit(
        entity_type='ACADEMIC_LEVEL',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.UPDATED,
        actor=actor,
        old_values=old,
        new_values=new,
        summary=f'Academic level updated: {obj.name}',
    )
    return new


@transaction.atomic
def archive_level(*, actor, level_id: int, lang: str) -> dict:
    obj = AcademicLevel.objects.select_related('filiere').get(pk=level_id)
    impact = compute_entity_impact('ACADEMIC_LEVEL', level_id)
    obj.is_archived = True
    obj.is_active = False
    obj.save(update_fields=['is_archived', 'is_active', 'updated_at'])
    _audit(
        entity_type='ACADEMIC_LEVEL',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.ARCHIVED,
        actor=actor,
        new_values={'impact': impact},
        summary=f'Academic level archived: {obj.name}',
    )
    return {'entity': serialize_management_level(obj, lang), 'impact': impact}


@transaction.atomic
def create_class_group(*, actor, data: dict[str, Any], lang: str) -> dict:
    filiere = Filiere.objects.get(pk=data['filiere_id'])
    level = AcademicLevel.objects.get(pk=data['academic_level_id']) if data.get('academic_level_id') else None
    code = slugify(data.get('code') or data.get('name_en') or data.get('name', ''))[:64]
    name_fr, name_en = bilingual_name_payload(data)
    obj = ClassGroup(
        code=code,
        name=name_en or name_fr,
        name_fr=name_fr,
        name_en=name_en,
        filiere=filiere,
        academic_level=level,
        academic_year=data.get('academic_year', ''),
        level=level.code if level else '',
        is_active=data.get('is_active', True),
    )
    apply_bilingual_names_to_entity(obj, data)
    obj.save()
    _audit(
        entity_type='CLASS_GROUP',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.CREATED,
        actor=actor,
        new_values=serialize_management_class(obj, lang),
        summary=f'Class created: {obj.name}',
    )
    return serialize_management_class(obj, lang)


@transaction.atomic
def update_class_group(*, actor, class_id: int, data: dict[str, Any], lang: str) -> dict:
    obj = ClassGroup.objects.select_related('filiere', 'academic_level').get(pk=class_id)
    old = serialize_management_class(obj, lang)
    if 'name' in data or 'name_fr' in data or 'name_en' in data:
        apply_bilingual_names_to_entity(obj, data)
    if 'academic_year' in data:
        obj.academic_year = data['academic_year']
    if 'filiere_id' in data:
        obj.filiere_id = data['filiere_id']
    if 'academic_level_id' in data:
        obj.academic_level_id = data['academic_level_id']
        if obj.academic_level_id:
            obj.level = AcademicLevel.objects.get(pk=obj.academic_level_id).code
    if 'is_active' in data:
        obj.is_active = bool(data['is_active'])
    obj.save()
    new = serialize_management_class(obj, lang)
    _audit(
        entity_type='CLASS_GROUP',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.UPDATED,
        actor=actor,
        old_values=old,
        new_values=new,
        summary=f'Class updated: {obj.name}',
    )
    return new


@transaction.atomic
def archive_class_group(*, actor, class_id: int, lang: str) -> dict:
    obj = ClassGroup.objects.select_related('filiere', 'academic_level').get(pk=class_id)
    impact = compute_entity_impact('CLASS_GROUP', class_id)
    obj.is_archived = True
    obj.is_active = False
    obj.save(update_fields=['is_archived', 'is_active', 'updated_at'])
    _audit(
        entity_type='CLASS_GROUP',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.ARCHIVED,
        actor=actor,
        new_values={'impact': impact},
        summary=f'Class archived: {obj.name}',
    )
    return {'entity': serialize_management_class(obj, lang), 'impact': impact}


@transaction.atomic
def create_internship_type(*, actor, data: dict[str, Any], lang: str) -> dict:
    level = AcademicLevel.objects.select_related('filiere').get(pk=data['academic_level_id'])
    code = slugify(data.get('code') or data.get('name_en') or data.get('name', ''))[:64]
    name_fr, name_en = bilingual_name_payload(data)
    obj = InternshipType(
        academic_level=level,
        code=code,
        name=name_en or name_fr,
        name_fr=name_fr,
        name_en=name_en,
        duration_hint=data.get('duration_hint', ''),
        sort_order=int(data.get('sort_order') or 0),
        is_active=data.get('is_active', True),
    )
    apply_bilingual_names_to_entity(obj, data)
    obj.save()
    _audit(
        entity_type='INTERNSHIP_TYPE',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.CREATED,
        actor=actor,
        new_values=serialize_management_internship(obj, lang),
        summary=f'Internship type created: {obj.name}',
    )
    return serialize_management_internship(obj, lang)


@transaction.atomic
def update_internship_type(*, actor, type_id: int, data: dict[str, Any], lang: str) -> dict:
    obj = InternshipType.objects.select_related('academic_level__filiere').get(pk=type_id)
    old = serialize_management_internship(obj, lang)
    if 'academic_level_id' in data:
        obj.academic_level_id = data['academic_level_id']
    for field in ('code', 'duration_hint', 'sort_order', 'is_active'):
        if field in data:
            setattr(obj, field, data[field])
    apply_bilingual_names_to_entity(obj, data)
    obj.save()
    obj.refresh_from_db()
    new = serialize_management_internship(obj, lang)
    _audit(
        entity_type='INTERNSHIP_TYPE',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.UPDATED,
        actor=actor,
        old_values=old,
        new_values=new,
        summary=f'Internship type updated: {obj.name}',
    )
    return new


@transaction.atomic
def archive_internship_type(*, actor, type_id: int, lang: str) -> dict:
    obj = InternshipType.objects.select_related('academic_level__filiere').get(pk=type_id)
    impact = compute_entity_impact('INTERNSHIP_TYPE', type_id)
    obj.is_archived = True
    obj.is_active = False
    obj.save(update_fields=['is_archived', 'is_active', 'updated_at'])
    _audit(
        entity_type='INTERNSHIP_TYPE',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.ARCHIVED,
        actor=actor,
        new_values={'impact': impact},
        summary=f'Internship type archived: {obj.name}',
    )
    return {'entity': serialize_management_internship(obj, lang), 'impact': impact}


@transaction.atomic
def create_work_mode(*, actor, data: dict[str, Any], lang: str) -> dict:
    code = slugify(data.get('code') or data.get('name_en') or data.get('name', ''))[:32]
    name_fr, name_en = bilingual_name_payload(data)
    obj = WorkMode(
        code=code,
        name=name_en or name_fr,
        name_fr=name_fr,
        name_en=name_en,
        description=data.get('description', ''),
        sort_order=int(data.get('sort_order') or 0),
        is_active=data.get('is_active', True),
    )
    apply_bilingual_names_to_entity(obj, data)
    obj.save()
    _audit(
        entity_type='WORK_MODE',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.CREATED,
        actor=actor,
        new_values=_serialize_work_mode(obj, lang),
        summary=f'Work mode created: {obj.name}',
    )
    return _serialize_work_mode(obj, lang)


@transaction.atomic
def update_work_mode(*, actor, mode_id: int, data: dict[str, Any], lang: str) -> dict:
    obj = WorkMode.objects.get(pk=mode_id)
    old = _serialize_work_mode(obj, lang)
    for field in ('description', 'sort_order', 'is_active'):
        if field in data:
            setattr(obj, field, data[field])
    apply_bilingual_names_to_entity(obj, data)
    obj.save()
    new = _serialize_work_mode(obj, lang)
    _audit(
        entity_type='WORK_MODE',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.UPDATED,
        actor=actor,
        old_values=old,
        new_values=new,
        summary=f'Work mode updated: {obj.name}',
    )
    return new


@transaction.atomic
def archive_work_mode(*, actor, mode_id: int, lang: str) -> dict:
    obj = WorkMode.objects.get(pk=mode_id)
    obj.is_archived = True
    obj.is_active = False
    obj.save(update_fields=['is_archived', 'is_active', 'updated_at'])
    _audit(
        entity_type='WORK_MODE',
        entity_id=obj.id,
        entity_label=obj.name,
        action=AcademicStructureAuditLog.Action.ARCHIVED,
        actor=actor,
        summary=f'Work mode archived: {obj.name}',
    )
    return {'entity': _serialize_work_mode(obj, lang), 'impact': {}}


@transaction.atomic
def reorder_filieres(*, actor, ordered_ids: list[int]) -> None:
    for index, pk in enumerate(ordered_ids):
        Filiere.objects.filter(pk=pk).update(sort_order=index)
    _audit(
        entity_type='FILIERE',
        entity_id=0,
        entity_label='bulk',
        action=AcademicStructureAuditLog.Action.REORDERED,
        actor=actor,
        new_values={'ordered_ids': ordered_ids},
        summary='Academic tracks reordered',
    )


def active_work_modes():
    return WorkMode.objects.filter(is_active=True, is_archived=False).order_by('sort_order', 'name')


def serialize_work_mode_ref(wm: WorkMode, lang: str) -> dict:
    return _serialize_work_mode(wm, lang)


@transaction.atomic
def delete_filiere(*, actor, filiere_id: int, lang: str) -> None:
    obj = Filiere.objects.get(pk=filiere_id)
    old = serialize_management_filiere(obj, lang)
    _assert_can_permanently_delete('FILIERE', filiere_id)
    label = obj.name
    entity_id = obj.id
    obj.delete()
    _audit(
        entity_type='FILIERE',
        entity_id=entity_id,
        entity_label=label,
        action=AcademicStructureAuditLog.Action.DELETED,
        actor=actor,
        old_values=old,
        summary=f'Academic track permanently deleted: {label}',
    )


@transaction.atomic
def delete_level(*, actor, level_id: int, lang: str) -> None:
    obj = AcademicLevel.objects.select_related('filiere').get(pk=level_id)
    old = serialize_management_level(obj, lang)
    _assert_can_permanently_delete('ACADEMIC_LEVEL', level_id)
    label = obj.name
    entity_id = obj.id
    obj.delete()
    _audit(
        entity_type='ACADEMIC_LEVEL',
        entity_id=entity_id,
        entity_label=label,
        action=AcademicStructureAuditLog.Action.DELETED,
        actor=actor,
        old_values=old,
        summary=f'Academic level permanently deleted: {label}',
    )


@transaction.atomic
def delete_class_group(*, actor, class_id: int, lang: str) -> None:
    obj = ClassGroup.objects.select_related('filiere', 'academic_level').get(pk=class_id)
    old = serialize_management_class(obj, lang)
    _assert_can_permanently_delete('CLASS_GROUP', class_id)
    label = obj.name
    entity_id = obj.id
    obj.delete()
    _audit(
        entity_type='CLASS_GROUP',
        entity_id=entity_id,
        entity_label=label,
        action=AcademicStructureAuditLog.Action.DELETED,
        actor=actor,
        old_values=old,
        summary=f'Class permanently deleted: {label}',
    )


@transaction.atomic
def delete_internship_type(*, actor, type_id: int, lang: str) -> None:
    obj = InternshipType.objects.select_related('academic_level__filiere').get(pk=type_id)
    old = serialize_management_internship(obj, lang)
    _assert_can_permanently_delete('INTERNSHIP_TYPE', type_id)
    label = obj.name
    entity_id = obj.id
    obj.delete()
    _audit(
        entity_type='INTERNSHIP_TYPE',
        entity_id=entity_id,
        entity_label=label,
        action=AcademicStructureAuditLog.Action.DELETED,
        actor=actor,
        old_values=old,
        summary=f'Internship type permanently deleted: {label}',
    )


@transaction.atomic
def delete_work_mode(*, actor, mode_id: int, lang: str) -> None:
    obj = WorkMode.objects.get(pk=mode_id)
    old = _serialize_work_mode(obj, lang)
    _assert_can_permanently_delete('WORK_MODE', mode_id)
    label = obj.name
    entity_id = obj.id
    obj.delete()
    _audit(
        entity_type='WORK_MODE',
        entity_id=entity_id,
        entity_label=label,
        action=AcademicStructureAuditLog.Action.DELETED,
        actor=actor,
        old_values=old,
        summary=f'Work mode permanently deleted: {label}',
    )
