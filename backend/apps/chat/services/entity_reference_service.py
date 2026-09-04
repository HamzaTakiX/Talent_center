"""Module-scoped entity references for chat messages (Instagram-style @tags on items)."""

from __future__ import annotations

from typing import Any, Optional

from django.http import HttpRequest

from apps.accounts_et_roles.models import StudentProfile, User

from ..models import Conversation, ConversationContext

ENTITY_REF_MAX = 5
ENTITY_LIST_LIMIT = 80


def _normalize_ref(raw: dict[str, Any]) -> dict[str, str] | None:
    if not isinstance(raw, dict):
        return None
    entity_type = str(raw.get('entity_type') or '').strip()
    entity_id = str(raw.get('entity_id') or '').strip()
    label = str(raw.get('label') or '').strip()
    if not entity_type or not entity_id or not label:
        return None
    subtitle = str(raw.get('subtitle') or '').strip()
    module = str(raw.get('module') or '').strip().lower() or None
    out: dict[str, str] = {
        'entity_type': entity_type,
        'entity_id': entity_id,
        'label': label[:255],
    }
    if subtitle:
        out['subtitle'] = subtitle[:255]
    if module:
        out['module'] = module
    return out


def _filter_query(items: list[dict[str, str]], q: str | None, *, limit: int = ENTITY_LIST_LIMIT) -> list[dict[str, str]]:
    needle = (q or '').strip().lower()
    if needle:
        filtered = []
        for item in items:
            haystack = ' '.join(
                part for part in (item.get('label'), item.get('subtitle'), item.get('entity_type')) if part
            ).lower()
            if needle in haystack:
                filtered.append(item)
        items = filtered
    return items[:limit]


def _student_profile_for_user(user: User) -> StudentProfile | None:
    return getattr(user, 'student_profile', None)


def _student_profile_from_conversation(conv: Conversation | None) -> StudentProfile | None:
    if not conv:
        return None
    ctx = getattr(conv, 'context', None)
    if not ctx:
        return None
    if ctx.student_user_id and hasattr(ctx.student_user, 'student_profile'):
        return ctx.student_user.student_profile
    student_user_id = ctx.student_user_id
    if student_user_id:
        return StudentProfile.objects.filter(user_id=student_user_id).first()
    snap = ctx.context_snapshot_json or {}
    profile_id = snap.get('student_profile_id')
    if profile_id:
        return StudentProfile.objects.filter(pk=profile_id).first()
    return None


def _resolve_student_profile(
    user: User,
    conversation: Conversation | None,
) -> StudentProfile | None:
    if user.role == User.RoleChoices.STUDENT:
        return _student_profile_for_user(user)
    return _student_profile_from_conversation(conversation)


def _list_documents(
    user: User,
    student: StudentProfile | None,
    *,
    q: str | None,
    request: HttpRequest | None,
) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []

    if student:
        from apps.documents.services import student_api

        for item in student_api.catalog_payload(student, request):
            service_id = str(item.get('id') or '')
            if not service_id:
                continue
            items.append(
                {
                    'entity_type': 'document_service',
                    'entity_id': service_id,
                    'label': str(item.get('name') or 'Document'),
                    'subtitle': str(item.get('category') or item.get('code') or ''),
                    'module': 'documents',
                }
            )
            student_request = item.get('studentRequest') or {}
            if student_request.get('hasRequest'):
                ref = student_request.get('reference') or f'DOC-{service_id}'
                items.append(
                    {
                        'entity_type': 'document_request',
                        'entity_id': str(student_request.get('requestId') or service_id),
                        'label': f"{item.get('name')} — {ref}",
                        'subtitle': str(student_request.get('status') or 'Demande'),
                        'module': 'documents',
                    }
                )
    elif user.role in {User.RoleChoices.ADMIN, User.RoleChoices.STAFF}:
        from apps.documents.services import catalog as catalog_service

        for item in catalog_service.catalog_list():
            if not item.get('isActive'):
                continue
            items.append(
                {
                    'entity_type': 'document_service',
                    'entity_id': str(item.get('id') or ''),
                    'label': str(item.get('name') or 'Document'),
                    'subtitle': str(item.get('category') or item.get('code') or ''),
                    'module': 'documents',
                }
            )

    return _filter_query(items, q)


