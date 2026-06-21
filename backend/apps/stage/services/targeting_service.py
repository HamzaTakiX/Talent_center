"""Targeting rules — build, update, audience estimation for internship offers."""

from __future__ import annotations

from typing import Any

from django.db import transaction

from apps.accounts_et_roles.models import StudentProfile, User
from apps.admin_management.models import AcademicLevel, ClassGroup, Filiere, InternshipType
from apps.stage.models import InternshipOffer, OfferTargetingRule
from apps.stage.services.audit_hooks import record_offer_event
from apps.stage.services.exceptions import OfferValidationError
from apps.stage.services.permissions import assert_can_manage_offers


def _resolve_filiere(label: str) -> Filiere | None:
    token = str(label).strip()
    if not token:
        return None
    for filiere in Filiere.objects.filter(is_archived=False):
        if filiere.name == token or filiere.code == token:
            return filiere
    lower = token.lower()
    for filiere in Filiere.objects.filter(is_archived=False):
        if filiere.name.lower() == lower or filiere.code.lower() == lower:
            return filiere
    return None


def _resolve_level(label: str) -> AcademicLevel | None:
    token = str(label).strip()
    if not token:
        return None
    for level in AcademicLevel.objects.filter(is_archived=False):
        if level.name == token or level.code == token:
            return level
    lower = token.lower()
    for level in AcademicLevel.objects.filter(is_archived=False):
        if level.name.lower() == lower or level.code.lower() == lower:
            return level
    return None


def _resolve_class_group(label: str) -> ClassGroup | None:
    token = str(label).strip()
    if not token:
        return None
    for group in ClassGroup.objects.filter(is_archived=False):
        if group.name == token or group.code == token:
            return group
    lower = token.lower()
    for group in ClassGroup.objects.filter(is_archived=False):
        if group.name.lower() == lower or group.code.lower() == lower:
            return group
    return None


def _resolve_internship_type(label: str) -> InternshipType | None:
    token = str(label).strip()
    if not token:
        return None
    for itype in InternshipType.objects.filter(is_archived=False):
        if itype.name == token or itype.code == token:
            return itype
    lower = token.lower()
    for itype in InternshipType.objects.filter(is_archived=False):
        if itype.name.lower() == lower or itype.code.lower() == lower:
            return itype
    return None


def _enrich_filiere_payload(label: str) -> dict[str, Any]:
    filiere = _resolve_filiere(label)
    if filiere:
        return {
            'labels': [filiere.name],
            'filiere_codes': [filiere.code],
            'filiere_ids': [filiere.id],
        }
    return {'labels': [label], 'filiere_codes': [label]}


def _enrich_level_payload(label: str) -> dict[str, Any]:
    level = _resolve_level(label)
    if level:
        return {
            'labels': [level.name],
            'level_codes': [level.code],
            'level_ids': [level.id],
        }
    return {'labels': [label], 'level_codes': [label]}


def _enrich_class_payload(label: str) -> dict[str, Any]:
    group = _resolve_class_group(label)
    if group:
        return {
            'labels': [group.name],
            'class_codes': [group.code],
            'class_group_ids': [group.id],
        }
    return {'labels': [label], 'class_codes': [label]}


def _enrich_internship_type_payload(label: str) -> dict[str, Any]:
    itype = _resolve_internship_type(label)
    if itype:
        return {
            'labels': [itype.name],
            'internship_type_codes': [itype.code],
            'internship_type_ids': [itype.id],
        }
    return {'labels': [label], 'internship_type_codes': [label]}


