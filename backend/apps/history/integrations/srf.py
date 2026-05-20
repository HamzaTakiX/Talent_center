from __future__ import annotations

from apps.history.audit import audit
from apps.history.models import HistoryEvent


def payment_proof_submitted(*, submission, actor=None) -> None:
    audit.emit(
        module='srf',
        action='SUBMIT',
        event_code='srf.payment.submitted',
        summary=f'Payment proof submitted ({submission.amount} MAD)',
        actor=actor,
        entity_type='payment_proof',
        entity_id=submission.pk,
        metadata={'account_id': submission.account_id},
    )


def payment_proof_reviewed(
    *,
    submission,
    reviewer,
    previous_status: str,
    new_status: str,
) -> None:
    severity = HistoryEvent.Severity.INFO
    if new_status == 'REJECTED':
        severity = HistoryEvent.Severity.WARNING
    elif new_status == 'APPROVED':
        severity = HistoryEvent.Severity.INFO

    audit.emit(
        module='srf',
        action='VALIDATE' if new_status == 'APPROVED' else 'REVIEW',
        event_code=f'srf.payment.{new_status.lower()}',
        summary=f'SRF payment proof {new_status.lower()}: {submission.amount} MAD',
        actor=reviewer,
        entity_type='payment_proof',
        entity_id=submission.pk,
        old_values={'status': previous_status},
        new_values={'status': new_status},
        severity=severity,
        metadata={'account_id': submission.account_id},
    )
