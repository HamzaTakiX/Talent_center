"""Payment proof validation workflow."""

from __future__ import annotations

from decimal import Decimal
from typing import Optional

from django.db import transaction
from django.utils import timezone

from apps.srf.compliance_models import Installment, PaymentProofSubmission
from apps.srf.models import FinancialAccount, Payment, PaymentMethod
from apps.srf.services.financial_profile import refresh_student_financial_state
from apps.srf.services.srf_notifications import emit_srf_notification


def _pending_proof_exists(installment: Installment) -> bool:
    return installment.proof_submissions.filter(
        status__in=[
            PaymentProofSubmission.Status.PENDING,
            PaymentProofSubmission.Status.UNDER_REVIEW,
        ],
    ).exists()


def _restore_installment_status(installment: Installment) -> None:
    paid = installment.paid_amount or Decimal('0')
    if paid >= installment.amount:
        installment.payment_status = Installment.PaymentStatus.PAID
    elif paid > 0:
        installment.payment_status = Installment.PaymentStatus.PARTIAL
    else:
        installment.payment_status = Installment.PaymentStatus.UNPAID
    installment.save(update_fields=['payment_status', 'updated_at'])


def _apply_installment_payment(
    installment: Installment,
    approved_amount: Decimal,
    *,
    reviewer,
    proof_file,
    payment: Payment,
) -> None:
    installment.paid_amount = min(
        (installment.paid_amount or Decimal('0')) + approved_amount,
        installment.amount,
    )
    if installment.paid_amount >= installment.amount:
        installment.payment_status = Installment.PaymentStatus.PAID
        installment.validated_at = timezone.now()
        installment.validated_by = reviewer
        installment.linked_payment = payment
        if proof_file:
            installment.uploaded_receipt = proof_file
    else:
        installment.payment_status = Installment.PaymentStatus.PARTIAL
    installment.save()


@transaction.atomic
def submit_payment_proof(
    account: FinancialAccount,
    *,
    submitted_by,
    amount: Decimal,
    proof_file,
    reference_number: str = '',
    installment: Optional[Installment] = None,
) -> PaymentProofSubmission:
    if installment and _pending_proof_exists(installment):
        raise ValueError('A payment proof is already pending validation for this installment.')

    submission = PaymentProofSubmission.objects.create(
        account=account,
        installment=installment,
        amount=amount,
        reference_number=reference_number,
        proof_file=proof_file,
        submitted_by=submitted_by,
        status=PaymentProofSubmission.Status.PENDING,
    )
    if installment:
        installment.payment_status = Installment.PaymentStatus.PENDING_VALIDATION
        installment.save(update_fields=['payment_status', 'updated_at'])
    refresh_student_financial_state(account.student_profile)
    emit_srf_notification(
        event_code='srf.payment.submitted',
        student=account.student_profile,
        title='Payment proof submitted',
        body=f'A payment proof of {amount} MAD is awaiting validation.',
        actor=submitted_by,
        entity_type='payment_proof',
        entity_id=submission.pk,
    )
    try:
        from apps.history.integrations.srf import payment_proof_submitted

        payment_proof_submitted(submission=submission, actor=submitted_by)
    except Exception:
        pass
    return submission


