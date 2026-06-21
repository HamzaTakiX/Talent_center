"""Company domain — CRUD, verification, blacklist, analytics."""

from __future__ import annotations

from typing import Any, Optional

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from django.utils.text import slugify

from apps.stage.models import InternshipOffer, OfferApplication
from apps.stage.models_extended import (
    Company,
    CompanyContact,
    CompanyDocument,
    CompanyInteraction,
    CompanyNote,
    CompanyStatusHistory,
)
from apps.stage.services.audit_hooks import record_offer_event
from apps.stage.services.exceptions import OfferPermissionError, OfferValidationError
from apps.stage.services.permissions import assert_can_manage_offers

COMPANY_TRANSITIONS: dict[str, set[str]] = {
    Company.Status.PENDING_VERIFICATION: {
        Company.Status.ACTIVE, Company.Status.VERIFIED, Company.Status.BLACKLISTED,
    },
    Company.Status.ACTIVE: {
        Company.Status.VERIFIED, Company.Status.SUSPENDED, Company.Status.ARCHIVED,
        Company.Status.BLACKLISTED,
    },
    Company.Status.VERIFIED: {
        Company.Status.SUSPENDED, Company.Status.ARCHIVED, Company.Status.BLACKLISTED,
    },
    Company.Status.SUSPENDED: {Company.Status.ACTIVE, Company.Status.ARCHIVED},
    Company.Status.ARCHIVED: {Company.Status.ACTIVE},
    Company.Status.BLACKLISTED: set(),
}


def _record_company_audit(company: Company, *, action: str, summary: str, actor, metadata: dict | None = None):
    from apps.history.audit import audit

    audit.emit(
        module='internship',
        action=action,
        event_code=f'internship.company.{action.lower()}',
        summary=summary,
        actor=actor,
        entity_type='company',
        entity_id=company.pk,
        metadata={'company_uuid': str(company.uuid), **(metadata or {})},
    )


def _transition_company(
    company: Company,
    new_status: str,
    *,
    actor,
    reason: str = '',
    is_automated: bool = False,
) -> Company:
    allowed = COMPANY_TRANSITIONS.get(company.status, set())
    if new_status not in allowed and company.status != new_status:
        raise OfferValidationError(f'Cannot transition company {company.status} → {new_status}')
    previous = company.status
    company.status = new_status
    if new_status == Company.Status.VERIFIED:
        company.verified_at = timezone.now()
        company.verified_by = actor
    if new_status == Company.Status.BLACKLISTED:
        company.blacklisted_at = timezone.now()
        company.blacklisted_reason = reason
    company.save()
    CompanyStatusHistory.objects.create(
        company=company,
        previous_status=previous,
        new_status=new_status,
        changed_by=actor,
        reason=reason,
        is_automated=is_automated,
    )
    return company


@transaction.atomic
def create_company(*, actor, data: dict[str, Any]) -> Company:
    assert_can_manage_offers(actor)
    name = (data.get('name') or '').strip()
    if len(name) < 2:
        raise OfferValidationError('Company name is required.')
    company = Company.objects.create(
        name=name,
        legal_name=data.get('legal_name', ''),
        slug=slugify(name)[:240] or f'company-{timezone.now().timestamp()}',
        website=data.get('website', ''),
        description=data.get('description', ''),
        sector=data.get('sector', ''),
        city=data.get('city', ''),
        country=data.get('country', 'Maroc'),
        status=Company.Status.PENDING_VERIFICATION,
        metadata_json=data.get('metadata_json', {}),
    )
    _record_company_audit(company, action='CREATE', summary=f'Company created: {name}', actor=actor)
    return company


@transaction.atomic
def update_company(*, company: Company, actor, data: dict[str, Any]) -> Company:
    assert_can_manage_offers(actor)
    if company.status == Company.Status.BLACKLISTED:
        raise OfferValidationError('Blacklisted companies cannot be edited.')
    for field in ('name', 'legal_name', 'website', 'description', 'sector', 'city', 'country', 'metadata_json'):
        if field in data:
            setattr(company, field, data[field])
    company.save()
    _record_company_audit(company, action='UPDATE', summary=f'Company updated: {company.name}', actor=actor)
    return company


def verify_company(*, company: Company, actor, notes: str = '') -> Company:
    assert_can_manage_offers(actor)
    company = _transition_company(company, Company.Status.VERIFIED, actor=actor, reason=notes or 'Verified')
    _record_company_audit(company, action='VERIFY', summary=f'Company verified: {company.name}', actor=actor)
    return company


def blacklist_company(*, company: Company, actor, reason: str) -> Company:
    assert_can_manage_offers(actor)
    company = _transition_company(company, Company.Status.BLACKLISTED, actor=actor, reason=reason)
    _record_company_audit(company, action='BLACKLIST', summary=f'Company blacklisted: {company.name}', actor=actor)
    return company


def archive_company(*, company: Company, actor, reason: str = '') -> Company:
    assert_can_manage_offers(actor)
    company = _transition_company(company, Company.Status.ARCHIVED, actor=actor, reason=reason or 'Archived')
    _record_company_audit(company, action='ARCHIVE', summary=f'Company archived: {company.name}', actor=actor)
    return company


def sync_offer_company_fields(offer: InternshipOffer, company: Company) -> InternshipOffer:
    offer.company = company
    offer.company_name = company.name
    offer.company_website = company.website or offer.company_website
    offer.company_description = company.description or offer.company_description
    offer.save(update_fields=['company', 'company_name', 'company_website', 'company_description', 'updated_at'])
    return offer


def company_analytics(company: Company) -> dict:
    offers = InternshipOffer.objects.filter(company=company).exclude(
        status=InternshipOffer.Status.DELETED,
    )
    apps = OfferApplication.objects.filter(offer__company=company)
    accepted = apps.filter(status=OfferApplication.Status.ACCEPTED).count()
    total_apps = apps.count()
    return {
        'company_id': company.pk,
        'company_uuid': str(company.uuid),
        'name': company.name,
        'status': company.status,
        'offer_count': offers.count(),
        'open_offers': offers.filter(status=InternshipOffer.Status.OPEN).count(),
        'total_applications': total_apps,
        'acceptance_rate': round(accepted / total_apps * 100, 2) if total_apps else 0,
        'total_views': offers.aggregate(v=Sum('view_count'))['v'] or 0,
        'avg_applications_per_offer': round(total_apps / max(offers.count(), 1), 2),
    }


def log_company_interaction(
    *,
    company: Company,
    actor,
    interaction_type: str,
    subject: str = '',
    notes: str = '',
    occurred_at=None,
) -> CompanyInteraction:
    assert_can_manage_offers(actor)
    return CompanyInteraction.objects.create(
        company=company,
        interaction_type=interaction_type,
        subject=subject,
        notes=notes,
        occurred_at=occurred_at or timezone.now(),
        performed_by=actor,
    )


def add_company_note(*, company: Company, actor, body: str, is_internal: bool = True) -> CompanyNote:
    assert_can_manage_offers(actor)
    return CompanyNote.objects.create(company=company, author=actor, body=body, is_internal=is_internal)
