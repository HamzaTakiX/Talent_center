"""Announcement recipient resolvers."""

from __future__ import annotations

from django.contrib.auth import get_user_model

from apps.accounts_et_roles.models import StudentProfile
from apps.announcements.models import Announcement, StudentAnnouncementPreference
from apps.notifications.events.resolvers.base import ResolvedRecipient
from apps.notifications.models import NotificationEvent

User = get_user_model()


def resolve_announcement_audience(event: NotificationEvent) -> list[ResolvedRecipient]:
    payload = event.payload_json or {}
    announcement_id = payload.get('announcement_id') or event.entity_id
    if not announcement_id:
        return []

    announcement = Announcement.objects.filter(pk=announcement_id).select_related('announcement_type').first()
    if not announcement:
        return []

    students = StudentProfile.objects.select_related('user').filter(user__is_active=True)
    target_filiere_ids = set(payload.get('filiere_ids') or [])
    target_class_ids = set(payload.get('class_group_ids') or [])

    if target_filiere_ids:
        students = students.filter(filiere_id__in=target_filiere_ids)
    if target_class_ids:
        students = students.filter(class_group_id__in=target_class_ids)

    recipients: list[ResolvedRecipient] = []
    for student in students:
        if not student.user_id:
            continue
        pref = StudentAnnouncementPreference.objects.filter(
            student_profile=student,
            announcement_type=announcement.announcement_type,
        ).first()
        if pref:
            if pref.is_muted or pref.is_banned or not pref.notify_via_in_app:
                continue
        recipients.append(ResolvedRecipient(student.user, 'student'))
    return recipients
