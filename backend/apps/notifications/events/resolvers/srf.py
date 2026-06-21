"""SRF recipient resolvers."""

from __future__ import annotations

from django.contrib.auth import get_user_model

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.admin_management.services.scopes import is_super_admin
from apps.notifications.events.resolvers.base import ResolvedRecipient
from apps.notifications.models import NotificationEvent

User = get_user_model()


def finance_admin_users() -> list[User]:
    admins = User.objects.filter(role=User.RoleChoices.ADMIN, is_active=True)
    result = []
    for admin in admins:
        if is_super_admin(admin):
            result.append(admin)
            continue
        if 'finance.manage' in get_admin_effective_permissions(admin):
            result.append(admin)
    return result


def _get_student(event: NotificationEvent) -> StudentProfile | None:
    payload = event.payload_json or {}
    student_id = payload.get('student_id')
    if student_id:
        return StudentProfile.objects.select_related('user').filter(pk=student_id).first()
    if event.entity_type == 'student_profile' and event.entity_id:
        return StudentProfile.objects.select_related('user').filter(pk=event.entity_id).first()
    return None


def resolve_finance_admins(event: NotificationEvent) -> list[ResolvedRecipient]:
    return [ResolvedRecipient(u, 'finance_admin') for u in finance_admin_users()]


def resolve_srf_student_and_admins(event: NotificationEvent) -> list[ResolvedRecipient]:
    recipients = [ResolvedRecipient(u, 'finance_admin') for u in finance_admin_users()]
    student = _get_student(event)
    if student and student.user_id:
        recipients.append(ResolvedRecipient(student.user, 'student'))
    return _dedupe(recipients)


def _dedupe(recipients: list[ResolvedRecipient]) -> list[ResolvedRecipient]:
    seen: set[int] = set()
    result: list[ResolvedRecipient] = []
    for item in recipients:
        if item.user.pk in seen:
            continue
        seen.add(item.user.pk)
        result.append(item)
    return result
