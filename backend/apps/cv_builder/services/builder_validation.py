"""Pre-flight validation for QuickCV / builder payloads before AI analysis."""

from __future__ import annotations

from typing import Any, Dict, List, Tuple


def _text(value: Any) -> str:
    return (value or '').strip() if isinstance(value, str) else ''


def _has_contact(details: Dict[str, Any]) -> bool:
    keys = ('email', 'phone', 'location', 'website', 'github', 'linkedin')
    return any(_text(details.get(k)) for k in keys)


def _entry_filled(entry: Dict[str, Any], *fields: str) -> bool:
    return any(_text(entry.get(f)) for f in fields)


def validate_builder_payload(payload: Dict[str, Any]) -> Tuple[bool, List[Dict[str, str]]]:
    """Return (is_valid, issues) where each issue has code, section, severity, message_key."""
    issues: List[Dict[str, str]] = []
    details = payload.get('details') or {}

    if not _text(details.get('name')):
        issues.append({
            'code': 'missing_full_name',
            'section': 'contact',
            'severity': 'high',
            'message_key': 'cv.ai.validation.missingFullName',
        })

    if not _text(details.get('role')):
        issues.append({
            'code': 'missing_professional_title',
            'section': 'profile_summary',
            'severity': 'high',
            'message_key': 'cv.ai.validation.missingTitle',
        })

    if not _has_contact(details):
        issues.append({
            'code': 'missing_contact',
            'section': 'contact',
            'severity': 'high',
            'message_key': 'cv.ai.validation.missingContact',
        })

    if not _text(details.get('about')):
        issues.append({
            'code': 'missing_summary',
            'section': 'profile_summary',
            'severity': 'high',
            'message_key': 'cv.ai.validation.missingSummary',
        })

    education = payload.get('education') or []
    edu_ok = any(
        _entry_filled(e, 'institution', 'qualification', 'date')
        for e in education
        if isinstance(e, dict)
    )
    if not edu_ok:
        issues.append({
            'code': 'missing_education',
            'section': 'education',
            'severity': 'high',
            'message_key': 'cv.ai.validation.missingEducation',
        })

    work = payload.get('workExp') or []
    projects = payload.get('projects') or []
    exp_ok = any(
        _entry_filled(w, 'company', 'title', 'desc', 'date')
        for w in work
        if isinstance(w, dict)
    )
    proj_ok = any(
        _entry_filled(p, 'name', 'desc', 'link')
        for p in projects
        if isinstance(p, dict)
    )
    if not exp_ok and not proj_ok:
        issues.append({
            'code': 'missing_experience_or_project',
            'section': 'experience',
            'severity': 'high',
            'message_key': 'cv.ai.validation.missingExperience',
        })

    skills = payload.get('skills') or []
    skill_ok = any(_text(s.get('name')) for s in skills if isinstance(s, dict))
    if not skill_ok:
        issues.append({
            'code': 'missing_skills',
            'section': 'skills',
            'severity': 'high',
            'message_key': 'cv.ai.validation.missingSkills',
        })

    languages = payload.get('languages') or []
    lang_ok = any(
        _entry_filled(l, 'name', 'level')
        for l in languages
        if isinstance(l, dict)
    )
    if not lang_ok:
        issues.append({
            'code': 'missing_languages',
            'section': 'languages',
            'severity': 'high',
            'message_key': 'cv.ai.validation.missingLanguages',
        })

    return len(issues) == 0, issues
