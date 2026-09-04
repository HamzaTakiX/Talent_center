"""Student ↔ Encadrant meeting session APIs (Jitsi-backed)."""

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope
from apps.encadrant.models import Meeting
from apps.encadrant.permissions import IsStudentOrSupervisor
from apps.encadrant.services.meeting_authorization import (
    assert_user_can_access_meeting,
    get_encadrant_profile,
    get_student_profile,
    supervised_student_ids,
)
from apps.encadrant.services.meeting_sessions import (
    create_or_get_meeting_session,
    end_meeting_session,
    list_scheduled_meetings_for_user,
    serialize_meeting_session,
    serialize_scheduled_meeting_item,
)
from apps.encadrant.services.meeting_workflow import transition_meeting_status


class CollaborationContextView(APIView):
    """Minimal context for frontend session creation."""

    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def get(self, request):
        user = request.user
        if user.role == user.RoleChoices.STUDENT:
            student = get_student_profile(user)
            from apps.admin_management.models import Assignment
            from apps.encadrant.models import SupervisedStudent

            assignment = (
                Assignment.objects.filter(
                    student_profile=student,
                    is_active=True,
                    encadrant_profile__isnull=False,
                )
                .select_related(
                    'encadrant_profile__supervisor_profile__user__profile',
                )
                .order_by('-updated_at')
                .first()
            )
            encadrant = assignment.encadrant_profile if assignment else None
            if not encadrant:
                supervision = (
                    SupervisedStudent.objects.filter(
                        student_profile=student,
                        is_active=True,
                    )
                    .select_related('encadrant_profile__supervisor_profile__user__profile')
                    .order_by('-period_start')
                    .first()
                )
                encadrant = supervision.encadrant_profile if supervision else None
            partner = None
            if encadrant:
                sup_user = encadrant.supervisor_profile.user
                partner = {
                    'profile_id': encadrant.pk,
                    'display_name': sup_user.full_name or sup_user.email,
                }
            return Response(
                envelope(
                    True,
                    'OK',
                    data={
                        'role': 'student',
                        'student_profile_id': student.pk,
                        'partner': partner,
                    },
                ),
            )

        encadrant = get_encadrant_profile(user)
        student_ids = supervised_student_ids(encadrant)
        from apps.accounts_et_roles.models import StudentProfile

        students = []
        for sp in StudentProfile.objects.filter(pk__in=student_ids).select_related('user__profile'):
            students.append({
                'profile_id': sp.pk,
                'display_name': sp.user.full_name or sp.user.email,
            })
        return Response(
            envelope(
                True,
                'OK',
                data={
                    'role': 'supervisor',
                    'encadrant_profile_id': encadrant.pk,
                    'students': students,
                },
            ),
        )


class ScheduledMeetingsView(APIView):
    """Joinable scheduled meetings for agenda / dashboard reuse."""

    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def get(self, request):
        meetings = list_scheduled_meetings_for_user(request.user)
        data = [serialize_scheduled_meeting_item(m) for m in meetings]
        return Response(envelope(True, 'OK', data=data))


class MeetingSessionCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def post(self, request):
        mode = (request.data.get('mode') or 'video').strip().lower()
        if mode not in {'video', 'voice'}:
            raise ValidationError({'mode': 'Must be video or voice.'})
        meeting_id = request.data.get('meeting_id')
        student_profile_id = request.data.get('student_profile_id')
        encadrant_profile_id = request.data.get('encadrant_profile_id')
        title = (request.data.get('title') or '').strip() or None

        meeting = create_or_get_meeting_session(
            request.user,
            mode=mode,
            meeting_id=int(meeting_id) if meeting_id else None,
            student_profile_id=int(student_profile_id) if student_profile_id else None,
            encadrant_profile_id=int(encadrant_profile_id) if encadrant_profile_id else None,
            title=title,
        )
        return Response(
            envelope(True, 'Meeting session ready.', data=serialize_meeting_session(meeting, mode=mode)),
            status=201,
        )


class MeetingSessionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def get(self, request, session_uuid):
        meeting = get_object_or_404(
            Meeting.objects.select_related(
                'student_profile__user__profile',
                'encadrant_profile__supervisor_profile__user__profile',
            ),
            session_uuid=session_uuid,
        )
        assert_user_can_access_meeting(request.user, meeting)
        mode = (request.query_params.get('mode') or '').strip().lower() or None
        return Response(
            envelope(True, 'OK', data=serialize_meeting_session(meeting, mode=mode)),
        )


class MeetingSessionJoinView(APIView):
    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def post(self, request, session_uuid):
        meeting = get_object_or_404(Meeting, session_uuid=session_uuid)
        assert_user_can_access_meeting(request.user, meeting)
        mode = (request.data.get('mode') or request.query_params.get('mode') or 'video').strip().lower()
        if mode not in {'video', 'voice'}:
            raise ValidationError({'mode': 'Must be video or voice.'})
        metadata = dict(meeting.metadata_json or {})
        metadata['preferred_media_mode'] = mode
        meeting.metadata_json = metadata
        update_fields = ['metadata_json', 'updated_at']
        if meeting.status in {Meeting.Status.SCHEDULED, Meeting.Status.CONFIRMED}:
            transition_meeting_status(
                meeting,
                Meeting.Status.IN_PROGRESS,
                actor=request.user,
                note='Participant joined session',
            )
        if not meeting.actual_start:
            meeting.actual_start = timezone.now()
            update_fields.append('actual_start')
        meeting.save(update_fields=update_fields)
        return Response(envelope(True, 'Join authorized.', data=serialize_meeting_session(meeting, mode=mode)))


class MeetingSessionEndView(APIView):
    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def post(self, request, session_uuid):
        meeting = get_object_or_404(Meeting, session_uuid=session_uuid)
        meeting = end_meeting_session(request.user, meeting)
        return Response(envelope(True, 'Meeting ended.', data=serialize_meeting_session(meeting)))
