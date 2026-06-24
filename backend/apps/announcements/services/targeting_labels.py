"""Helpers for summarizing announcement targeting."""

from __future__ import annotations

from apps.announcements.models import Announcement, AnnouncementTarget


def summarize_target_audience(announcement: Announcement) -> str:
    if announcement.target_scope == Announcement.TargetScope.ALL_STUDENTS:
        return 'All students'

    labels: list[str] = []
    for target in announcement.targets.all():
        if target.target_type == AnnouncementTarget.TargetType.ALL:
            return 'All students'
        if target.target_type == AnnouncementTarget.TargetType.FILIERE and target.filiere_id:
            name = getattr(target.filiere, 'name', None) or getattr(target.filiere, 'code', None)
            if name:
                labels.append(str(name))
        elif target.target_type == AnnouncementTarget.TargetType.CLASS_GROUP and target.class_group_id:
            name = getattr(target.class_group, 'name', None) or getattr(target.class_group, 'code', None)
            if name:
                labels.append(str(name))
        elif target.target_type == AnnouncementTarget.TargetType.ACADEMIC_LEVEL and target.academic_level_id:
            name = getattr(target.academic_level, 'name', None) or getattr(target.academic_level, 'code', None)
            if name:
                labels.append(str(name))

    if labels:
        unique = list(dict.fromkeys(labels))
        return ', '.join(unique[:3]) + ('…' if len(unique) > 3 else '')

    return announcement.get_target_scope_display()
