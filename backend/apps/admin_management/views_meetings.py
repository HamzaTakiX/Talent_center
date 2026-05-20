"""Admin API views for supervision meetings agenda."""

from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope
from apps.encadrant.models import Meeting, MeetingRecurrence
from apps.encadrant.permissions import HasMeetingPermission, MeetingObjectPermission
from apps.encadrant.services.meeting_alerts import build_meeting_alerts
from apps.encadrant.services.meeting_analytics import (
    build_encadrant_supervision_overview,
    build_meetings_analytics,
    build_meetings_dashboard,
)
from apps.encadrant.services.meeting_conflicts import detect_meeting_conflicts, serialize_conflicts
from apps.encadrant.services.meeting_query import (
    apply_meeting_filters,
    calendar_events_queryset,
    meeting_detail_queryset,
    meetings_list_queryset,
    serialize_calendar_event,
    serialize_meeting_detail,
    serialize_meeting_list_item,
)
from apps.encadrant.services.meeting_workflow import log_meeting_event, transition_meeting_status
from apps.encadrant.models import MeetingTimelineEvent
from apps.admin_management.services.meeting_scopes import assert_meeting_in_scope


def _paginate(qs, request):
    try:
        page = max(1, int(request.query_params.get('page', 1)))
        page_size = min(100, max(1, int(request.query_params.get('page_size', 25))))
    except (TypeError, ValueError):
        page, page_size = 1, 25
    total = qs.count()
    start = (page - 1) * page_size
    items = [serialize_meeting_list_item(m) for m in qs[start : start + page_size]]
    return {
        'items': items,
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total': total,
            'total_pages': (total + page_size - 1) // page_size if page_size else 0,
        },
    }


class AdminSupervisionMeetingsDashboardView(APIView):
    permission_classes = [IsAuthenticated, HasMeetingPermission]
    required_permission = 'meetings.access'

    def get(self, request):
        return Response(
            envelope(
                True,
                'OK',
                data={
                    'summary': build_meetings_dashboard(request.user),
                    'alerts': build_meeting_alerts(request.user),
                    'encadrantOverview': build_encadrant_supervision_overview(request.user),
                },
            ),
            status=status.HTTP_200_OK,
        )


class AdminSupervisionMeetingsListView(APIView):
    permission_classes = [IsAuthenticated, HasMeetingPermission]
    required_permission = 'meetings.access'

    def get(self, request):
        qs = apply_meeting_filters(meetings_list_queryset(request.user), dict(request.query_params))
        data = _paginate(qs, request)
        return Response(envelope(True, 'OK', data=data), status=status.HTTP_200_OK)


class AdminSupervisionMeetingsCalendarView(APIView):
    permission_classes = [IsAuthenticated, HasMeetingPermission]
    required_permission = 'meetings.access'

    def get(self, request):
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        if not start or not end:
            raise ValidationError({'detail': 'start and end query params are required (YYYY-MM-DD).'})
        qs = calendar_events_queryset(request.user, start, end)
        events = [serialize_calendar_event(m) for m in qs[:500]]
        conflicts = []
        seen = set()
        for m in qs:
            if m.encadrant_profile_id in seen:
                continue
            m_start = m.planned_start or m.scheduled_at
            m_end = m.planned_end
            if m_start and m_end:
                overlap = detect_meeting_conflicts(m.encadrant_profile_id, m_start, m_end, m.pk)
                if len(overlap) > 0:
                    conflicts.append({'meetingId': m.pk, 'conflicts': serialize_conflicts(overlap)})
            seen.add(m.encadrant_profile_id)
        return Response(
            envelope(True, 'OK', data={'events': events, 'conflicts': conflicts}),
            status=status.HTTP_200_OK,
        )


class AdminSupervisionMeetingsAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, HasMeetingPermission]
    required_permission = 'meetings.access'

    def get(self, request):
        return Response(
            envelope(True, 'OK', data=build_meetings_analytics(request.user)),
            status=status.HTTP_200_OK,
        )


