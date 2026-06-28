"""Event payload validation schemas."""

from __future__ import annotations

from typing import Any


class EventValidationError(ValueError):
    pass


def validate_payload(event_code: str, payload: dict[str, Any]) -> dict[str, Any]:
    payload = dict(payload or {})
    required = _REQUIRED_FIELDS.get(event_code, ())
    missing = [field for field in required if not payload.get(field)]
    if missing:
        raise EventValidationError(
            f'Event {event_code} missing required payload fields: {", ".join(missing)}'
        )
    return payload


_REQUIRED_FIELDS: dict[str, tuple[str, ...]] = {
    'student.password.reset': ('reset_url',),
    'internship.offer.published': ('title',),
    'internship.application.submitted': ('title',),
    'internship.application.accepted': ('title',),
    'internship.application.rejected': ('title',),
    'internship.application.interview': ('title',),
    'documents.approved': ('title',),
    'documents.rejected': ('title',),
    'announcement.published': ('title',),
    'chat.message.received': ('title', 'body'),
    'chat.conversation.resolved': ('title', 'body'),
}
