"""Convert QuickCV builder payload to structured CV data."""

from __future__ import annotations

import re
from typing import Any


def builder_payload_to_structured(payload: dict[str, Any]) -> dict[str, Any]:
    details = payload.get('details') or {}
    work_exp = payload.get('workExp') or payload.get('experience') or []
    education = payload.get('education') or []
    projects = payload.get('projects') or []
    skills = payload.get('skills') or []
    languages = payload.get('languages') or []
    certifications = payload.get('certifications') or []
    achievements = payload.get('achievements') or payload.get('awards') or []

    structured = {
        'name': _text(details.get('name')),
        'email': _text(details.get('email')),
        'phone': _text(details.get('phone')),
        'linkedin': _text(details.get('linkedin') or details.get('linkedIn')),
        'github': _text(details.get('github') or details.get('gitHub')),
        'portfolio': _text(details.get('portfolio') or details.get('website')),
        'professional_summary': _text(details.get('summary') or details.get('role')),
        'languages': _normalize_languages(languages),
        'education': [_format_education(e) for e in education if _has_content(e)],
        'experience': [_format_experience(e) for e in work_exp if _has_content(e)],
        'projects': [_format_project(p) for p in projects if _has_content(p)],
        'certifications': [_format_cert(c) for c in certifications if _has_content(c)],
        'skills': _normalize_skills(skills),
        'achievements': [_text(a) if isinstance(a, str) else _text(a.get('title') or a.get('name')) for a in achievements],
        'internship_history': _extract_internships(work_exp),
    }
    return {k: v for k, v in structured.items() if v not in (None, '', [], {})}


def builder_payload_to_text(payload: dict[str, Any]) -> str:
    structured = builder_payload_to_structured(payload)
    parts: list[str] = []
    if structured.get('name'):
        parts.append(structured['name'])
    if structured.get('professional_summary'):
        parts.append(structured['professional_summary'])
    for section_key in ('experience', 'education', 'projects', 'skills', 'certifications', 'achievements'):
        items = structured.get(section_key) or []
        if items:
            parts.append(section_key.upper())
            parts.extend(str(i) for i in items)
    return '\n'.join(parts)


def _text(value: Any) -> str:
    return str(value or '').strip()


def _has_content(item: Any) -> bool:
    if isinstance(item, str):
        return bool(item.strip())
    if isinstance(item, dict):
        return any(_text(v) for v in item.values())
    return bool(item)


def _normalize_skills(skills: list) -> list[str]:
    result: list[str] = []
    for s in skills:
        if isinstance(s, str) and s.strip():
            result.append(s.strip())
        elif isinstance(s, dict):
            name = _text(s.get('name') or s.get('skill') or s.get('label'))
            if name:
                result.append(name)
    return result


def _normalize_languages(languages: list) -> list[dict[str, str]]:
    result: list[dict[str, str]] = []
    for lang in languages:
        if isinstance(lang, str) and lang.strip():
            result.append({'language': lang.strip(), 'level': ''})
        elif isinstance(lang, dict):
            result.append({
                'language': _text(lang.get('language') or lang.get('name')),
                'level': _text(lang.get('level') or lang.get('proficiency')),
            })
    return [r for r in result if r.get('language')]


def _format_education(edu: dict) -> str:
    parts = [
        _text(edu.get('degree') or edu.get('title')),
        _text(edu.get('institution') or edu.get('school')),
        _text(edu.get('dates') or edu.get('period')),
    ]
    return ' — '.join(p for p in parts if p)


def _format_experience(exp: dict) -> str:
    parts = [
        _text(exp.get('position') or exp.get('title') or exp.get('role')),
        _text(exp.get('company') or exp.get('organization')),
        _text(exp.get('dates') or exp.get('period')),
    ]
    desc = _text(exp.get('description') or exp.get('summary'))
    base = ' — '.join(p for p in parts if p)
    return f'{base}: {desc}' if desc and base else base or desc


def _format_project(proj: dict) -> str:
    parts = [
        _text(proj.get('name') or proj.get('title')),
        _text(proj.get('description') or proj.get('summary')),
        _text(proj.get('technologies') or proj.get('tech')),
    ]
    return ' — '.join(p for p in parts if p)


def _format_cert(cert: dict | str) -> str:
    if isinstance(cert, str):
        return cert.strip()
    return ' — '.join(
        p for p in [_text(cert.get('name')), _text(cert.get('issuer')), _text(cert.get('date'))] if p
    )


def _extract_internships(work_exp: list) -> list[str]:
    pattern = re.compile(
        r'\b(stage|internship|intern|stagiaire|pfe|pfa)\b',
        re.IGNORECASE,
    )
    internships: list[str] = []
    for exp in work_exp:
        formatted = _format_experience(exp) if isinstance(exp, dict) else _text(exp)
        if formatted and pattern.search(formatted):
            internships.append(formatted)
    return internships
