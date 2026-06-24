"""Internship-specific chat logic — wraps canonical chat app."""

from __future__ import annotations

from typing import Any, Optional

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.accounts_et_roles.models import StudentProfile
from apps.chat.models import Channel, Conversation, ConversationContext, ConversationParticipant, Message
from apps.chat.services.conversation_service import get_or_create_contextual_conversation
from apps.chat.services.message_service import send_message as chat_send_message
from apps.chat.services.message_service import unread_count_for_user as chat_unread_count
from apps.chat.services.realtime import publish_message_created
from apps.chat.services.seed import seed_chat_infrastructure
from apps.stage.models import InternshipOffer, OfferApplication
from apps.stage.services.notifications import _internship_admin_users
from apps.stage.services.permissions import user_can_access_chat

User = get_user_model()
MODULE = ConversationContext.Module.OFFERS
CHANNEL_CODE = 'support-stage'
ENTITY_TYPE = 'internship_offer'


def _ensure_chat_infrastructure() -> None:
    """Seed channels/tags once; skip the full seed on every chat open."""
    if Channel.objects.filter(code=CHANNEL_CODE, is_archived=False).exists():
        return
    seed_chat_infrastructure()


def offer_thread_entity_id(offer: InternshipOffer, student: StudentProfile) -> str:
    return f'{offer.uuid}:{student.pk}'


def offer_uuid_from_context(ctx: ConversationContext) -> str | None:
    snapshot = ctx.context_snapshot_json or {}
    if snapshot.get('offer_uuid'):
        return str(snapshot['offer_uuid'])
    entity_id = ctx.entity_id or ''
    if ':' in entity_id:
        return entity_id.split(':', 1)[0]
    return entity_id or None


def get_application_for_chat(offer: InternshipOffer, student: StudentProfile) -> OfferApplication | None:
    return (
        OfferApplication.objects.filter(offer=offer, student_profile=student)
        .order_by('-applied_at')
        .first()
    )


def _internship_admin_participants() -> list[User]:
    return _internship_admin_users()


def ensure_conversation_participants(
    conversation: Conversation,
    users: list[User],
    *,
    default_role: str = ConversationParticipant.Role.MEMBER,
) -> None:
    seen: set[int] = set()
    for user in users:
        if not user or user.pk in seen:
            continue
        seen.add(user.pk)
        part, created = ConversationParticipant.objects.get_or_create(
            conversation=conversation,
            user=user,
            defaults={'role': default_role},
        )
        if part.left_at:
            part.left_at = None
            part.save(update_fields=['left_at', 'updated_at'])
        if created and user.role == User.RoleChoices.ADMIN and default_role == ConversationParticipant.Role.MEMBER:
            part.role = ConversationParticipant.Role.ADMIN
            part.save(update_fields=['role', 'updated_at'])


def _student_phone(student: StudentProfile) -> str:
    user = student.user
    if not user:
        return ''
    profile = getattr(user, 'profile', None)
    return getattr(profile, 'phone', '') or ''


def _next_interview_at(application: OfferApplication | None) -> str | None:
    if not application:
        return None
    try:
        from apps.stage.models_extended import Interview

        interview = (
            Interview.objects.filter(
                application=application,
                status__in=('SCHEDULED', 'CONFIRMED', 'RESCHEDULED'),
            )
            .order_by('scheduled_at')
            .first()
        )
        if interview and interview.scheduled_at:
            return interview.scheduled_at.isoformat()
    except Exception:
        pass
    return None


def _student_display_name(student: StudentProfile) -> str:
    user = student.user
    profile = getattr(user, 'profile', None)
    candidates = (
        (user.first_name, user.last_name),
        (
            getattr(profile, 'first_name', '') if profile else '',
            getattr(profile, 'last_name', '') if profile else '',
        ),
    )
    for first, last in candidates:
        name = f'{first} {last}'.strip()
        if name:
            return name
    return ''


def resolve_student_for_context(
    *,
    student_user_id: int | None,
    snapshot: dict[str, Any] | None = None,
) -> StudentProfile | None:
    snap = snapshot or {}
    student_profile_id = snap.get('student_profile_id')
    resolved_user_id = student_user_id or snap.get('student_user_id')
    if not student_profile_id and not resolved_user_id:
        return None

    queryset = StudentProfile.objects.select_related('user', 'user__profile')
    if student_profile_id:
        student = queryset.filter(pk=student_profile_id).first()
        if student:
            return student
    if resolved_user_id:
        return queryset.filter(user_id=resolved_user_id).first()
    return None


def resolve_student_display_name_for_context(
    *,
    student_user_id: int | None,
    snapshot: dict[str, Any] | None = None,
) -> str:
    snap = snapshot or {}
    cached = str(snap.get('student_name') or '').strip()
    if cached:
        return cached
    student = resolve_student_for_context(student_user_id=student_user_id, snapshot=snap)
    if not student:
        return ''
    return _student_display_name(student)


