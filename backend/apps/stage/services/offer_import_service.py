"""Offer import orchestration — URL validation, extraction, draft/publish."""

from __future__ import annotations

import difflib
import hashlib
from typing import Any, Optional

from django.db import transaction
from django.utils import timezone

from apps.stage.models import InternshipOffer, OfferImportHistory, OfferImportJob
from apps.stage.services.audit_hooks import record_import_event, record_offer_event
from apps.stage.services.exceptions import DuplicateOfferError, StageServiceError
from apps.stage.services.import_html import HtmlFetchError, check_url_reachable, validate_url_format
from apps.stage.services.import_parsers import detect_platform, extract_offer_from_url
from apps.stage.services.matching_service import recalculate_matches_for_offer
from apps.stage.services.offer_service import create_offer_draft, detect_duplicate_offer, publish_offer
from apps.stage.services.permissions import assert_can_manage_offers


SUPPORTED_PLATFORMS = {
    OfferImportJob.Platform.LINKEDIN,
    OfferImportJob.Platform.INDEED,
    OfferImportJob.Platform.REKRUTE,
    OfferImportJob.Platform.EMPLOI_MA,
    OfferImportJob.Platform.NOVOJOB,
    OfferImportJob.Platform.COMPANY_WEBSITE,
    OfferImportJob.Platform.UNKNOWN,
}


def external_id_from_url(url: str) -> str:
    """Stable short identifier for external_url (fits varchar(128))."""
    normalized = (url or '').strip()
    if not normalized:
        return ''
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()


def append_history(job: OfferImportJob, step: str, message: str = '', payload: Optional[dict] = None) -> None:
    OfferImportHistory.objects.create(
        job=job,
        step=step,
        message=message,
        payload_json=payload or {},
    )


def compute_duplicate_similarity(
    *,
    title: str,
    company_name: str,
    duplicate: InternshipOffer,
) -> int:
    title_ratio = difflib.SequenceMatcher(
        None,
        (title or '').lower().strip(),
        (duplicate.title or '').lower().strip(),
    ).ratio()
    company_ratio = difflib.SequenceMatcher(
        None,
        (company_name or '').lower().strip(),
        (duplicate.company_name or '').lower().strip(),
    ).ratio()
    return int(round((title_ratio * 0.7 + company_ratio * 0.3) * 100))


def duplicate_offer_days_ago(offer: InternshipOffer) -> int:
    ref = offer.published_at or offer.created_at
    if not ref:
        return 0
    delta = timezone.now() - ref
    return max(0, delta.days)


def find_duplicate_for_import(
    *,
    title: str,
    company_name: str,
    source_url: str,
) -> tuple[InternshipOffer | None, int]:
    dup = InternshipOffer.objects.filter(
        external_url=source_url,
    ).exclude(
        status=InternshipOffer.Status.DELETED,
    ).first()
    if dup:
        return dup, 100

    dup = detect_duplicate_offer(
        title=title,
        company_name=company_name,
        external_source='url_import',
        external_id=external_id_from_url(source_url),
    )
    if dup:
        return dup, compute_duplicate_similarity(
            title=title,
            company_name=company_name,
            duplicate=dup,
        )
    return None, 0


def get_import_analytics() -> dict[str, Any]:
    qs = OfferImportJob.objects.all()
    total = qs.count()
    published = qs.filter(status=OfferImportJob.Status.COMPLETED, resulting_offer__isnull=False).count()
    failed = qs.filter(status=OfferImportJob.Status.FAILED).count()
    by_platform: dict[str, int] = {}
    for row in qs.values('detected_platform').order_by().distinct():
        platform = row['detected_platform'] or 'UNKNOWN'
        by_platform[platform] = qs.filter(detected_platform=platform).count()
    successful = qs.filter(status__in=[
        OfferImportJob.Status.PREVIEW_READY,
        OfferImportJob.Status.COMPLETED,
        OfferImportJob.Status.AWAITING_ADMIN,
    ]).count()
    return {
        'total_imports': total,
        'published_imports': published,
        'failed_imports': failed,
        'successful_extractions': successful,
        'source_distribution': by_platform,
    }


