"""Offer import orchestration — URL validation, extraction, draft/publish."""

from __future__ import annotations

import difflib
import hashlib
from typing import Any, NoReturn, Optional

from django.db import transaction
from django.utils import timezone

from apps.stage.models import (
    InternshipOffer,
    OfferImportHistory,
    OfferImportJob,
    OfferTargetingRule,
)
from apps.stage.services.audit_hooks import record_import_event, record_offer_event
from apps.stage.services.exceptions import DuplicateOfferError, StageServiceError
from apps.stage.services.import_html import HtmlFetchError, check_url_reachable, validate_url_format
from apps.stage.services.import_parsers import detect_platform, extract_offer_from_url
from apps.stage.services.offer_service import create_offer_draft, detect_duplicate_offer, publish_offer
from apps.stage.services.offer_types import is_canonical_offer_type, resolve_offer_type
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


def start_import_from_url(*, actor, source_url: str) -> OfferImportJob:
    """Validate reachability, then open an import job.

    Not atomic: `check_url_reachable` performs a network round-trip that must not
    hold a database transaction open, and the job row has to be committed so the
    subsequent extraction step can record its outcome against it.
    """
    assert_can_manage_offers(actor)
    try:
        validate_url_format(source_url)
        final_url = check_url_reachable(source_url)
    except HtmlFetchError as exc:
        code = getattr(exc, 'code', 'invalid_url')
        raise StageServiceError(failure_message(code), code=code) from exc

    platform_key = detect_platform(final_url)
    try:
        detected_platform = OfferImportJob.Platform(platform_key)
    except ValueError:
        detected_platform = OfferImportJob.Platform.UNKNOWN

    if detected_platform not in SUPPORTED_PLATFORMS:
        raise StageServiceError(
            failure_message('unsupported_website'),
            code='unsupported_website',
        )

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


#: Operator-facing wording per failure code. The frontend localizes on the code
#: and only falls back to these strings, so raw parser/driver exception text is
#: never shown to an administrator.
_FAILURE_MESSAGES: dict[str, str] = {
    'invalid_url': 'This URL is not valid. Paste the full link to the offer page, starting with https://',
    'unreachable': 'This website could not be reached. Check the link or try again later.',
    'not_found': 'The offer page no longer exists at this address (HTTP 404).',
    'timeout': 'The website took too long to respond. Try again in a moment.',
    'blocked': 'This website blocks automated reading. Copy the offer text and use "Paste text" instead.',
    'not_html': 'This link does not point to a web page (it may be a PDF or a file).',
    'empty_page': 'The page was reached but contained no readable content.',
    'unsupported_website': 'This website is not supported yet. Copy the offer text and use "Paste text" instead.',
    'no_content_extracted': (
        'The page was read but no offer details could be identified. '
        'Copy the offer text and use "Paste text" instead.'
    ),
    'extraction_failed': (
        'The offer details could not be extracted from this page. '
        'Copy the offer text and use "Paste text" instead.'
    ),
}


def failure_message(code: str) -> str:
    return _FAILURE_MESSAGES.get(code, _FAILURE_MESSAGES['extraction_failed'])


def run_import_extraction(job: OfferImportJob, *, actor) -> OfferImportJob:
    """Fetch and normalize the remote offer page.

    Deliberately NOT wrapped in `transaction.atomic`: the body performs a
    multi-second HTTP fetch and records progress/failure rows that must survive
    the call. Under a single atomic block a failure rolled back the FAILED status
    it had just written, and a database error turned every later bookkeeping
    write into an opaque `TransactionManagementError`.
    """
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
    except HtmlFetchError as exc:
        _fail_import(
            job,
            actor=actor,
            code=getattr(exc, 'code', 'extraction_failed'),
            technical_detail=str(exc),
        )
    except Exception as exc:
        _fail_import(
            job,
            actor=actor,
            code='extraction_failed',
            technical_detail=f'{type(exc).__name__}: {exc}',
        )

    normalized = _normalize_from_extracted(
        extracted_dict,
        source_url=job.source_url,
        detected_platform=job.detected_platform,
    )

    if not _has_usable_content(normalized):
        _fail_import(
            job,
            actor=actor,
            code='no_content_extracted',
            technical_detail=f'parser={extracted.parser_used} produced no title/description',
        )

    try:
        with transaction.atomic():
            job.extracted_data = extracted_dict
            job.normalized_data = normalized

            dup, similarity = find_duplicate_for_import(
                title=normalized.get('title', ''),
                company_name=normalized.get('company_name', ''),
                source_url=job.source_url,
            )
            if dup:
                job.duplicate_offer = dup
                job.normalized_data = {**normalized, 'duplicate_similarity': similarity}

            job.status = OfferImportJob.Status.PREVIEW_READY
            job.completed_at = timezone.now()
            job.save()

            append_history(
                job,
                OfferImportHistory.Step.DATA_EXTRACTED,
                f'Data extracted via {extracted.parser_used}',
                {
                    'parser': extracted.parser_used,
                    'fields_found': [k for k, v in extracted_dict.items() if v],
                },
            )
            append_history(job, OfferImportHistory.Step.DATA_NORMALIZED, 'Offer draft normalized')
            append_history(job, OfferImportHistory.Step.PREVIEW_GENERATED, 'Preview ready for admin review')
    except Exception as exc:
        _fail_import(
            job,
            actor=actor,
            code='extraction_failed',
            technical_detail=f'{type(exc).__name__}: {exc}',
        )

    record_import_event(
        event_code='internship.import.preview_ready',
        summary=f'Import preview ready: {normalized.get("title", job.source_url)}',
        job_id=job.pk,
        actor=actor,
        metadata={
            'platform': job.detected_platform,
            'parser': extracted.parser_used,
            'duplicate_offer_id': job.duplicate_offer_id,
        },
    )
    return job


