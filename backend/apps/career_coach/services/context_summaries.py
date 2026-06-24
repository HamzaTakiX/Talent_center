"""Compact, cacheable context summaries for prompt construction."""

from __future__ import annotations

from typing import Any

from apps.career_coach.services.context_cache import get_cached_summaries, set_cached_summaries


def _truncate(text: str, limit: int = 400) -> str:
    clean = (text or '').strip()
    if len(clean) <= limit:
        return clean
    return f'{clean[:limit]}…'


def build_context_summaries(context: dict[str, Any]) -> dict[str, str]:
    """Derive short summaries from a full student context dict."""
    profile = context.get('profile') or {}
    cv = context.get('cv') or {}
    offers = context.get('offers') or []
    applications = context.get('applications') or []
    interview = context.get('interview') or {}
    current_offer = context.get('current_offer')

    skills = profile.get('skills') or []
    profile_summary = (
        f"Program: {profile.get('program') or 'N/A'} | "
        f"Class: {profile.get('class') or 'N/A'} | "
        f"Skills: {', '.join(str(s) for s in skills[:12]) or 'N/A'} | "
        f"Objective: {_truncate(profile.get('career_objective') or '', 120)}"
    )

    cv_summary = (
        f"CV: {cv.get('title') or 'Untitled'} | "
        f"Score: {cv.get('cv_score', 'N/A')} | ATS: {cv.get('ats_score', 'N/A')} | "
        f"Summary: {_truncate(cv.get('summary') or '', 300)}"
    )
    if cv.get('strengths'):
        cv_summary += f" | Strengths: {', '.join(str(s) for s in cv['strengths'][:4])}"
    if cv.get('weaknesses'):
        cv_summary += f" | Weaknesses: {', '.join(str(w) for w in cv['weaknesses'][:4])}"

    offer_lines = []
    for offer in offers[:8]:
        offer_lines.append(
            f"- {offer.get('title')} @ {offer.get('company')} "
            f"({int(offer.get('match_score') or 0)}% match, {offer.get('application_status', 'not_applied')})"
        )
    offers_summary = '\n'.join(offer_lines) if offer_lines else 'No matched offers yet.'

    app_lines = []
    for app in applications[:8]:
        app_lines.append(
            f"- {app.get('offer_title')} @ {app.get('company')}: "
            f"{app.get('status')} (match {app.get('match_score', 'N/A')}%)"
        )
    applications_summary = '\n'.join(app_lines) if app_lines else 'No applications yet.'

    interview_summary = ''
    if interview:
        weak = interview.get('weak_areas') or []
        interview_summary = (
            f"Readiness: {interview.get('readiness', 'N/A')} | "
            f"Weak areas: {', '.join(str(w) for w in weak[:5]) or 'N/A'}"
        )

    summaries = {
        'profile': profile_summary,
        'cv': cv_summary,
        'offers': offers_summary,
        'applications': applications_summary,
        'interview': interview_summary,
    }

    if current_offer:
        summaries['current_offer'] = (
            f"{current_offer.get('title')} @ {current_offer.get('company')} | "
            f"Match: {current_offer.get('match_score')}% | "
            f"Missing skills: {', '.join(str(s) for s in (current_offer.get('missing_skills') or [])[:6])}"
        )

    return summaries


def get_or_build_summaries(student_id: int, context: dict[str, Any]) -> dict[str, str]:
    cached = get_cached_summaries(student_id)
    if cached:
        return cached
    summaries = build_context_summaries(context)
    set_cached_summaries(student_id, summaries)
    return summaries


def summaries_to_prompt_text(summaries: dict[str, str]) -> str:
    sections = [
        f"PROFILE:\n{summaries.get('profile', 'N/A')}",
        f"CV:\n{summaries.get('cv', 'N/A')}",
        f"TOP OFFERS:\n{summaries.get('offers', 'N/A')}",
        f"APPLICATIONS:\n{summaries.get('applications', 'N/A')}",
    ]
    if summaries.get('interview'):
        sections.append(f"INTERVIEW:\n{summaries['interview']}")
    if summaries.get('current_offer'):
        sections.append(f"CURRENT OFFER:\n{summaries['current_offer']}")
    return '\n\n'.join(sections)