@transaction.atomic
def start_import_from_url(*, actor, source_url: str) -> OfferImportJob:
    assert_can_manage_offers(actor)
    try:
        validate_url_format(source_url)
        final_url = check_url_reachable(source_url)
    except HtmlFetchError as exc:
        raise StageServiceError(str(exc), code=getattr(exc, 'code', 'invalid_url')) from exc

    platform_key = detect_platform(final_url)
    try:
        detected_platform = OfferImportJob.Platform(platform_key)
    except ValueError:
        detected_platform = OfferImportJob.Platform.UNKNOWN

    if detected_platform not in SUPPORTED_PLATFORMS:
        raise StageServiceError('Unsupported website.', code='unsupported_website')

    job = OfferImportJob.objects.create(
        source_url=final_url,
        detected_platform=detected_platform,
        status=OfferImportJob.Status.PENDING,
        initiated_by=actor,
    )
    append_history(job, OfferImportHistory.Step.URL_VALIDATED, 'URL validated and reachable')
    record_import_event(
        event_code='internship.import.started',
        summary=f'Import started from {final_url}',
        job_id=job.pk,
        actor=actor,
        metadata={'source_url': final_url, 'platform': detected_platform},
    )
    return job


@transaction.atomic
def run_import_extraction(job: OfferImportJob, *, actor) -> OfferImportJob:
    assert_can_manage_offers(actor)
    job.status = OfferImportJob.Status.VALIDATING
    job.save(update_fields=['status', 'updated_at'])

    append_history(
        job,
        OfferImportHistory.Step.PLATFORM_DETECTED,
        f'Platform detected: {job.detected_platform}',
        {'platform': job.detected_platform},
    )

    job.status = OfferImportJob.Status.EXTRACTING
    job.save(update_fields=['status', 'updated_at'])

    try:
        extracted = extract_offer_from_url(job.source_url)
        extracted_dict = extracted.to_dict()
        job.extracted_data = extracted_dict
        append_history(
            job,
            OfferImportHistory.Step.DATA_EXTRACTED,
            f'Data extracted via {extracted.parser_used}',
            {'parser': extracted.parser_used, 'fields_found': list(k for k, v in extracted_dict.items() if v)},
        )

        normalized = _normalize_from_extracted(
            extracted_dict,
            source_url=job.source_url,
            detected_platform=job.detected_platform,
        )
        job.normalized_data = normalized
        append_history(job, OfferImportHistory.Step.DATA_NORMALIZED, 'Offer draft normalized')

        dup, similarity = find_duplicate_for_import(
            title=normalized.get('title', ''),
            company_name=normalized.get('company_name', ''),
            source_url=job.source_url,
        )
        if dup:
            job.duplicate_offer = dup
            job.normalized_data = {
                **normalized,
                'duplicate_similarity': similarity,
            }

        job.status = OfferImportJob.Status.PREVIEW_READY
        job.completed_at = timezone.now()
        job.save()
        append_history(job, OfferImportHistory.Step.PREVIEW_GENERATED, 'Preview ready for admin review')

        record_import_event(
            event_code='internship.import.preview_ready',
            summary=f'Import preview ready: {normalized.get("title", job.source_url)}',
            job_id=job.pk,
            actor=actor,
            metadata={
                'platform': job.detected_platform,
                'parser': extracted.parser_used,
                'duplicate_offer_id': dup.pk if dup else None,
            },
        )
        return job
    except HtmlFetchError as exc:
        return _fail_import(job, actor=actor, message=str(exc), code=getattr(exc, 'code', 'fetch_failed'))
    except Exception as exc:
        return _fail_import(job, actor=actor, message=str(exc), code='extraction_failed')