def _has_usable_content(normalized: dict[str, Any]) -> bool:
    """A preview is only useful if the page yielded a real title or description."""
    title = str(normalized.get('title') or '').strip()
    description = str(normalized.get('description') or '').strip()
    if title and title != 'Imported internship offer':
        return True
    return len(description) >= 40


def _fail_import(
    job: OfferImportJob,
    *,
    actor,
    code: str,
    technical_detail: str = '',
) -> NoReturn:
    """Record the failure durably, then raise a user-safe service error."""
    user_message = failure_message(code)
    job.status = OfferImportJob.Status.FAILED
    job.error_message = user_message
    job.completed_at = timezone.now()
    try:
        job.save(update_fields=['status', 'error_message', 'completed_at', 'updated_at'])
        append_history(
            job,
            OfferImportHistory.Step.FAILED,
            user_message,
            {'code': code, 'detail': technical_detail[:2000]},
        )
        record_import_event(
            event_code='internship.import.failed',
            summary=f'Import failed ({code}): {job.source_url}',
            job_id=job.pk,
            actor=actor,
            metadata={'error_code': code, 'detail': technical_detail[:2000]},
        )
    except Exception:
        # Bookkeeping must never mask the original failure reported to the user.
        pass
    raise StageServiceError(user_message, code=code)


def preview_offer_from_url(source_url: str) -> dict[str, Any]:
    """Extract offer fields from a URL for student-facing preview (no import job)."""
    try:
        validate_url_format(source_url)
        final_url = check_url_reachable(source_url)
    except HtmlFetchError as exc:
        code = getattr(exc, 'code', 'invalid_url')
        raise StageServiceError(failure_message(code), code=code) from exc

    platform_key = detect_platform(final_url)
    try:
        detected_platform = OfferImportJob.Platform(platform_key)
    except ValueError:
        detected_platform = OfferImportJob.Platform.UNKNOWN

    if detected_platform not in SUPPORTED_PLATFORMS:
        raise StageServiceError(
            failure_message('unsupported_website'),
            code='unsupported_website',
        )

    try:
        extracted = extract_offer_from_url(final_url)
        extracted_dict = extracted.to_dict()
    except HtmlFetchError as exc:
        code = getattr(exc, 'code', 'extraction_failed')
        raise StageServiceError(failure_message(code), code=code) from exc
    except Exception as exc:
        raise StageServiceError(
            failure_message('extraction_failed'),
            code='extraction_failed',
        ) from exc

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
    return resolve_offer_type(value)


#: Admin-supplied targeting selections. These MUST survive the import payload
#: build: `publish_offer` refuses to publish an offer without an active
#: targeting rule, and dropping them here is what surfaced as
#: "targeting is required for publishing" ("ciblage manquant") on every
#: URL/text import.
TARGETING_PAYLOAD_KEYS = (
    'programs',
    'classes',
    'levels',
    'departments',
    'categories',
    'internship_types',
    'targeting_rules',
)

#: Scalar offer fields the admin can edit in the import review step. They were
#: previously discarded, silently losing the operator's input.
_PASSTHROUGH_PAYLOAD_KEYS = (
    'company_website',
    'company_description',
    'location_country',
    'is_remote',
    'is_hybrid',
    'duration_months',
    'start_date',
    'end_date',
    'compensation_amount',
    'compensation_currency',
    'compensation_period',
    'min_education_level',
)


