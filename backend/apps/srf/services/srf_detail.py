"""Rich payloads for SRF admin detail & validation pages."""

from __future__ import annotations

from typing import Any, Optional

from django.contrib.auth import get_user_model
from django.db.models import Prefetch

from apps.srf.compliance_models import FinancialRiskAlert, Installment, PaymentProofSubmission
from apps.srf.models import FinancialAccount, Payment
from apps.srf.serializers import (
    FinancialAccountSerializer,
    FinancialRiskAlertSerializer,
    PaymentProofSubmissionSerializer,
    account_to_table_row,
)
from apps.srf.services.academic_access import get_student_access

User = get_user_model()


def _user_display_name(user) -> str:
    if not user:
        return ''
    profile = getattr(user, 'profile', None)
    if profile:
        name = f'{profile.first_name} {profile.last_name}'.strip()
        if name:
            return name
    return user.email or ''


def build_student_summary(student) -> dict[str, Any]:
    profile = getattr(student.user, 'profile', None)
    filiere = student.filiere
    level = student.academic_level
    group = student.class_group
    return {
        'student_id': student.pk,
        'student_number': student.student_number or '',
        'email': student.user.email,
        'first_name': profile.first_name if profile else '',
        'last_name': profile.last_name if profile else '',
        'full_name': _user_display_name(student.user),
        'program': filiere.name if filiere else student.program_major or '',
        'filiere_code': filiere.code if filiere else '',
        'academic_level': level.name if level else '',
        'class_group': group.name if group else student.current_class or '',
        'academic_year': student.academic_year or '',
    }


def _installment_progress(
    account: FinancialAccount,
    *,
    can_take_exams: bool | None = None,
) -> dict[str, Any]:
    year = account.current_academic_year or ''
    installments = list(
        account.installments.filter(academic_year=year).order_by('installment_number')
        if year
        else account.installments.order_by('installment_number'),
    )
    if not installments:
        installments = list(account.installments.order_by('installment_number')[:8])
    total = len(installments)
    paid = sum(1 for i in installments if i.payment_status == Installment.PaymentStatus.PAID)
    overdue = sum(1 for i in installments if i.payment_status == Installment.PaymentStatus.OVERDUE)
    # Under DUE_TRANCHES, future overdue tranches do not block exams — exclude them from risk/insights.
    blocking_overdue = overdue if can_take_exams is False else 0
    return {
        'total_installments': total,
        'paid_installments': paid,
        'overdue_installments': overdue,
        'blocking_overdue_installments': blocking_overdue,
        'completion_pct': round((paid / total) * 100, 1) if total else 0,
    }


def _build_audit_timeline(account: FinancialAccount, request) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for proof in account.payment_proofs.order_by('-created_at')[:50]:
        events.append({
            'type': 'payment_proof',
            'id': proof.pk,
            'at': proof.created_at.isoformat(),
            'status': proof.status,
            'amount': str(proof.amount),
            'currency': proof.currency,
            'reference': proof.reference_number,
            'reviewed_at': proof.reviewed_at.isoformat() if proof.reviewed_at else None,
            'reviewer_name': _user_display_name(proof.reviewed_by),
            'admin_notes': proof.admin_notes,
            'rejection_reason': proof.rejection_reason,
        })
        for entry in (proof.metadata_json or {}).get('audit_timeline') or []:
            events.append({
                'type': 'proof_review',
                'proof_id': proof.pk,
                **entry,
            })
    for payment in account.payments.order_by('-payment_date')[:30]:
        events.append({
            'type': 'payment',
            'id': payment.pk,
            'at': payment.payment_date.isoformat(),
            'status': payment.status,
            'amount': str(payment.amount),
            'currency': payment.currency,
            'reference': payment.reference_number,
            'recorded_by': _user_display_name(payment.recorded_by),
        })
    events.sort(key=lambda e: e.get('at') or '', reverse=True)
    return events[:80]


