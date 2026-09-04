"""Manual offer creation, validation, duplicate detection, publishing."""

from __future__ import annotations

import hashlib
from decimal import Decimal
from typing import Any, Optional

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.stage.models import InternshipOffer, OfferTargetingRule
from apps.stage.services.audit_hooks import record_offer_event
from apps.stage.services.exceptions import (
    DuplicateOfferError,
    OfferTransitionError,
    OfferValidationError,
)
from apps.stage.services.notifications import notify_offer_published
from apps.stage.services.offer_lifecycle import (
    STUDENT_APPLYABLE_STATUSES,
    transition_offer,
)
from apps.stage.services.offer_types import resolve_offer_type
from apps.stage.services.permissions import assert_can_manage_offers

REQUIRED_PUBLISH_FIELDS = (
    'title',
    'company_name',
    'description',
    'offer_type',
    'location_city',
)


def _normalize_external_id(external_id: str, external_url: str = '') -> str:
    value = (external_id or '').strip()
    if len(value) <= 128:
        return value
    source = (external_url or value).strip()
    if source:
        return hashlib.sha256(source.encode('utf-8')).hexdigest()
    return value[:128]


def validate_offer_for_publish(offer: InternshipOffer) -> list[str]:
    """Full publish gate — aligned with the admin create/edit wizard."""
    data = {f: getattr(offer, f) for f in REQUIRED_PUBLISH_FIELDS + ('application_deadline',)}
    errors = validate_offer_payload(data, for_publish=True)
    if not offer.required_skills:
        errors.append('required_skills is required for publishing.')
    if not offer.targeting_rules.filter(is_active=True).exists():
        errors.append('targeting is required for publishing.')
    if not offer.application_deadline:
        errors.append('application_deadline is required for publishing.')
    return errors


def missing_publish_requirements(offer: InternshipOffer) -> list[str]:
    """Field keys blocking publication, for localized client-side messaging."""
    missing: list[str] = []
    for field in REQUIRED_PUBLISH_FIELDS:
        value = getattr(offer, field, None)
        if not value or (isinstance(value, str) and not value.strip()):
            missing.append(field)
    if not offer.required_skills:
        missing.append('required_skills')
    if not offer.targeting_rules.filter(is_active=True).exists():
        missing.append('targeting')
    if not offer.application_deadline:
        missing.append('application_deadline')
    return missing


def _raise_publish_gate(offer: InternshipOffer, errors: list[str]) -> None:
    raise OfferValidationError(
        '; '.join(errors),
        details={'missing_fields': missing_publish_requirements(offer)},
    )


def evaluate_publish_readiness(offer: InternshipOffer) -> dict[str, Any]:
    sections = {
        'basic': bool(
            (offer.title or '').strip()
            and (offer.company_name or '').strip()
            and offer.offer_type
            and (offer.location_city or '').strip()
        ),
        'description': bool((offer.description or '').strip()),
        'skills': bool(offer.required_skills),
        'targeting': offer.targeting_rules.filter(is_active=True).exists(),
        'recruitment': bool(offer.application_deadline),
    }
    total = len(sections)
    complete_count = sum(1 for value in sections.values() if value)
    score = round(complete_count / total * 100)
    missing_sections = [key for key, ok in sections.items() if not ok]
    return {
        'score': score,
        'ready': score == 100,
        'missing_sections': missing_sections,
    }


def validate_offer_payload(data: dict[str, Any], *, for_publish: bool = False) -> list[str]:
    errors: list[str] = []
    if for_publish:
        for field in REQUIRED_PUBLISH_FIELDS:
            value = data.get(field) or (data.get(field.replace('_', '')))
            if not value or (isinstance(value, str) and not value.strip()):
                errors.append(f'{field} is required for publishing.')
    title = (data.get('title') or '').strip()
    if title and len(title) < 5:
        errors.append('title must be at least 5 characters.')
    company = (data.get('company_name') or '').strip()
    if company and len(company) < 2:
        errors.append('company_name must be at least 2 characters.')
    deadline = data.get('application_deadline')
    if deadline and hasattr(deadline, 'year'):
        if deadline < timezone.now():
            errors.append('application_deadline cannot be in the past.')
    compensation = data.get('compensation_amount')
    if compensation is not None and Decimal(str(compensation)) < 0:
        errors.append('compensation_amount cannot be negative.')
    return errors


