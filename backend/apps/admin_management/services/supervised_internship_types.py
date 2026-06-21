"""Encadrant supervised internship type catalog helpers."""

from __future__ import annotations

from typing import Iterable

from apps.admin_management.models import InternshipType
from apps.admin_management.services.academic_reference import serialize_internship_type
from apps.admin_management.services.i18n_labels import entity_localized_name


def validate_supervised_internship_type_ids(ids: Iterable[int]) -> list[int]:
    cleaned = []
    for raw in ids or []:
        try:
            pk = int(raw)
        except (TypeError, ValueError):
            continue
        if pk > 0 and pk not in cleaned:
            cleaned.append(pk)
    if not cleaned:
        return []
    found = set(
        InternshipType.objects.filter(pk__in=cleaned, is_active=True).values_list('pk', flat=True),
    )
    missing = [pk for pk in cleaned if pk not in found]
    if missing:
        raise ValueError(f'Unknown or inactive internship type id(s): {missing}')
    return cleaned


def sync_encadrant_supervised_internship_types(encadrant, internship_type_ids: list[int]) -> None:
    validated = validate_supervised_internship_type_ids(internship_type_ids)
    encadrant.supervised_internship_types.set(validated)


def get_encadrant_supervised_internship_type_ids(encadrant) -> list[int]:
    return list(
        encadrant.supervised_internship_types.filter(is_active=True).values_list('pk', flat=True),
    )


def build_encadrant_supervised_internship_payload(encadrant, lang: str = '') -> list[dict]:
    items = encadrant.supervised_internship_types.filter(is_active=True).select_related(
        'academic_level', 'academic_sector',
    ).order_by('academic_level__sort_order', 'sort_order', 'name')
    return [serialize_internship_type(item, lang) for item in items]


def build_encadrant_supervised_internship_labels(encadrant, lang: str = '') -> list[str]:
    return [
        entity_localized_name(item, lang)
        for item in encadrant.supervised_internship_types.filter(is_active=True).order_by('name')
    ]
