"""Build canonical text blobs for embedding generation."""

from __future__ import annotations

from apps.accounts_et_roles.models import StudentProfile
from apps.stage.models import InternshipOffer


def student_profile_text(student: StudentProfile) -> str:
    parts: list[str] = []
    if student.career_objective:
        parts.append(f'Career objective: {student.career_objective}')
    if student.professional_summary:
        parts.append(f'Summary: {student.professional_summary}')
    skills = getattr(student, 'skills', None) or []
    if skills:
        parts.append('Skills: ' + ', '.join(str(s) for s in skills))
    if student.program_major:
        parts.append(f'Program: {student.program_major}')
    if student.city:
        parts.append(f'City: {student.city}')
    mobility = getattr(student, 'mobility', None) or []
    if mobility:
        if isinstance(mobility, list):
            parts.append('Mobility: ' + ', '.join(str(m) for m in mobility))
        else:
            parts.append(f'Mobility: {mobility}')
    internship_type = getattr(student, 'internship_type', None)
    if internship_type and getattr(internship_type, 'name', None):
        parts.append(f'Internship type: {internship_type.name}')
    return '\n'.join(parts).strip()


def offer_profile_text(offer: InternshipOffer) -> str:
    parts: list[str] = [
        f'Title: {offer.title}',
        f'Company: {offer.company_name}',
    ]
    if offer.description:
        parts.append(f'Description: {offer.description}')
    if offer.required_skills:
        parts.append('Required skills: ' + ', '.join(str(s) for s in offer.required_skills))
    if offer.preferred_skills:
        parts.append('Preferred skills: ' + ', '.join(str(s) for s in offer.preferred_skills))
    if offer.location_city:
        parts.append(f'Location: {offer.location_city}')
    if offer.is_remote:
        parts.append('Remote: yes')
    parts.append(f'Type: {offer.offer_type}')
    if offer.min_education_level:
        parts.append(f'Min education: {offer.min_education_level}')
    return '\n'.join(parts).strip()


def parsed_cv_text(parsed: dict) -> str:
    parts: list[str] = []
    for key in ('professional_summary', 'career_objective', 'full_name'):
        value = parsed.get(key)
        if value:
            parts.append(f'{key}: {value}')
    skills = parsed.get('skills') or []
    if skills:
        parts.append('Skills: ' + ', '.join(str(s) for s in skills))
    for section_key in ('education', 'experience', 'languages'):
        items = parsed.get(section_key) or []
        if items:
            parts.append(f'{section_key}: ' + ' | '.join(str(i) for i in items))
    return '\n'.join(parts).strip()