def _fail_import(job: OfferImportJob, *, actor, message: str, code: str) -> OfferImportJob:
    job.status = OfferImportJob.Status.FAILED
    job.error_message = message
    job.completed_at = timezone.now()
    job.save(update_fields=['status', 'error_message', 'completed_at', 'updated_at'])
    append_history(job, OfferImportHistory.Step.FAILED, message, {'code': code})
    record_import_event(
        event_code='internship.import.failed',
        summary=f'Import failed: {message}',
        job_id=job.pk,
        actor=actor,
        metadata={'error_code': code},
    )
    raise StageServiceError(message, code=code)


def preview_offer_from_url(source_url: str) -> dict[str, Any]:
    """Extract offer fields from a URL for student-facing preview (no import job)."""
    try:
        validate_url_format(source_url)
        final_url = check_url_reachable(source_url)
    except HtmlFetchError as exc:
        raise StageServiceError(str(exc), code=getattr(exc, 'code', 'invalid_url')) from exc

    platform_key = detect_platform(final_url)
    try:
        detected_platform = OfferImportJob.Platform(platform_key)
    except ValueError:
        detected_platform = OfferImportJob.Platform.UNKNOWN

    if detected_platform not in SUPPORTED_PLATFORMS:
        raise StageServiceError('Unsupported website.', code='unsupported_website')

    try:
        extracted = extract_offer_from_url(final_url)
        extracted_dict = extracted.to_dict()
    except HtmlFetchError as exc:
        raise StageServiceError(str(exc), code=getattr(exc, 'code', 'extraction_failed')) from exc
    except Exception as exc:
        raise StageServiceError('Could not extract offer from this URL.', code='extraction_failed') from exc

    normalized = _normalize_from_extracted(
        extracted_dict,
        source_url=final_url,
        detected_platform=detected_platform,
    )
    return {
        'title': normalized.get('title', ''),
        'company_name': normalized.get('company_name', ''),
        'description': normalized.get('description', ''),
        'requirements': normalized.get('requirements', ''),
        'benefits': normalized.get('benefits', ''),
        'location_city': normalized.get('location_city', ''),
        'required_skills': normalized.get('required_skills', []),
        'company_logo': normalized.get('company_logo', ''),
        'source_platform': normalized.get('source_platform', ''),
        'parser_used': normalized.get('parser_used', ''),
        'source_url': final_url,
    }


def _normalize_from_extracted(
    extracted: dict[str, Any],
    *,
    source_url: str,
    detected_platform: str,
) -> dict[str, Any]:
    skills = extracted.get('skills') or []
    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(',') if s.strip()]

    description = extracted.get('description') or ''
    requirements = extracted.get('requirements') or ''
    benefits = extracted.get('benefits') or ''

    offer_type = _map_internship_type(extracted.get('internship_type') or '')

    return {
        'title': extracted.get('title') or 'Imported internship offer',
        'company_name': extracted.get('company_name') or 'Unknown company',
        'description': description,
        'requirements': requirements,
        'benefits': benefits,
        'location_city': (extracted.get('location') or '')[:128],
        'required_skills': skills,
        'preferred_skills': [],
        'required_languages': [],
        'offer_type': offer_type,
        'application_deadline': extracted.get('application_deadline') or None,
        'external_url': source_url,
        'external_source': detected_platform,
        'external_id': external_id_from_url(source_url),
        'company_logo': extracted.get('company_logo') or '',
        'parser_used': extracted.get('parser_used') or '',
        'source_platform': extracted.get('source_platform') or detected_platform,
        'import_metadata': {
            'import_date': timezone.now().isoformat(),
            'employment_type': extracted.get('employment_type') or '',
            'published_date': extracted.get('published_date') or '',
            'raw_content_preview': (extracted.get('raw_content') or '')[:500],
            'parser_metadata': extracted.get('metadata') or {},
        },
    }


