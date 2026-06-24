"""Query builders for announcement list endpoints."""

from __future__ import annotations

from datetime import datetime, time, timedelta

from django.db.models import Q, QuerySet
from django.utils import timezone

from apps.announcements.models import Announcement, AnnouncementTarget


def _multi_values(raw) -> list[str]:
    if raw is None or raw == '':
        return []
    if isinstance(raw, (list, tuple)):
        parts = raw
    else:
        parts = str(raw).split(',')
    return [str(p).strip() for p in parts if p and str(p).strip()]


def _parse_date(value: str):
    try:
        return datetime.strptime(value[:10], '%Y-%m-%d').date()
    except (TypeError, ValueError):
        return None


def _apply_publish_date_range(qs: QuerySet[Announcement], params: dict) -> QuerySet[Announcement]:
    date_range = (params.get('date_range') or '').strip().lower()
    now = timezone.now()
    start = end = None

    if date_range == 'today':
        start = timezone.make_aware(datetime.combine(now.date(), time.min))
        end = timezone.make_aware(datetime.combine(now.date(), time.max))
    elif date_range == 'week':
        week_start = now.date() - timedelta(days=now.weekday())
        start = timezone.make_aware(datetime.combine(week_start, time.min))
        end = start + timedelta(days=7)
    elif date_range == 'month':
        month_start = now.date().replace(day=1)
        start = timezone.make_aware(datetime.combine(month_start, time.min))
        if month_start.month == 12:
            next_month = month_start.replace(year=month_start.year + 1, month=1)
        else:
            next_month = month_start.replace(month=month_start.month + 1)
        end = timezone.make_aware(datetime.combine(next_month, time.min))
    elif date_range == 'custom':
        from_date = _parse_date(params.get('publish_start_from') or '')
        to_date = _parse_date(params.get('publish_start_to') or '')
        if from_date:
            start = timezone.make_aware(datetime.combine(from_date, time.min))
        if to_date:
            end = timezone.make_aware(datetime.combine(to_date, time.max))

    if start:
        qs = qs.filter(publish_start_at__gte=start)
    if end:
        qs = qs.filter(publish_start_at__lte=end)
    return qs


def _apply_target_audience_filters(qs: QuerySet[Announcement], params: dict) -> QuerySet[Announcement]:
    filiere_ids = _multi_values(params.get('filiere') or params.get('filiere_id'))
    class_group_ids = _multi_values(params.get('class_group') or params.get('class_group_id'))
    level_ids = _multi_values(params.get('academic_level') or params.get('academic_level_id'))

    if not filiere_ids and not class_group_ids and not level_ids:
        return qs

    target_q = Q()
    if filiere_ids:
        target_q |= Q(targets__filiere_id__in=filiere_ids)
    if class_group_ids:
        target_q |= Q(targets__class_group_id__in=class_group_ids)
    if level_ids:
        target_q |= Q(targets__academic_level_id__in=level_ids)

    return qs.filter(target_q).distinct()


def announcements_list_queryset(params: dict) -> QuerySet[Announcement]:
    qs = Announcement.objects.select_related(
        'announcement_type', 'created_by', 'updated_by',
    ).prefetch_related(
        'targets',
        'targets__filiere',
        'targets__class_group',
        'targets__academic_level',
        'attachments',
    )

    search = (params.get('search') or '').strip()
    if search:
        qs = qs.filter(
            Q(title__icontains=search)
            | Q(summary__icontains=search)
            | Q(company_name__icontains=search)
            | Q(tags__icontains=search),
        )

    statuses = _multi_values(params.get('status'))
    if statuses:
        qs = qs.filter(status__in=statuses)

    scheduled_only = params.get('scheduled_only')
    if scheduled_only in ('1', 'true', 'yes', True):
        qs = qs.filter(status=Announcement.Status.SCHEDULED)

    priorities = _multi_values(params.get('priority'))
    if priorities:
        qs = qs.filter(priority__in=priorities)

    type_codes = _multi_values(params.get('type') or params.get('announcement_type'))
    if type_codes:
        qs = qs.filter(announcement_type__code__in=type_codes)

    internship_only = params.get('internship_only')
    if internship_only in ('1', 'true', 'yes', True):
        qs = qs.filter(announcement_type__is_internship_related=True)

    qs = _apply_publish_date_range(qs, params)
    qs = _apply_target_audience_filters(qs, params)

    ordering = params.get('ordering', '-created_at')
    allowed = {
        'created_at', '-created_at', 'title', '-title',
        'published_at', '-published_at', 'publish_start_at', '-publish_start_at',
        'view_count', '-view_count', 'priority', '-priority',
    }
    if ordering in allowed:
        qs = qs.order_by(ordering)
    elif scheduled_only in ('1', 'true', 'yes', True):
        qs = qs.order_by('publish_start_at')
    else:
        qs = qs.order_by('-is_pinned', '-published_at', '-created_at')

    return qs
