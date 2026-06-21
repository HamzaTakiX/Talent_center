"""Scheduled job runners for internship offers module."""

from __future__ import annotations

from django.utils import timezone

from apps.stage.models import InternshipOffer, OfferApplication
from apps.stage.services.analytics import generate_analytics_snapshot
from apps.stage.services.audit_hooks import record_offer_event
from apps.stage.services.notifications import notify_deadline_reminder, notify_offer_expiring
from apps.stage.services.offer_lifecycle import is_offer_expired, transition_offer


def close_expired_offers(*, dry_run: bool = False) -> dict:
    """Close offers past deadline or end date."""
    now = timezone.now()
    qs = InternshipOffer.objects.filter(
        status__in=[InternshipOffer.Status.OPEN, InternshipOffer.Status.PUBLISHED],
    )
    closed = 0
    for offer in qs.iterator():
        if not is_offer_expired(offer, now=now):
            continue
        if dry_run:
            closed += 1
            continue
        previous = offer.status
        transition_offer(
            offer,
            InternshipOffer.Status.EXPIRED,
            actor=None,
            reason='Automatic expiration',
            is_automated=True,
        )
        transition_offer(
            offer,
            InternshipOffer.Status.CLOSED,
            actor=None,
            reason='Closed after expiration',
            is_automated=True,
        )
        record_offer_event(
            action='UPDATE',
            event_code='internship.offer.expired',
            summary=f'Offer expired: {offer.title}',
            offer_id=offer.pk,
            is_automated=True,
            old_values={'status': previous},
            new_values={'status': offer.status},
        )
        closed += 1
    return {'closed': closed}


def send_offer_reminders(*, days_before: int = 3) -> dict:
    """Notify admins about offers expiring soon."""
    from datetime import timedelta

    now = timezone.now()
    window_end = now + timedelta(days=days_before)
    qs = InternshipOffer.objects.filter(
        status=InternshipOffer.Status.OPEN,
        application_deadline__gte=now,
        application_deadline__lte=window_end,
    )
    sent = 0
    for offer in qs:
        remaining = (offer.application_deadline - now).days
        notify_offer_expiring(offer, max(remaining, 1))
        notify_deadline_reminder(offer)
        sent += 1
    return {'reminders_sent': sent}


def recalculate_all_matching(*, limit_offers: int = 100) -> dict:
    from apps.stage.services.matching_service import recalculate_matches_for_offer

    offers = InternshipOffer.objects.filter(
        status__in=[InternshipOffer.Status.OPEN, InternshipOffer.Status.PUBLISHED],
    )[:limit_offers]
    total = 0
    for offer in offers:
        total += recalculate_matches_for_offer(offer, trigger='SCHEDULED')
    return {'students_scored': total, 'offers_processed': offers.count()}


def archive_inactive_offers(*, inactive_days: int = 90) -> dict:
    from datetime import timedelta

    cutoff = timezone.now() - timedelta(days=inactive_days)
    qs = InternshipOffer.objects.filter(
        status__in=[InternshipOffer.Status.CLOSED, InternshipOffer.Status.EXPIRED],
        updated_at__lt=cutoff,
    )
    archived = 0
    for offer in qs:
        transition_offer(
            offer,
            InternshipOffer.Status.ARCHIVED,
            actor=None,
            reason=f'Auto-archived after {inactive_days} days inactive',
            is_automated=True,
        )
        archived += 1
    return {'archived': archived}


def expire_stale_applications(*, days: int = 30) -> dict:
    from datetime import timedelta

    from apps.stage.services.application_lifecycle import transition_application

    cutoff = timezone.now() - timedelta(days=days)
    qs = OfferApplication.objects.filter(
        status=OfferApplication.Status.SUBMITTED,
        applied_at__lt=cutoff,
    )
    expired = 0
    for app in qs:
        transition_application(
            app,
            OfferApplication.Status.EXPIRED,
            actor=None,
            reason='No review activity',
            is_automated=True,
        )
        expired += 1
    return {'expired_applications': expired}


def generate_analytics_snapshots(period: str = 'daily') -> dict:
    snapshot = generate_analytics_snapshot(period=period)
    return {'snapshot_id': snapshot.pk, 'date': str(snapshot.snapshot_date)}


def process_recommendations(*, limit_students: int = 100) -> dict:
    from apps.accounts_et_roles.models import StudentProfile, User
    from apps.stage.services.recommendation_service import generate_all_recommendations

    count = 0
    students = StudentProfile.objects.filter(user__role=User.RoleChoices.STUDENT, user__is_active=True)[:limit_students]
    for student in students:
        generate_all_recommendations(student)
        count += 1
    return {'students_processed': count}


def process_webhooks(*, limit: int = 50) -> dict:
    from apps.stage.services.webhook_service import process_pending_webhook_deliveries

    return process_pending_webhook_deliveries(limit=limit)


def monitor_sla() -> dict:
    from apps.stage.services.sla_service import monitor_all_sla

    return monitor_all_sla()
