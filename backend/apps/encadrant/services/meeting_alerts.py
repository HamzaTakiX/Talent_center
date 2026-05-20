"""Smart alerts for supervision meeting monitoring."""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone

from apps.admin_management.models import Assignment
from apps.encadrant.models import Meeting
from apps.encadrant.services.meeting_query import meetings_list_queryset


def build_meeting_alerts(user) -> list:
    now = timezone.now()
    alerts = []
    qs = meetings_list_queryset(user)

    # Students without upcoming meetings
    assigned = Assignment.objects.filter(is_active=True).select_related('student_profile')
    student_ids_with_meeting = set(
        qs.filter(
            Q(planned_start__gte=now) | Q(scheduled_at__gte=now),
        )
        .exclude(status=Meeting.Status.CANCELLED)
        .values_list('student_profile_id', flat=True),
    )
    missing = assigned.exclude(student_profile_id__in=student_ids_with_meeting).count()
    if missing:
        alerts.append({
            'code': 'STUDENTS_WITHOUT_MEETINGS',
            'severity': 'warning',
            'count': missing,
            'message': f'{missing} étudiant(s) assigné(s) sans réunion planifiée',
        })

    # Overdue follow-ups
    overdue = qs.filter(
        Q(planned_end__lt=now) | Q(scheduled_at__lt=now - timedelta(days=1)),
    ).exclude(
        status__in=[Meeting.Status.COMPLETED, Meeting.Status.CANCELLED, Meeting.Status.IN_PROGRESS],
    ).count()
    if overdue:
        alerts.append({
            'code': 'OVERDUE_MEETINGS',
            'severity': 'high',
            'count': overdue,
            'message': f'{overdue} réunion(s) en retard de suivi',
        })

    # Repeated cancellations (encadrants with 3+ cancellations in 30 days)
    since = now - timedelta(days=30)
    repeat_cancel = list(
        qs.filter(status=Meeting.Status.CANCELLED, updated_at__gte=since)
        .values('encadrant_profile_id')
        .annotate(c=Count('id'))
        .filter(c__gte=3),
    )
    if repeat_cancel:
        alerts.append({
            'code': 'REPEATED_CANCELLATIONS',
            'severity': 'medium',
            'count': len(repeat_cancel),
            'message': f'{len(repeat_cancel)} encadrant(s) avec annulations répétées',
        })

    # Needs follow-up status
    followup = qs.filter(status=Meeting.Status.NEEDS_FOLLOWUP).count()
    if followup:
        alerts.append({
            'code': 'NEEDS_FOLLOWUP',
            'severity': 'info',
            'count': followup,
            'message': f'{followup} réunion(s) nécessitent un suivi',
        })

    # Inactive encadrants (no meetings in 60 days but have students)
    since_60 = now - timedelta(days=60)
    active_enc = set(
        Assignment.objects.filter(is_active=True).values_list('encadrant_profile_id', flat=True),
    )
    recent_enc = set(
        qs.filter(
            Q(planned_start__gte=since_60) | Q(scheduled_at__gte=since_60),
        ).values_list('encadrant_profile_id', flat=True),
    )
    inactive = len(active_enc - recent_enc)
    if inactive:
        alerts.append({
            'code': 'INACTIVE_ENCADRANTS',
            'severity': 'warning',
            'count': inactive,
            'message': f'{inactive} encadrant(s) sans activité de réunion récente',
        })

    return alerts
