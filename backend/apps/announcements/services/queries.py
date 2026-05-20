"""Query builders for announcement list endpoints."""

from __future__ import annotations

from django.db.models import Q, QuerySet

from apps.announcements.models import Announcement


def announcements_list_queryset(params: dict) -> QuerySet[Announcement]:
    qs = Announcement.objects.select_related(
        'announcement_type', 'created_by', 'updated_by',
    ).prefetch_related('targets', 'attachments')

    search = (params.get('search') or '').strip()
    if search:
        qs = qs.filter(
            Q(title__icontains=search)
            | Q(summary__icontains=search)
            | Q(company_name__icontains=search)
            | Q(tags__icontains=search),
        )

    status = params.get('status')
    if status:
        qs = qs.filter(status=status)

    priority = params.get('priority')
    if priority:
        qs = qs.filter(priority=priority)

    type_code = params.get('type') or params.get('announcement_type')
    if type_code:
        qs = qs.filter(announcement_type__code=type_code)

    internship_only = params.get('internship_only')
    if internship_only in ('1', 'true', 'yes', True):
        qs = qs.filter(announcement_type__is_internship_related=True)

    ordering = params.get('ordering', '-created_at')
    allowed = {
        'created_at', '-created_at', 'title', '-title',
        'published_at', '-published_at', 'view_count', '-view_count',
        'priority', '-priority',
    }
    if ordering in allowed:
        qs = qs.order_by(ordering)
    else:
        qs = qs.order_by('-is_pinned', '-published_at', '-created_at')

    return qs
