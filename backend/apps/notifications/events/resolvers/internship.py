"""Internship-related recipient resolvers."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.cache import cache

from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.admin_management.services.scopes import is_super_admin
from apps.notifications.events.resolvers.base import ResolvedRecipient, dedupe_users
from apps.notifications.models import NotificationEvent
from apps.stage.models import InternshipOffer, OfferApplication
from apps.stage.services.matching_service import top_matches_for_offer

User = get_user_model()

_INTERN_ADMINS_CACHE_KEY = 'internship:admin_user_ids'
_INTERN_ADMINS_CACHE_TTL = 120


def invalidate_internship_admin_users_cache() -> None:
    cache.delete(_INTERN_ADMINS_CACHE_KEY)


def internship_admin_users() -> list[User]:
    cached_ids = cache.get(_INTERN_ADMINS_CACHE_KEY)
    if cached_ids is not None:
        return list(
            User.objects.filter(pk__in=cached_ids)
            .select_related('admin_profile')
            .prefetch_related('role_assignments__role__role_permissions__permission')
        )

    admins = (
        User.objects.filter(role=User.RoleChoices.ADMIN, is_active=True)
        .select_related('admin_profile')
        .prefetch_related('role_assignments__role__role_permissions__permission')
    )
    result = []
    for admin in admins:
        if is_super_admin(admin):
            result.append(admin)
            continue
        if 'internship.manage' in get_admin_effective_permissions(admin):
            result.append(admin)
    cache.set(_INTERN_ADMINS_CACHE_KEY, [u.pk for u in result], _INTERN_ADMINS_CACHE_TTL)
    return result


def _get_offer(event: NotificationEvent) -> InternshipOffer | None:
    if event.entity_type == 'internship_offer' and event.entity_id:
        return InternshipOffer.objects.filter(pk=event.entity_id).first()
    offer_uuid = (event.payload_json or {}).get('offer_uuid')
    if offer_uuid:
        return InternshipOffer.objects.filter(uuid=offer_uuid).first()
    return None


def _get_application(event: NotificationEvent) -> OfferApplication | None:
    if event.entity_type == 'offer_application' and event.entity_id:
        return (
            OfferApplication.objects
            .select_related('student_profile__user', 'offer')
            .filter(pk=event.entity_id)
            .first()
        )
    return None


def resolve_internship_admins(event: NotificationEvent) -> list[ResolvedRecipient]:
    return [ResolvedRecipient(u, 'internship_admin') for u in internship_admin_users()]


def resolve_targeted_students_and_admins(event: NotificationEvent) -> list[ResolvedRecipient]:
    recipients: list[ResolvedRecipient] = [
        ResolvedRecipient(u, 'internship_admin') for u in internship_admin_users()
    ]
    offer = _get_offer(event)
    if offer:
        for match in top_matches_for_offer(offer, limit=100):
            if float(match.score) >= 30 and match.student_profile.user_id:
                recipients.append(ResolvedRecipient(match.student_profile.user, 'targeted_student'))
    return _dedupe_resolved(recipients)


def resolve_application_parties(event: NotificationEvent) -> list[ResolvedRecipient]:
    recipients = [ResolvedRecipient(u, 'internship_admin') for u in internship_admin_users()]
    application = _get_application(event)
    if application and application.student_profile.user_id:
        recipients.append(ResolvedRecipient(application.student_profile.user, 'student'))
    payload = event.payload_json or {}
    for user_id in payload.get('recipient_user_ids', []):
        user = User.objects.filter(pk=user_id).first()
        if user:
            recipients.append(ResolvedRecipient(user, 'student'))
    user_id = payload.get('recipient_user_id')
    if user_id:
        user = User.objects.filter(pk=user_id).first()
        if user:
            recipients.append(ResolvedRecipient(user, 'student'))
    return _dedupe_resolved(recipients)


def resolve_student_only(event: NotificationEvent) -> list[ResolvedRecipient]:
    application = _get_application(event)
    if application and application.student_profile.user_id:
        return [ResolvedRecipient(application.student_profile.user, 'student')]
    payload = event.payload_json or {}
    user_id = payload.get('recipient_user_id') or payload.get('user_id')
    if user_id:
        user = User.objects.filter(pk=user_id).first()
        if user:
            return [ResolvedRecipient(user, 'student')]
    if event.triggered_by_id:
        return [ResolvedRecipient(event.triggered_by, 'student')]
    return []


def _dedupe_resolved(recipients: list[ResolvedRecipient]) -> list[ResolvedRecipient]:
    seen: set[int] = set()
    result: list[ResolvedRecipient] = []
    for item in recipients:
        if item.user.pk in seen:
            continue
        seen.add(item.user.pk)
        result.append(item)
    return result
