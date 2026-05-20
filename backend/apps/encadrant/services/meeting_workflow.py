"""Meeting status transitions and timeline logging."""

from __future__ import annotations

from apps.encadrant.models import Meeting, MeetingTimelineEvent


STATUS_ACTION_MAP = {
    Meeting.Status.CONFIRMED: MeetingTimelineEvent.Action.CONFIRMED,
    Meeting.Status.IN_PROGRESS: MeetingTimelineEvent.Action.STARTED,
    Meeting.Status.COMPLETED: MeetingTimelineEvent.Action.COMPLETED,
    Meeting.Status.DELAYED: MeetingTimelineEvent.Action.DELAYED,
    Meeting.Status.RESCHEDULED: MeetingTimelineEvent.Action.RESCHEDULED,
    Meeting.Status.CANCELLED: MeetingTimelineEvent.Action.CANCELLED,
    Meeting.Status.MISSED: MeetingTimelineEvent.Action.MISSED,
    Meeting.Status.NEEDS_FOLLOWUP: MeetingTimelineEvent.Action.NEEDS_FOLLOWUP,
}


def log_meeting_event(meeting, action, *, actor=None, note='', from_status='', to_status='', payload=None):
    MeetingTimelineEvent.objects.create(
        meeting=meeting,
        action=action,
        from_status=from_status or '',
        to_status=to_status or meeting.status,
        actor=actor,
        note=note or '',
        payload_json=payload or {},
    )


def transition_meeting_status(meeting: Meeting, new_status: str, *, actor=None, note='') -> Meeting:
    old = meeting.status
    meeting.status = new_status
    meeting.save(update_fields=['status', 'updated_at'])
    action = STATUS_ACTION_MAP.get(new_status, MeetingTimelineEvent.Action.UPDATED)
    log_meeting_event(
        meeting,
        action,
        actor=actor,
        note=note,
        from_status=old,
        to_status=new_status,
    )
    try:
        from apps.history.integrations.meetings import meeting_status_changed

        meeting_status_changed(meeting=meeting, actor=actor, old_status=old, new_status=new_status)
    except Exception:
        pass
    return meeting
