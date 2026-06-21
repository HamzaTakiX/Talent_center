"""Stage notification wrappers — delegate to centralized emit_event()."""

from __future__ import annotations

from typing import Iterable, Optional

from django.contrib.auth import get_user_model

from apps.accounts_et_roles.models import StudentProfile
from apps.notifications.events.publisher import emit_event
from apps.notifications.events.resolvers.internship import internship_admin_users
from apps.notifications.models import NotificationEvent
from apps.stage.models import InternshipOffer, OfferApplication

User = get_user_model()

# Backward compatibility for chat_service
_internship_admin_users = internship_admin_users


def emit_stage_notification(
    *,
    event_code: str,
    title: str,
    body: str,
    actor=None,
    recipient_users: Optional[Iterable[User]] = None,
    action_url: str = '/admin/internship-offers',
    entity_type: str = 'internship_offer',
    entity_id: Optional[int] = None,
    extra_payload: Optional[dict] = None,
) -> NotificationEvent:
    payload = {
        'title': title,
        'body': body,
        'action_url': action_url,
        **(extra_payload or {}),
    }
    if recipient_users is not None:
        payload['recipient_user_ids'] = [u.pk for u in recipient_users if u]
    return emit_event(
        event_code=event_code,
        source_app='stage',
        entity_type=entity_type,
        entity_id=entity_id,
        payload=payload,
        actor=actor,
    )


def notify_offer_published(offer: InternshipOffer, actor) -> NotificationEvent:
    return emit_stage_notification(
        event_code='internship.offer.published',
        title=f'Offre publiée : {offer.title}',
        body=f"L'offre {offer.title} chez {offer.company_name} est maintenant publiée.",
        actor=actor,
        entity_id=offer.pk,
        action_url=f'/admin/internship-offers/{offer.uuid}',
        extra_payload={'offer_uuid': str(offer.uuid), 'company_name': offer.company_name},
    )


def notify_application_submitted(application: OfferApplication, actor=None) -> NotificationEvent:
    student = application.student_profile
    return emit_stage_notification(
        event_code='internship.application.submitted',
        title='Nouvelle candidature reçue',
        body=f'{student.user.email} a postulé à {application.offer.title}.',
        actor=actor or (student.user if student.user_id else None),
        entity_type='offer_application',
        entity_id=application.pk,
        action_url=f'/admin/internship-offers/{application.offer.uuid}/applications',
        extra_payload={
            'offer_id': application.offer_id,
            'student_profile_id': student.pk,
        },
    )


def notify_application_status_changed(
    application: OfferApplication,
    *,
    previous_status: str,
    actor,
    recipient_users: Optional[Iterable[User]] = None,
) -> NotificationEvent:
    event_code = 'internship.application.status_changed'
    if application.status == 'ACCEPTED':
        event_code = 'internship.application.accepted'
    elif application.status == 'REJECTED':
        event_code = 'internship.application.rejected'
    elif application.status == 'SHORTLISTED':
        event_code = 'internship.application.shortlisted'
    return emit_stage_notification(
        event_code=event_code,
        title='Statut de candidature mis à jour',
        body=f'Votre candidature pour {application.offer.title} : {previous_status} → {application.status}.',
        actor=actor,
        recipient_users=recipient_users,
        entity_type='offer_application',
        entity_id=application.pk,
        action_url=f'/student/internship-offers/{application.offer.uuid}',
        extra_payload={
            'previous_status': previous_status,
            'new_status': application.status,
            'recipient_user_id': application.student_profile.user_id,
        },
    )


def notify_interview_scheduled(application: OfferApplication, actor, interview_details: dict) -> NotificationEvent:
    return emit_stage_notification(
        event_code='internship.application.interview_scheduled',
        title='Entretien planifié',
        body=f'Un entretien a été planifié pour {application.offer.title}.',
        actor=actor,
        recipient_users=[application.student_profile.user] if application.student_profile.user_id else [],
        entity_type='offer_application',
        entity_id=application.pk,
        action_url=f'/student/internship-offers/{application.offer.uuid}',
        extra_payload={**interview_details, 'recipient_user_id': application.student_profile.user_id},
    )


def notify_offer_expiring(offer: InternshipOffer, days_remaining: int) -> NotificationEvent:
    return emit_stage_notification(
        event_code='internship.offer.expiring',
        title=f'Offre expirant dans {days_remaining} jour(s)',
        body=f"L'offre {offer.title} expire bientôt.",
        entity_id=offer.pk,
        action_url=f'/admin/internship-offers/{offer.uuid}',
        extra_payload={'days_remaining': days_remaining, 'offer_uuid': str(offer.uuid)},
    )


def notify_deadline_reminder(offer: InternshipOffer) -> NotificationEvent:
    return emit_stage_notification(
        event_code='internship.offer.deadline_reminder',
        title='Rappel deadline candidatures',
        body=f'La deadline pour {offer.title} approche.',
        entity_id=offer.pk,
        action_url=f'/admin/internship-offers/{offer.uuid}',
        extra_payload={'offer_uuid': str(offer.uuid)},
    )


def notify_conversation_reply(
    *,
    student: StudentProfile,
    offer: InternshipOffer,
    actor,
    preview: str,
) -> NotificationEvent:
    return emit_stage_notification(
        event_code='internship.chat.reply',
        title=f'Nouveau message — {offer.title}',
        body=preview[:200],
        actor=actor,
        recipient_users=[student.user] if student.user_id else [],
        entity_id=offer.pk,
        action_url=f'/student/internship-offers/{offer.uuid}/chat',
        extra_payload={'recipient_user_id': student.user_id, 'offer_uuid': str(offer.uuid)},
    )