def _student_avatar_url(student: StudentProfile, request=None) -> str | None:
    profile = getattr(student.user, 'profile', None)
    if not profile or not profile.avatar:
        return None
    url = profile.avatar.url
    if request:
        return request.build_absolute_uri(url)
    return url


def _offer_company_logo_url(offer: InternshipOffer, request=None) -> str | None:
    if offer.company_logo:
        url = offer.company_logo.url
        if request:
            return request.build_absolute_uri(url)
        return url
    meta_logo = (offer.metadata_json or {}).get('company_logo')
    if meta_logo:
        return str(meta_logo)
    company = getattr(offer, 'company', None)
    if company and getattr(company, 'logo', None):
        url = company.logo.url
        if request:
            return request.build_absolute_uri(url)
        return url
    return None


def _build_context_snapshot(
    *,
    offer: InternshipOffer,
    student: StudentProfile,
    application: OfferApplication | None,
) -> dict[str, Any]:
    user = student.user
    student_name = _student_display_name(student)
    filiere = getattr(student, 'filiere', None)
    class_group = getattr(student, 'class_group', None)
    academic_level = getattr(student, 'academic_level', None)
    internship_type = getattr(student, 'internship_type', None)

    return {
        'offer_id': offer.pk,
        'offer_uuid': str(offer.uuid),
        'offer_title': offer.title,
        'offer_type': offer.offer_type,
        'company_name': offer.company_name,
        'company_logo_url': _offer_company_logo_url(offer),
        'application_deadline': (
            offer.application_deadline.isoformat() if offer.application_deadline else None
        ),
        'student_profile_id': student.pk,
        'student_user_id': user.pk if user else None,
        'student_name': student_name,
        'student_email': user.email if user else '',
        'student_avatar_url': _student_avatar_url(student),
        'student_phone': _student_phone(student),
        'filiere_id': student.filiere_id,
        'filiere_name': filiere.name if filiere else (student.program_major or ''),
        'class_group_id': student.class_group_id,
        'class_code': (
            class_group.code
            if class_group
            else (student.current_class or '')
        ),
        'academic_level': (
            academic_level.code or academic_level.name if academic_level else ''
        ),
        'internship_type': (
            internship_type.name if internship_type else offer.offer_type
        ),
        'application_id': application.pk if application else None,
        'application_uuid': str(application.uuid) if application else None,
        'application_status': application.status if application else None,
        'applied_at': (
            application.applied_at.isoformat()
            if application and application.applied_at
            else None
        ),
        'last_status_change_at': (
            application.last_status_change_at.isoformat()
            if application and application.last_status_change_at
            else None
        ),
        'interview_at': _next_interview_at(application),
    }


def get_or_create_offer_conversation(
    *,
    offer: InternshipOffer,
    student: StudentProfile,
    admin_users: list[User] | None = None,
    created_by: User | None = None,
) -> Conversation:
    _ensure_chat_infrastructure()
    entity_id = offer_thread_entity_id(offer, student)
    existing = (
        Conversation.objects.filter(
            context__module=MODULE,
            context__entity_type=ENTITY_TYPE,
            context__entity_id=entity_id,
            is_archived=False,
        )
        .select_related('context')
        .first()
    )
    if existing:
        ensure_conversation_participants(existing, [student.user])
        return existing

    student = (
        StudentProfile.objects.select_related(
            'user',
            'user__profile',
            'filiere',
            'class_group',
            'academic_level',
            'internship_type',
        )
        .filter(pk=student.pk)
        .first()
        or student
    )
    application = get_application_for_chat(offer, student)
    workflow_status = application.status if application else 'INQUIRY'
    student_name = _student_display_name(student)
    display_name = student_name or student.user.email

    admins = list(admin_users or [])
    for admin in _internship_admin_participants():
        if admin.pk not in {u.pk for u in admins}:
            admins.append(admin)

    conv = get_or_create_contextual_conversation(
        module=MODULE,
        entity_type=ENTITY_TYPE,
        entity_id=entity_id,
        title=f'{offer.title} — {display_name}',
        entity_label=f'{offer.company_name} / {offer.title}',
        workflow_status=workflow_status,
        student_user=student.user,
        is_internal_only=False,
        context_snapshot=_build_context_snapshot(offer=offer, student=student, application=application),
        participant_users=[student.user, *admins],
        created_by=created_by,
        channel_code=CHANNEL_CODE,
    )
    ensure_conversation_participants(conv, [student.user, *admins])
    _sync_offer_context(conv, offer=offer, student=student, application=application)
    return conv


def _sync_offer_context(
    conversation: Conversation,
    *,
    offer: InternshipOffer,
    student: StudentProfile,
    application: OfferApplication | None,
) -> None:
    ctx = getattr(conversation, 'context', None)
    if not ctx:
        return
    snapshot = _build_context_snapshot(offer=offer, student=student, application=application)
    workflow_status = application.status if application else ctx.workflow_status or 'INQUIRY'
    ctx.workflow_status = workflow_status
    ctx.context_snapshot_json = {**(ctx.context_snapshot_json or {}), **snapshot}
    ctx.student_user = student.user
    ctx.entity_label = f'{offer.company_name} / {offer.title}'
    ctx.save(update_fields=['workflow_status', 'context_snapshot_json', 'student_user', 'entity_label', 'updated_at'])


