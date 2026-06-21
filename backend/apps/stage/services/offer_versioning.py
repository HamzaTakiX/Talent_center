"""Offer versioning — snapshots, history, restoration."""

from __future__ import annotations

import copy
from typing import Any

from django.db import transaction

from apps.stage.models import InternshipOffer
from apps.stage.models_extended import OfferContentHistory, OfferVersion

OFFER_SNAPSHOT_FIELDS = [
    'title', 'description', 'company_name', 'company_website', 'company_description',
    'location_city', 'location_country', 'is_remote', 'is_hybrid', 'offer_type',
    'duration_months', 'start_date', 'end_date', 'application_deadline',
    'compensation_amount', 'compensation_currency', 'compensation_period',
    'required_skills', 'preferred_skills', 'required_languages', 'min_education_level',
    'external_url', 'metadata_json',
]


def _snapshot_offer(offer: InternshipOffer) -> dict[str, Any]:
    return {field: getattr(offer, field) for field in OFFER_SNAPSHOT_FIELDS}


@transaction.atomic
def create_offer_version(
    *,
    offer: InternshipOffer,
    actor,
    change_summary: str = '',
    track_field_changes: dict[str, tuple[Any, Any]] | None = None,
) -> OfferVersion:
    last = offer.versions.order_by('-version_number').first()
    next_num = (last.version_number + 1) if last else 1
    OfferVersion.objects.filter(offer=offer, is_current=True).update(is_current=False)
    version = OfferVersion.objects.create(
        offer=offer,
        version_number=next_num,
        snapshot_json=_snapshot_offer(offer),
        change_summary=change_summary,
        changed_by=actor,
        is_current=True,
    )
    for field, (old_val, new_val) in (track_field_changes or {}).items():
        OfferContentHistory.objects.create(
            offer=offer,
            field_name=field,
            old_value=old_val,
            new_value=new_val,
            changed_by=actor,
            version_number=next_num,
        )
    return version


@transaction.atomic
def restore_offer_version(*, offer: InternshipOffer, version_number: int, actor) -> InternshipOffer:
    version = offer.versions.filter(version_number=version_number).first()
    if not version:
        raise ValueError(f'Version {version_number} not found')
    snapshot = copy.deepcopy(version.snapshot_json)
    for field, value in snapshot.items():
        if hasattr(offer, field):
            setattr(offer, field, value)
    offer.save()
    create_offer_version(
        offer=offer,
        actor=actor,
        change_summary=f'Restored from version {version_number}',
    )
    latest = offer.versions.order_by('-version_number').first()
    if latest:
        latest.restored_from_version = version_number
        latest.save(update_fields=['restored_from_version', 'updated_at'])
    return offer


def list_offer_versions(offer: InternshipOffer) -> list[OfferVersion]:
    return list(offer.versions.order_by('-version_number'))