def _list_offers(
    user: User,
    student: StudentProfile | None,
    *,
    q: str | None,
    request: HttpRequest | None,
) -> list[dict[str, str]]:
    if not student:
        return []

    from apps.stage.models import InternshipOffer, OfferApplication
    from apps.stage.services.student_journey_service import build_offers_feed

    items: list[dict[str, str]] = []
    seen: set[str] = set()

    feed = build_offers_feed(student)
    for section in ('recommended', 'eligible', 'recent', 'closing_soon', 'popular'):
        for offer in feed.get(section, []) or []:
            uid = str(offer.get('uuid') or offer.get('offer_uuid') or '')
            if not uid or uid in seen:
                continue
            seen.add(uid)
            items.append(
                {
                    'entity_type': 'internship_offer',
                    'entity_id': uid,
                    'label': str(offer.get('title') or offer.get('offer_title') or 'Offre de stage'),
                    'subtitle': str(offer.get('company_name') or offer.get('company') or ''),
                    'module': 'offers',
                }
            )

    applications = (
        OfferApplication.objects.filter(student_profile=student)
        .select_related('offer')
        .order_by('-updated_at')[:40]
    )
    for application in applications:
        offer = application.offer
        if not offer:
            continue
        items.append(
            {
                'entity_type': 'offer_application',
                'entity_id': str(application.uuid),
                'label': f"{offer.title} — Candidature",
                'subtitle': str(application.status or ''),
                'module': 'offers',
            }
        )
        uid = str(offer.uuid)
        if uid not in seen:
            seen.add(uid)
            items.append(
                {
                    'entity_type': 'internship_offer',
                    'entity_id': uid,
                    'label': offer.title,
                    'subtitle': offer.company_name or '',
                    'module': 'offers',
                }
            )

    return _filter_query(items, q)


def _list_announcements(
    user: User,
    student: StudentProfile | None,
    *,
    q: str | None,
    request: HttpRequest | None,
) -> list[dict[str, str]]:
    if not student:
        return []

    from apps.announcements.services.student_feed import get_student_announcement_feed

    feed = get_student_announcement_feed(student, request=request, search=q, limit=ENTITY_LIST_LIMIT)
    items: list[dict[str, str]] = []
    for ann in feed.get('items', []) or []:
        uid = str(ann.get('uuid') or ann.get('announcement_uuid') or '')
        if not uid:
            continue
        items.append(
            {
                'entity_type': 'announcement',
                'entity_id': uid,
                'label': str(ann.get('title') or 'Annonce'),
                'subtitle': str(ann.get('typeName') or ann.get('announcement_type_name') or ''),
                'module': 'announcements',
            }
        )
    return items[:ENTITY_LIST_LIMIT]


def _list_srf(
    user: User,
    student: StudentProfile | None,
    *,
    q: str | None,
    request: HttpRequest | None,
) -> list[dict[str, str]]:
    if not student:
        return []

    from apps.srf.models import FinancialAccount
    from apps.srf.services.financial_profile import ensure_financial_account

    account = ensure_financial_account(student)
    account = FinancialAccount.objects.prefetch_related('installments').filter(pk=account.pk).first()
    if not account:
        return []

    items: list[dict[str, str]] = []
    for installment in account.installments.all().order_by('installment_number'):
        items.append(
            {
                'entity_type': 'installment',
                'entity_id': str(installment.pk),
                'label': installment.label or f"Échéance {installment.installment_number}",
                'subtitle': f"{installment.payment_status} · {installment.amount} {installment.currency}",
                'module': 'srf',
            }
        )

    items.append(
        {
            'entity_type': 'financial_account',
            'entity_id': str(account.pk),
            'label': 'Compte SRF',
            'subtitle': str(account.financial_status or account.status or ''),
            'module': 'srf',
        }
    )

    return _filter_query(items, q)


def _encadrant_profile_for_refs(
    user: User,
    conversation: Conversation | None,
    student: StudentProfile | None,
):
    from apps.admin_management.models import EncadrantProfile

    if user.role == User.RoleChoices.SUPERVISOR:
        supervisor = getattr(user, 'supervisor_profile', None)
        encadrant = getattr(supervisor, 'encadrant_profile', None) if supervisor else None
        if encadrant:
            return encadrant

    if conversation:
        ctx = getattr(conversation, 'context', None)
        snap = (getattr(ctx, 'context_snapshot_json', None) or {}) if ctx else {}
        profile_id = snap.get('encadrant_profile_id')
        if profile_id:
            encadrant = (
                EncadrantProfile.objects.select_related('supervisor_profile__user')
                .filter(pk=profile_id)
                .first()
            )
            if encadrant:
                return encadrant

    if student:
        from apps.admin_management.models import Assignment
        from apps.encadrant.models import SupervisedStudent

        link = (
            SupervisedStudent.objects.filter(student_profile=student, is_active=True)
            .select_related('encadrant_profile__supervisor_profile__user')
            .first()
        )
        if link:
            return link.encadrant_profile
        assignment = (
            Assignment.objects.filter(student_profile=student, is_active=True)
            .select_related('encadrant_profile__supervisor_profile__user')
            .first()
        )
        if assignment:
            return assignment.encadrant_profile
    return None


