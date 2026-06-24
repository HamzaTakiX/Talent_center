"""CV extraction orchestrator — PDF, DOCX, builder, profile file."""

from __future__ import annotations

from typing import Any

from apps.cv_intelligence.constants import CvSourceType

from .builder_extractor import builder_payload_to_structured, builder_payload_to_text
from .docx_extractor import extract_text_from_docx
from .pdf_extractor import extract_text_from_pdf
from .text_parser import parse_raw_text_to_structured


def extract_from_bytes(
    file_bytes: bytes,
    filename: str,
) -> tuple[dict[str, Any], str, dict[str, Any]]:
    """Return (structured_json, raw_text, metadata)."""
    lower = (filename or '').lower()
    metadata: dict[str, Any] = {'filename': filename}

    if lower.endswith('.pdf'):
        raw_text, meta = extract_text_from_pdf(file_bytes)
        metadata.update(meta)
        source = CvSourceType.PDF
    elif lower.endswith('.docx') or lower.endswith('.doc'):
        raw_text, meta = extract_text_from_docx(file_bytes)
        metadata.update(meta)
        source = CvSourceType.DOCX
    else:
        raw_text = file_bytes.decode('utf-8', errors='ignore')
        source = CvSourceType.PROFILE_FILE

    structured = parse_raw_text_to_structured(raw_text)
    metadata['source_type'] = source
    metadata['raw_text_length'] = len(raw_text)
    return structured, raw_text, metadata


def extract_from_builder(payload: dict[str, Any]) -> tuple[dict[str, Any], str, dict[str, Any]]:
    structured = builder_payload_to_structured(payload)
    raw_text = builder_payload_to_text(payload)
    metadata = {
        'source_type': CvSourceType.BUILDER,
        'raw_text_length': len(raw_text),
    }
    return structured, raw_text, metadata


def merge_structured_with_profile(
    structured: dict[str, Any],
    student_profile,
) -> dict[str, Any]:
    """Enrich extracted CV with real student profile data."""
    merged = dict(structured)
    user = getattr(student_profile, 'user', None)
    profile = getattr(user, 'profile', None) if user else None

    if not merged.get('name') and profile:
        merged['name'] = f'{profile.first_name or ""} {profile.last_name or ""}'.strip()
    if not merged.get('email') and user:
        merged['email'] = getattr(user, 'email', '') or ''
    if not merged.get('phone') and profile:
        merged['phone'] = getattr(profile, 'phone', '') or ''
    if not merged.get('linkedin') and student_profile:
        merged['linkedin'] = getattr(student_profile, 'linkedin_url', '') or ''
    if not merged.get('professional_summary') and student_profile:
        merged['professional_summary'] = getattr(student_profile, 'professional_summary', '') or ''

    profile_skills = getattr(student_profile, 'skills', None) or []
    cv_skills = merged.get('skills') or []
    seen = {s.lower() for s in cv_skills if isinstance(s, str)}
    for skill in profile_skills:
        s = str(skill).strip()
        if s and s.lower() not in seen:
            cv_skills.append(s)
            seen.add(s.lower())
    if cv_skills:
        merged['skills'] = cv_skills

    return merged