def build_student_financial_detail(account: FinancialAccount, request) -> dict[str, Any]:
    student = account.student_profile
    access = get_student_access(student)
    progress = _installment_progress(account, can_take_exams=access.get('can_take_exams'))
    holds = list(
        student.financial_holds.filter(is_active=True).values(
            'hold_type', 'reason', 'placed_at',
        ),
    )
    risk_qs = FinancialRiskAlert.objects.filter(
        student_profile=student,
        is_resolved=False,
    ).order_by('-created_at')[:20]
    pending_proofs = account.payment_proofs.filter(
        status__in=[
            PaymentProofSubmission.Status.PENDING,
            PaymentProofSubmission.Status.UNDER_REVIEW,
            PaymentProofSubmission.Status.REQUIRES_CORRECTION,
        ],
    ).count()

    return {
        'student': build_student_summary(student),
        'account': FinancialAccountSerializer(account, context={'request': request}).data,
        'academic_access': access,
        'table_row': account_to_table_row(account),
        'installment_progress': progress,
        'restrictions': {
            'active_holds': holds,
            'blocking_reasons': access.get('blocking_reasons') or [],
            'is_overdue': progress['blocking_overdue_installments'] > 0,
            'is_access_blocked': not access.get('can_take_exams', False),
            'pending_proof_count': pending_proofs,
        },
        'payment_proofs': PaymentProofSubmissionSerializer(
            account.payment_proofs.order_by('-created_at')[:50],
            many=True,
            context={'request': request},
        ).data,
        'payments': [
            {
                'id': p.pk,
                'uuid': str(p.uuid),
                'amount': str(p.amount),
                'currency': p.currency,
                'status': p.status,
                'payment_date': p.payment_date.isoformat(),
                'reference_number': p.reference_number,
                'notes': p.notes,
            }
            for p in account.payments.select_related('payment_method').order_by('-payment_date')[:50]
        ],
        'risk_alerts': FinancialRiskAlertSerializer(
            risk_qs,
            many=True,
            context={'request': request},
        ).data,
        'audit_timeline': _build_audit_timeline(account, request),
    }


def build_payment_proof_detail(proof_id: int, request) -> Optional[dict[str, Any]]:
    try:
        proof = PaymentProofSubmission.objects.select_related(
            'account__student_profile__user',
            'account__student_profile__filiere',
            'account__student_profile__class_group',
            'account__student_profile__academic_level',
            'installment',
            'submitted_by',
            'reviewed_by',
            'linked_payment',
        ).prefetch_related(
            Prefetch(
                'account__installments',
                queryset=Installment.objects.order_by('installment_number'),
            ),
        ).get(pk=proof_id)
    except PaymentProofSubmission.DoesNotExist:
        return None

    account = proof.account
    student = account.student_profile
    installment = proof.installment
    access = get_student_access(student)

    return {
        'proof': PaymentProofSubmissionSerializer(proof, context={'request': request}).data,
        'student': build_student_summary(student),
        'account': FinancialAccountSerializer(account, context={'request': request}).data,
        'academic_access': access,
        'installment': {
            'id': installment.pk,
            'installment_number': installment.installment_number,
            'label': installment.label,
            'amount': str(installment.amount),
            'paid_amount': str(installment.paid_amount or 0),
            'currency': installment.currency,
            'due_date': installment.due_date.isoformat(),
            'payment_status': installment.payment_status,
            'academic_year': installment.academic_year,
        } if installment else None,
        'installment_progress': _installment_progress(
            account,
            can_take_exams=access.get('can_take_exams'),
        ),
        'linked_payment': {
            'id': proof.linked_payment.pk,
            'amount': str(proof.linked_payment.amount),
            'status': proof.linked_payment.status,
            'payment_date': proof.linked_payment.payment_date.isoformat(),
        } if proof.linked_payment else None,
        'audit_timeline': (proof.metadata_json or {}).get('audit_timeline') or [],
        'can_review': proof.status in (
            PaymentProofSubmission.Status.PENDING,
            PaymentProofSubmission.Status.UNDER_REVIEW,
            PaymentProofSubmission.Status.REQUIRES_CORRECTION,
        ),
    }
