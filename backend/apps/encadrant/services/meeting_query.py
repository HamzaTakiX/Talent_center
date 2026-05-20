"""Query building and serialization for supervision meetings."""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Count, Prefetch, Q
from django.utils import timezone

from apps.encadrant.models import Meeting, MeetingAttachment, MeetingTimelineEvent
from apps.admin_management.services.meeting_scopes import filter_meetings_by_admin_scope


MEETING_LIST_SELECT = (
    'student_profile__user__profile',
    'encadrant_profile__supervisor_profile__user__profile',
    'filiere',
    'academic_level',
    'academic_sector',
    'class_group',
    'academic_year',
    'internship_type',
    'assignment',
    'created_by__profile',
)


def _user_display(user) -> str:
    if not user:
        return ''
    profile = getattr(user, 'profile', None)
    if profile:
        name = f'{profile.first_name or ""} {profile.last_name or ""}'.strip()
        if name:
            return name
    return user.email or str(user.pk)


def _student_display(sp) -> str:
    if not sp:
        return ''
    profile = getattr(sp.user, 'profile', None)
    if profile:
        name = f'{profile.first_name or ""} {profile.last_name or ""}'.strip()
        if name:
            return name
    return sp.user.email if sp.user else ''


def _encadrant_display(ep) -> str:
    if not ep:
        return ''
    user = ep.supervisor_profile.user
    return _user_display(user)


def meetings_list_queryset(user):
    return (
        filter_meetings_by_admin_scope(Meeting.objects.all(), user)
        .select_related(*MEETING_LIST_SELECT)
        .prefetch_related('attachments')
    )


def meeting_detail_queryset(user):
    return (
        filter_meetings_by_admin_scope(Meeting.objects.all(), user)
        .select_related(*MEETING_LIST_SELECT, 'workspace', 'recurrence')
        .prefetch_related(
            Prefetch(
                'timeline_events',
                queryset=MeetingTimelineEvent.objects.select_related('actor__profile'),
            ),
            Prefetch(
                'attachments',
                queryset=MeetingAttachment.objects.select_related('uploaded_by__profile'),
            ),
        )
    )


def apply_meeting_filters(qs, params: dict):
    if encadrant_id := params.get('encadrant_id'):
        qs = qs.filter(encadrant_profile_id=encadrant_id)
    if student_id := params.get('student_id'):
        qs = qs.filter(student_profile_id=student_id)
    if meeting_type := params.get('meeting_type'):
        qs = qs.filter(meeting_type=meeting_type)
    if status := params.get('status'):
        qs = qs.filter(status=status)
    if priority := params.get('priority'):
        qs = qs.filter(priority=priority)
    if meeting_mode := params.get('meeting_mode'):
        qs = qs.filter(meeting_mode=meeting_mode)
    if filiere_id := params.get('filiere_id'):
        qs = qs.filter(Q(filiere_id=filiere_id) | Q(student_profile__filiere_id=filiere_id))
    if level_id := params.get('academic_level_id'):
        qs = qs.filter(Q(academic_level_id=level_id) | Q(student_profile__academic_level_id=level_id))
    if class_group_id := params.get('class_group_id'):
        qs = qs.filter(Q(class_group_id=class_group_id) | Q(student_profile__class_group_id=class_group_id))
    if internship_type_id := params.get('internship_type_id'):
        qs = qs.filter(internship_type_id=internship_type_id)
    if academic_year := params.get('academic_year'):
        qs = qs.filter(
            Q(academic_year__code=academic_year) | Q(student_profile__academic_year=academic_year),
        )

    date_from = params.get('date_from')
    date_to = params.get('date_to')
    if date_from:
        qs = qs.filter(
            Q(planned_start__date__gte=date_from)
            | Q(scheduled_at__date__gte=date_from),
        )
    if date_to:
        qs = qs.filter(
            Q(planned_start__date__lte=date_to)
            | Q(scheduled_at__date__lte=date_to),
        )

    if params.get('upcoming') == 'true':
        now = timezone.now()
        qs = qs.filter(
            Q(planned_start__gte=now) | Q(scheduled_at__gte=now),
        ).exclude(status__in=[Meeting.Status.CANCELLED, Meeting.Status.COMPLETED])

    if params.get('overdue') == 'true':
        now = timezone.now()
        qs = qs.filter(
            Q(planned_end__lt=now) | Q(scheduled_at__lt=now),
        ).exclude(
            status__in=[
                Meeting.Status.COMPLETED,
                Meeting.Status.CANCELLED,
                Meeting.Status.IN_PROGRESS,
            ],
        )

    search = (params.get('search') or '').strip()
    if search:
        qs = qs.filter(
            Q(title__icontains=search)
            | Q(description__icontains=search)
            | Q(student_profile__user__email__icontains=search)
            | Q(encadrant_profile__supervisor_profile__user__email__icontains=search),
        )

    ordering = params.get('ordering', '-planned_start')
    allowed = {'-planned_start', 'planned_start', '-created_at', 'created_at', 'status', '-status'}
    if ordering in allowed:
        qs = qs.order_by(ordering, '-id')
    else:
        qs = qs.order_by('-planned_start', '-scheduled_at', '-id')
    return qs


