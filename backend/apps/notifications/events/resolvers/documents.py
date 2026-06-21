"""Document recipient resolvers."""

from __future__ import annotations

from django.contrib.auth import get_user_model

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.admin_management.services.scopes import is_super_admin
from apps.notifications.events.resolvers.base import ResolvedRecipient
from apps.notifications.models import NotificationEvent

User = get_user_model()


def document_admin_users() -> list[User]:
    admins = User.objects.filter(role=User.RoleChoices.ADMIN, is_active=True)
    result = []
    for admin in admins:
        if is_super_admin(admin):
            result.append(admin)
            continue
        perms = get_admin_effective_permissions(admin)
        if 'documents.manage' in perms or 'admin.manage' in perms:
            result.append(admin)
    return result


def resolve_document_student(event: NotificationEvent) -> list[ResolvedRecipient]:
    payload = event.payload_json or {}
    student_id = payload.get('student_id') or payload.get('student_profile_id')
    if student_id:
        student = StudentProfile.objects.select_related('user').filter(pk=student_id).first()
        if student and student.user_id:
            return [ResolvedRecipient(student.user, 'student')]
    user_id = payload.get('user_id') or payload.get('recipient_user_id')
    if user_id:
        user = User.objects.filter(pk=user_id).first()
        if user:
            return [ResolvedRecipient(user, 'student')]
    return []


def resolve_document_admins(event: NotificationEvent) -> list[ResolvedRecipient]:
    return [ResolvedRecipient(u, 'document_admin') for u in document_admin_users()]
