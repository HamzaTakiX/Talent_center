"""Filtered history queries with pagination."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from django.db.models import Q, QuerySet
from django.utils.dateparse import parse_datetime

from apps.history.models import HistoryEvent
from apps.history.services.visibility import filter_events_for_user

# KPI keys align with frontend stat cards (`statCardDefinitions.ts`).
KPI_SOURCE_APPS: dict[str, list[str]] = {
    'students': ['students', 'auth'],
    'admins': ['auth'],
    'encadrants': ['encadrant'],
    'internship_offers': ['stage', 'internship'],
    'applications': ['smart_assignment'],
    'announcements': ['announcements'],
    'documents': ['documents'],
    'srf': ['srf'],
    'chat': ['chat', 'notifications'],
    'reports': ['reports'],
    'tasks': ['tasks'],
    'meetings': ['meetings'],
}


def base_queryset(user) -> QuerySet:
    return (
        filter_events_for_user(HistoryEvent.objects.all(), user)
        .select_related('actor_user')
        .prefetch_related('metadata_entries', 'targets')
    )


def apply_list_filters(qs: QuerySet, params) -> QuerySet:
    kpi = (params.get('kpi') or params.get('kpi_key') or '').strip()
    if kpi and kpi != 'total_actions' and kpi in KPI_SOURCE_APPS:
        apps = KPI_SOURCE_APPS[kpi]
        if apps:
            qs = qs.filter(source_app__in=apps)
    else:
        module = params.get('module') or params.get('source_app')
        if module and module != 'all':
            qs = qs.filter(source_app=module)

    action = params.get('action') or params.get('action_code')
    if action and action != 'all':
        qs = qs.filter(action_code__iexact=action)

    severity = params.get('severity') or params.get('criticality')
    if severity and severity != 'all':
        qs = qs.filter(severity__iexact=severity)

    entity_type = params.get('entity_type')
    if entity_type and entity_type != 'all':
        qs = qs.filter(entity_type=entity_type)

    entity_id = params.get('entity_id')
    if entity_id:
        try:
            qs = qs.filter(entity_id=int(entity_id))
        except (TypeError, ValueError):
            pass

    actor_id = params.get('actor_id') or params.get('user_id')
    if actor_id:
        try:
            qs = qs.filter(actor_user_id=int(actor_id))
        except (TypeError, ValueError):
            pass

    actor_role = params.get('actor_role') or params.get('role')
    if actor_role and actor_role != 'all':
        qs = qs.filter(actor_role__iexact=actor_role)

    automated = params.get('automated') or params.get('is_automated')
    if automated in ('true', '1', 'yes'):
        qs = qs.filter(is_automated=True)
    elif automated in ('false', '0', 'no'):
        qs = qs.filter(is_automated=False)

    date_from = params.get('date_from')
    if date_from:
        dt = parse_datetime(date_from) or _parse_date_start(date_from)
        if dt:
            qs = qs.filter(occurred_at__gte=dt)

    date_to = params.get('date_to')
    if date_to:
        dt = parse_datetime(date_to) or _parse_date_end(date_to)
        if dt:
            qs = qs.filter(occurred_at__lte=dt)

    search = (params.get('search') or params.get('q') or '').strip()
    if search:
        qs = qs.filter(
            Q(summary__icontains=search)
            | Q(event_code__icontains=search)
            | Q(actor_email__icontains=search)
            | Q(entity_type__icontains=search)
            | Q(payload_json__icontains=search)
        )

    return qs.order_by('-occurred_at')


def entity_timeline(user, entity_type: str, entity_id: int) -> QuerySet:
    qs = base_queryset(user)
    return qs.filter(
        Q(entity_type=entity_type, entity_id=entity_id)
        | Q(targets__target_entity_type=entity_type, targets__target_entity_id=entity_id)
    ).distinct().order_by('-occurred_at')


def _parse_date_start(raw: str) -> Optional[datetime]:
    try:
        return datetime.fromisoformat(raw.replace('Z', '+00:00'))
    except ValueError:
        return None


def _parse_date_end(raw: str) -> Optional[datetime]:
    dt = _parse_date_start(raw)
    if dt and len(raw) <= 10:
        return dt.replace(hour=23, minute=59, second=59)
    return dt
