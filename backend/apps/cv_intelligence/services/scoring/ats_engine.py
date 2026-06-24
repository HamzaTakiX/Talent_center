"""Deterministic ATS compatibility analysis."""

from __future__ import annotations

from typing import Any


REQUIRED_CONTACT = ('email', 'phone', 'name')
RECOMMENDED_SECTIONS = ('education', 'experience', 'skills', 'professional_summary')


def analyze_ats(structured: dict[str, Any], raw_text: str = '') -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    score = 100

    contact_score, contact_checks = _check_contact(structured)
    checks.extend(contact_checks)
    score = min(score, contact_score + 40)

    section_score, section_checks = _check_sections(structured)
    checks.extend(section_checks)
    score = int((score * 0.4) + (section_score * 0.6))

    keyword_score, keyword_checks = _check_keywords(structured, raw_text)
    checks.extend(keyword_checks)
    score = int((score * 0.7) + (keyword_score * 0.3))

    formatting_score, formatting_checks = _check_formatting(structured, raw_text)
    checks.extend(formatting_checks)
    score = int((score * 0.8) + (formatting_score * 0.2))

    score = max(0, min(100, score))
    passed = sum(1 for c in checks if c.get('passed'))
    total = len(checks) or 1

    return {
        'compatibility_percent': score,
        'checks': checks,
        'keyword_coverage': keyword_checks[0]['detail'] if keyword_checks else 'N/A',
        'section_structure': section_checks,
        'contact_information': contact_checks,
        'formatting': formatting_checks,
        'readability': _readability_note(raw_text),
        'content_quality': _content_quality_note(structured),
        'summary': (
            f'Compatibilité ATS {score}% — {passed}/{total} critères satisfaits. '
            + _primary_gap(checks)
        ),
    }


def _check_contact(structured: dict[str, Any]) -> tuple[int, list[dict[str, Any]]]:
    checks: list[dict[str, Any]] = []
    present = 0
    for field in REQUIRED_CONTACT:
        value = structured.get(field)
        ok = bool(value and str(value).strip())
        if ok:
            present += 1
        checks.append({
            'dimension': 'contact',
            'field': field,
            'passed': ok,
            'detail': f'{field}: {"present" if ok else "missing"}',
        })
    score = int((present / len(REQUIRED_CONTACT)) * 100)
    return score, checks


def _check_sections(structured: dict[str, Any]) -> tuple[int, list[dict[str, Any]]]:
    checks: list[dict[str, Any]] = []
    present = 0
    for section in RECOMMENDED_SECTIONS:
        value = structured.get(section)
        ok = bool(value and (isinstance(value, str) and value.strip() or isinstance(value, list) and value))
        if ok:
            present += 1
        checks.append({
            'dimension': 'section',
            'field': section,
            'passed': ok,
            'detail': f'Section {section}: {"present" if ok else "missing"}',
        })
    score = int((present / len(RECOMMENDED_SECTIONS)) * 100)
    return score, checks


def _check_keywords(structured: dict[str, Any], raw_text: str) -> tuple[int, list[dict[str, Any]]]:
    skills = structured.get('skills') or []
    skill_count = len(skills)
    text_len = len(raw_text or '')
    if skill_count >= 8:
        score = 90
        detail = f'Strong keyword coverage — {skill_count} skills listed'
    elif skill_count >= 4:
        score = 70
        detail = f'Moderate keyword coverage — {skill_count} skills listed'
    elif skill_count >= 1:
        score = 50
        detail = f'Low keyword coverage — only {skill_count} skills'
    else:
        score = 20
        detail = 'No skills keywords detected — ATS parsing risk'
    if text_len < 200:
        score = max(10, score - 20)
        detail += '; CV text is very short'
    return score, [{'dimension': 'keywords', 'passed': skill_count >= 4, 'detail': detail}]


def _check_formatting(structured: dict[str, Any], raw_text: str) -> tuple[int, list[dict[str, Any]]]:
    checks: list[dict[str, Any]] = []
    score = 80
    if raw_text and raw_text.count('\t') > 5:
        score -= 15
        checks.append({'dimension': 'formatting', 'passed': False, 'detail': 'Tab characters may break ATS parsing'})
    else:
        checks.append({'dimension': 'formatting', 'passed': True, 'detail': 'No problematic tab formatting detected'})
    has_links = bool(structured.get('linkedin') or structured.get('github') or structured.get('portfolio'))
    checks.append({
        'dimension': 'formatting',
        'passed': has_links,
        'detail': 'Professional links present' if has_links else 'No LinkedIn/GitHub/portfolio links',
    })
    if not has_links:
        score -= 10
    return score, checks


def _readability_note(raw_text: str) -> str:
    if not raw_text:
        return 'Insufficient text for readability assessment'
    words = len(raw_text.split())
    if words < 100:
        return f'Short CV ({words} words) — consider adding more detail'
    if words > 900:
        return f'Long CV ({words} words) — may reduce recruiter attention'
    return f'Readable length ({words} words)'


def _content_quality_note(structured: dict[str, Any]) -> str:
    quality_points = 0
    if structured.get('achievements'):
        quality_points += 1
    if structured.get('projects'):
        quality_points += 1
    if structured.get('certifications'):
        quality_points += 1
    if structured.get('internship_history'):
        quality_points += 1
    labels = ['Basic', 'Developing', 'Good', 'Strong', 'Excellent']
    return f'Content quality: {labels[min(quality_points, 4)]}'


def _primary_gap(checks: list[dict[str, Any]]) -> str:
    failed = [c for c in checks if not c.get('passed')]
    if not failed:
        return 'All core ATS criteria met.'
    return f'Primary gap: {failed[0].get("detail", "missing content")}.'
