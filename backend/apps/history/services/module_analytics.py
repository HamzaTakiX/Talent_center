"""Fast audit KPI aggregates — batched SQL, minimal queries."""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Count, Q, QuerySet
from django.utils import timezone

from apps.history.models import HistoryEvent
from apps.history.services.queries import KPI_SOURCE_APPS

_MODULE_STAT_SPECS: dict[str, list[dict]] = {
    'internship_offers': [
        {'key': 'offers_created', 'action_codes': ['CREATE']},
        {'key': 'offers_published', 'action_codes': ['PUBLISH']},
        {'key': 'offers_archived', 'action_codes': ['ARCHIVE']},
        {'key': 'applications_received', 'source_apps': ['smart_assignment'], 'event_code_contains': 'application'},
        {'key': 'status_changes', 'action_codes': ['UPDATE'], 'event_code_contains': 'status'},
        {'key': 'external_imports', 'event_code_contains': 'import'},
        {'key': 'expired_offers', 'event_code_contains': 'expired'},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'documents': [
        {'key': 'documents_uploaded', 'action_codes': ['CREATE', 'SUBMIT'], 'event_code_contains': 'upload'},
        {'key': 'documents_validated', 'action_codes': ['APPROVE', 'VALIDATE'], 'event_code_contains': 'valid'},
        {'key': 'documents_rejected', 'action_codes': ['REJECT', 'DELETE'], 'event_code_contains': 'reject'},
        {'key': 'corrections_requested', 'event_code_contains': 'correction'},
        {'key': 'deadlines_modified', 'event_code_contains': 'deadline'},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'meetings': [
        {'key': 'meetings_created', 'action_codes': ['CREATE']},
        {'key': 'meetings_rescheduled', 'event_code_contains': 'reschedul'},
        {'key': 'meetings_cancelled', 'event_code_contains': 'cancel'},
        {'key': 'reports_submitted', 'event_code_contains': 'report', 'action_codes': ['SUBMIT']},
        {'key': 'tasks_generated', 'event_code_contains': 'task', 'action_codes': ['CREATE']},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'announcements': [
        {'key': 'announcements_published', 'action_codes': ['PUBLISH']},
        {'key': 'announcements_updated', 'action_codes': ['UPDATE']},
        {'key': 'announcements_archived', 'action_codes': ['ARCHIVE']},
        {'key': 'urgent_announcements', 'severity': ['WARNING', 'CRITICAL', 'ERROR']},
        {'key': 'targeted_campaigns', 'event_code_contains': 'target'},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'chat': [
        {'key': 'messages_sent', 'event_code_contains': 'message.sent'},
        {'key': 'channels_created', 'event_code_contains': 'channel', 'action_codes': ['CREATE']},
        {'key': 'channels_archived', 'event_code_contains': 'channel', 'action_codes': ['ARCHIVE']},
        {'key': 'moderation_actions', 'event_code_contains': 'moderat'},
        {'key': 'pinned_messages', 'event_code_contains': 'pin'},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'applications': [
        {'key': 'assignments_executed', 'event_code_contains': 'smart_assignment'},
        {'key': 'status_changes', 'action_codes': ['UPDATE']},
        {'key': 'manual_reassignments', 'event_code_contains': 'reassign'},
        {'key': 'conflicts_detected', 'event_code_contains': 'conflict'},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'srf': [
        {'key': 'payments_validated', 'event_code_contains': 'valid'},
        {'key': 'receipts_uploaded', 'event_code_contains': 'submit'},
        {'key': 'receipts_rejected', 'event_code_contains': 'reject'},
        {'key': 'financial_alerts_sent', 'event_code_contains': 'alert'},
        {'key': 'students_in_delay', 'event_code_contains': 'delay'},
        {'key': 'financial_holds_created', 'event_code_contains': 'hold'},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'reports': [
        {'key': 'reports_submitted', 'action_codes': ['SUBMIT']},
        {'key': 'reports_validated', 'action_codes': ['APPROVE', 'VALIDATE']},
        {'key': 'reports_rejected', 'action_codes': ['REJECT']},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'tasks': [
        {'key': 'tasks_created', 'action_codes': ['CREATE']},
        {'key': 'tasks_completed', 'event_code_contains': 'complet'},
        {'key': 'tasks_assigned', 'action_codes': ['ASSIGN']},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'encadrants': [
        {'key': 'profiles_updated', 'action_codes': ['UPDATE']},
        {'key': 'assignments_changed', 'event_code_contains': 'assign'},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'students': [
        {'key': 'profile_updates', 'action_codes': ['UPDATE']},
        {'key': 'access_changes', 'event_code_contains': 'access'},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
    'admins': [
        {'key': 'role_changes', 'event_code_contains': 'role'},
        {'key': 'permission_updates', 'event_code_contains': 'permission'},
        {'key': 'login_events', 'action_codes': ['LOGIN']},
        {'key': 'recent_activity', 'recent_hours': 24},
    ],
}

_STUDENT_STAT_SPECS: list[dict] = [
    {'key': 'my_applications', 'source_apps': ['stage', 'internship', 'smart_assignment'], 'event_code_contains': 'application'},
    {'key': 'my_documents', 'source_apps': ['documents']},
    {'key': 'my_meetings', 'source_apps': ['meetings', 'encadrant'], 'event_code_contains': 'meeting'},
    {'key': 'my_interview_simulations', 'event_code_contains': 'interview'},
    {'key': 'my_notifications', 'source_apps': ['notifications']},
    {'key': 'recent_activity', 'recent_hours': 168},
]

_MODULE_LABELS: dict[str, str] = {
    'stage': 'Internships',
    'internship': 'Internships',
    'documents': 'Documents',
    'announcements': 'Announcements',
    'srf': 'SRF',
    'encadrant': 'Encadrants',
    'meetings': 'Meetings',
    'reports': 'Reports',
    'chat': 'Chat',
    'tasks': 'Tasks',
    'auth': 'Authentication',
    'students': 'Students',
    'smart_assignment': 'Applications',
    'notifications': 'Notifications',
}


def build_module_audit_stats(kpi_key: str, qs: QuerySet) -> list[dict]:
    specs = _MODULE_STAT_SPECS.get(kpi_key, [])
    if not specs:
        return []

    apps = KPI_SOURCE_APPS.get(kpi_key, [])
    scoped = qs.filter(source_app__in=apps) if apps else qs
    stats = _aggregate_specs(scoped, specs)

    top_actor = _top_actor(scoped)
    if top_actor:
        stats.append({'key': 'most_active_actor', 'value': top_actor['count'], 'meta': top_actor})

    return stats


def build_student_audit_stats(qs: QuerySet) -> list[dict]:
    return _aggregate_specs(qs, _STUDENT_STAT_SPECS)


def _aggregate_specs(qs: QuerySet, specs: list[dict]) -> list[dict]:
    """One SQL query for all card counts."""
    agg_kwargs: dict[str, Count] = {}
    for spec in specs:
        q = _spec_to_q(spec)
        if q is not None:
            agg_kwargs[spec['key']] = Count('id', filter=q)

    if not agg_kwargs:
        return []

    row = qs.aggregate(**agg_kwargs)
    return [{'key': key, 'value': int(row.get(key) or 0)} for key in agg_kwargs]


def _spec_to_q(spec: dict) -> Q | None:
    q = Q()
    recent_hours = spec.get('recent_hours')
    if recent_hours:
        since = timezone.now() - timedelta(hours=recent_hours)
        q &= Q(occurred_at__gte=since)

    source_apps = spec.get('source_apps')
    if source_apps:
        q &= Q(source_app__in=source_apps)

    action_codes = spec.get('action_codes')
    if action_codes:
        q &= Q(action_code__in=action_codes)

    event_contains = spec.get('event_code_contains')
    if event_contains:
        q &= Q(event_code__icontains=event_contains)

    severity = spec.get('severity')
    if severity:
        q &= Q(severity__in=severity)

    is_automated = spec.get('is_automated')
    if is_automated is not None:
        q &= Q(is_automated=is_automated)

    return q


def _top_actor(qs: QuerySet) -> dict | None:
    row = (
        qs.filter(actor_user__isnull=False, is_automated=False)
        .values('actor_user', 'actor_email', 'actor_role')
        .annotate(count=Count('id'))
        .order_by('-count')
        .first()
    )
    if not row or row['count'] <= 0:
        return None
    return {
        'actor_email': row['actor_email'],
        'actor_role': row['actor_role'],
        'count': row['count'],
    }


def resolve_most_active_module(by_module: list[dict]) -> dict | None:
    if not by_module:
        return None
    top = by_module[0]
    return {
        'source_app': top['source_app'],
        'label': _MODULE_LABELS.get(top['source_app'], top['source_app'].replace('_', ' ').title()),
        'count': top['count'],
    }
