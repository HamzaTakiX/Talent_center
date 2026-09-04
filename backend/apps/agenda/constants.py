"""Shared agenda constants and cross-module contracts."""

from __future__ import annotations

# Notification event codes registered in apps.notifications.events.registry.
EVENT_CREATED = 'agenda.event.created'
EVENT_UPDATED = 'agenda.event.updated'
EVENT_CANCELLED = 'agenda.event.cancelled'
EVENT_RESCHEDULED = 'agenda.event.rescheduled'
EVENT_REMINDER = 'agenda.event.reminder'
INVITATION_SENT = 'agenda.invitation.sent'
INVITATION_ANSWERED = 'agenda.invitation.answered'
PARTICIPANT_REMOVED = 'agenda.participant.removed'

AGENDA_EVENT_CODES = (
    EVENT_CREATED,
    EVENT_UPDATED,
    EVENT_CANCELLED,
    EVENT_RESCHEDULED,
    EVENT_REMINDER,
    INVITATION_SENT,
    INVITATION_ANSWERED,
    PARTICIPANT_REMOVED,
)

# Realtime group naming, mirroring apps.chat / apps.notifications conventions.
AGENDA_USER_GROUP = 'agenda_user_{user_id}'

# Audit module key registered in apps.history.services.adapters.SOURCE_APPS.
AUDIT_MODULE = 'agenda'

# Series edit scopes, modelled on Google Calendar / Outlook semantics.
SCOPE_THIS = 'this'
SCOPE_FOLLOWING = 'following'
SCOPE_SERIES = 'series'
EDIT_SCOPES = (SCOPE_THIS, SCOPE_FOLLOWING, SCOPE_SERIES)

# Upper bound on generated occurrences for a single range query. Guards against
# a pathological rule (e.g. DAILY over 10 years) flooding a month view.
MAX_OCCURRENCES_PER_SERIES = 750

# Widest window a single range query may request, in days.
MAX_RANGE_DAYS = 400

DEFAULT_TIMEZONE = 'Africa/Casablanca'