def _map_internship_type(value: str) -> str:
    normalized = (value or '').lower()
    mapping = {
        'pfe': InternshipOffer.OfferType.PFE,
        'pfa': InternshipOffer.OfferType.PFA,
        'alternance': InternshipOffer.OfferType.ALTERNANCE,
        'summer': InternshipOffer.OfferType.INTERNSHIP,
        'observation': InternshipOffer.OfferType.INTERNSHIP,
        'internship': InternshipOffer.OfferType.INTERNSHIP,
        'stage': InternshipOffer.OfferType.INTERNSHIP,
        'job': InternshipOffer.OfferType.JOB,
        'emploi': InternshipOffer.OfferType.JOB,
        'cdi': InternshipOffer.OfferType.JOB,
        'cdd': InternshipOffer.OfferType.JOB,
    }
    for key, offer_type in mapping.items():
        if key in normalized:
            return offer_type
    return InternshipOffer.OfferType.INTERNSHIP


def _build_offer_payload(job: OfferImportJob, overrides: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    base = dict(job.normalized_data or {})
    merged = {**base, **(overrides or {})}

    description_parts = [
        merged.get('description') or '',
        merged.get('requirements') or '',
        merged.get('benefits') or '',
    ]
    full_description = '\n\n'.join(part.strip() for part in description_parts if part and str(part).strip())

    return {
        'title': merged.get('title') or base.get('title'),
        'company_name': merged.get('company_name') or base.get('company_name'),
        'description': full_description or merged.get('description', ''),
        'location_city': (merged.get('location_city') or merged.get('location') or '')[:128],
        'offer_type': merged.get('offer_type') or InternshipOffer.OfferType.INTERNSHIP,
        'application_deadline': merged.get('application_deadline'),
        'required_skills': merged.get('required_skills') or [],
        'preferred_skills': merged.get('preferred_skills') or [],
        'required_languages': merged.get('required_languages') or [],
        'external_url': job.source_url,
        'external_source': str(job.detected_platform)[:64],
        'external_id': external_id_from_url(job.source_url),
        'metadata_json': {
            'import_job_uuid': str(job.uuid),
            'parser_used': merged.get('parser_used') or base.get('parser_used'),
            'source_platform': merged.get('source_platform') or base.get('source_platform'),
            'import_metadata': base.get('import_metadata') or {},
            'requirements': merged.get('requirements') or base.get('requirements') or '',
            'benefits': merged.get('benefits') or base.get('benefits') or '',
            'company_logo': merged.get('company_logo') or base.get('company_logo') or '',
        },
    }


@transaction.atomic
def save_import_as_draft(
    job: OfferImportJob,
    *,
    actor,
    overrides: Optional[dict[str, Any]] = None,
    skip_duplicate_check: bool = False,
) -> InternshipOffer:
    assert_can_manage_offers(actor)
    if job.status not in (OfferImportJob.Status.PREVIEW_READY, OfferImportJob.Status.AWAITING_ADMIN):
        raise StageServiceError('Import job is not ready for draft save.', code='invalid_state')

    payload = _build_offer_payload(job, overrides)
    if skip_duplicate_check:
        offer = InternshipOffer.objects.create(
            **{k: v for k, v in _payload_to_model_fields(payload).items()},
            posted_by=actor,
            status=InternshipOffer.Status.DRAFT,
        )
    else:
        try:
            offer = create_offer_draft(actor=actor, data=payload)
        except DuplicateOfferError as exc:
            raise StageServiceError(str(exc), code='duplicate_offer') from exc

    job.resulting_offer = offer
    job.status = OfferImportJob.Status.COMPLETED
    job.save(update_fields=['resulting_offer', 'status', 'updated_at'])
    append_history(job, OfferImportHistory.Step.ADMIN_APPROVED, 'Draft saved without publish')

    record_import_event(
        event_code='internship.import.draft_created',
        summary=f'Import draft created: {offer.title}',
        job_id=job.pk,
        actor=actor,
        metadata={'offer_id': offer.pk, 'offer_uuid': str(offer.uuid)},
    )
    record_offer_event(
        action='CREATE',
        event_code='internship.offer.import_draft_created',
        summary=f'Offer draft created from import: {offer.title}',
        offer_id=offer.pk,
        actor=actor,
        metadata={'import_job_id': job.pk},
    )
    return offer


def _payload_to_model_fields(payload: dict[str, Any]) -> dict[str, Any]:
    external_url = payload.get('external_url', '')
    external_id = payload.get('external_id', '')
    if external_url and (not external_id or len(external_id) > 128):
        external_id = external_id_from_url(external_url)

    return {
        'title': payload['title'],
        'description': payload.get('description', ''),
        'company_name': payload['company_name'],
        'location_city': (payload.get('location_city') or '')[:128],
        'offer_type': payload.get('offer_type', InternshipOffer.OfferType.INTERNSHIP),
        'application_deadline': payload.get('application_deadline'),
        'required_skills': payload.get('required_skills', []),
        'preferred_skills': payload.get('preferred_skills', []),
        'required_languages': payload.get('required_languages', []),
        'external_url': external_url,
        'external_source': (payload.get('external_source') or '')[:64],
        'external_id': external_id[:128],
        'metadata_json': payload.get('metadata_json', {}),
    }


@transaction.atomic
def approve_import_and_publish(
    job: OfferImportJob,
    *,
    actor,
    overrides: Optional[dict[str, Any]] = None,
    skip_duplicate_check: bool = False,
) -> InternshipOffer:
    assert_can_manage_offers(actor)
    if job.status not in (OfferImportJob.Status.PREVIEW_READY, OfferImportJob.Status.AWAITING_ADMIN):
        raise StageServiceError('Import job is not ready for approval.', code='invalid_state')

    job.status = OfferImportJob.Status.PUBLISHING
    job.save(update_fields=['status', 'updated_at'])

    payload = _build_offer_payload(job, overrides)

    if job.resulting_offer_id:
        offer = job.resulting_offer
        for field, value in _payload_to_model_fields(payload).items():
            setattr(offer, field, value)
        offer.save()
    elif skip_duplicate_check:
        offer = InternshipOffer.objects.create(
            **{k: v for k, v in _payload_to_model_fields(payload).items()},
            posted_by=actor,
            status=InternshipOffer.Status.DRAFT,
        )
    else:
        try:
            offer = create_offer_draft(actor=actor, data=payload)
        except DuplicateOfferError as exc:
            job.status = OfferImportJob.Status.PREVIEW_READY
            job.save(update_fields=['status', 'updated_at'])
            raise StageServiceError(str(exc), code='duplicate_offer', details={'existing_offer_id': exc.existing_offer_id}) from exc

    offer = publish_offer(offer=offer, actor=actor)
    recalculate_matches_for_offer(offer)

    job.resulting_offer = offer
    job.status = OfferImportJob.Status.COMPLETED
    job.completed_at = timezone.now()
    job.save()

    append_history(job, OfferImportHistory.Step.OFFER_PUBLISHED, f'Offer published: {offer.title}')
    record_import_event(
        event_code='internship.import.completed',
        summary=f'Import published: {offer.title}',
        job_id=job.pk,
        actor=actor,
        metadata={'offer_id': offer.pk, 'offer_uuid': str(offer.uuid)},
    )
    return offer


@transaction.atomic
def reject_import(job: OfferImportJob, *, actor, reason: str = '') -> OfferImportJob:
    assert_can_manage_offers(actor)
    job.status = OfferImportJob.Status.CANCELLED
    job.error_message = reason or 'Rejected by admin'
    job.completed_at = timezone.now()
    job.save(update_fields=['status', 'error_message', 'completed_at', 'updated_at'])
    append_history(job, OfferImportHistory.Step.ADMIN_REJECTED, reason or 'Rejected by admin')
    record_import_event(
        event_code='internship.import.rejected',
        summary=f'Import rejected: {job.source_url}',
        job_id=job.pk,
        actor=actor,
        metadata={'reason': reason},
    )
    return job
