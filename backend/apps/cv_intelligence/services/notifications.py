"""Notification integration for CV Intelligence events."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


def emit_analysis_notifications(
    *,
    report,
    student_profile,
    matches: list[dict[str, Any]],
    missing_skills: list[dict[str, Any]],
    interview_prep: list[dict[str, Any]],
    score_delta: int | None,
) -> None:
    try:
        from apps.notifications.events.publisher import emit_event
    except ImportError:
        return

    user_id = student_profile.user_id
    base_payload = {
        'student_id': student_profile.pk,
        'user_id': user_id,
        'report_uuid': str(report.uuid),
        'score': report.global_score,
        'action_url': '/student/internship-offers/cv-analysis-tool',
    }

    emit_event(
        event_code='cv.analysis.completed',
        source_app='cv_intelligence',
        entity_type='cv_intelligence_report',
        entity_id=report.pk,
        payload={
            **base_payload,
            'title': 'Analyse CV terminée',
            'body': f'Votre score CV est {report.global_score}/100.',
        },
        idempotency_key=f'cv-intelligence-completed-{report.uuid}',
    )

    if score_delta is not None and score_delta > 0:
        emit_event(
            event_code='cv.score.updated',
            source_app='cv_intelligence',
            entity_type='cv_intelligence_report',
            entity_id=report.pk,
            payload={
                **base_payload,
                'title': 'Score CV amélioré',
                'body': f'Votre score a augmenté de +{score_delta} points ({report.global_score}/100).',
                'delta': score_delta,
            },
            idempotency_key=f'cv-score-updated-{report.uuid}',
        )

    for match in matches[:3]:
        if match.get('matchPercent', 0) >= 70:
            emit_event(
                event_code='cv.match.found',
                source_app='cv_intelligence',
                entity_type='internship_offer',
                entity_id=None,
                payload={
                    **base_payload,
                    'title': 'Nouvelle offre correspondante',
                    'body': f'{match.get("title")} — {match.get("matchPercent")}% de compatibilité',
                    'offer_id': match.get('id'),
                    'match_percent': match.get('matchPercent'),
                    'action_url': f'/student/internship-offers/{match.get("id")}',
                },
                idempotency_key=f'cv-match-{report.uuid}-{match.get("id")}',
            )

    for skill in missing_skills[:3]:
        if skill.get('priority') == 'high':
            emit_event(
                event_code='cv.missing_skill.detected',
                source_app='cv_intelligence',
                entity_type='cv_intelligence_report',
                entity_id=report.pk,
                payload={
                    **base_payload,
                    'title': 'Compétence manquante détectée',
                    'body': f'{skill.get("name")} — priorité haute',
                    'skill_name': skill.get('name'),
                    'priority': skill.get('priority'),
                },
                idempotency_key=f'cv-missing-skill-{report.uuid}-{skill.get("id")}',
            )

    if interview_prep:
        top = interview_prep[0]
        emit_event(
            event_code='cv.interview.recommendation',
            source_app='cv_intelligence',
            entity_type='cv_intelligence_report',
            entity_id=report.pk,
            payload={
                **base_payload,
                'title': 'Préparation entretien recommandée',
                'body': top.get('title') or 'Simulateur d\'entretien disponible',
                'interview_type': top.get('type'),
                'action_url': top.get('simulatorPath') or '/student/internship-offers/interview-simulator',
            },
            idempotency_key=f'cv-interview-rec-{report.uuid}',
        )
