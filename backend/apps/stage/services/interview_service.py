"""Interview domain — schedule, reschedule, cancel, feedback, results."""

from __future__ import annotations

from typing import Any, Optional

from django.db import transaction
from django.utils import timezone

from apps.stage.models import OfferApplication
from apps.stage.models_extended import (
    Interview,
    InterviewFeedback,
    InterviewResult,
    InterviewSchedule,
    InterviewStatusHistory,
)
from apps.stage.services.application_lifecycle import transition_application
from apps.stage.services.audit_hooks import record_application_event
from apps.stage.services.exceptions import OfferValidationError
from apps.stage.services.notifications import notify_interview_scheduled
from apps.stage.services.permissions import assert_can_manage_applications
from apps.stage.services.webhook_service import emit_webhook_event

INTERVIEW_TRANSITIONS: dict[str, set[str]] = {
    Interview.Status.SCHEDULED: {
        Interview.Status.CONFIRMED, Interview.Status.RESCHEDULED,
        Interview.Status.CANCELLED, Interview.Status.IN_PROGRESS,
    },
    Interview.Status.CONFIRMED: {
        Interview.Status.RESCHEDULED, Interview.Status.IN_PROGRESS,
        Interview.Status.CANCELLED, Interview.Status.NO_SHOW,
    },
    Interview.Status.RESCHEDULED: {
        Interview.Status.CONFIRMED, Interview.Status.CANCELLED, Interview.Status.IN_PROGRESS,
    },
    Interview.Status.IN_PROGRESS: {Interview.Status.COMPLETED, Interview.Status.NO_SHOW},
    Interview.Status.COMPLETED: set(),
    Interview.Status.CANCELLED: set(),
    Interview.Status.NO_SHOW: set(),
}


def _transition_interview(
    interview: Interview,
    new_status: str,
    *,
    actor,
    reason: str = '',
) -> Interview:
    allowed = INTERVIEW_TRANSITIONS.get(interview.status, set())
    if new_status not in allowed:
        raise OfferValidationError(f'Interview transition {interview.status} → {new_status} not allowed')
    previous = interview.status
    interview.status = new_status
    interview.save(update_fields=['status', 'updated_at'])
    InterviewStatusHistory.objects.create(
        interview=interview,
        previous_status=previous,
        new_status=new_status,
        changed_by=actor,
        reason=reason,
    )
    return interview


@transaction.atomic
def schedule_interview(
    *,
    application: OfferApplication,
    actor,
    scheduled_at,
    interview_type: str = Interview.InterviewType.VIDEO,
    location: str = '',
    meeting_url: str = '',
    interviewer_name: str = '',
    simulator_session_id: str = '',
    duration_minutes: int = 45,
) -> Interview:
    assert_can_manage_applications(actor)
    interview = Interview.objects.create(
        application=application,
        interview_type=interview_type,
        status=Interview.Status.SCHEDULED,
        scheduled_at=scheduled_at,
        duration_minutes=duration_minutes,
        location=location,
        meeting_url=meeting_url,
        interviewer_name=interviewer_name,
        simulator_session_id=simulator_session_id,
        scheduled_by=actor,
    )
    InterviewSchedule.objects.create(
        interview=interview,
        previous_scheduled_at=None,
        new_scheduled_at=scheduled_at,
        reason='Initial schedule',
        changed_by=actor,
    )
    InterviewResult.objects.create(interview=interview, outcome=InterviewResult.Outcome.PENDING)

    if application.status != OfferApplication.Status.INTERVIEW:
        transition_application(
            application,
            OfferApplication.Status.INTERVIEW,
            actor=actor,
            reason='Interview scheduled',
        )

    details = {
        'interview_uuid': str(interview.uuid),
        'scheduled_at': scheduled_at.isoformat(),
        'interview_type': interview_type,
        'meeting_url': meeting_url,
        'simulator_session_id': simulator_session_id,
    }
    record_application_event(
        action='SCHEDULE',
        event_code='internship.interview.scheduled',
        summary=f'Interview scheduled for {application.offer.title}',
        application_id=application.pk,
        offer_id=application.offer_id,
        student_profile_id=application.student_profile_id,
        actor=actor,
        metadata=details,
    )
    notify_interview_scheduled(application, actor, details)
    emit_webhook_event('internship.interview.scheduled', 'interview', interview.pk, details)
    return interview


@transaction.atomic
def reschedule_interview(
    *,
    interview: Interview,
    actor,
    new_scheduled_at,
    reason: str = '',
) -> Interview:
    assert_can_manage_applications(actor)
    previous = interview.scheduled_at
    InterviewSchedule.objects.create(
        interview=interview,
        previous_scheduled_at=previous,
        new_scheduled_at=new_scheduled_at,
        reason=reason or 'Rescheduled',
        changed_by=actor,
    )
    interview.scheduled_at = new_scheduled_at
    interview.save(update_fields=['scheduled_at', 'updated_at'])
    _transition_interview(interview, Interview.Status.RESCHEDULED, actor=actor, reason=reason)
    _transition_interview(interview, Interview.Status.CONFIRMED, actor=actor, reason='Confirmed after reschedule')
    emit_webhook_event(
        'internship.interview.rescheduled',
        'interview',
        interview.pk,
        {'new_scheduled_at': new_scheduled_at.isoformat()},
    )
    return interview


@transaction.atomic
def cancel_interview(*, interview: Interview, actor, reason: str = '') -> Interview:
    assert_can_manage_applications(actor)
    interview = _transition_interview(interview, Interview.Status.CANCELLED, actor=actor, reason=reason)
    emit_webhook_event('internship.interview.cancelled', 'interview', interview.pk, {'reason': reason})
    return interview


@transaction.atomic
def submit_interview_feedback(
    *,
    interview: Interview,
    actor,
    data: dict[str, Any],
) -> InterviewFeedback:
    assert_can_manage_applications(actor)
    feedback = InterviewFeedback.objects.create(
        interview=interview,
        reviewer=actor,
        overall_score=data.get('overall_score'),
        technical_score=data.get('technical_score'),
        communication_score=data.get('communication_score'),
        strengths=data.get('strengths', ''),
        weaknesses=data.get('weaknesses', ''),
        recommendation=data.get('recommendation', ''),
        metadata_json=data.get('metadata_json', {}),
    )
    emit_webhook_event('internship.interview.feedback_submitted', 'interview', interview.pk, {'feedback_id': feedback.pk})
    return feedback


@transaction.atomic
def record_interview_result(
    *,
    interview: Interview,
    actor,
    outcome: str,
    notes: str = '',
) -> InterviewResult:
    assert_can_manage_applications(actor)
    result, _ = InterviewResult.objects.get_or_create(interview=interview)
    result.outcome = outcome
    result.notes = notes
    result.decided_by = actor
    result.decided_at = timezone.now()
    result.save()
    _transition_interview(interview, Interview.Status.COMPLETED, actor=actor, reason=f'Result: {outcome}')
    emit_webhook_event('internship.interview.completed', 'interview', interview.pk, {'outcome': outcome})
    return result
