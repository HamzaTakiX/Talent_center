"""Application workflow — apply, withdraw, shortlist, interview, accept, reject."""

from __future__ import annotations

from typing import Any, Optional

from django.db import transaction
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.stage.models import (
    APPLICATION_ACTIVE_STATUSES,
    ApplicationDocument,
    InternshipOffer,
    OfferApplication,
)
from apps.stage.services.application_lifecycle import transition_application
from apps.stage.services.audit_hooks import record_application_event
from apps.stage.services.exceptions import ApplicationTransitionError, OfferValidationError
from apps.stage.services.notifications import (
    notify_application_status_changed,
    notify_application_submitted,
    notify_interview_scheduled,
)
from apps.stage.services.chat_service import (
    on_application_status_changed as chat_on_application_status_changed,
    on_application_submitted as chat_on_application_submitted,
)
from apps.stage.services.offer_lifecycle import (
    PUBLICLY_VISIBLE_STATUSES,
    STUDENT_APPLYABLE_STATUSES,
    is_offer_expired,
)
from apps.stage.services.permissions import assert_can_manage_applications


def _get_student_profile(user) -> StudentProfile:
    try:
        return user.student_profile
    except StudentProfile.DoesNotExist as exc:
        raise OfferValidationError('Student profile required.') from exc


@transaction.atomic
def apply_to_offer(
    *,
    offer: InternshipOffer,
    student_user,
    cover_letter: str = '',
    student_cv_id: int | None = None,
    cv_analysis_id: int | None = None,
    documents: Optional[list[dict[str, Any]]] = None,
    external_confirmation: bool = False,
) -> OfferApplication:
    student = _get_student_profile(student_user)
    if external_confirmation:
        if not (offer.external_url or '').strip():
            raise OfferValidationError('This offer has no external application link.')
        allowed_statuses = PUBLICLY_VISIBLE_STATUSES
    else:
        allowed_statuses = STUDENT_APPLYABLE_STATUSES

    if offer.status not in allowed_statuses:
        raise OfferValidationError('This offer is not open for applications.')
    if is_offer_expired(offer):
        raise OfferValidationError('This offer has expired.')

    existing = OfferApplication.objects.filter(
        offer=offer,
        student_profile=student,
        status__in=APPLICATION_ACTIVE_STATUSES,
    ).first()
    if existing:
        raise OfferValidationError('You already have an active application for this offer.')

    match_score = None
    try:
        from apps.stage.services.matching_service import get_match_score

        match_score = get_match_score(student, offer)
    except Exception:
        pass

    application = OfferApplication.objects.create(
        offer=offer,
        student_profile=student,
        student_cv_id=student_cv_id,
        cv_analysis_id=cv_analysis_id,
        cover_letter=cover_letter,
        match_score_at_apply=match_score,
        status=OfferApplication.Status.SUBMITTED,
        metadata_json={'external_confirmation': True} if external_confirmation else {},
    )

    for doc in documents or []:
        ApplicationDocument.objects.create(
            application=application,
            document_type=doc.get('document_type', ApplicationDocument.DocumentType.OTHER),
            file=doc['file'],
            original_filename=doc.get('original_filename', ''),
            file_size_bytes=doc.get('file_size_bytes', 0),
            mime_type=doc.get('mime_type', ''),
        )

    InternshipOffer.objects.filter(pk=offer.pk).update(
        application_count=OfferApplication.objects.filter(offer_id=offer.pk).count(),
    )

    record_application_event(
        action='CREATE',
        event_code='internship.application.submitted',
        summary=f'Application submitted for {offer.title}',
        application_id=application.pk,
        offer_id=offer.pk,
        student_profile_id=student.pk,
        actor=student_user,
        new_values={'status': application.status},
    )
    notify_application_submitted(application, actor=student_user)
    chat_on_application_submitted(application, actor=student_user)
    return application


@transaction.atomic
def withdraw_application(*, application: OfferApplication, student_user, reason: str = '') -> OfferApplication:
    if application.student_profile.user_id != student_user.pk:
        raise ApplicationTransitionError('Only the applicant can withdraw.')
    previous = application.status
    application = transition_application(
        application,
        OfferApplication.Status.WITHDRAWN,
        actor=student_user,
        reason=reason or 'Withdrawn by student',
        is_student_actor=True,
    )
    record_application_event(
        action='UPDATE',
        event_code='internship.application.withdrawn',
        summary='Application withdrawn',
        application_id=application.pk,
        offer_id=application.offer_id,
        student_profile_id=application.student_profile_id,
        actor=student_user,
        old_values={'status': previous},
        new_values={'status': application.status},
    )
    notify_application_status_changed(application, previous_status=previous, actor=student_user)
    chat_on_application_status_changed(application, previous_status=previous, actor=student_user)
    return application


