"""
Intelligence alert service — emit notifications when scores cross thresholds.
"""

from __future__ import annotations

import logging

from apps.accounts_et_roles.models import StudentProfile

from ..models import StudentProfileIndicator

logger = logging.getLogger(__name__)

# Thresholds for alert generation
_CRITICAL_RISK = 75
_LOW_ENGAGEMENT = 15
_LOW_READINESS = 30
_LOW_PLACEMENT = 25


def _publish_event(event_code: str, payload: dict) -> None:
    try:
        from apps.notifications.events.publisher import emit_event
        emit_event(
            event_code=event_code,
            source_app='profile_intelligence',
            entity_type='student_profile',
            entity_id=payload.get('student_profile_id'),
            payload=payload,
        )
    except Exception:
        logger.exception('Failed to publish intelligence alert: %s', event_code)


def check_and_emit_alerts(
    student_profile: StudentProfile,
    indicator: StudentProfileIndicator,
    *,
    previous: StudentProfileIndicator | None = None,
) -> list[str]:
    """
    Compare current scores with previous and emit alerts when thresholds
    are breached. Returns list of alert codes emitted.
    """
    emitted: list[str] = []
    user = student_profile.user
    base_payload = {
        'student_profile_id': student_profile.pk,
        'user_id': user.pk,
        'student_name': getattr(user, 'full_name', '') or user.email,
        'risk_score': indicator.risk_score,
        'engagement_score': indicator.engagement_score,
        'readiness_score': indicator.internship_readiness_score,
        'placement_probability': indicator.placement_probability,
    }

    if indicator.risk_category == StudentProfileIndicator.RiskCategory.CRITICAL:
        if not previous or previous.risk_category != StudentProfileIndicator.RiskCategory.CRITICAL:
            _publish_event('student.intelligence.critical_risk', base_payload)
            emitted.append('critical_risk')

    if indicator.engagement_score <= _LOW_ENGAGEMENT:
        if not previous or previous.engagement_score > _LOW_ENGAGEMENT:
            _publish_event('student.intelligence.engagement_drop', base_payload)
            emitted.append('engagement_drop')

    if indicator.internship_readiness_score <= _LOW_READINESS:
        if not previous or previous.internship_readiness_score > _LOW_READINESS:
            _publish_event('student.intelligence.readiness_drop', base_payload)
            emitted.append('readiness_drop')

    if indicator.placement_probability <= _LOW_PLACEMENT:
        if not previous or previous.placement_probability > _LOW_PLACEMENT:
            _publish_event('student.intelligence.low_placement', base_payload)
            emitted.append('low_placement')

    return emitted
