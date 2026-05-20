"""Analytics and workload metrics for supervision meetings."""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Avg, Count, Q
from django.utils import timezone

from apps.encadrant.models import Meeting
from apps.admin_management.models import Assignment, EncadrantProfile
from apps.encadrant.services.meeting_query import meetings_list_queryset


def build_meetings_dashboard(user) -> dict:
    now = timezone.now()
    qs = meetings_list_queryset(user)
    total = qs.count()
    upcoming = qs.filter(
        Q(planned_start__gte=now) | Q(scheduled_at__gte=now),
    ).exclude(status__in=[Meeting.Status.CANCELLED, Meeting.Status.COMPLETED]).count()
    completed = qs.filter(status=Meeting.Status.COMPLETED).count()
    missed = qs.filter(status__in=[Meeting.Status.MISSED, Meeting.Status.NO_SHOW]).count()
    delayed = qs.filter(status=Meeting.Status.DELAYED).count()
    cancelled = qs.filter(status=Meeting.Status.CANCELLED).count()
    in_progress = qs.filter(status=Meeting.Status.IN_PROGRESS).count()
    needs_followup = qs.filter(status=Meeting.Status.NEEDS_FOLLOWUP).count()

    overdue = qs.filter(
        Q(planned_end__lt=now) | Q(scheduled_at__lt=now),
    ).exclude(
        status__in=[Meeting.Status.COMPLETED, Meeting.Status.CANCELLED, Meeting.Status.IN_PROGRESS],
    ).count()

    completion_rate = round((completed / total) * 100, 1) if total else 0
    cancellation_rate = round((cancelled / total) * 100, 1) if total else 0

    by_status = list(
        qs.values('status').annotate(count=Count('id')).order_by('-count'),
    )
    by_type = list(
        qs.values('meeting_type').annotate(count=Count('id')).order_by('-count')[:10],
    )

    return {
        'total': total,
        'upcoming': upcoming,
        'completed': completed,
        'missed': missed,
        'delayed': delayed,
        'cancelled': cancelled,
        'inProgress': in_progress,
        'needsFollowup': needs_followup,
        'overdue': overdue,
        'completionRate': completion_rate,
        'cancellationRate': cancellation_rate,
        'byStatus': by_status,
        'byType': by_type,
    }


def build_meetings_analytics(user) -> dict:
    qs = meetings_list_queryset(user)
    dashboard = build_meetings_dashboard(user)

    per_encadrant = list(
        qs.values('encadrant_profile_id')
        .annotate(
            total=Count('id'),
            completed=Count('id', filter=Q(status=Meeting.Status.COMPLETED)),
            missed=Count('id', filter=Q(status__in=[Meeting.Status.MISSED, Meeting.Status.NO_SHOW])),
            cancelled=Count('id', filter=Q(status=Meeting.Status.CANCELLED)),
        )
        .order_by('-total')[:15],
    )

    encadrant_ids = [r['encadrant_profile_id'] for r in per_encadrant]
    enc_map = {
        e.pk: e.supervisor_profile.user.email
        for e in EncadrantProfile.objects.filter(pk__in=encadrant_ids).select_related(
            'supervisor_profile__user',
        )
    }
    for row in per_encadrant:
        row['encadrantEmail'] = enc_map.get(row['encadrant_profile_id'], '')

    return {
        **dashboard,
        'perEncadrant': per_encadrant,
        'busiestEncadrants': per_encadrant[:5],
    }


def build_encadrant_supervision_overview(user) -> list:
    qs = meetings_list_queryset(user)
    rows = list(
        qs.values('encadrant_profile_id')
        .annotate(
            total=Count('id'),
            completed=Count('id', filter=Q(status=Meeting.Status.COMPLETED)),
            missed=Count('id', filter=Q(status__in=[Meeting.Status.MISSED, Meeting.Status.NO_SHOW])),
            delayed=Count('id', filter=Q(status=Meeting.Status.DELAYED)),
        )
        .order_by('-total'),
    )
    enc_ids = [r['encadrant_profile_id'] for r in rows]
    encadrants = {
        e.pk: e
        for e in EncadrantProfile.objects.filter(pk__in=enc_ids).select_related(
            'supervisor_profile__user__profile',
        )
    }
    active_students = dict(
        Assignment.objects.filter(encadrant_profile_id__in=enc_ids, is_active=True)
        .values('encadrant_profile_id')
        .annotate(c=Count('student_profile', distinct=True))
        .values_list('encadrant_profile_id', 'c'),
    )

    out = []
    for row in rows:
        ep = encadrants.get(row['encadrant_profile_id'])
        user_obj = ep.supervisor_profile.user if ep else None
        profile = getattr(user_obj, 'profile', None) if user_obj else None
        name = ''
        if profile:
            name = f'{profile.first_name or ""} {profile.last_name or ""}'.strip()
        total = row['total'] or 0
        completed = row['completed'] or 0
        out.append({
            'encadrantId': row['encadrant_profile_id'],
            'encadrantName': name or (user_obj.email if user_obj else ''),
            'totalMeetings': total,
            'completedMeetings': completed,
            'missedMeetings': row['missed'],
            'delayedMeetings': row['delayed'],
            'completionRate': round((completed / total) * 100, 1) if total else 0,
            'activeStudents': active_students.get(row['encadrant_profile_id'], 0),
        })
    return out