def _build_offer_payload(job: OfferImportJob, overrides: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    base = dict(job.normalized_data or {})
    merged = {**base, **(overrides or {})}

    description_parts = [
        merged.get('description') or '',
        merged.get('requirements') or '',
        merged.get('benefits') or '',
    ]
    full_description = '\n\n'.join(part.strip() for part in description_parts if part and str(part).strip())

    raw_offer_type = merged.get('offer_type') or ''
    incoming_metadata = (overrides or {}).get('metadata_json')
    incoming_metadata = dict(incoming_metadata) if isinstance(incoming_metadata, dict) else {}

    metadata: dict[str, Any] = {
        **incoming_metadata,
        'import_job_uuid': str(job.uuid),
        'parser_used': merged.get('parser_used') or base.get('parser_used'),
        'source_platform': merged.get('source_platform') or base.get('source_platform'),
        'import_metadata': base.get('import_metadata') or {},
        'requirements': merged.get('requirements') or base.get('requirements') or '',
        'benefits': merged.get('benefits') or base.get('benefits') or '',
        'company_logo': merged.get('company_logo') or base.get('company_logo') or '',
    }
    if raw_offer_type and not is_canonical_offer_type(raw_offer_type):
        metadata.setdefault('academic_internship_type', str(raw_offer_type))

    payload: dict[str, Any] = {
        'title': merged.get('title') or base.get('title'),
        'company_name': merged.get('company_name') or base.get('company_name'),
        'description': full_description or merged.get('description', ''),
        'location_city': str(merged.get('location_city') or merged.get('location') or '')[:128],
        'offer_type': resolve_offer_type(raw_offer_type),
        'application_deadline': merged.get('application_deadline'),
        'required_skills': merged.get('required_skills') or [],
        'preferred_skills': merged.get('preferred_skills') or [],
        'required_languages': merged.get('required_languages') or [],
        'external_url': job.source_url,
        'external_source': str(job.detected_platform)[:64],
        'external_id': external_id_from_url(job.source_url),
        'metadata_json': metadata,
    }

    for key in _PASSTHROUGH_PAYLOAD_KEYS:
        if merged.get(key) is not None:
            payload[key] = merged[key]

    for key in TARGETING_PAYLOAD_KEYS:
        value = merged.get(key)
        if value:
            payload[key] = value

    return payload


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
        _apply_targeting_from_payload(offer, payload)
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

    fields = {
        'title': payload['title'],
        'description': payload.get('description', ''),
        'company_name': payload['company_name'],
        'location_city': (payload.get('location_city') or '')[:128],
        'offer_type': resolve_offer_type(payload.get('offer_type')),
        'application_deadline': payload.get('application_deadline'),
        'required_skills': payload.get('required_skills', []),
        'preferred_skills': payload.get('preferred_skills', []),
        'required_languages': payload.get('required_languages', []),
        'external_url': external_url,
        'external_source': (payload.get('external_source') or '')[:64],
        'external_id': external_id[:128],
        'metadata_json': payload.get('metadata_json', {}),
    }
    for key in _PASSTHROUGH_PAYLOAD_KEYS:
        if payload.get(key) is not None:
            fields[key] = payload[key]
    return fields


def _apply_targeting_from_payload(offer: InternshipOffer, payload: dict[str, Any]) -> None:
    """Persist targeting rules for offers created outside `create_offer_draft`.

    `create_offer_draft` already builds them; the duplicate-check bypass and the
    "re-approve an existing draft" paths build the row directly and would
    otherwise leave the offer unpublishable.
    """
    if not any(payload.get(key) for key in TARGETING_PAYLOAD_KEYS):
        return

    from apps.stage.services.targeting_service import build_targeting_rules_from_selection

    rules = build_targeting_rules_from_selection(
        programs=payload.get('programs'),
        classes=payload.get('classes'),
        levels=payload.get('levels'),
        departments=payload.get('departments'),
        categories=payload.get('categories'),
        internship_types=payload.get('internship_types'),
        raw_rules=payload.get('targeting_rules') or [],
    )
    if not rules:
        return

    offer.targeting_rules.all().delete()
    OfferTargetingRule.objects.bulk_create([
        OfferTargetingRule(
            offer=offer,
            rule_type=rule['rule_type'],
            value_json=rule.get('value_json', {}),
            is_inclusive=rule.get('is_inclusive', True),
            priority=rule.get('priority', 0),
        )
        for rule in rules
    ])


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
        _apply_targeting_from_payload(offer, payload)
    elif skip_duplicate_check:
        offer = InternshipOffer.objects.create(
            **{k: v for k, v in _payload_to_model_fields(payload).items()},
            posted_by=actor,
            status=InternshipOffer.Status.DRAFT,
        )
        _apply_targeting_from_payload(offer, payload)
    else:
        try:
            offer = create_offer_draft(actor=actor, data=payload)
        except DuplicateOfferError as exc:
            job.status = OfferImportJob.Status.PREVIEW_READY
            job.save(update_fields=['status', 'updated_at'])
            raise StageServiceError(str(exc), code='duplicate_offer', details={'existing_offer_id': exc.existing_offer_id}) from exc

    offer = publish_offer(offer=offer, actor=actor)

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
