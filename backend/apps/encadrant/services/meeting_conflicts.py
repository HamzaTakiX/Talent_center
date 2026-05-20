"""Conflict detection for encadrant meeting schedules."""

from __future__ import annotations

from django.db.models import Q

from apps.encadrant.models import Meeting


def detect_meeting_conflicts(encadrant_profile_id: int, start, end, exclude_id: int | None = None) -> list:
    """Return overlapping meetings for the same encadrant in [start, end]."""
    qs = Meeting.objects.filter(encadrant_profile_id=encadrant_profile_id).exclude(
        status__in=[Meeting.Status.CANCELLED],
    )
    if exclude_id:
        qs = qs.exclude(pk=exclude_id)

    conflicts = []
    for m in qs:
        m_start = m.planned_start or m.scheduled_at
        m_end = m.planned_end
        if not m_end and m_start:
            from datetime import timedelta
            m_end = m_start + timedelta(minutes=m.duration_minutes or 30)
        if not m_start or not m_end:
            continue
        if m_start < end and m_end > start:
            conflicts.append(m)
    return conflicts


def serialize_conflicts(meetings) -> list:
    from apps.encadrant.services.meeting_query import serialize_meeting_list_item
    return [serialize_meeting_list_item(m) for m in meetings]
