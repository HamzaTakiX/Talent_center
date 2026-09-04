"""
Keep the calendar in step with supervision meetings.

Meetings are also created outside the calendar — by admin supervision
scheduling and by the collaboration session flow. Projecting them here means a
student sees a meeting an admin booked for them without the calendar and the
meeting list ever disagreeing.

Living in this app rather than in ``apps.encadrant`` keeps the dependency
one-directional: the calendar knows about meetings, meetings know nothing about
the calendar, so removing this app would leave the supervision flow intact.
"""

from __future__ import annotations

import logging

from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from apps.encadrant.models import Meeting

from .models import CalendarEvent, EventSource

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Meeting, dispatch_uid='agenda_project_meeting')
def project_meeting_to_calendar(sender, instance: Meeting, **kwargs) -> None:
    """Mirror a scheduled meeting into the calendar. Never breaks the save."""
    from .services.integrations import project_meeting
    from .services.realtime import broadcast

    try:
        event = project_meeting(instance)
    except Exception:
        logger.exception('Failed to project meeting %s into the calendar', instance.pk)
        return
    if event is None:
        return
    try:
        broadcast(event, 'created' if kwargs.get('created') else 'updated')
    except Exception:
        logger.exception('Failed to broadcast calendar projection for meeting %s', instance.pk)


@receiver(pre_delete, sender=Meeting, dispatch_uid='agenda_unproject_meeting')
def remove_projected_event(sender, instance: Meeting, **kwargs) -> None:
    """
    Drop the mirror row, leaving calendar-authored events that merely link to it.

    ``pre_delete`` rather than ``post_delete``: the ``meeting`` FK is SET_NULL,
    and Django applies those updates before firing post-delete, so by then the
    projection would no longer be findable.
    """
    try:
        CalendarEvent.objects.filter(meeting_id=instance.pk, source=EventSource.MEETING).delete()
    except Exception:
        logger.exception('Failed to remove calendar projection for meeting %s', instance.pk)
