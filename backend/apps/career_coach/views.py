"""REST API for AI Career Coach."""

from __future__ import annotations

import json
import uuid

from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope
from apps.career_coach.serializers import (
    ChatRequestSerializer,
    ConversationMessageSerializer,
    CreateSessionSerializer,
    UpdateSessionSerializer,
)
from apps.career_coach.services.ai.factory import get_provider_config
from apps.career_coach.services.coach_service import (
    chat,
    chat_stream,
    get_conversation_history,
    get_student,
    list_sessions,
    warmup_student_context,
)
from apps.career_coach.services.context_builder import build_context_panel
from apps.career_coach.services.perf_metrics import PerfTracker
from apps.career_coach.services.session_service import create_session, delete_session, update_session
from apps.career_coach.services.summary_service import build_session_summary


def _parse_session_id(session_id) -> uuid.UUID | None:
    try:
        return uuid.UUID(str(session_id))
    except ValueError:
        return None


class CareerCoachConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(envelope(True, 'Career coach config.', data=get_provider_config()))


class CareerCoachContextView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = get_student(request.user)
        if not student:
            return Response(
                envelope(False, 'Student profile required.'),
                status=status.HTTP_403_FORBIDDEN,
            )
        warmup = request.query_params.get('warmup', '').lower() in ('1', 'true', 'yes')
        if warmup:
            warmup_student_context(request.user)
        panel = build_context_panel(student, use_cache_only=not warmup)
        return Response(envelope(True, 'Context loaded.', data=panel))


class CareerCoachSessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        archived_param = request.query_params.get('archived', '0').lower()
        if archived_param in ('1', 'true', 'yes'):
            archived = True
        elif archived_param in ('all',):
            archived = None
        else:
            archived = False

        sessions = list_sessions(request.user, archived=archived)
        return Response(envelope(True, 'Sessions loaded.', data={'sessions': sessions}))

    def post(self, request):
        serializer = CreateSessionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                envelope(False, 'Invalid request.', errors=serializer.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        data = serializer.validated_data
        perf = PerfTracker('create_session')
        with perf.track('conversation_creation'):
            session = create_session(
                request.user,
                mode=data.get('mode', 'career-coach'),
                title=data.get('title', ''),
            )
        session['perf'] = perf.as_dict()
        return Response(
            envelope(True, 'Session created.', data={'session': session}),
            status=status.HTTP_201_CREATED,
        )


class CareerCoachSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        sid = _parse_session_id(session_id)
        if sid is None:
            return Response(envelope(False, 'Invalid session ID.'), status=status.HTTP_400_BAD_REQUEST)

        messages = get_conversation_history(request.user, sid, limit=50)
        data = ConversationMessageSerializer(messages, many=True).data
        return Response(envelope(True, 'History loaded.', data={'messages': data, 'session_id': str(sid)}))

    def patch(self, request, session_id):
        sid = _parse_session_id(session_id)
        if sid is None:
            return Response(envelope(False, 'Invalid session ID.'), status=status.HTTP_400_BAD_REQUEST)

        serializer = UpdateSessionSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(
                envelope(False, 'Invalid request.', errors=serializer.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        session = update_session(
            request.user,
            sid,
            title=data.get('title'),
            mode=data.get('mode'),
            is_archived=data.get('is_archived'),
        )
        if session is None:
            return Response(envelope(False, 'Session not found.'), status=status.HTTP_404_NOT_FOUND)

        return Response(envelope(True, 'Session updated.', data={'session': session}))

    def delete(self, request, session_id):
        sid = _parse_session_id(session_id)
        if sid is None:
            return Response(envelope(False, 'Invalid session ID.'), status=status.HTTP_400_BAD_REQUEST)

        if not delete_session(request.user, sid):
            return Response(envelope(False, 'Session not found.'), status=status.HTTP_404_NOT_FOUND)

        return Response(envelope(True, 'Session deleted.', data={'session_id': str(sid)}))


class CareerCoachSessionSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        sid = _parse_session_id(session_id)
        if sid is None:
            return Response(envelope(False, 'Invalid session ID.'), status=status.HTTP_400_BAD_REQUEST)

        refresh = request.query_params.get('refresh', '').lower() in ('1', 'true', 'yes')
        summary = build_session_summary(request.user, sid, force_refresh=refresh)
        if summary is None:
            return Response(envelope(False, 'Session not found.'), status=status.HTTP_404_NOT_FOUND)

        return Response(envelope(True, 'Summary loaded.', data=summary))


class CareerCoachChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                envelope(False, 'Invalid request.', errors=serializer.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        offer_uuid = str(data['offer_uuid']) if data.get('offer_uuid') else request.query_params.get('offer')

        if data.get('stream'):
            return self._stream_response(request, data, offer_uuid)

        try:
            result = chat(
                request.user,
                message=data['message'],
                session_id=data.get('session_id'),
                mode=data.get('mode', 'career-coach'),
                offer_uuid=offer_uuid,
            )
        except PermissionError as exc:
            return Response(envelope(False, str(exc)), status=status.HTTP_403_FORBIDDEN)
        except Exception as exc:
            return Response(
                envelope(False, f'Chat failed: {exc}'),
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(envelope(True, 'Response generated.', data=result))

    def _stream_response(self, request, data, offer_uuid):
        def event_generator():
            try:
                for event in chat_stream(
                    request.user,
                    message=data['message'],
                    session_id=data.get('session_id'),
                    mode=data.get('mode', 'career-coach'),
                    offer_uuid=offer_uuid,
                ):
                    yield f'data: {json.dumps(event, ensure_ascii=False)}\n\n'
            except Exception as exc:
                yield f'data: {json.dumps({"type": "error", "message": str(exc)})}\n\n'

        response = StreamingHttpResponse(event_generator(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response
