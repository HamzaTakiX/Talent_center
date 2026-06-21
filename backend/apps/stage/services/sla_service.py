"""SLA monitoring and escalation for internship operations."""

from __future__ import annotations

from datetime import timedelta

from django.utils import timezone

from apps.stage.models import OfferApplication
from apps.stage.models_extended import SlaRule, SlaViolation
from apps.stage.services.notifications import emit_stage_notification

DEFAULT_SLA_RULES = [
    {'code': 'application_pending_24h', 'entity_type': 'APPLICATION', 'threshold_hours': 24, 'escalation_level': 1},
    {'code': 'application_pending_48h', 'entity_type': 'APPLICATION', 'threshold_hours': 48, 'escalation_level': 2, 'notify_supervisor': True},
    {'code': 'application_pending_72h', 'entity_type': 'APPLICATION', 'threshold_hours': 72, 'escalation_level': 3, 'notify_supervisor': True},
    {'code': 'interview_feedback_48h', 'entity_type': 'INTERVIEW', 'threshold_hours': 48, 'escalation_level': 1},
    {'code': 'offer_review_72h', 'entity_type': 'OFFER_REVIEW', 'threshold_hours': 72, 'escalation_level': 1},
]


def seed_default_sla_rules() -> int:
    created = 0
    for spec in DEFAULT_SLA_RULES:
        _, was_created = SlaRule.objects.update_or_create(
            code=spec['code'],
            defaults={
                'entity_type': spec['entity_type'],
                'threshold_hours': spec['threshold_hours'],
                'escalation_level': spec['escalation_level'],
                'notify_supervisor': spec.get('notify_supervisor', False),
                'description': spec.get('description', ''),
                'is_active': True,
            },
        )
        if was_created:
            created += 1
    return created


def _open_violation(rule: SlaRule, entity_type: str, entity_id: str, metadata: dict) -> SlaViolation | None:
    existing = SlaViolation.objects.filter(
        rule=rule,
        entity_type=entity_type,
        entity_id=entity_id,
        status__in=[SlaViolation.Status.OPEN, SlaViolation.Status.ESCALATED],
    ).first()
    if existing:
        return None
    return SlaViolation.objects.create(
        rule=rule,
        entity_type=entity_type,
        entity_id=entity_id,
        status=SlaViolation.Status.OPEN,
        metadata_json=metadata,
    )


def scan_application_sla(*, now=None) -> dict:
    now = now or timezone.now()
    rules = SlaRule.objects.filter(entity_type=SlaRule.EntityType.APPLICATION, is_active=True)
    if not rules.exists():
        seed_default_sla_rules()
        rules = SlaRule.objects.filter(entity_type=SlaRule.EntityType.APPLICATION, is_active=True)

    violations_created = 0
    for rule in rules:
        cutoff = now - timedelta(hours=rule.threshold_hours)
        stale = OfferApplication.objects.filter(
            status=OfferApplication.Status.SUBMITTED,
            applied_at__lt=cutoff,
        )
        for app in stale[:200]:
            v = _open_violation(
                rule,
                'APPLICATION',
                str(app.pk),
                {'application_uuid': str(app.uuid), 'offer_id': app.offer_id},
            )
            if v:
                violations_created += 1
                if rule.notify_supervisor:
                    v.status = SlaViolation.Status.ESCALATED
                    v.escalated_at = now
                    v.save(update_fields=['status', 'escalated_at', 'updated_at'])
                emit_stage_notification(
                    event_code='internship.sla.violation',
                    title=f'SLA breach: {rule.code}',
                    body=f'Application {app.uuid} pending over {rule.threshold_hours}h',
                    entity_type='offer_application',
                    entity_id=app.pk,
                    action_url=f'/admin/internship-offers/{app.offer.uuid}/applications',
                )
    return {'violations_created': violations_created}


def scan_interview_feedback_sla(*, now=None) -> dict:
    from apps.stage.models_extended import Interview, InterviewFeedback

    now = now or timezone.now()
    rules = SlaRule.objects.filter(entity_type=SlaRule.EntityType.INTERVIEW, is_active=True)
    violations_created = 0
    for rule in rules:
        cutoff = now - timedelta(hours=rule.threshold_hours)
        completed_ids = InterviewFeedback.objects.values_list('interview_id', flat=True)
        interviews = Interview.objects.filter(
            status=Interview.Status.COMPLETED,
            updated_at__lt=cutoff,
        ).exclude(pk__in=completed_ids)
        for interview in interviews[:100]:
            v = _open_violation(rule, 'INTERVIEW', str(interview.pk), {'interview_uuid': str(interview.uuid)})
            if v:
                violations_created += 1
    return {'violations_created': violations_created}


def monitor_all_sla() -> dict:
    return {
        'applications': scan_application_sla(),
        'interviews': scan_interview_feedback_sla(),
    }