def _list_encadrant_meetings(student: StudentProfile | None, encadrant) -> list[dict[str, str]]:
    from apps.encadrant.models import Meeting

    if not student:
        return []

    meetings = Meeting.objects.filter(student_profile=student)
    if encadrant:
        meetings = meetings.filter(encadrant_profile=encadrant)
    meetings = meetings.order_by('-planned_start', '-scheduled_at', '-updated_at')[:25]

    items: list[dict[str, str]] = []
    for meeting in meetings:
        planned = meeting.planned_start or meeting.scheduled_at
        when = planned.strftime('%d/%m/%Y %H:%M') if planned else ''
        status = meeting.get_status_display()
        items.append(
            {
                'entity_type': 'meeting',
                'entity_id': str(meeting.pk),
                'label': meeting.title or 'Réunion de supervision',
                'subtitle': ' · '.join(part for part in (when, status) if part),
                'module': 'encadrant',
            }
        )
    return items


def _list_encadrant_tasks(
    student: StudentProfile | None,
    encadrant,
    encadrant_user: User | None,
) -> list[dict[str, str]]:
    from django.db.models import Q

    from apps.encadrant.models import Task

    if not student:
        return []

    tasks = Task.objects.filter(assigned_to_student=student).exclude(status=Task.Status.CANCELLED)
    if encadrant:
        scope = Q(workspace__owner_encadrant=encadrant)
        if encadrant_user:
            scope |= Q(assigned_by=encadrant_user)
        tasks = tasks.filter(scope)
    tasks = tasks.order_by('-updated_at')[:25]

    items: list[dict[str, str]] = []
    for task in tasks:
        due = task.due_at.strftime('%d/%m/%Y') if task.due_at else ''
        items.append(
            {
                'entity_type': 'task',
                'entity_id': str(task.pk),
                'label': task.title or 'Tâche',
                'subtitle': ' · '.join(part for part in (task.get_status_display(), due) if part),
                'module': 'encadrant',
            }
        )
    return items


def _list_encadrant_reports(student: StudentProfile | None, encadrant) -> list[dict[str, str]]:
    from apps.encadrant.models import Report

    if not student:
        return []

    reports = Report.objects.filter(student_profile=student).exclude(status=Report.Status.ARCHIVED)
    if encadrant:
        reports = reports.filter(encadrant_profile=encadrant)
    reports = reports.order_by('-updated_at')[:25]

    items: list[dict[str, str]] = []
    for report in reports:
        items.append(
            {
                'entity_type': 'report',
                'entity_id': str(report.pk),
                'label': report.title or 'Rapport',
                'subtitle': ' · '.join(
                    part
                    for part in (report.get_report_type_display(), report.get_status_display())
                    if part
                ),
                'module': 'encadrant',
            }
        )
    return items


def _list_encadrant_internships(student: StudentProfile | None) -> list[dict[str, str]]:
    if not student:
        return []

    from apps.stage.models import OfferApplication

    items: list[dict[str, str]] = []
    active_apps = (
        OfferApplication.objects.filter(student_profile=student)
        .exclude(status__in=['REJECTED', 'WITHDRAWN', 'CANCELLED'])
        .select_related('offer')
        .order_by('-updated_at')[:10]
    )
    for application in active_apps:
        if not application.offer:
            continue
        items.append(
            {
                'entity_type': 'internship_offer',
                'entity_id': str(application.offer.uuid),
                'label': f'Stage — {application.offer.title}',
                'subtitle': application.offer.company_name or str(application.status or ''),
                'module': 'offers',
            }
        )
    return items


def _list_encadrant(
    user: User,
    student: StudentProfile | None,
    *,
    q: str | None,
    request: HttpRequest | None,
    conversation: Conversation | None = None,
) -> list[dict[str, str]]:
    encadrant = _encadrant_profile_for_refs(user, conversation, student)
    encadrant_user = None
    if encadrant:
        supervisor = getattr(encadrant, 'supervisor_profile', None)
        encadrant_user = getattr(supervisor, 'user', None) if supervisor else None

    items: list[dict[str, str]] = []
    items.extend(_list_encadrant_meetings(student, encadrant))
    items.extend(_list_encadrant_tasks(student, encadrant, encadrant_user))
    items.extend(_list_encadrant_reports(student, encadrant))
    items.extend(_list_encadrant_internships(student))
    return _filter_query(items, q, limit=120)


