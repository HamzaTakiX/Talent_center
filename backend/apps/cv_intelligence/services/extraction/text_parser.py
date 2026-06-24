"""Parse raw CV text into structured fields using deterministic regex heuristics."""

from __future__ import annotations

import re
from typing import Any


EMAIL_RE = re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]+')
PHONE_RE = re.compile(r'(?:\+?\d[\d\s().-]{7,}\d)')
LINKEDIN_RE = re.compile(r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+', re.I)
GITHUB_RE = re.compile(r'(?:https?://)?(?:www\.)?github\.com/[\w-]+', re.I)
URL_RE = re.compile(r'https?://[\w./?=#&+-]+', re.I)

SECTION_HEADERS = {
    'education': re.compile(
        r'^(?:education|formation|studies|études|academic|parcours\s+acad[ée]mique)\s*:?\s*$',
        re.I | re.M,
    ),
    'experience': re.compile(
        r'^(?:experience|expérience|work\s+experience|professional\s+experience|emploi|travail)\s*:?\s*$',
        re.I | re.M,
    ),
    'skills': re.compile(
        r'^(?:skills|compétences|competences|technical\s+skills|soft\s+skills|expertise)\s*:?\s*$',
        re.I | re.M,
    ),
    'projects': re.compile(
        r'^(?:projects|projets|portfolio)\s*:?\s*$',
        re.I | re.M,
    ),
    'certifications': re.compile(
        r'^(?:certifications?|certificats?|licenses?)\s*:?\s*$',
        re.I | re.M,
    ),
    'languages': re.compile(
        r'^(?:languages?|langues?)\s*:?\s*$',
        re.I | re.M,
    ),
    'achievements': re.compile(
        r'^(?:achievements?|réalisations?|accomplishments?|awards?|distinctions?)\s*:?\s*$',
        re.I | re.M,
    ),
}


def parse_raw_text_to_structured(raw_text: str) -> dict[str, Any]:
    text = (raw_text or '').strip()
    if not text:
        return {}

    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    structured: dict[str, Any] = {
        'email': _first_match(EMAIL_RE, text),
        'phone': _first_match(PHONE_RE, text),
        'linkedin': _first_match(LINKEDIN_RE, text),
        'github': _first_match(GITHUB_RE, text),
        'portfolio': _extract_portfolio(text),
        'name': _guess_name(lines),
        'professional_summary': _guess_summary(lines),
        'languages': _extract_languages_section(text),
        'education': _extract_section_lines(text, 'education'),
        'experience': _extract_section_lines(text, 'experience'),
        'projects': _extract_section_lines(text, 'projects'),
        'certifications': _extract_section_lines(text, 'certifications'),
        'skills': _extract_skills(text),
        'achievements': _extract_section_lines(text, 'achievements'),
        'internship_history': _extract_internships(text),
    }
    return {k: v for k, v in structured.items() if v not in (None, '', [], {})}


def _first_match(pattern: re.Pattern, text: str) -> str:
    match = pattern.search(text)
    return match.group(0).strip() if match else ''


def _extract_portfolio(text: str) -> str:
    for url in URL_RE.findall(text):
        lower = url.lower()
        if 'linkedin.com' in lower or 'github.com' in lower:
            continue
        return url
    return ''


def _guess_name(lines: list[str]) -> str:
    for line in lines[:5]:
        if EMAIL_RE.search(line) or PHONE_RE.search(line) or URL_RE.search(line):
            continue
        if len(line.split()) <= 5 and len(line) < 60 and not line.endswith(':'):
            return line
    return lines[0] if lines else ''


def _guess_summary(lines: list[str]) -> str:
    summary_keywords = ('summary', 'profil', 'profile', 'about', 'à propos', 'objective', 'objectif')
    for i, line in enumerate(lines[:12]):
        lower = line.lower()
        if any(k in lower for k in summary_keywords):
            chunk = lines[i + 1:i + 4]
            return ' '.join(chunk).strip()
    if len(lines) > 1:
        second = lines[1]
        if len(second) > 40 and not second.endswith(':'):
            return second[:400]
    return ''


def _extract_section_lines(text: str, section: str) -> list[str]:
    pattern = SECTION_HEADERS.get(section)
    if not pattern:
        return []
    match = pattern.search(text)
    if not match:
        return []
    start = match.end()
    rest = text[start:]
    items: list[str] = []
    for line in rest.splitlines():
        stripped = line.strip()
        if not stripped:
            if items:
                break
            continue
        if any(h.search(stripped) for h in SECTION_HEADERS.values() if h != pattern):
            break
        if stripped.startswith(('-', '•', '*', '·')):
            items.append(stripped.lstrip('-•*· ').strip())
        elif stripped:
            items.append(stripped)
        if len(items) >= 12:
            break
    return items


def _extract_skills(text: str) -> list[str]:
    inline = _extract_section_lines(text, 'skills')
    if inline:
        skills: list[str] = []
        for line in inline:
            parts = re.split(r'[,;|/•·]', line)
            skills.extend(p.strip() for p in parts if p.strip())
        return skills[:30]
    return []


def _extract_languages_section(text: str) -> list[dict[str, str]]:
    lines = _extract_section_lines(text, 'languages')
    result: list[dict[str, str]] = []
    for line in lines:
        if ':' in line or '—' in line or '-' in line:
            sep = ':' if ':' in line else ('—' if '—' in line else '-')
            lang, level = [p.strip() for p in line.split(sep, 1)]
            result.append({'language': lang, 'level': level})
        else:
            result.append({'language': line, 'level': ''})
    return result


def _extract_internships(text: str) -> list[str]:
    pattern = re.compile(r'\b(stage|internship|intern|stagiaire|pfe|pfa)\b', re.I)
    return [ln.strip() for ln in text.splitlines() if ln.strip() and pattern.search(ln)][:8]