def _when_start(m: Meeting):
    return m.planned_start or m.scheduled_at


def _when_end(m: Meeting):
    if m.planned_end:
        return m.planned_end
    start = _when_start(m)
    if start:
        return start + timedelta(minutes=m.duration_minutes or 30)
    return None


def serialize_meeting_list_item(m: Meeting) -> dict:
    start = _when_start(m)
    end = _when_end(m)
    return {
        'id': m.pk,
        'title': m.title,
        'meetingType': m.meeting_type,
        'status': m.status,
        'priority': m.priority,
        'meetingMode': m.meeting_mode,
        'plannedStart': start.isoformat() if start else None,
        'plannedEnd': end.isoformat() if end else None,
        'location': m.location,
        'meetingUrl': m.meeting_url,
        'encadrant': _encadrant_display(m.encadrant_profile),
        'encadrantId': m.encadrant_profile_id,
        'student': _student_display(m.student_profile),
        'studentId': m.student_profile_id,
        'filiere': m.filiere.name if m.filiere else (m.student_profile.filiere.name if m.student_profile and m.student_profile.filiere else ''),
        'filiereId': m.filiere_id or (m.student_profile.filiere_id if m.student_profile else None),
        'academicLevel': m.academic_level.name if m.academic_level else '',
        'classGroup': m.class_group.name if m.class_group else '',
        'academicYear': m.academic_year.code if m.academic_year else '',
        'internshipType': m.internship_type.name if m.internship_type else '',
        'isRecurring': m.is_recurring,
        'createdAt': m.created_at.isoformat(),
    }


def serialize_meeting_detail(m: Meeting) -> dict:
    base = serialize_meeting_list_item(m)
    base.update({
        'description': m.description,
        'notes': m.notes,
        'followUpActions': m.follow_up_actions,
        'actualStart': m.actual_start.isoformat() if m.actual_start else None,
        'actualEnd': m.actual_end.isoformat() if m.actual_end else None,
        'durationMinutes': m.duration_minutes,
        'assignmentId': m.assignment_id,
        'workspaceId': m.workspace_id,
        'reminderSentAt': m.reminder_sent_at.isoformat() if m.reminder_sent_at else None,
        'nextSuggestedAt': m.next_suggested_at.isoformat() if m.next_suggested_at else None,
        'createdBy': _user_display(m.created_by),
        'updatedAt': m.updated_at.isoformat(),
        'timeline': [
            {
                'id': e.pk,
                'action': e.action,
                'fromStatus': e.from_status,
                'toStatus': e.to_status,
                'note': e.note,
                'actor': _user_display(e.actor),
                'createdAt': e.created_at.isoformat(),
            }
            for e in m.timeline_events.all()
        ],
        'attachments': [
            {
                'id': a.pk,
                'originalName': a.original_name,
                'mimeType': a.mime_type,
                'sizeBytes': a.size_bytes,
                'url': a.file.url if a.file else None,
                'uploadedBy': _user_display(a.uploaded_by),
                'createdAt': a.created_at.isoformat(),
            }
            for a in m.attachments.all()
        ],
        'recurrence': (
            {
                'frequency': m.recurrence.frequency,
                'intervalCount': m.recurrence.interval_count,
                'untilDate': m.recurrence.until_date.isoformat() if m.recurrence.until_date else None,
                'isActive': m.recurrence.is_active,
            }
            if hasattr(m, 'recurrence') and m.recurrence
            else None
        ),
    })
    return base


def calendar_events_queryset(user, start, end):
    qs = apply_meeting_filters(
        meetings_list_queryset(user),
        {'date_from': start, 'date_to': end},
    )
    return qs


def serialize_calendar_event(m: Meeting) -> dict:
    item = serialize_meeting_list_item(m)
    item['resourceId'] = str(m.encadrant_profile_id)
    return item