class AdminSupervisionMeetingDetailView(APIView):
    permission_classes = [IsAuthenticated, HasMeetingPermission, MeetingObjectPermission]
    required_permission = 'meetings.access'

    def get(self, request, meeting_id: int):
        meeting = get_object_or_404(meeting_detail_queryset(request.user), pk=meeting_id)
        return Response(
            envelope(True, 'OK', data=serialize_meeting_detail(meeting)),
            status=status.HTTP_200_OK,
        )

    def patch(self, request, meeting_id: int):
        meeting = get_object_or_404(meeting_detail_queryset(request.user), pk=meeting_id)
        assert_meeting_in_scope(request.user, meeting)
        data = request.data
        if 'status' in data:
            transition_meeting_status(meeting, data['status'], actor=request.user, note=data.get('note', ''))
        for field, attr in [
            ('title', 'title'),
            ('description', 'description'),
            ('notes', 'notes'),
            ('followUpActions', 'follow_up_actions'),
            ('location', 'location'),
            ('meetingUrl', 'meeting_url'),
            ('priority', 'priority'),
            ('meetingMode', 'meeting_mode'),
            ('meetingType', 'meeting_type'),
        ]:
            if field in data:
                setattr(meeting, attr, data[field])
        if 'plannedStart' in data:
            meeting.planned_start = parse_datetime(data['plannedStart'])
        if 'plannedEnd' in data:
            meeting.planned_end = parse_datetime(data['plannedEnd'])
        meeting.save()
        log_meeting_event(meeting, MeetingTimelineEvent.Action.UPDATED, actor=request.user)
        meeting = get_object_or_404(meeting_detail_queryset(request.user), pk=meeting_id)
        return Response(
            envelope(True, 'OK', data=serialize_meeting_detail(meeting)),
            status=status.HTTP_200_OK,
        )


class AdminSupervisionMeetingStatusView(APIView):
    permission_classes = [IsAuthenticated, HasMeetingPermission, MeetingObjectPermission]
    required_permission = 'meetings.manage'

    def post(self, request, meeting_id: int):
        meeting = get_object_or_404(meeting_detail_queryset(request.user), pk=meeting_id)
        assert_meeting_in_scope(request.user, meeting)
        new_status = request.data.get('status')
        if not new_status:
            raise ValidationError({'status': 'Required'})
        transition_meeting_status(meeting, new_status, actor=request.user, note=request.data.get('note', ''))
        meeting = get_object_or_404(meeting_detail_queryset(request.user), pk=meeting_id)
        return Response(
            envelope(True, 'OK', data=serialize_meeting_detail(meeting)),
            status=status.HTTP_200_OK,
        )


class AdminSupervisionMeetingCreateView(APIView):
    permission_classes = [IsAuthenticated, HasMeetingPermission]
    required_permission = 'meetings.manage'

    def post(self, request):
        data = request.data
        required = ['encadrantId', 'title', 'plannedStart']
        missing = [k for k in required if not data.get(k)]
        if missing:
            raise ValidationError({k: 'Required' for k in missing})

        planned_start = parse_datetime(data['plannedStart'])
        planned_end = parse_datetime(data['plannedEnd']) if data.get('plannedEnd') else None

        meeting = Meeting(
            encadrant_profile_id=data['encadrantId'],
            student_profile_id=data.get('studentId'),
            assignment_id=data.get('assignmentId'),
            title=data['title'],
            description=data.get('description', ''),
            meeting_type=data.get('meetingType', Meeting.MeetingType.FOLLOW_UP),
            status=data.get('status', Meeting.Status.SCHEDULED),
            priority=data.get('priority', Meeting.Priority.MEDIUM),
            meeting_mode=data.get('meetingMode', Meeting.MeetingMode.IN_PERSON),
            planned_start=planned_start,
            planned_end=planned_end,
            location=data.get('location', ''),
            meeting_url=data.get('meetingUrl', ''),
            notes=data.get('notes', ''),
            filiere_id=data.get('filiereId'),
            academic_level_id=data.get('academicLevelId'),
            class_group_id=data.get('classGroupId'),
            academic_year_id=data.get('academicYearId'),
            internship_type_id=data.get('internshipTypeId'),
            created_by=request.user,
            is_recurring=bool(data.get('isRecurring')),
        )
        meeting.save()
        log_meeting_event(meeting, MeetingTimelineEvent.Action.CREATED, actor=request.user)

        if data.get('recurrence'):
            rec = data['recurrence']
            MeetingRecurrence.objects.create(
                meeting=meeting,
                frequency=rec.get('frequency', MeetingRecurrence.Frequency.WEEKLY),
                interval_count=rec.get('intervalCount', 1),
                is_active=True,
            )

        return Response(
            envelope(True, 'Created', data=serialize_meeting_detail(
                get_object_or_404(meeting_detail_queryset(request.user), pk=meeting.pk),
            )),
            status=status.HTTP_201_CREATED,
        )