def detect_duplicate_offer(
    *,
    title: str,
    company_name: str,
    external_source: str = '',
    external_id: str = '',
    exclude_id: int | None = None,
) -> InternshipOffer | None:
    qs = InternshipOffer.objects.exclude(status=InternshipOffer.Status.DELETED)
    if exclude_id:
        qs = qs.exclude(pk=exclude_id)
    if external_source and external_id:
        dup = qs.filter(external_source=external_source, external_id=external_id).first()
        if dup:
            return dup
    normalized_title = title.strip().lower()
    normalized_company = company_name.strip().lower()
    return qs.filter(
        Q(title__iexact=title) | Q(title__icontains=normalized_title[:50]),
        company_name__iexact=company_name,
    ).exclude(
        status__in=[InternshipOffer.Status.ARCHIVED, InternshipOffer.Status.EXPIRED],
    ).first()


@transaction.atomic
def create_offer_draft(*, actor, data: dict[str, Any]) -> InternshipOffer:
    assert_can_manage_offers(actor)
    errors = validate_offer_payload(data, for_publish=False)
    if errors:
        raise OfferValidationError('; '.join(errors))

    external_id = _normalize_external_id(
        data.get('external_id', ''),
        data.get('external_url', ''),
    )
    external_source = (data.get('external_source', '') or '')[:64]

    dup = detect_duplicate_offer(
        title=data.get('title', ''),
        company_name=data.get('company_name', ''),
        external_source=external_source,
        external_id=external_id,
    )
    if dup:
        raise DuplicateOfferError(
            f'Similar offer already exists: {dup.title} @ {dup.company_name}',
            existing_offer_id=dup.pk,
        )

    offer = InternshipOffer.objects.create(
        title=data['title'],
        description=data.get('description', ''),
        company_name=data['company_name'],
        company_website=data.get('company_website', ''),
        company_description=data.get('company_description', ''),
        location_city=(data.get('location_city', '') or '')[:128],
        location_country=(data.get('location_country', '') or '')[:128],
        is_remote=data.get('is_remote', False),
        is_hybrid=data.get('is_hybrid', False),
        offer_type=resolve_offer_type(data.get('offer_type')),
        duration_months=data.get('duration_months'),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        application_deadline=data.get('application_deadline'),
        compensation_amount=data.get('compensation_amount'),
        compensation_currency=data.get('compensation_currency', 'MAD'),
        compensation_period=data.get(
            'compensation_period',
            InternshipOffer.CompensationPeriod.NOT_SPECIFIED,
        ),
        required_skills=data.get('required_skills', []),
        preferred_skills=data.get('preferred_skills', []),
        required_languages=data.get('required_languages', []),
        min_education_level=data.get('min_education_level', ''),
        external_url=data.get('external_url', ''),
        external_source=external_source,
        external_id=external_id,
        posted_by=actor,
        status=InternshipOffer.Status.DRAFT,
        metadata_json=data.get('metadata_json', {}),
    )

    from apps.stage.services.targeting_service import build_targeting_rules_from_selection

    targeting_rules = build_targeting_rules_from_selection(
        programs=data.get('programs'),
        classes=data.get('classes'),
        levels=data.get('levels'),
        departments=data.get('departments'),
        categories=data.get('categories'),
        internship_types=data.get('internship_types'),
        raw_rules=data.get('targeting_rules') or [],
    )
    if targeting_rules:
        OfferTargetingRule.objects.bulk_create([
            OfferTargetingRule(
                offer=offer,
                rule_type=rule['rule_type'],
                value_json=rule.get('value_json', {}),
                is_inclusive=rule.get('is_inclusive', True),
                priority=rule.get('priority', 0),
            )
            for rule in targeting_rules
        ])

    offer = InternshipOffer.objects.prefetch_related('targeting_rules').get(pk=offer.pk)

    record_offer_event(
        action='CREATE',
        event_code='internship.offer.created',
        summary=f'Offer draft created: {offer.title}',
        offer_id=offer.pk,
        actor=actor,
        new_values={'status': offer.status, 'title': offer.title},
    )
    return offer


