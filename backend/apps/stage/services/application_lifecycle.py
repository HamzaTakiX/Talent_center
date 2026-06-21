"""Application status state machine — full candidate tracking workflow."""

from __future__ import annotations

from typing import Optional

from django.utils import timezone

from apps.stage.models import ApplicationStatusHistory, OfferApplication
from apps.stage.services.exceptions import ApplicationTransitionError
from apps.stage.services.permissions import assert_can_manage_applications, user_can_manage_offers

# Transitions: (requires_admin, requires_student)
APPLICATION_TRANSITIONS: dict[str, dict[str, tuple[bool, bool]]] = {
    OfferApplication.Status.SUBMITTED: {
        OfferApplication.Status.UNDER_REVIEW: (True, False),
        OfferApplication.Status.WITHDRAWN: (False, True),
        OfferApplication.Status.EXPIRED: (False, False),
    },
    OfferApplication.Status.UNDER_REVIEW: {
        OfferApplication.Status.SHORTLISTED: (True, False),
        OfferApplication.Status.REJECTED: (True, False),
        OfferApplication.Status.INTERVIEW: (True, False),
        OfferApplication.Status.WITHDRAWN: (False, True),
    },
    OfferApplication.Status.SHORTLISTED: {
        OfferApplication.Status.INTERVIEW: (True, False),
        OfferApplication.Status.ACCEPTED: (True, False),
        OfferApplication.Status.REJECTED: (True, False),
        OfferApplication.Status.WITHDRAWN: (False, True),
    },
    OfferApplication.Status.INTERVIEW: {
        OfferApplication.Status.ACCEPTED: (True, False),
        OfferApplication.Status.REJECTED: (True, False),
        OfferApplication.Status.WITHDRAWN: (False, True),
    },
    OfferApplication.Status.ACCEPTED: {
        OfferApplication.Status.OFFER_ACCEPTED: (False, True),
        OfferApplication.Status.OFFER_DECLINED: (False, True),
        OfferApplication.Status.WITHDRAWN: (False, True),
    },
    OfferApplication.Status.OFFER_ACCEPTED: {
        OfferApplication.Status.INTERNSHIP_STARTED: (True, False),
        OfferApplication.Status.OFFER_DECLINED: (False, True),
        OfferApplication.Status.WITHDRAWN: (False, True),
    },
    OfferApplication.Status.INTERNSHIP_STARTED: {
        OfferApplication.Status.INTERNSHIP_COMPLETED: (True, False),
    },
}

TERMINAL_APPLICATION_STATUSES = {
    OfferApplication.Status.REJECTED,
    OfferApplication.Status.WITHDRAWN,
    OfferApplication.Status.EXPIRED,
    OfferApplication.Status.OFFER_DECLINED,
    OfferApplication.Status.INTERNSHIP_COMPLETED,
}


def can_transition_application(application: OfferApplication, target_status: str) -> bool:
    return target_status in APPLICATION_TRANSITIONS.get(application.status, {})


def validate_application_transition(
    application: OfferApplication,
    target_status: str,
    *,
    actor=None,
    is_student_actor: bool = False,
    is_automated: bool = False,
) -> None:
    if application.status == target_status:
        raise ApplicationTransitionError(
            f'Application is already in status {target_status}.',
            from_status=application.status,
            to_status=target_status,
        )
    rule = APPLICATION_TRANSITIONS.get(application.status, {}).get(target_status)
    if rule is None:
        raise ApplicationTransitionError(
            f'Transition {application.status} → {target_status} is not allowed.',
            from_status=application.status,
            to_status=target_status,
        )
    requires_admin, requires_student = rule
    if is_automated:
        return
    if requires_admin:
        if not actor or not user_can_manage_offers(actor):
            assert_can_manage_applications(actor)
    if requires_student and not is_student_actor:
        raise ApplicationTransitionError(
            'This transition must be performed by the student.',
            from_status=application.status,
            to_status=target_status,
        )


def apply_application_side_effects(
    application: OfferApplication,
    target_status: str,
    *,
    now=None,
    actor=None,
) -> None:
    now = now or timezone.now()
    application.last_status_change_at = now
    if target_status in (
        OfferApplication.Status.UNDER_REVIEW,
        OfferApplication.Status.SHORTLISTED,
        OfferApplication.Status.INTERVIEW,
        OfferApplication.Status.REJECTED,
    ):
        application.reviewed_at = now
        if actor:
            application.reviewed_by = actor
    if target_status == OfferApplication.Status.ACCEPTED:
        application.accepted_at = now
    if target_status == OfferApplication.Status.REJECTED:
        application.rejected_at = now
    if target_status == OfferApplication.Status.WITHDRAWN:
        application.withdrawn_at = now


def transition_application(
    application: OfferApplication,
    target_status: str,
    *,
    actor=None,
    reason: str = '',
    is_student_actor: bool = False,
    is_automated: bool = False,
    metadata: Optional[dict] = None,
) -> OfferApplication:
    validate_application_transition(
        application,
        target_status,
        actor=actor,
        is_student_actor=is_student_actor,
        is_automated=is_automated,
    )
    previous = application.status
    application.status = target_status
    apply_application_side_effects(application, target_status, actor=actor)
    application.save()

    ApplicationStatusHistory.objects.create(
        application=application,
        previous_status=previous,
        new_status=target_status,
        changed_by=actor,
        reason=reason,
        is_automated=is_automated,
        metadata_json=metadata or {},
    )
    return application
