"""Authorization helpers for Student ↔ Encadrant collaboration meetings."""

from __future__ import annotations

from rest_framework.exceptions import PermissionDenied

from apps.accounts_et_roles.models import StudentProfile, User
from apps.admin_management.models import Assignment, EncadrantProfile
from apps.encadrant.models import Meeting, SupervisedStudent


def get_encadrant_profile(user: User) -> EncadrantProfile:
    sp = getattr(user, 'supervisor_profile', None)
    if not sp:
        raise PermissionDenied('Supervisor profile required.')
    ep = getattr(sp, 'encadrant_profile', None)
    if not ep:
        raise PermissionDenied('Encadrant profile required.')
    return ep


def get_student_profile(user: User) -> StudentProfile:
    sp = getattr(user, 'student_profile', None)
    if not sp:
        raise PermissionDenied('Student profile required.')
    return sp


def supervised_student_ids(encadrant: EncadrantProfile) -> set[int]:
    ids = set(
        SupervisedStudent.objects.filter(
            encadrant_profile=encadrant,
            is_active=True,
        ).values_list('student_profile_id', flat=True),
    )
    ids.update(
        Assignment.objects.filter(
            encadrant_profile=encadrant,
            is_active=True,
        ).values_list('student_profile_id', flat=True),
    )
    return ids


def pair_is_allowed(student_profile_id: int, encadrant_profile_id: int) -> bool:
    if Assignment.objects.filter(
        student_profile_id=student_profile_id,
        encadrant_profile_id=encadrant_profile_id,
        is_active=True,
    ).exists():
        return True
    return SupervisedStudent.objects.filter(
        student_profile_id=student_profile_id,
        encadrant_profile_id=encadrant_profile_id,
        is_active=True,
    ).exists()


def resolve_student_encadrant_for_user(
    user: User,
    *,
    student_profile_id: int | None = None,
    encadrant_profile_id: int | None = None,
) -> tuple[StudentProfile, EncadrantProfile]:
    if user.role == User.RoleChoices.STUDENT:
        student = get_student_profile(user)
        if student_profile_id and int(student_profile_id) != student.pk:
            raise PermissionDenied('Cannot start a meeting for another student.')
        if encadrant_profile_id:
            encadrant = EncadrantProfile.objects.filter(pk=encadrant_profile_id).first()
            if not encadrant:
                raise PermissionDenied('Encadrant not found.')
        else:
            assignment = (
                Assignment.objects.filter(
                    student_profile=student,
                    is_active=True,
                    encadrant_profile__isnull=False,
                )
                .select_related('encadrant_profile')
                .order_by('-updated_at')
                .first()
            )
            if assignment and assignment.encadrant_profile:
                encadrant = assignment.encadrant_profile
            else:
                supervision = (
                    SupervisedStudent.objects.filter(
                        student_profile=student,
                        is_active=True,
                    )
                    .select_related('encadrant_profile')
                    .order_by('-period_start')
                    .first()
                )
                if not supervision:
                    raise PermissionDenied('No assigned encadrant found for this student.')
                encadrant = supervision.encadrant_profile
        if not pair_is_allowed(student.pk, encadrant.pk):
            raise PermissionDenied('Student is not assigned to this encadrant.')
        return student, encadrant

    if user.role == User.RoleChoices.SUPERVISOR:
        encadrant = get_encadrant_profile(user)
        if encadrant_profile_id and int(encadrant_profile_id) != encadrant.pk:
            raise PermissionDenied('Cannot start a meeting for another encadrant.')
        allowed = supervised_student_ids(encadrant)
        if not allowed:
            raise PermissionDenied('No supervised students found.')
        if student_profile_id:
            student = StudentProfile.objects.filter(pk=int(student_profile_id)).first()
            if not student or student.pk not in allowed:
                raise PermissionDenied('Student not under your supervision.')
        else:
            if len(allowed) == 1:
                student = StudentProfile.objects.get(pk=next(iter(allowed)))
            else:
                raise PermissionDenied('student_profile_id is required when supervising multiple students.')
        if not pair_is_allowed(student.pk, encadrant.pk):
            raise PermissionDenied('Student is not assigned to this encadrant.')
        return student, encadrant

    raise PermissionDenied('Only students and supervisors may access collaboration meetings.')


def user_can_access_meeting(user: User, meeting: Meeting) -> bool:
    if user.role == User.RoleChoices.STUDENT:
        student = getattr(user, 'student_profile', None)
        if not student or meeting.student_profile_id != student.pk:
            return False
        return pair_is_allowed(student.pk, meeting.encadrant_profile_id)
    if user.role == User.RoleChoices.SUPERVISOR:
        encadrant = get_encadrant_profile(user)
        if meeting.encadrant_profile_id != encadrant.pk:
            return False
        if meeting.student_profile_id:
            return meeting.student_profile_id in supervised_student_ids(encadrant)
        return True
    return False


def assert_user_can_access_meeting(user: User, meeting: Meeting) -> None:
    if not user_can_access_meeting(user, meeting):
        raise PermissionDenied('You are not allowed to access this meeting session.')
