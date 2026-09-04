"""
Calendar authorization.

Everything the API is allowed to see or touch is decided here, server-side.
IDs arriving from the client are treated as untrusted claims: an event UUID, a
participant user id, a student profile id or an assignment id is only honoured
after it has been re-derived from the acting user's own relationships.

Relationship truth is not reinvented — it is read from the existing supervision
primitives in ``apps.encadrant.services.meeting_authorization``
(``Assignment`` + ``SupervisedStudent``) and from the existing admin academic
scope in ``apps.admin_management.services.scopes``.

Read model
----------
=============  =======================================================
Student        events they organize, are invited to, or that are
               attached to their own student profile with a visibility
               wider than PRIVATE.
Encadrant      the same, plus SUPERVISION-visible events of students
               actually assigned to them.
Admin          events inside their academic scope, plus their own.
=============  =======================================================
"""

from __future__ import annotations

from dataclasses import dataclass, field

from django.db.models import Q, QuerySet
from rest_framework.exceptions import NotFound, PermissionDenied

from apps.accounts_et_roles.models import StudentProfile, User
from apps.admin_management.models import Assignment, EncadrantProfile
from apps.admin_management.services.scopes import (
    get_admin_scope,
    is_super_admin,
)
from apps.encadrant.models import SupervisedStudent
from apps.encadrant.services.meeting_authorization import (
    pair_is_allowed,
    supervised_student_ids,
)

from ..models import CalendarEvent, EventParticipant, EventVisibility


@dataclass
class ActorContext:
    """Everything the calendar needs to know about the caller, resolved once."""

    user: User
    role: str
    student_profile: StudentProfile | None = None
    encadrant_profile: EncadrantProfile | None = None
    supervised_student_ids: set[int] = field(default_factory=set)
    supervising_encadrant_ids: set[int] = field(default_factory=set)
    is_admin: bool = False
    _admin_scope: dict | None = field(default=None, repr=False)
    _is_super_admin: bool | None = field(default=None, repr=False)

    @property
    def is_student(self) -> bool:
        return self.role == User.RoleChoices.STUDENT

    @property
    def is_encadrant(self) -> bool:
        return self.role == User.RoleChoices.SUPERVISOR

    @property
    def admin_scope(self) -> dict:
        """Cached: serializing a page of events must not re-query the scope per row."""
        if self._admin_scope is None:
            self._admin_scope = get_admin_scope(self.user)
        return self._admin_scope

    @property
    def super_admin(self) -> bool:
        if self._is_super_admin is None:
            self._is_super_admin = is_super_admin(self.user)
        return self._is_super_admin


def build_actor_context(user: User) -> ActorContext:
    """Resolve the caller's calendar identity from the database, never from input."""
    ctx = ActorContext(user=user, role=user.role)

    if user.role == User.RoleChoices.STUDENT:
        ctx.student_profile = getattr(user, 'student_profile', None)
        if ctx.student_profile:
            ctx.supervising_encadrant_ids = _encadrant_ids_for_student(ctx.student_profile.pk)
        return ctx

    if user.role == User.RoleChoices.SUPERVISOR:
        supervisor_profile = getattr(user, 'supervisor_profile', None)
        ctx.encadrant_profile = getattr(supervisor_profile, 'encadrant_profile', None)
        if ctx.encadrant_profile:
            ctx.supervised_student_ids = supervised_student_ids(ctx.encadrant_profile)
        return ctx

    ctx.is_admin = user.role == User.RoleChoices.ADMIN or user.is_superuser
    return ctx


def _encadrant_ids_for_student(student_profile_id: int) -> set[int]:
    """Encadrant profile ids currently supervising this student."""
    ids = set(
        Assignment.objects.filter(
            student_profile_id=student_profile_id,
            is_active=True,
            encadrant_profile__isnull=False,
        ).values_list('encadrant_profile_id', flat=True),
    )
    ids.update(
        SupervisedStudent.objects.filter(
            student_profile_id=student_profile_id,
            is_active=True,
        ).values_list('encadrant_profile_id', flat=True),
    )
    return ids


# ---------------------------------------------------------------------------
# Read access
# ---------------------------------------------------------------------------

def visible_events_q(ctx: ActorContext) -> Q:
    """
    The ``Q`` describing every event this actor may read.

    Expressed as a single predicate so it can be pushed into the database
    instead of filtering in Python after loading the calendar.
    """
    user = ctx.user

    # Always visible: what you organize, and what you were invited to.
    own = Q(organizer_id=user.pk) | Q(participants__user_id=user.pk)

    if ctx.is_student:
        if not ctx.student_profile:
            return own
        # Events attached to this student's own file, unless marked private by
        # someone else (a private event is only ever its organizer's business).
        return own | (
            Q(related_student_id=ctx.student_profile.pk)
            & ~Q(visibility=EventVisibility.PRIVATE)
        )

    if ctx.is_encadrant:
        if not ctx.encadrant_profile:
            return own
        supervision = Q(visibility=EventVisibility.SUPERVISION) & (
            Q(related_encadrant_id=ctx.encadrant_profile.pk)
            | Q(related_student_id__in=ctx.supervised_student_ids)
            | Q(related_assignment__encadrant_profile_id=ctx.encadrant_profile.pk)
        )
        return own | supervision

    if ctx.is_admin:
        return own | _admin_scope_q(ctx)

    return own


