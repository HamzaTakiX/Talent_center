"""Kanban recruitment pipeline — column mapping, bulk actions, metrics."""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from apps.stage.models import OfferApplication
from apps.stage.models_extended import PipelineColumn

DEFAULT_PIPELINE_COLUMNS = [
    {'code': 'applied', 'label': 'Applied', 'application_statuses': ['SUBMITTED'], 'sort_order': 1, 'color': '#3B82F6'},
    {'code': 'review', 'label': 'Review', 'application_statuses': ['UNDER_REVIEW', 'SHORTLISTED'], 'sort_order': 2, 'color': '#8B5CF6'},
    {'code': 'interview', 'label': 'Interview', 'application_statuses': ['INTERVIEW'], 'sort_order': 3, 'color': '#F59E0B'},
    {'code': 'accepted', 'label': 'Accepted', 'application_statuses': ['ACCEPTED', 'OFFER_ACCEPTED'], 'sort_order': 4, 'color': '#10B981'},
    {'code': 'started', 'label': 'Started', 'application_statuses': ['INTERNSHIP_STARTED'], 'sort_order': 5, 'color': '#06B6D4'},
    {'code': 'completed', 'label': 'Completed', 'application_statuses': ['INTERNSHIP_COMPLETED'], 'sort_order': 6, 'color': '#6366F1'},
    {'code': 'rejected', 'label': 'Rejected', 'application_statuses': ['REJECTED', 'WITHDRAWN', 'OFFER_DECLINED', 'EXPIRED'], 'sort_order': 7, 'color': '#EF4444', 'is_terminal': True},
]


def seed_default_pipeline_columns() -> int:
    created = 0
    for spec in DEFAULT_PIPELINE_COLUMNS:
        _, was_created = PipelineColumn.objects.update_or_create(
            code=spec['code'],
            defaults={
                'label': spec['label'],
                'application_statuses': spec['application_statuses'],
                'sort_order': spec['sort_order'],
                'color': spec.get('color', ''),
                'is_terminal': spec.get('is_terminal', False),
            },
        )
        if was_created:
            created += 1
    return created


def get_pipeline_columns() -> list[PipelineColumn]:
    cols = list(PipelineColumn.objects.order_by('sort_order'))
    if not cols:
        seed_default_pipeline_columns()
        cols = list(PipelineColumn.objects.order_by('sort_order'))
    return cols


def build_pipeline_board(*, offer_id: int | None = None) -> dict[str, Any]:
    columns = get_pipeline_columns()
    qs = OfferApplication.objects.select_related('student_profile__user', 'offer')
    if offer_id:
        qs = qs.filter(offer_id=offer_id)

    status_to_column: dict[str, str] = {}
    for col in columns:
        for st in col.application_statuses:
            status_to_column[st] = col.code

    board: dict[str, list] = {col.code: [] for col in columns}
    unmapped: list = []

    for app in qs.order_by('-applied_at')[:500]:
        col_code = status_to_column.get(app.status)
        card = {
            'application_uuid': str(app.uuid),
            'student_email': app.student_profile.user.email,
            'status': app.status,
            'offer_title': app.offer.title,
            'applied_at': app.applied_at.isoformat(),
            'match_score': float(app.match_score_at_apply or 0),
        }
        if col_code and col_code in board:
            board[col_code].append(card)
        else:
            unmapped.append(card)

    return {
        'columns': [
            {
                'code': c.code,
                'label': c.label,
                'color': c.color,
                'is_terminal': c.is_terminal,
                'count': len(board[c.code]),
                'cards': board[c.code],
            }
            for c in columns
        ],
        'unmapped': unmapped,
    }


def pipeline_metrics(*, offer_id: int | None = None) -> dict:
    board = build_pipeline_board(offer_id=offer_id)
    total = sum(c['count'] for c in board['columns'])
    interview_col = next((c for c in board['columns'] if c['code'] == 'interview'), None)
    accepted_col = next((c for c in board['columns'] if c['code'] == 'accepted'), None)
    applied_col = next((c for c in board['columns'] if c['code'] == 'applied'), None)
    interview_count = interview_col['count'] if interview_col else 0
    accepted_count = accepted_col['count'] if accepted_col else 0
    applied_count = applied_col['count'] if applied_col else 0
    return {
        'total_applications': total,
        'interview_rate_pct': round(interview_count / total * 100, 2) if total else 0,
        'acceptance_rate_pct': round(accepted_count / total * 100, 2) if total else 0,
        'conversion_applied_to_interview_pct': round(interview_count / applied_count * 100, 2) if applied_count else 0,
    }