def post_offer_thread_event(
    *,
    offer: InternshipOffer,
    student: StudentProfile,
    body: str,
    actor: User | None = None,
    message_type: str = Message.MessageType.EVENT,
    metadata: Optional[dict[str, Any]] = None,
) -> Message | None:
    conv = get_or_create_offer_conversation(
        offer=offer,
        student=student,
        admin_users=[actor] if actor and actor.role == User.RoleChoices.ADMIN else [],
        created_by=actor,
    )
    msg = Message.objects.create(
        conversation=conv,
        sender=actor,
        body=body.strip(),
        message_type=message_type,
        metadata_json=metadata or {},
    )
    conv.last_message_at = timezone.now()
    conv.save(update_fields=['last_message_at', 'updated_at'])
    publish_message_created(
        conv.pk,
        {
            'message_id': msg.pk,
            'sender_id': actor.pk if actor else None,
            'body': body.strip()[:200],
            'message_type': message_type,
        },
    )
    return msg


def on_application_submitted(application: OfferApplication, *, actor: User | None = None) -> Conversation:
    offer = application.offer
    student = application.student_profile
    post_offer_thread_event(
        offer=offer,
        student=student,
        actor=actor,
        body=f'Candidature soumise pour {offer.title}.',
        metadata={
            'event': 'application_submitted',
            'application_id': application.pk,
            'application_uuid': str(application.uuid),
        },
    )
    return get_or_create_offer_conversation(offer=offer, student=student, created_by=actor)


def on_application_status_changed(
    application: OfferApplication,
    *,
    previous_status: str,
    actor: User | None = None,
) -> Conversation:
    offer = application.offer
    student = application.student_profile
    post_offer_thread_event(
        offer=offer,
        student=student,
        actor=actor,
        body=f'Statut de candidature : {previous_status} → {application.status}.',
        metadata={
            'event': 'application_status_changed',
            'previous_status': previous_status,
            'new_status': application.status,
            'application_id': application.pk,
        },
    )
    return get_or_create_offer_conversation(
        offer=offer,
        student=student,
        admin_users=[actor] if actor and actor.role == User.RoleChoices.ADMIN else [],
        created_by=actor,
    )


def send_offer_message(
    *,
    conversation: Conversation,
    sender: User,
    body: str,
    attachments: Optional[list[dict[str, Any]]] = None,
) -> Message | None:
    if not user_can_access_chat(sender):
        raise PermissionError('Chat access denied.')
    ensure_conversation_participants(conversation, [sender])
    message = chat_send_message(
        user=sender,
        conversation_id=conversation.pk,
        body=body,
        metadata={'attachments': attachments or []},
    )
    if not message:
        return None
    return message


def assign_offer_conversation(conversation: Conversation, assignee: User, actor: User) -> Conversation:
    part, _ = ConversationParticipant.objects.get_or_create(
        conversation=conversation,
        user=assignee,
        defaults={'role': ConversationParticipant.Role.ADMIN},
    )
    if part.role != ConversationParticipant.Role.ADMIN:
        part.role = ConversationParticipant.Role.ADMIN
        part.save(update_fields=['role', 'updated_at'])
    meta = conversation.metadata_json or {}
    meta['assigned_to'] = assignee.pk
    meta['assigned_by'] = actor.pk
    conversation.metadata_json = meta
    conversation.save(update_fields=['metadata_json', 'updated_at'])
    return conversation


def resolve_offer_conversation(conversation: Conversation, actor: User, resolution_note: str = '') -> Conversation:
    ctx = getattr(conversation, 'context', None)
    if ctx:
        ctx.workflow_status = 'RESOLVED'
        ctx.context_snapshot_json = {
            **(ctx.context_snapshot_json or {}),
            'resolution_note': resolution_note,
            'resolved_by': actor.pk,
        }
        ctx.save(update_fields=['workflow_status', 'context_snapshot_json', 'updated_at'])
    return conversation


def archive_offer_conversation(conversation: Conversation, actor: User) -> Conversation:
    """Hide a thread from the admin inbox only; students keep full access."""
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


def unarchive_offer_conversation(conversation: Conversation, actor: User) -> Conversation:
    """Restore a thread to the active admin inbox."""
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


def total_unread_for_user(user: User) -> int:
    from apps.chat.services.conversation_service import list_module_conversations

    convs = list_module_conversations(user, module=MODULE)
    return sum(chat_unread_count(user, c.pk) for c in convs)


def message_history(conversation: Conversation, *, limit: int = 50) -> list[Message]:
    return list(
        Message.objects.filter(conversation=conversation, deleted_at__isnull=True)
        .select_related('sender')
        .order_by('-created_at')[:limit]
    )
