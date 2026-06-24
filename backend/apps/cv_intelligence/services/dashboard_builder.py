"""Build frontend-compatible dashboard payload from analysis results."""

from __future__ import annotations

from typing import Any

from django.utils import timezone


def build_dashboard_payload(
    *,
    structured: dict[str, Any],
    scores: dict[str, int],
    swot: dict[str, Any],
    ats_analysis: dict[str, Any],
    matches: list[dict[str, Any]],
    missing_skills: list[dict[str, Any]],
    recommended_skills: list[dict[str, Any]],
    roadmap: list[dict[str, Any]],
    interview_prep: list[dict[str, Any]],
    score_explanations: dict[str, Any],
    student_context: dict[str, Any],
    provider: str,
    detected_languages: list[str],
    report_uuid: str | None = None,
    previous_scores: dict[str, int] | None = None,
    cv_hash: str = '',
    version: int = 1,
    analyzed_at=None,
) -> dict[str, Any]:
    profile = _build_profile(structured, student_context)
    insights = _build_insights(swot)
    detected = _build_detected_skills(structured)
    recommendations = _build_recommendations(roadmap, swot, scores)
    roadmap_steps = _build_roadmap_steps(roadmap)
    interview_suggestions = _build_interview_suggestions(interview_prep)
    career_metrics = _build_career_metrics(scores, previous_scores)
    activity = _build_activity_timeline(report_uuid, analyzed_at)

    analyzed_label = _format_datetime(analyzed_at)

    return {
        'profile': profile,
        'meta': {
            'overallScore': scores.get('global', 0),
            'potentialScore': scores.get('potential', scores.get('global', 0)),
            'lastAnalyzed': analyzed_label,
            'analysisVersion': f'v{version}',
            'cvVersion': cv_hash[:12] if cv_hash else '',
            'cvHash': cv_hash,
            'analysisStatus': 'up_to_date',
            'detectedLanguages': detected_languages,
            'reportUuid': report_uuid,
            'provider': provider,
        },
        'breakdown': [
            {'id': 'skills', 'labelKey': 'student.internshipOffers.cvDashboard.breakdown.skills', 'score': scores.get('skills', 0), 'explanation': score_explanations.get('skills', '')},
            {'id': 'experience', 'labelKey': 'student.internshipOffers.cvDashboard.breakdown.experience', 'score': scores.get('experience', 0), 'explanation': score_explanations.get('experience', '')},
            {'id': 'education', 'labelKey': 'student.internshipOffers.cvDashboard.breakdown.education', 'score': scores.get('education', 0), 'explanation': score_explanations.get('education', '')},
            {'id': 'formatting', 'labelKey': 'student.internshipOffers.cvDashboard.breakdown.formatting', 'score': scores.get('formatting', 0), 'explanation': score_explanations.get('formatting', '')},
            {'id': 'ats', 'labelKey': 'student.internshipOffers.cvDashboard.breakdown.ats', 'score': scores.get('ats', 0), 'explanation': score_explanations.get('ats', ats_analysis.get('summary', ''))},
            {'id': 'readiness', 'labelKey': 'student.internshipOffers.cvDashboard.breakdown.readiness', 'score': scores.get('readiness', 0), 'explanation': score_explanations.get('readiness', '')},
        ],
        'insights': insights,
        'detectedSkills': detected,
        'missingSkills': missing_skills,
        'recommendedSkills': recommended_skills,
        'internshipMatches': matches,
        'recommendations': recommendations,
        'roadmap': roadmap_steps,
        'interviewSuggestions': interview_suggestions,
        'careerMetrics': career_metrics,
        'activityTimeline': activity,
        'atsAnalysis': ats_analysis,
        'scoreExplanations': score_explanations,
        'profileIntelligence': {
            'engagementScore': min(100, scores.get('readiness', 0) + 5),
            'riskScore': max(0, 100 - scores.get('global', 0)),
            'activityLevel': _activity_level(scores.get('global', 0)),
            'status': 'active',
            'riskLabel': _risk_label(scores.get('global', 0)),
        },
    }