def build_targeting_rules_from_selection(
    *,
    programs: list[str] | None = None,
    classes: list[str] | None = None,
    levels: list[str] | None = None,
    departments: list[str] | None = None,
    categories: list[str] | None = None,
    internship_types: list[str] | None = None,
    raw_rules: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """Normalize admin UI selections into OfferTargetingRule payloads."""
    rules: list[dict[str, Any]] = []

    if raw_rules:
        for rule in raw_rules:
            if 'rule_type' in rule:
                rules.append(
                    {
                        'rule_type': rule['rule_type'],
                        'value_json': rule.get('value_json') or {},
                        'is_inclusive': rule.get('is_inclusive', True),
                        'priority': rule.get('priority', 0),
                    }
                )
            elif rule.get('type') == 'program' or rule.get('rule_type') == 'FILIERE':
                programs = (programs or []) + [str(rule.get('value') or rule.get('label') or '')]
            elif rule.get('type') == 'category' or rule.get('rule_type') == 'CUSTOM':
                categories = (categories or []) + [str(rule.get('value') or rule.get('label') or '')]

    for label in _clean_labels(programs):
        rules.append(
            {
                'rule_type': OfferTargetingRule.RuleType.FILIERE,
                'value_json': _enrich_filiere_payload(label),
                'is_inclusive': True,
                'priority': 0,
            }
        )
    for label in _clean_labels(classes):
        rules.append(
            {
                'rule_type': OfferTargetingRule.RuleType.CLASS_GROUP,
                'value_json': _enrich_class_payload(label),
                'is_inclusive': True,
                'priority': 0,
            }
        )
    for label in _clean_labels(levels):
        rules.append(
            {
                'rule_type': OfferTargetingRule.RuleType.LEVEL,
                'value_json': _enrich_level_payload(label),
                'is_inclusive': True,
                'priority': 0,
            }
        )
    for label in _clean_labels(departments):
        rules.append(
            {
                'rule_type': OfferTargetingRule.RuleType.CUSTOM,
                'value_json': {'departments': [label]},
                'is_inclusive': True,
                'priority': 0,
            }
        )
    for label in _clean_labels(categories):
        rules.append(
            {
                'rule_type': OfferTargetingRule.RuleType.CUSTOM,
                'value_json': {'categories': [label]},
                'is_inclusive': True,
                'priority': 0,
            }
        )
    for label in _clean_labels(internship_types):
        rules.append(
            {
                'rule_type': OfferTargetingRule.RuleType.INTERNSHIP_TYPE,
                'value_json': _enrich_internship_type_payload(label),
                'is_inclusive': True,
                'priority': 0,
            }
        )
    return rules


def _clean_labels(values: list[str] | None) -> list[str]:
    if not values:
        return []
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        label = str(value).strip()
        if not label or label in seen:
            continue
        seen.add(label)
        out.append(label)
    return out


def _student_matches_rule(student: StudentProfile, rule: OfferTargetingRule) -> bool:
    payload = rule.value_json or {}
    labels = {str(v).strip().lower() for v in payload.get('labels', []) if str(v).strip()}
    codes = {str(v).strip().lower() for v in payload.get('level_codes', []) if str(v).strip()}
    codes.update(str(v).strip().lower() for v in payload.get('filiere_codes', []) if str(v).strip())
    codes.update(str(v).strip().lower() for v in payload.get('class_codes', []) if str(v).strip())

    if rule.rule_type == OfferTargetingRule.RuleType.FILIERE:
        filiere_ids = payload.get('filiere_ids') or []
        if student.filiere_id and student.filiere_id in filiere_ids:
            return True
        filiere_name = (getattr(getattr(student, 'filiere', None), 'name', '') or '').lower()
        filiere_code = (getattr(getattr(student, 'filiere', None), 'code', '') or '').lower()
        program_major = (student.program_major or '').lower()
        return any(
            token in (filiere_name, filiere_code, program_major)
            for token in labels | codes
            if token
        )

    if rule.rule_type == OfferTargetingRule.RuleType.CLASS_GROUP:
        class_group_ids = payload.get('class_group_ids') or []
        if student.class_group_id and student.class_group_id in class_group_ids:
            return True
        class_name = (getattr(getattr(student, 'class_group', None), 'name', '') or '').lower()
        class_code = (getattr(getattr(student, 'class_group', None), 'code', '') or '').lower()
        current_class = (student.current_class or '').lower()
        return any(
            token in (class_name, class_code, current_class)
            for token in labels | codes
            if token
        )

    if rule.rule_type == OfferTargetingRule.RuleType.LEVEL:
        level_code = (getattr(getattr(student, 'academic_level', None), 'code', '') or '').lower()
        level_name = (getattr(getattr(student, 'academic_level', None), 'name', '') or '').lower()
        level_ids = payload.get('level_ids') or []
        if student.academic_level_id and student.academic_level_id in level_ids:
            return True
        return any(token in (level_code, level_name) for token in labels | codes if token)

    if rule.rule_type == OfferTargetingRule.RuleType.INTERNSHIP_TYPE:
        student_type = getattr(student, 'internship_type', None)
        if not student_type:
            return False
        type_ids = payload.get('internship_type_ids') or []
        if student_type.id in type_ids:
            return True
        type_code = (student_type.code or '').lower()
        type_name = (student_type.name or '').lower()
        type_codes = {str(c).lower() for c in payload.get('internship_type_codes', []) if str(c).strip()}
        return any(token in (type_code, type_name) for token in labels | type_codes if token)

    if rule.rule_type == OfferTargetingRule.RuleType.CUSTOM:
        departments = {str(v).strip().lower() for v in payload.get('departments', []) if str(v).strip()}
        categories = {str(v).strip().lower() for v in payload.get('categories', []) if str(v).strip()}
        sector_name = (getattr(getattr(student, 'academic_sector', None), 'name', '') or '').lower()
        internship_category = (getattr(student, 'internship_category', '') or '').lower()
        filiere_department = (getattr(getattr(student, 'filiere', None), 'department', '') or '').lower()
        if departments and not any(
            dep in (sector_name, filiere_department, student.program_major or '').lower()
            for dep in departments
        ):
            return False
        if categories and internship_category not in categories:
            return False
        return True

    return True


def student_passes_targeting(student: StudentProfile, rules: list[OfferTargetingRule]) -> bool:
    active_rules = [rule for rule in rules if rule.is_active]
    if not active_rules:
        return True
    for rule in active_rules:
        matched = _student_matches_rule(student, rule)
        if rule.is_inclusive and not matched:
            return False
        if not rule.is_inclusive and matched:
            return False
    return True


def estimate_targeting_audience(
    *,
    offer: InternshipOffer | None = None,
    rule_payloads: list[dict[str, Any]] | None = None,
) -> dict[str, int]:
    students = StudentProfile.objects.filter(
        user__is_active=True,
        user__role=User.RoleChoices.STUDENT,
    ).select_related('filiere', 'class_group', 'academic_level', 'academic_sector', 'internship_type')

    if offer and not rule_payloads:
        rules = list(offer.targeting_rules.filter(is_active=True))
    else:
        rules = [
            OfferTargetingRule(
                rule_type=payload['rule_type'],
                value_json=payload.get('value_json') or {},
                is_inclusive=payload.get('is_inclusive', True),
                is_active=True,
            )
            for payload in (rule_payloads or [])
        ]

    total_students = students.count()
    if not rules:
        return {
            'total_students': total_students,
            'affected_students': total_students,
            'recipient_count': total_students,
        }

    affected = sum(1 for student in students if student_passes_targeting(student, rules))
    return {
        'total_students': total_students,
        'affected_students': affected,
        'recipient_count': affected,
    }


def _save_targeting_rules(offer: InternshipOffer, rule_payloads: list[dict[str, Any]]) -> None:
    offer.targeting_rules.all().delete()
    for payload in rule_payloads:
        OfferTargetingRule.objects.create(
            offer=offer,
            rule_type=payload['rule_type'],
            value_json=payload.get('value_json') or {},
            is_inclusive=payload.get('is_inclusive', True),
            priority=payload.get('priority', 0),
            is_active=True,
        )


def refresh_offer_audience(
    *,
    offer: InternshipOffer | None = None,
    rule_payloads: list[dict[str, Any]] | None = None,
) -> dict[str, int]:
    return estimate_targeting_audience(offer=offer, rule_payloads=rule_payloads)


def recalculate_student_matching(
    *,
    offer: InternshipOffer,
    trigger: str = 'TARGETING_UPDATED',
) -> int:
    from apps.stage.services.matching_service import recalculate_matches_for_offer

    return recalculate_matches_for_offer(offer, trigger=trigger)


def update_offer_visibility(*, offer: InternshipOffer, audience: dict[str, int]) -> None:
    meta = dict(offer.metadata_json) if isinstance(offer.metadata_json, dict) else {}
    meta['targeting_audience'] = {
        'affected_students': audience.get('affected_students', 0),
        'recipient_count': audience.get('recipient_count', 0),
        'total_students': audience.get('total_students', 0),
    }
    offer.metadata_json = meta
    offer.save(update_fields=['metadata_json', 'updated_at'])


def preview_offer_targeting(
    *,
    offer: InternshipOffer,
    rule_payloads: list[dict[str, Any]],
) -> dict[str, Any]:
    audience = refresh_offer_audience(rule_payloads=rule_payloads)
    existing_matches = offer.match_scores.count() if hasattr(offer, 'match_scores') else 0
    return {
        **audience,
        'rule_count': len(rule_payloads),
        'existing_match_records': existing_matches,
        'matching_will_refresh': True,
    }


@transaction.atomic
def update_offer_targeting(
    *,
    offer: InternshipOffer,
    actor,
    rule_payloads: list[dict[str, Any]],
    recalculate_matching: bool = True,
) -> tuple[InternshipOffer, dict[str, Any]]:
    assert_can_manage_offers(actor)
    if offer.status == InternshipOffer.Status.DELETED:
        raise OfferValidationError('Cannot update targeting on a deleted offer.')

    old_rules = list(
        offer.targeting_rules.filter(is_active=True).values('rule_type', 'value_json', 'is_inclusive')
    )
    _save_targeting_rules(offer, rule_payloads)

    record_offer_event(
        action='UPDATE',
        event_code='internship.offer.targeting_updated',
        summary=f'Targeting updated for offer: {offer.title}',
        offer_id=offer.pk,
        actor=actor,
        old_values={'targeting_rules': old_rules},
        new_values={'targeting_rules': rule_payloads},
        metadata={'rule_count': len(rule_payloads)},
    )

    audience = refresh_offer_audience(offer=offer)
    update_offer_visibility(offer=offer, audience=audience)

    matches_recalculated = 0
    if recalculate_matching and rule_payloads:
        try:
            matches_recalculated = recalculate_student_matching(offer=offer)
        except Exception:
            pass

    return offer, {
        **audience,
        'matches_recalculated': matches_recalculated,
        'rule_count': len(rule_payloads),
    }