def _admin_scope_q(ctx: ActorContext) -> Q:
    """Admin visibility, bounded by the academic scope they were granted."""
    not_private = ~Q(visibility=EventVisibility.PRIVATE)

    if ctx.super_admin:
        return not_private

    scope = ctx.admin_scope
    if scope['global']:
        return not_private
    if not scope['filiere_ids'] and not scope['class_group_ids'] and not scope['level_ids']:
        # A scoped admin with no scope rows sees nothing beyond their own events.
        return Q(pk__in=[])

    scoped = Q()
    if scope['filiere_ids']:
        scoped |= Q(related_student__filiere_id__in=scope['filiere_ids'])
    if scope['class_group_ids']:
        scoped |= Q(related_student__class_group_id__in=scope['class_group_ids'])
    if scope['level_ids']:
        scoped |= Q(related_student__academic_level_id__in=scope['level_ids'])
    if scope['sector_ids']:
        scoped |= Q(related_student__academic_sector_id__in=scope['sector_ids'])
    return not_private & scoped


def base_event_queryset() -> QuerySet[CalendarEvent]:
    """Read queryset with every relation the serializer touches pre-joined."""
    return (
        CalendarEvent.objects.select_related(
            'organizer__profile',
            'related_student__user__profile',
            'related_encadrant__supervisor_profile__user__profile',
            'related_assignment',
            'related_offer',
            'related_report',
            'related_task',
            'related_application__offer',
            'related_document_request',
            'meeting',
            'conversation',
            'recurrence',
        )
        .prefetch_related(
            'participants__user__profile',
            'reminders',
        )
    )


def visible_events(ctx: ActorContext) -> QuerySet[CalendarEvent]:
    return base_event_queryset().filter(visible_events_q(ctx)).distinct()


def get_visible_event_or_404(ctx: ActorContext, event_uuid) -> CalendarEvent:
    """
    Fetch by public UUID with authorization folded into the lookup.

    An event the caller may not read is reported as *not found* rather than
    *forbidden*, so event ids cannot be probed for existence.
    """
    event = visible_events(ctx).filter(uuid=event_uuid).first()
    if event is None:
        raise NotFound('Event not found.')
    return event


def can_view_event(ctx: ActorContext, event: CalendarEvent) -> bool:
    return visible_events(ctx).filter(pk=event.pk).exists()


# ---------------------------------------------------------------------------
# Write access
# ---------------------------------------------------------------------------

def can_manage_event(ctx: ActorContext, event: CalendarEvent) -> bool:
    """
    Who may modify or delete an event.

    Organizer always. Admins within scope. Participants may only answer their
    own invitation, which is handled separately — being invited never grants
    edit rights.
    """
    if event.organizer_id == ctx.user.pk:
        return True
    if ctx.is_admin:
        return _admin_can_manage(ctx, event)
    return False


def _admin_can_manage(ctx: ActorContext, event: CalendarEvent) -> bool:
    if ctx.super_admin:
        return True
    if event.visibility == EventVisibility.PRIVATE:
        return False
    if event.related_student_id is None:
        return False
    scope = ctx.admin_scope
    if scope['global']:
        return True
    student = event.related_student
    if scope['filiere_ids'] and student.filiere_id in scope['filiere_ids']:
        return True
    if scope['class_group_ids'] and student.class_group_id in scope['class_group_ids']:
        return True
    if scope['level_ids'] and student.academic_level_id in scope['level_ids']:
        return True
    if scope['sector_ids'] and student.academic_sector_id in scope['sector_ids']:
        return True
    return False


def assert_can_manage_event(ctx: ActorContext, event: CalendarEvent) -> None:
    if not can_manage_event(ctx, event):
        raise PermissionDenied('You are not allowed to modify this event.')


# ---------------------------------------------------------------------------
# Invitation rules
# ---------------------------------------------------------------------------