def _list_platform(
    user: User,
    student: StudentProfile | None,
    *,
    q: str | None,
    request: HttpRequest | None,
) -> list[dict[str, str]]:
    if not student:
        return []

    merged: list[dict[str, str]] = []
    for label, loader in (
        ('documents', _list_documents),
        ('offers', _list_offers),
        ('announcements', _list_announcements),
        ('srf', _list_srf),
    ):
        try:
            merged.extend(loader(user, student, q=q, request=request))
        except Exception:
            continue

    if q:
        return _filter_query(merged, q)
    return merged[:ENTITY_LIST_LIMIT]


_MODULE_LOADERS = {
    ConversationContext.Module.DOCUMENTS: _list_documents,
    ConversationContext.Module.OFFERS: _list_offers,
    ConversationContext.Module.ANNOUNCEMENTS: _list_announcements,
    ConversationContext.Module.SRF: _list_srf,
    ConversationContext.Module.ENCADRANT: _list_encadrant,
    ConversationContext.Module.PLATFORM: _list_platform,
}


def list_entity_references(
    user: User,
    module: str,
    *,
    conversation_id: int | None = None,
    q: str | None = None,
    request: HttpRequest | None = None,
) -> list[dict[str, str]]:
    module_key = (module or '').strip().lower()
    loader = _MODULE_LOADERS.get(module_key)
    if not loader:
        return []

    conversation = None
    if conversation_id:
        conversation = (
            Conversation.objects.select_related('context', 'context__student_user__student_profile')
            .filter(pk=conversation_id)
            .first()
        )

    student = _resolve_student_profile(user, conversation)
    if module_key == ConversationContext.Module.ENCADRANT:
        return _list_encadrant(
            user,
            student,
            q=q,
            request=request,
            conversation=conversation,
        )
    return loader(user, student, q=q, request=request)


def _ref_key(ref: dict[str, str]) -> tuple[str, str]:
    return ref['entity_type'], ref['entity_id']


SUPERVISION_SOFT_ENTITY_TYPES = frozenset({'task', 'meeting', 'report'})


def _is_supervision_soft_ref(
    module: str,
    conversation: Conversation | None,
    ref: dict[str, str],
) -> bool:
    """Allow tagging a supervision item even when it is not yet in the catalog."""
    if module != ConversationContext.Module.ENCADRANT:
        return False
    if ref.get('entity_type') not in SUPERVISION_SOFT_ENTITY_TYPES:
        return False
    ctx = getattr(conversation, 'context', None)
    return bool(ctx and ctx.entity_type == 'supervision_dm')


def sanitize_entity_refs(
    user: User,
    module: str | None,
    refs: list[dict[str, Any]] | None,
    *,
    conversation_id: int | None = None,
    request: HttpRequest | None = None,
) -> list[dict[str, str]]:
    if not refs or not module:
        return []

    normalized: list[dict[str, str]] = []
    for raw in refs[:ENTITY_REF_MAX]:
        ref = _normalize_ref(raw)
        if ref:
            normalized.append(ref)
    if not normalized:
        return []

    conversation = None
    if conversation_id:
        conversation = (
            Conversation.objects.select_related('context')
            .filter(pk=conversation_id)
            .first()
        )

    allowed = list_entity_references(
        user,
        module,
        conversation_id=conversation_id,
        request=request,
    )
    allowed_keys = {_ref_key(item) for item in allowed}

    # Platform messages may reference entities from sibling modules.
    if module == ConversationContext.Module.PLATFORM:
        for sibling in (
            ConversationContext.Module.DOCUMENTS,
            ConversationContext.Module.OFFERS,
            ConversationContext.Module.ANNOUNCEMENTS,
            ConversationContext.Module.SRF,
        ):
            for item in list_entity_references(
                user,
                sibling,
                conversation_id=conversation_id,
                request=request,
            ):
                allowed_keys.add(_ref_key(item))

    clean: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for ref in normalized:
        key = _ref_key(ref)
        if key in seen:
            continue
        if key not in allowed_keys and not _is_supervision_soft_ref(module, conversation, ref):
            continue
        seen.add(key)
        clean.append(ref)
    return clean