def _build_profile(structured: dict[str, Any], ctx: dict[str, Any]) -> dict[str, Any]:
    name = structured.get('name') or ctx.get('full_name') or 'Étudiant'
    program = ctx.get('filiere') or ctx.get('program') or structured.get('professional_summary', '')[:60] or ''
    initials = ''.join(p[0].upper() for p in name.split()[:2]) or 'ET'
    completion = _profile_completion(structured, ctx)
    return {
        'name': name,
        'program': program,
        'avatarInitials': initials,
        'profileCompletion': completion,
    }


def _profile_completion(structured: dict[str, Any], ctx: dict[str, Any]) -> int:
    fields = [
        structured.get('name') or ctx.get('full_name'),
        structured.get('email') or ctx.get('email'),
        structured.get('phone'),
        structured.get('professional_summary') or ctx.get('professional_summary'),
        structured.get('skills'),
        structured.get('education'),
        structured.get('experience') or structured.get('internship_history'),
        structured.get('linkedin'),
    ]
    filled = sum(1 for f in fields if f)
    return int((filled / len(fields)) * 100)


def _build_insights(swot: dict[str, Any]) -> list[dict[str, Any]]:
    categories = [
        ('strengths', swot.get('strengths') or []),
        ('weaknesses', swot.get('weaknesses') or []),
        ('opportunities', swot.get('opportunities') or []),
        ('risks', swot.get('risks') or []),
    ]
    result: list[dict[str, Any]] = []
    for category, items in categories:
        insight_items = [
            {'id': f'{category[0]}-{i}', 'text': text}
            for i, text in enumerate(items[:4])
            if str(text).strip()
        ]
        if insight_items:
            result.append({'category': category, 'items': insight_items})
    return result


def _build_detected_skills(structured: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {'id': f's-{i}', 'name': skill}
        for i, skill in enumerate(structured.get('skills') or [])
        if str(skill).strip()
    ]


def _build_recommendations(
    roadmap: list[dict[str, Any]],
    swot: dict[str, Any],
    scores: dict[str, int],
) -> list[dict[str, Any]]:
    recs: list[dict[str, Any]] = []
    for i, step in enumerate(roadmap[:5]):
        impact = step.get('impact', 'medium')
        priority = impact if impact in ('high', 'medium', 'low') else 'medium'
        gain = 8 if priority == 'high' else (5 if priority == 'medium' else 2)
        recs.append({
            'id': f'rec-{i}',
            'titleKey': step.get('title', f'Step {step.get("step", i + 1)}'),
            'descriptionKey': step.get('description', step.get('title', '')),
            'priority': priority,
            'impactLevel': 3 if priority == 'high' else (2 if priority == 'medium' else 1),
            'scoreGain': gain,
            'actionKey': 'student.internshipOffers.cvDashboard.actions.improve',
            'isDynamic': True,
        })
    for i, opp in enumerate((swot.get('opportunities') or [])[:2]):
        recs.append({
            'id': f'opp-{i}',
            'titleKey': str(opp),
            'descriptionKey': str(opp),
            'priority': 'medium',
            'impactLevel': 2,
            'scoreGain': 4,
            'actionKey': 'student.internshipOffers.cvDashboard.actions.improve',
            'isDynamic': True,
        })
    return recs[:6]


def _roadmap_score_gain(impact: str) -> int:
    return {'high': 12, 'medium': 7, 'low': 3}.get(impact, 7)


def _roadmap_action_key(title: str) -> str:
    lowered = title.lower()
    if any(token in lowered for token in ('postul', 'offre', 'apply', 'stage', 'intern', 'candidat')):
        return 'student.internshipOffers.cvDashboard.roadmap.actions.viewOffers'
    if any(token in lowered for token in ('github', 'portfolio', 'profil', 'résumé', 'resume', 'summary', 'linkedin')):
        return 'student.internshipOffers.cvDashboard.roadmap.actions.updateProfile'
    return 'student.internshipOffers.cvDashboard.roadmap.actions.improve'


def _build_roadmap_steps(roadmap: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            'id': f'rm-{step.get("step", i)}',
            'step': step.get('step', i + 1),
            'titleKey': step.get('title', ''),
            'description': step.get('description', ''),
            'completed': False,
            'impact': step.get('impact', 'medium'),
            'scoreGain': _roadmap_score_gain(step.get('impact', 'medium')),
            'actionKey': _roadmap_action_key(str(step.get('title', ''))),
            'isDynamic': True,
        }
        for i, step in enumerate(roadmap[:8])
    ]