@transaction.atomic
def update_offer(*, offer: InternshipOffer, actor, data: dict[str, Any]) -> InternshipOffer:
    assert_can_manage_offers(actor)
    if offer.status == InternshipOffer.Status.DELETED:
        raise OfferValidationError('Cannot edit a deleted offer.')

    editable_fields = [
        'title', 'description', 'company_name', 'company_website', 'company_description',
        'location_city', 'location_country', 'is_remote', 'is_hybrid', 'offer_type',
        'duration_months', 'start_date', 'end_date', 'application_deadline',
        'compensation_amount', 'compensation_currency', 'compensation_period',
        'required_skills', 'preferred_skills', 'required_languages',
        'min_education_level', 'external_url', 'metadata_json',
    ]
    old_values = {f: getattr(offer, f) for f in editable_fields if f in data}
    for field in editable_fields:
        if field not in data:
            continue
        if field == 'metadata_json':
            existing = dict(offer.metadata_json or {})
            incoming = dict(data[field] or {})
            merged = {**existing, **incoming}
            desc_existing = existing.get('description_sections')
            desc_incoming = incoming.get('description_sections')
            if isinstance(desc_existing, dict) or isinstance(desc_incoming, dict):
                merged['description_sections'] = {
                    **(desc_existing if isinstance(desc_existing, dict) else {}),
                    **(desc_incoming if isinstance(desc_incoming, dict) else {}),
                }
            setattr(offer, field, merged)
            continue
        if field == 'offer_type':
            setattr(offer, field, resolve_offer_type(data[field]))
            continue
        setattr(offer, field, data[field])
    offer.save()

    targeting_keys = ('programs', 'classes', 'levels', 'departments', 'categories', 'internship_types')
    if any(k in data for k in targeting_keys):
        from apps.stage.services.targeting_service import (
            build_targeting_rules_from_selection,
            update_offer_targeting,
        )

        targeting_rules = build_targeting_rules_from_selection(
            programs=data.get('programs'),
            classes=data.get('classes'),
            levels=data.get('levels'),
            departments=data.get('departments'),
            categories=data.get('categories'),
            internship_types=data.get('internship_types'),
            raw_rules=data.get('targeting_rules') or [],
        )
        offer, _targeting_meta = update_offer_targeting(
            offer=offer,
            actor=actor,
            rule_payloads=targeting_rules,
            recalculate_matching=True,
        )

    try:
        from apps.stage.services.offer_versioning import create_offer_version

        create_offer_version(
            offer=offer,
            actor=actor,
            change_summary='Offer updated',
            track_field_changes={k: (old_values.get(k), data[k]) for k in old_values},
        )
    except Exception:
        pass

    record_offer_event(
        action='UPDATE',
        event_code='internship.offer.updated',
        summary=f'Offer updated: {offer.title}',
        offer_id=offer.pk,
        actor=actor,
        old_values=old_values,
        new_values={k: data[k] for k in old_values},
    )
    return offer


@transaction.atomic
def submit_for_review(*, offer: InternshipOffer, actor) -> InternshipOffer:
    assert_can_manage_offers(actor)
    errors = validate_offer_for_publish(offer)
    if errors:
        _raise_publish_gate(offer, errors)
    previous = offer.status
    offer = transition_offer(
        offer,
        InternshipOffer.Status.PENDING_REVIEW,
        actor=actor,
        reason='Submitted for review',
    )
    record_offer_event(
        action='UPDATE',
        event_code='internship.offer.submitted_for_review',
        summary=f'Offer submitted for review: {offer.title}',
        offer_id=offer.pk,
        actor=actor,
        old_values={'status': previous},
        new_values={'status': offer.status},
    )
    return offer