def invitable_users(ctx: ActorContext) -> QuerySet[User]:
    """
    The exact set of users this actor may add as participants.

    Students may only invite the encadrant(s) actually assigned to them;
    encadrants only the students they actually supervise. This is what stops
    the frontend from posting an arbitrary user id.
    """
    if ctx.is_student:
        if not ctx.supervising_encadrant_ids:
            return User.objects.none()
        return User.objects.filter(
            supervisor_profile__encadrant_profile__id__in=ctx.supervising_encadrant_ids,
            is_active=True,
        ).select_related('profile')

    if ctx.is_encadrant:
        if not ctx.supervised_student_ids:
            return User.objects.none()
        return User.objects.filter(
            student_profile__id__in=ctx.supervised_student_ids,
            is_active=True,
        ).select_related('profile')

    if ctx.is_admin:
        from apps.admin_management.services.scopes import filter_students_by_admin_scope

        students = filter_students_by_admin_scope(
            User.objects.filter(role=User.RoleChoices.STUDENT, is_active=True),
            ctx.user,
        )
        supervisors = User.objects.filter(
            role=User.RoleChoices.SUPERVISOR,
            is_active=True,
        )
        return (students | supervisors).distinct().select_related('profile')

    return User.objects.none()


def assert_can_invite(ctx: ActorContext, user_ids: list[int]) -> list[User]:
    """Validate every requested participant against the caller's allowed set."""
    wanted = {int(uid) for uid in user_ids if int(uid) != ctx.user.pk}
    if not wanted:
        return []
    allowed = {u.pk: u for u in invitable_users(ctx).filter(pk__in=wanted)}
    rejected = sorted(wanted - set(allowed))
    if rejected:
        raise PermissionDenied(
            'You are not allowed to invite these users: '
            + ', '.join(str(uid) for uid in rejected)
            + '.',
        )
    return [allowed[uid] for uid in sorted(wanted)]


# ---------------------------------------------------------------------------
# Business-context validation
# ---------------------------------------------------------------------------

def resolve_student_profile(ctx: ActorContext, student_profile_id) -> StudentProfile:
    """Resolve a claimed student id, refusing students the caller cannot touch."""
    profile = StudentProfile.objects.filter(pk=int(student_profile_id)).first()
    if profile is None:
        raise NotFound('Student not found.')

    if ctx.is_student:
        if not ctx.student_profile or profile.pk != ctx.student_profile.pk:
            raise PermissionDenied('You cannot attach an event to another student.')
        return profile

    if ctx.is_encadrant:
        if profile.pk not in ctx.supervised_student_ids:
            raise PermissionDenied('This student is not under your supervision.')
        return profile

    if ctx.is_admin:
        from apps.admin_management.services.scopes import assert_student_in_scope

        assert_student_in_scope(ctx.user, profile.user)
        return profile

    raise PermissionDenied('You cannot attach students to events.')


def resolve_encadrant_profile(ctx: ActorContext, encadrant_profile_id) -> EncadrantProfile:
    profile = EncadrantProfile.objects.filter(pk=int(encadrant_profile_id)).first()
    if profile is None:
        raise NotFound('Encadrant not found.')

    if ctx.is_student:
        if profile.pk not in ctx.supervising_encadrant_ids:
            raise PermissionDenied('This encadrant is not assigned to you.')
        return profile

    if ctx.is_encadrant:
        if not ctx.encadrant_profile or profile.pk != ctx.encadrant_profile.pk:
            raise PermissionDenied('You cannot attach an event to another encadrant.')
        return profile

    if ctx.is_admin:
        return profile

    raise PermissionDenied('You cannot attach encadrants to events.')


def resolve_assignment(ctx: ActorContext, assignment_id) -> Assignment:
    """Resolve the internship/supervision context, verifying the caller belongs to it."""
    assignment = (
        Assignment.objects
        .select_related('student_profile__user', 'encadrant_profile')
        .filter(pk=int(assignment_id))
        .first()
    )
    if assignment is None:
        raise NotFound('Assignment not found.')

    if ctx.is_student:
        if not ctx.student_profile or assignment.student_profile_id != ctx.student_profile.pk:
            raise PermissionDenied('This assignment does not belong to you.')
        return assignment

    if ctx.is_encadrant:
        if not ctx.encadrant_profile:
            raise PermissionDenied('Encadrant profile required.')
        if assignment.encadrant_profile_id != ctx.encadrant_profile.pk:
            raise PermissionDenied('This assignment is not yours.')
        return assignment

    if ctx.is_admin:
        from apps.admin_management.services.scopes import assert_student_in_scope

        assert_student_in_scope(ctx.user, assignment.student_profile.user)
        return assignment

    raise PermissionDenied('You cannot attach assignments to events.')


def assert_pair_allowed(student_profile_id: int, encadrant_profile_id: int) -> None:
    """Reuse the supervision pairing rule already enforced by meeting sessions."""
    if not pair_is_allowed(student_profile_id, encadrant_profile_id):
        raise PermissionDenied('This student and encadrant are not linked.')


def participant_record(event: CalendarEvent, user: User) -> EventParticipant | None:
    return EventParticipant.objects.filter(event=event, user=user).first()
