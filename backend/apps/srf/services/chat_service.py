"""SRF financial support chat — student ↔ finance desk."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.admin_management.services.scopes import is_super_admin
from apps.chat.models import Channel, Conversation, ConversationContext, Message
from apps.chat.services.conversation_service import get_or_create_contextual_conversation
from apps.chat.services.message_service import send_message as chat_send_message
from apps.chat.services.seed import seed_chat_infrastructure
from apps.srf.compliance_models import Installment
from apps.srf.models import FinancialAccount
from apps.srf.services.financial_profile import ensure_financial_account, sync_account_amounts
from apps.srf.services.srf_detail import build_student_summary
from apps.stage.services.chat_service import _student_avatar_url, ensure_conversation_participants

User = get_user_model()
MODULE = ConversationContext.Module.SRF
CHANNEL_CODE = 'srf'
ENTITY_TYPE = 'financial_support'


def _ensure_chat_infrastructure() -> None:
    if Channel.objects.filter(code=CHANNEL_CODE, is_archived=False).exists():
        return
    seed_chat_infrastructure()


def user_can_manage_srf_chat(user: User) -> bool:
    if not user or not user.is_authenticated:
        return False
    if is_super_admin(user):
        return True
    if user.role != User.RoleChoices.ADMIN:
        return False
    return 'finance.manage' in get_admin_effective_permissions(user)


def _srf_admin_users() -> list[User]:
    admins = User.objects.filter(role=User.RoleChoices.ADMIN, is_active=True)
    return [admin for admin in admins if user_can_manage_srf_chat(admin)]


def srf_thread_entity_id(student: StudentProfile) -> str:
    return str(student.pk)


def _student_display_name(student: StudentProfile) -> str:
    return build_student_summary(student).get('full_name') or (
        student.user.email if student.user else ''
    )


def _format_amount(amount: Decimal | float | int, currency: str = 'MAD') -> str:
    value = float(amount or 0)
    formatted = f'{value:,.0f}'.replace(',', ' ')
    return f'{formatted} {currency}'


def _build_obligations(account: FinancialAccount) -> list[dict[str, Any]]:
    year = account.current_academic_year or ''
    installments = account.installments.filter(academic_year=year).order_by('installment_number')
    if not installments.exists():
        installments = account.installments.order_by('installment_number')
    obligations: list[dict[str, Any]] = []
    for inst in installments[:12]:
        is_paid = inst.payment_status == Installment.PaymentStatus.PAID
        label = inst.label or f'Tranche {inst.installment_number}'
        if is_paid:
            paid_at = inst.validated_at.strftime('%d %b.') if inst.validated_at else ''
            detail = f'{_format_amount(inst.amount, account.currency)} — Payé {paid_at}'.strip()
        else:
            due = inst.due_date.strftime('%d %B') if inst.due_date else ''
            detail = f'{_format_amount(inst.amount, account.currency)}'
            if due:
                detail += f' — Échéance : {due}'
        obligations.append({
            'id': str(inst.pk),
            'title': label,
            'status': 'paid' if is_paid else 'unpaid',
            'detail': detail,
        })
    return obligations


def _upcoming_deadline(account: FinancialAccount) -> dict[str, str]:
    year = account.current_academic_year or ''
    pending = account.installments.filter(
        academic_year=year,
        payment_status__in=[
            Installment.PaymentStatus.UNPAID,
            Installment.PaymentStatus.OVERDUE,
            Installment.PaymentStatus.PARTIAL,
            Installment.PaymentStatus.PENDING_VALIDATION,
        ],
    ).order_by('due_date')
    if not pending.exists():
        pending = account.installments.filter(
            payment_status__in=[
                Installment.PaymentStatus.UNPAID,
                Installment.PaymentStatus.OVERDUE,
                Installment.PaymentStatus.PARTIAL,
                Installment.PaymentStatus.PENDING_VALIDATION,
            ],
        ).order_by('due_date')
    next_inst = pending.first()
    if not next_inst:
        return {'label': '—'}
    due = next_inst.due_date.strftime('%d %B %Y') if next_inst.due_date else '—'
    return {
        'label': f'{due} — {_format_amount(next_inst.amount, account.currency)}',
    }


def _status_label(account: FinancialAccount) -> str:
    remaining = account.remaining_amount or Decimal('0')
    if remaining <= 0:
        return 'Soldé'
    return f'{_format_amount(remaining, account.currency)} restants'


def _build_context_snapshot(
    *,
    account: FinancialAccount,
    student: StudentProfile,
    request=None,
) -> dict[str, Any]:
    sync_account_amounts(account)
    account.refresh_from_db()
    summary = build_student_summary(student)
    obligations = _build_obligations(account)
    upcoming = _upcoming_deadline(account)
    return {
        'account_id': account.pk,
        'student_profile_id': student.pk,
        'student_user_id': student.user_id,
        'student_name': summary.get('full_name') or _student_display_name(student),
        'student_email': summary.get('email') or '',
        'student_avatar_url': _student_avatar_url(student, request),
        'program': summary.get('program') or '',
        'academic_level': summary.get('academic_level') or '',
        'class_group': summary.get('class_group') or '',
        'academic_year': summary.get('academic_year') or account.current_academic_year or '',
        'financial_status': account.financial_status,
        'currency': account.currency or 'MAD',
        'total_due': float(account.total_amount or 0),
        'total_paid': float(account.paid_amount or 0),
        'total_remaining': float(account.remaining_amount or 0),
        'status_label': _status_label(account),
        'obligations': obligations,
        'upcoming_deadline': upcoming,
    }


def get_or_create_srf_conversation(
    *,
    student: StudentProfile,
    admin_users: list[User] | None = None,
    created_by: User | None = None,
    request=None,
) -> Conversation:
    _ensure_chat_infrastructure()
    account = ensure_financial_account(student)
    entity_id = srf_thread_entity_id(student)
    existing = (
        Conversation.objects.filter(
            context__module=MODULE,
            context__entity_type=ENTITY_TYPE,
            context__entity_id=entity_id,
        )
        .select_related('context')
        .order_by('-last_message_at', '-updated_at', '-id')
        .first()
    )
    if existing:
        admins = list(admin_users or [])
        for admin in _srf_admin_users():
            if admin.pk not in {u.pk for u in admins}:
                admins.append(admin)
        ensure_conversation_participants(existing, [student.user, *admins])
        _sync_srf_context(existing, account=account, student=student, request=request)
        return existing

    student = (
        StudentProfile.objects.select_related(
            'user',
            'user__profile',
            'filiere',
            'class_group',
            'academic_level',
        )
        .filter(pk=student.pk)
        .first()
        or student
    )
    student_name = _student_display_name(student)
    display_name = student_name or (student.user.email if student.user else '')
    admins = list(admin_users or [])
    for admin in _srf_admin_users():
        if admin.pk not in {u.pk for u in admins}:
            admins.append(admin)

    snap = _build_context_snapshot(account=account, student=student, request=request)
    conv = get_or_create_contextual_conversation(
        module=MODULE,
        entity_type=ENTITY_TYPE,
        entity_id=entity_id,
        title=f'SRF — {display_name}',
        entity_label=display_name,
        workflow_status='INQUIRY',
        student_user=student.user,
        is_internal_only=False,
        context_snapshot=snap,
        participant_users=[student.user, *admins],
        created_by=created_by,
        channel_code=CHANNEL_CODE,
        context_kind=ConversationContext.ContextKind.WORKFLOW_THREAD,
    )
    ensure_conversation_participants(conv, [student.user, *admins])
    return conv


def _sync_srf_context(
    conversation: Conversation,
    *,
    account: FinancialAccount,
    student: StudentProfile,
    request=None,
) -> None:
    ctx = getattr(conversation, 'context', None)
    if not ctx:
        return
    snap = _build_context_snapshot(account=account, student=student, request=request)
    ctx.context_snapshot_json = snap
    ctx.entity_label = snap.get('student_name') or ctx.entity_label
    ctx.save(update_fields=['context_snapshot_json', 'entity_label', 'updated_at'])


def sync_srf_conversations_for_admin(admin: User, *, limit: int = 500) -> int:
    """Ensure finance admins have SRF threads for financial accounts (maintenance/bulk only).

    Not invoked on inbox list load — threads appear when a student or admin opens chat
    or when the first message is sent.
    """
    if not user_can_manage_srf_chat(admin):
        return 0
    count = 0
    accounts = (
        FinancialAccount.objects.select_related(
            'student_profile',
            'student_profile__user',
            'student_profile__filiere',
            'student_profile__class_group',
            'student_profile__academic_level',
        )
        .prefetch_related('installments')
        .order_by('-updated_at')[:limit]
    )
    for account in accounts:
        student = account.student_profile
        if not student or not student.user_id:
            continue
        get_or_create_srf_conversation(
            student=student,
            admin_users=[admin],
            created_by=admin,
        )
        count += 1
    return count


def refresh_srf_conversation_snapshot(conversation: Conversation, request=None) -> None:
    ctx = getattr(conversation, 'context', None)
    if not ctx or ctx.module != MODULE:
        return
    student_id = ctx.context_snapshot_json.get('student_profile_id') if ctx.context_snapshot_json else None
    if not student_id:
        try:
            student_id = int(ctx.entity_id)
        except (TypeError, ValueError):
            return
    student = StudentProfile.objects.filter(pk=student_id).select_related(
        'user', 'filiere', 'class_group', 'academic_level',
    ).first()
    if not student:
        return
    account = ensure_financial_account(student)
    _sync_srf_context(conversation, account=account, student=student, request=request)


def send_srf_message(
    *,
    conversation: Conversation,
    sender: User,
    body: str,
) -> Message | None:
    ensure_conversation_participants(conversation, [sender])
    refresh_srf_conversation_snapshot(conversation)
    return chat_send_message(
        user=sender,
        conversation_id=conversation.pk,
        body=body,
        metadata={},
    )


def resolve_srf_conversation(
    conversation: Conversation,
    actor: User,
    resolution_note: str = '',
) -> Conversation:
    ctx = getattr(conversation, 'context', None)
    if ctx:
        ctx.workflow_status = 'RESOLVED'
        ctx.workflow_state = ConversationContext.WorkflowState.RESOLVED
        ctx.context_snapshot_json = {
            **(ctx.context_snapshot_json or {}),
            'resolution_note': resolution_note,
            'resolved_by': actor.pk,
        }
        ctx.save(update_fields=['workflow_status', 'workflow_state', 'context_snapshot_json', 'updated_at'])
    meta = dict(conversation.metadata_json or {})
    meta['resolved'] = True
    conversation.metadata_json = meta
    conversation.save(update_fields=['metadata_json', 'updated_at'])
    return conversation


def archive_srf_conversation(conversation: Conversation, actor: User) -> Conversation:
    meta = conversation.metadata_json or {}
    meta['admin_inbox_archived'] = True
    meta['archived_by'] = actor.pk
    meta['admin_inbox_archived_at'] = timezone.now().isoformat()
    meta.pop('unarchived_by', None)
    meta.pop('admin_inbox_unarchived_at', None)
    conversation.metadata_json = meta
    conversation.is_archived = False
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation


def unarchive_srf_conversation(conversation: Conversation, actor: User) -> Conversation:
    meta = conversation.metadata_json or {}
    meta['admin_inbox_archived'] = False
    meta.pop('archived_by', None)
    meta.pop('admin_inbox_archived_at', None)
    meta['unarchived_by'] = actor.pk
    meta['admin_inbox_unarchived_at'] = timezone.now().isoformat()
    conversation.metadata_json = meta
    conversation.is_archived = False
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation


def archive_student_srf_conversation(conversation: Conversation, actor: User) -> Conversation:
    meta = dict(conversation.metadata_json or {})
    meta['student_archived_by'] = actor.pk
    meta['student_archived_at'] = timezone.now().isoformat()
    meta.pop('student_unarchived_by', None)
    meta.pop('student_unarchived_at', None)
    conversation.is_archived = True
    conversation.metadata_json = meta
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation


def unarchive_student_srf_conversation(conversation: Conversation, actor: User) -> Conversation:
    meta = dict(conversation.metadata_json or {})
    meta.pop('student_archived_by', None)
    meta.pop('student_archived_at', None)
    meta['student_unarchived_by'] = actor.pk
    meta['student_unarchived_at'] = timezone.now().isoformat()
    conversation.is_archived = False
    conversation.metadata_json = meta
    conversation.save(update_fields=['is_archived', 'metadata_json', 'updated_at'])
    return conversation
