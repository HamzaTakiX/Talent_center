"""Offer status state machine — transitions, validations, permissions."""

from __future__ import annotations

from typing import Optional

from django.utils import timezone

from apps.stage.models import InternshipOffer, OfferStatusHistory
from apps.stage.services.exceptions import OfferTransitionError
from apps.stage.services.permissions import assert_can_hard_delete, user_can_manage_offers

# Allowed transitions: current_status -> {target_status: (requires_manage, requires_super)}
OFFER_TRANSITIONS: dict[str, dict[str, tuple[bool, bool]]] = {
    InternshipOffer.Status.DRAFT: {
        InternshipOffer.Status.PENDING_REVIEW: (True, False),
        InternshipOffer.Status.DELETED: (True, True),
    },
    InternshipOffer.Status.PENDING_REVIEW: {
        InternshipOffer.Status.DRAFT: (True, False),
        InternshipOffer.Status.PUBLISHED: (True, False),
    },
    InternshipOffer.Status.PUBLISHED: {
        InternshipOffer.Status.OPEN: (True, False),
        InternshipOffer.Status.CLOSED: (True, False),
        InternshipOffer.Status.EXPIRED: (False, False),
        InternshipOffer.Status.ARCHIVED: (True, False),
    },
    InternshipOffer.Status.OPEN: {
        InternshipOffer.Status.CLOSED: (True, False),
        InternshipOffer.Status.EXPIRED: (False, False),  # automated
        InternshipOffer.Status.ARCHIVED: (True, False),
    },
    InternshipOffer.Status.CLOSED: {
        InternshipOffer.Status.ARCHIVED: (True, False),
        InternshipOffer.Status.OPEN: (True, False),
    },
    InternshipOffer.Status.EXPIRED: {
        InternshipOffer.Status.ARCHIVED: (True, False),
        InternshipOffer.Status.CLOSED: (True, False),
    },
    InternshipOffer.Status.ARCHIVED: {
        InternshipOffer.Status.DELETED: (True, True),
        InternshipOffer.Status.DRAFT: (True, False),
    },
}

TERMINAL_OFFER_STATUSES = {
    InternshipOffer.Status.DELETED,
}

PUBLICLY_VISIBLE_STATUSES = {
    InternshipOffer.Status.PUBLISHED,
    InternshipOffer.Status.OPEN,
}

STUDENT_APPLYABLE_STATUSES = {
    InternshipOffer.Status.OPEN,
}


def can_transition(offer: InternshipOffer, target_status: str) -> bool:
    allowed = OFFER_TRANSITIONS.get(offer.status, {})
    return target_status in allowed


def validate_transition(
    offer: InternshipOffer,
    target_status: str,
    *,
    actor=None,
    is_automated: bool = False,
) -> None:
    if offer.status == target_status:
        raise OfferTransitionError(
            f'Offer is already in status {target_status}.',
            from_status=offer.status,
            to_status=target_status,
        )
    allowed = OFFER_TRANSITIONS.get(offer.status, {})
    rule = allowed.get(target_status)
    if rule is None:
        raise OfferTransitionError(
            f'Transition {offer.status} → {target_status} is not allowed.',
            from_status=offer.status,
            to_status=target_status,
        )
    requires_manage, requires_super = rule
    if requires_manage and not is_automated:
        if not actor or not user_can_manage_offers(actor):
            raise OfferTransitionError(
                'Insufficient permissions for this offer transition.',
                from_status=offer.status,
                to_status=target_status,
            )
    if requires_super and not is_automated:
        assert_can_hard_delete(actor)


def apply_status_side_effects(
    offer: InternshipOffer,
    target_status: str,
    *,
    now=None,
) -> None:
    now = now or timezone.now()
    if target_status == InternshipOffer.Status.PENDING_REVIEW:
        offer.submitted_for_review_at = now
    elif target_status == InternshipOffer.Status.PUBLISHED:
        offer.published_at = now
    elif target_status == InternshipOffer.Status.OPEN:
        offer.opened_at = now
    elif target_status == InternshipOffer.Status.CLOSED:
        offer.closed_at = now
    elif target_status == InternshipOffer.Status.ARCHIVED:
        offer.archived_at = now
    elif target_status == InternshipOffer.Status.DELETED:
        offer.deleted_at = now


def transition_offer(
    offer: InternshipOffer,
    target_status: str,
    *,
    actor=None,
    reason: str = '',
    is_automated: bool = False,
    metadata: Optional[dict] = None,
) -> InternshipOffer:
    validate_transition(offer, target_status, actor=actor, is_automated=is_automated)
    previous = offer.status
    offer.status = target_status
    apply_status_side_effects(offer, target_status)
    offer.save()

    OfferStatusHistory.objects.create(
        offer=offer,
        previous_status=previous,
        new_status=target_status,
        changed_by=actor,
        reason=reason,
        is_automated=is_automated,
        metadata_json=metadata or {},
    )
    return offer


def is_offer_expired(offer: InternshipOffer, *, now=None) -> bool:
    now = now or timezone.now()
    if offer.application_deadline and offer.application_deadline < now:
        return True
    if offer.end_date and offer.end_date < now.date():
        return True
    return False