def _build_interview_suggestions(interview_prep: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            'id': f'int-{i}',
            'titleKey': item.get('title', ''),
            'type': item.get('type', 'general'),
            'reason': item.get('reason', ''),
            'priority': item.get('priority', 'medium'),
            'offerId': item.get('offer_id'),
            'simulatorPath': _simulator_path(item.get('type', 'general')),
        }
        for i, item in enumerate(interview_prep[:6])
    ]


def _simulator_path(interview_type: str) -> str:
    return f'/student/internship-offers/interview-simulator?type={interview_type}'


def _build_career_metrics(
    scores: dict[str, int],
    previous: dict[str, int] | None,
) -> list[dict[str, Any]]:
    current = scores.get('global', 0)
    prev = (previous or {}).get('global', current)
    trend = [max(0, prev - 5), prev, current]
    return [
        {
            'id': 'cv-score',
            'labelKey': 'student.internshipOffers.cvDashboard.metrics.cvScore',
            'value': current,
            'trend': trend,
            'unit': '%',
        },
        {
            'id': 'readiness',
            'labelKey': 'student.internshipOffers.cvDashboard.breakdown.readiness',
            'value': scores.get('readiness', 0),
            'trend': [scores.get('readiness', 0) - 3, scores.get('readiness', 0)],
            'unit': '%',
        },
    ]


def _build_activity_timeline(report_uuid: str | None, analyzed_at=None) -> list[dict[str, Any]]:
    return [{
        'id': 'act-analyze',
        'type': 'analyze',
        'titleKey': 'student.internshipOffers.cvDashboard.activity.analyzed',
        'timestamp': _format_datetime(analyzed_at),
        'reportUuid': report_uuid,
    }]


def _activity_level(score: int) -> str:
    if score >= 80:
        return 'high'
    if score >= 60:
        return 'medium'
    return 'low'


def _risk_label(score: int) -> str:
    if score >= 75:
        return 'low'
    if score >= 50:
        return 'medium'
    return 'high'


def _format_datetime(dt=None) -> str:
    if dt is None:
        dt = timezone.now()
    return timezone.localtime(dt).strftime('%d/%m/%Y %H:%M')


def _now_label() -> str:
    return _format_datetime()


def rebuild_dashboard_from_report(report) -> dict[str, Any]:
    """Rebuild frontend dashboard payload from a persisted report (no AI)."""
    from apps.cv_intelligence.services.orchestrator import build_student_context

    structured: dict[str, Any] = {}
    if getattr(report, 'structured_data', None):
        structured = report.structured_data.structured_json or {}

    scores = {
        'global': report.global_score,
        'skills': report.skills_score,
        'experience': report.experience_score,
        'education': report.education_score,
        'formatting': report.formatting_score,
        'ats': report.ats_score,
        'readiness': report.readiness_score,
        'potential': report.potential_score,
    }

    previous_scores = None
    if report.previous_report_id and report.previous_report:
        prev = report.previous_report
        previous_scores = {
            'global': prev.global_score,
            'skills': prev.skills_score,
            'experience': prev.experience_score,
            'education': prev.education_score,
            'formatting': prev.formatting_score,
            'ats': prev.ats_score,
            'readiness': prev.readiness_score,
        }

    return build_dashboard_payload(
        structured=structured,
        scores=scores,
        swot=report.swot_json or {},
        ats_analysis=report.ats_analysis_json or {},
        matches=report.internship_matches_json or [],
        missing_skills=report.missing_skills_json or [],
        recommended_skills=report.recommended_skills_json or [],
        roadmap=report.roadmap_json or [],
        interview_prep=report.interview_prep_json or [],
        score_explanations=report.score_explanations_json or {},
        student_context=build_student_context(report.student_profile),
        provider=report.provider,
        detected_languages=report.detected_languages or [],
        report_uuid=str(report.uuid),
        previous_scores=previous_scores,
        cv_hash=report.cv_hash,
        version=report.version,
        analyzed_at=report.analyzed_at,
    )