def _admin_transition(
    *,
    application: OfferApplication,
    target_status: str,
    actor,
    reason: str = '',
    interview_details: Optional[dict] = None,
) -> OfferApplication:
    assert_can_manage_applications(actor)
    previous = application.status
    application = transition_application(
        application,
        target_status,
        actor=actor,
        reason=reason,
    )
    record_application_event(
        action='UPDATE',
        event_code=f'internship.application.{target_status.lower()}',
        summary=f'Application status changed to {target_status}',
        application_id=application.pk,
        offer_id=application.offer_id,
        student_profile_id=application.student_profile_id,
        actor=actor,
        old_values={'status': previous},
        new_values={'status': application.status},
    )
    notify_application_status_changed(application, previous_status=previous, actor=actor)
    chat_on_application_status_changed(application, previous_status=previous, actor=actor)
    if target_status == OfferApplication.Status.INTERVIEW and interview_details:
        notify_interview_scheduled(application, actor, interview_details)
    return application


def shortlist_application(*, application: OfferApplication, actor, notes: str = '') -> OfferApplication:
    if notes:
        application.reviewer_notes = notes
        application.save(update_fields=['reviewer_notes', 'updated_at'])
    return _admin_transition(
        application=application,
        target_status=OfferApplication.Status.SHORTLISTED,
        actor=actor,
        reason=notes or 'Shortlisted',
    )


def reject_application(*, application: OfferApplication, actor, reason: str = '') -> OfferApplication:
    application.reviewer_notes = reason or application.reviewer_notes
    application.save(update_fields=['reviewer_notes', 'updated_at'])
    return _admin_transition(
        application=application,
        target_status=OfferApplication.Status.REJECTED,
        actor=actor,
        reason=reason or 'Rejected',
    )


def schedule_interview(
    *,
    application: OfferApplication,
    actor,
    interview_details: dict,
) -> OfferApplication:
    from apps.stage.services.interview_service import schedule_interview as schedule_interview_entity
    from django.utils.dateparse import parse_datetime

    scheduled_at = interview_details.get('scheduled_at')
    if isinstance(scheduled_at, str):
        scheduled_at = parse_datetime(scheduled_at)
    if not scheduled_at:
        from django.utils import timezone
        scheduled_at = timezone.now()

    schedule_interview_entity(
        application=application,
        actor=actor,
        scheduled_at=scheduled_at,
        interview_type=interview_details.get('interview_type', 'VIDEO'),
        location=interview_details.get('location', ''),
        meeting_url=interview_details.get('meeting_url', ''),
        interviewer_name=interview_details.get('interviewer_name', ''),
        simulator_session_id=interview_details.get('simulator_session_id', ''),
        duration_minutes=int(interview_details.get('duration_minutes', 45)),
    )
    application.refresh_from_db()
    return application


def accept_application(*, application: OfferApplication, actor, notes: str = '') -> OfferApplication:
    return _admin_transition(
        application=application,
        target_status=OfferApplication.Status.ACCEPTED,
        actor=actor,
        reason=notes or 'Accepted',
    )


@transaction.atomic
def student_accept_offer(*, application: OfferApplication, student_user) -> OfferApplication:
    if application.student_profile.user_id != student_user.pk:
        raise ApplicationTransitionError('Only the applicant can accept the offer.')
    previous = application.status
    application = transition_application(
        application,
        OfferApplication.Status.OFFER_ACCEPTED,
        actor=student_user,
        is_student_actor=True,
        reason='Offer accepted by student',
    )
    record_application_event(
        action='UPDATE',
        event_code='internship.application.offer_accepted',
        summary='Student accepted the offer',
        application_id=application.pk,
        offer_id=application.offer_id,
        student_profile_id=application.student_profile_id,
        actor=student_user,
        old_values={'status': previous},
        new_values={'status': application.status},
    )
    notify_application_status_changed(application, previous_status=previous, actor=student_user)
    chat_on_application_status_changed(application, previous_status=previous, actor=student_user)
    return application


@transaction.atomic
def student_decline_offer(*, application: OfferApplication, student_user, reason: str = '') -> OfferApplication:
    if application.student_profile.user_id != student_user.pk:
        raise ApplicationTransitionError('Only the applicant can decline the offer.')
    previous = application.status
    application = transition_application(
        application,
        OfferApplication.Status.OFFER_DECLINED,
        actor=student_user,
        is_student_actor=True,
        reason=reason or 'Offer declined by student',
    )
    record_application_event(
        action='UPDATE',
        event_code='internship.application.offer_declined',
        summary='Student declined the offer',
        application_id=application.pk,
        offer_id=application.offer_id,
        student_profile_id=application.student_profile_id,
        actor=student_user,
        old_values={'status': previous},
        new_values={'status': application.status},
    )
    notify_application_status_changed(application, previous_status=previous, actor=student_user)
    chat_on_application_status_changed(application, previous_status=previous, actor=student_user)
    return application


def mark_internship_started(*, application: OfferApplication, actor) -> OfferApplication:
    return _admin_transition(
        application=application,
        target_status=OfferApplication.Status.INTERNSHIP_STARTED,
        actor=actor,
        reason='Internship started',
    )


def mark_internship_completed(*, application: OfferApplication, actor, notes: str = '') -> OfferApplication:
    return _admin_transition(
        application=application,
        target_status=OfferApplication.Status.INTERNSHIP_COMPLETED,
        actor=actor,
        reason=notes or 'Internship completed',
    )