@transaction.atomic
def review_payment_proof(
    submission: PaymentProofSubmission,
    *,
    reviewer,
    new_status: str,
    rejection_reason: str = '',
    admin_notes: str = '',
    approved_amount: Optional[Decimal] = None,
) -> PaymentProofSubmission:
    previous_status = submission.status
    submission.status = new_status
    submission.reviewed_by = reviewer
    submission.reviewed_at = timezone.now()
    submission.rejection_reason = rejection_reason
    submission.admin_notes = admin_notes

    timeline = list((submission.metadata_json or {}).get('audit_timeline') or [])
    timeline.append({
        'at': timezone.now().isoformat(),
        'action': new_status,
        'from_status': previous_status,
        'actor_id': reviewer.pk,
        'actor_name': getattr(reviewer, 'email', '') or str(reviewer),
        'admin_notes': admin_notes,
        'rejection_reason': rejection_reason,
        'approved_amount': str(approved_amount) if approved_amount is not None else None,
    })
    submission.metadata_json = {**(submission.metadata_json or {}), 'audit_timeline': timeline}
    submission.save()

    student = submission.account.student_profile

    if new_status == PaymentProofSubmission.Status.UNDER_REVIEW:
        submission.save(update_fields=['status', 'reviewed_by', 'reviewed_at', 'admin_notes', 'updated_at'])
        return submission

    if new_status == PaymentProofSubmission.Status.APPROVED:
        amount = approved_amount if approved_amount is not None else submission.amount
        if amount <= 0:
            raise ValueError('Approved amount must be greater than zero.')
        if submission.installment:
            remaining = submission.installment.amount - (submission.installment.paid_amount or Decimal('0'))
            if amount > remaining:
                raise ValueError(
                    f'Approved amount exceeds remaining installment balance ({remaining} MAD).',
                )
        payment = _create_payment_from_proof(submission, reviewer, amount=amount)
        submission.linked_payment = payment
        submission.save(update_fields=['linked_payment', 'updated_at'])
        if submission.installment:
            _apply_installment_payment(
                submission.installment,
                amount,
                reviewer=reviewer,
                proof_file=submission.proof_file,
                payment=payment,
            )
        emit_srf_notification(
            event_code='srf.payment.approved',
            student=student,
            title='Payment approved',
            body=f'Your payment of {amount} MAD has been validated.',
            actor=reviewer,
            entity_type='payment_proof',
            entity_id=submission.pk,
        )
    elif new_status == PaymentProofSubmission.Status.REJECTED:
        if submission.installment:
            _restore_installment_status(submission.installment)
        emit_srf_notification(
            event_code='srf.payment.rejected',
            student=student,
            title='Payment rejected',
            body=rejection_reason or 'Your payment proof was rejected. Please resubmit.',
            actor=reviewer,
            entity_type='payment_proof',
            entity_id=submission.pk,
        )
    elif new_status == PaymentProofSubmission.Status.REQUIRES_CORRECTION:
        if submission.installment:
            _restore_installment_status(submission.installment)
        emit_srf_notification(
            event_code='srf.payment.requires_correction',
            student=student,
            title='Payment requires correction',
            body=admin_notes or 'Please correct and resubmit your payment proof.',
            actor=reviewer,
            entity_type='payment_proof',
            entity_id=submission.pk,
        )

    from apps.srf.services.financial_profile import refresh_student_financial_state_after_import

    refresh_student_financial_state_after_import(student, submission.account)
    try:
        from apps.history.integrations.srf import payment_proof_reviewed

        payment_proof_reviewed(
            submission=submission,
            reviewer=reviewer,
            previous_status=previous_status,
            new_status=new_status,
        )
    except Exception:
        pass
    return submission


def _create_payment_from_proof(
    submission: PaymentProofSubmission,
    reviewer,
    *,
    amount: Decimal,
) -> Payment:
    method, _ = PaymentMethod.objects.get_or_create(
        code='bank_transfer',
        defaults={
            'name': 'Bank transfer',
            'method_type': PaymentMethod.MethodType.BANK_TRANSFER,
        },
    )
    account = submission.account
    payment = Payment.objects.create(
        account=account,
        payment_method=method,
        amount=amount,
        currency=submission.currency,
        payment_date=timezone.now(),
        reference_number=submission.reference_number,
        status=Payment.Status.COMPLETED,
        recorded_by=reviewer,
        notes=f'Approved from proof submission {submission.uuid}',
    )
    account.last_payment_at = timezone.now()
    account.save(update_fields=['last_payment_at', 'updated_at'])
    return payment