@transaction.atomic
def publish_offer(*, offer: InternshipOffer, actor, open_immediately: bool = True) -> InternshipOffer:
    assert_can_manage_offers(actor)
    errors = validate_offer_for_publish(offer)
    if errors:
        _raise_publish_gate(offer, errors)

    dup = detect_duplicate_offer(
        title=offer.title,
        company_name=offer.company_name,
        external_source=offer.external_source,
        external_id=offer.external_id,
        exclude_id=offer.pk,
    )
    if dup and dup.status in STUDENT_APPLYABLE_STATUSES:
        raise DuplicateOfferError(
            f'An active duplicate offer exists (id={dup.pk}).',
            existing_offer_id=dup.pk,
        )

    previous = offer.status
    if offer.status == InternshipOffer.Status.DRAFT:
        offer = transition_offer(offer, InternshipOffer.Status.PENDING_REVIEW, actor=actor)
    offer = transition_offer(offer, InternshipOffer.Status.PUBLISHED, actor=actor, reason='Published')
    if open_immediately:
        offer = transition_offer(offer, InternshipOffer.Status.OPEN, actor=actor, reason='Opened for applications')

    offer.reviewed_by = actor
    offer.reviewed_at = timezone.now()
    offer.save(update_fields=['reviewed_by', 'reviewed_at', 'updated_at'])

    record_offer_event(
        action='PUBLISH',
        event_code='internship.offer.published',
        summary=f'Offer published: {offer.title}',
        offer_id=offer.pk,
        actor=actor,
        old_values={'status': previous},
        new_values={'status': offer.status},
    )
    notify_offer_published(offer, actor)

    offer_id = offer.pk
    transaction.on_commit(lambda: _schedule_offer_post_publish(offer_id))

    return offer


def _schedule_offer_post_publish(offer_id: int) -> None:
    from apps.stage.jobs.celery_tasks import schedule_offer_post_publish

    schedule_offer_post_publish(offer_id)


@transaction.atomic
def archive_offer(*, offer: InternshipOffer, actor, reason: str = '') -> InternshipOffer:
    assert_can_manage_offers(actor)
    previous = offer.status
    offer = transition_offer(offer, InternshipOffer.Status.ARCHIVED, actor=actor, reason=reason or 'Archived')
    record_offer_event(
        action='ARCHIVE',
        event_code='internship.offer.archived',
        summary=f'Offer archived: {offer.title}',
        offer_id=offer.pk,
        actor=actor,
        old_values={'status': previous},
        new_values={'status': offer.status},
    )
    return offer


@transaction.atomic
def unarchive_offer(*, offer: InternshipOffer, actor, reason: str = '') -> InternshipOffer:
    assert_can_manage_offers(actor)
    if offer.status != InternshipOffer.Status.ARCHIVED:
        raise OfferTransitionError(
            'Only archived offers can be restored.',
            from_status=offer.status,
            to_status=InternshipOffer.Status.OPEN,
        )
    previous = offer.status
    offer = transition_offer(
        offer,
        InternshipOffer.Status.OPEN,
        actor=actor,
        reason=reason or 'Restored from archive',
    )
    record_offer_event(
        action='UPDATE',
        event_code='internship.offer.restored',
        summary=f'Offer restored: {offer.title}',
        offer_id=offer.pk,
        actor=actor,
        old_values={'status': previous},
        new_values={'status': offer.status},
    )
    return offer


@transaction.atomic
def close_offer(*, offer: InternshipOffer, actor, reason: str = '') -> InternshipOffer:
    assert_can_manage_offers(actor)
    previous = offer.status
    offer = transition_offer(offer, InternshipOffer.Status.CLOSED, actor=actor, reason=reason or 'Closed')
    record_offer_event(
        action='UPDATE',
        event_code='internship.offer.closed',
        summary=f'Offer closed: {offer.title}',
        offer_id=offer.pk,
        actor=actor,
        old_values={'status': previous},
        new_values={'status': offer.status},
    )
    return offer


@transaction.atomic
def soft_delete_offer(*, offer: InternshipOffer, actor, reason: str = '') -> InternshipOffer:
    from apps.stage.services.permissions import assert_can_hard_delete

    assert_can_hard_delete(actor)
    if offer.status != InternshipOffer.Status.ARCHIVED:
        offer = archive_offer(offer=offer, actor=actor, reason='Archived before deletion')
    previous = offer.status
    offer = transition_offer(offer, InternshipOffer.Status.DELETED, actor=actor, reason=reason or 'Deleted')
    record_offer_event(
        action='DELETE',
        event_code='internship.offer.deleted',
        summary=f'Offer deleted: {offer.title}',
        offer_id=offer.pk,
        actor=actor,
        old_values={'status': previous},
        new_values={'status': offer.status},
    )
    return offer


def increment_view_count(offer: InternshipOffer) -> None:
    InternshipOffer.objects.filter(pk=offer.pk).update(view_count=offer.view_count + 1)
