"""Student ↔ Encadrant supervision chat open API."""

from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope
from apps.encadrant.permissions import IsStudentOrSupervisor
from apps.encadrant.services.chat_service import get_or_create_supervision_dm
from apps.encadrant.services.meeting_authorization import resolve_student_encadrant_for_user


class SupervisionChatOpenView(APIView):
    """Open or continue the student ↔ assigned encadrant supervision DM."""

    permission_classes = [IsAuthenticated, IsStudentOrSupervisor]

    def post(self, request):
        student_profile_id = request.data.get('student_profile_id')
        encadrant_profile_id = request.data.get('encadrant_profile_id')
        try:
            student, encadrant = resolve_student_encadrant_for_user(
                request.user,
                student_profile_id=int(student_profile_id) if student_profile_id else None,
                encadrant_profile_id=int(encadrant_profile_id) if encadrant_profile_id else None,
            )
        except PermissionDenied as exc:
            return Response(
                envelope(False, str(exc.detail) if hasattr(exc, 'detail') else str(exc)),
                status=status.HTTP_403_FORBIDDEN,
            )
        except (TypeError, ValueError):
            return Response(
                envelope(False, 'Invalid student_profile_id or encadrant_profile_id'),
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            conv = get_or_create_supervision_dm(
                student=student,
                encadrant=encadrant,
                created_by=request.user,
                request=request,
            )
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=status.HTTP_400_BAD_REQUEST)

        snap = getattr(getattr(conv, 'context', None), 'context_snapshot_json', None) or {}
        return Response(
            envelope(
                True,
                'Conversation ready',
                data={
                    'conversation_id': conv.pk,
                    'encadrant_profile_id': encadrant.pk,
                    'encadrant_name': snap.get('encadrant_name') or '',
                    'student_profile_id': student.pk,
                    'student_name': snap.get('student_name') or '',
                },
            ),
            status=status.HTTP_200_OK,
        )
