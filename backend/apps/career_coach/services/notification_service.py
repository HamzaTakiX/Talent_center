"""Emit career coach notifications via the notification center."""

from __future__ import annotations

import logging

from apps.notifications.events.publisher import emit_event

logger = logging.getLogger(__name__)

EVENT_CODES = {
    'recommendation': 'career_coach.recommendation.available',
    'matching_offer': 'career_coach.matching_offer.found',
    'cv_improved': 'career_coach.cv_analysis.improved',
    'interview_rec': 'career_coach.interview.recommendation',
}


def notify_career_recommendation(user, *, title: str, summary: str, session_id: str | None = None) -> None:
    try:
        emit_event(
            event_code=EVENT_CODES['recommendation'],
            source_app='career_coach',
            entity_type='ai_conversation',
            payload={
                'user_id': user.pk,
                'title': title,
                'summary': summary,
                'session_id': session_id or '',
                'action_url': '/student/internship-offers/ai-career-coach',
            },
            actor=user,
            idempotency_key=f'career_rec:{user.pk}:{hash(summary) % 10_000_000}',
        )
    except Exception as exc:
        logger.warning('Career coach notification failed: %s', exc)


def notify_matching_offer(user, *, offer_title: str, match_score: float, offer_id: str) -> None:
    try:
        emit_event(
            event_code=EVENT_CODES['matching_offer'],
            source_app='career_coach',
            entity_type='internship_offer',
            payload={
                'user_id': user.pk,
                'offer_title': offer_title,
                'match_score': match_score,
                'offer_id': offer_id,
                'action_url': f'/student/internship-offers/{offer_id}',
            },
            actor=user,
            idempotency_key=f'career_match:{user.pk}:{offer_id}',
        )
    except Exception as exc:
        logger.warning('Matching offer notification failed: %s', exc)


def maybe_emit_insight_notifications(user, context: dict, response_text: str) -> None:
    """Emit notifications when the coach surfaces actionable insights."""
    offers = context.get('offers') or []
    for offer in offers[:1]:
        if offer.get('is_recommended') and offer.get('application_status') == 'not_applied':
            if offer.get('match_score', 0) >= 70:
                notify_matching_offer(
                    user,
                    offer_title=offer.get('title', ''),
                    match_score=offer.get('match_score', 0),
                    offer_id=offer.get('id', ''),
                )
            break

    if 'action plan' in response_text.lower() or 'خطة' in response_text or 'plan d' in response_text.lower():
        notify_career_recommendation(
            user,
            title='New career recommendation',
            summary=response_text[:200],
        )
