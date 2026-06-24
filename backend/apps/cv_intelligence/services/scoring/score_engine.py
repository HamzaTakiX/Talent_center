"""Deterministic CV scoring engine — stable and reproducible."""

from __future__ import annotations

from typing import Any

from apps.cv_intelligence.constants import SCORE_WEIGHTS


def compute_scores(
    structured: dict[str, Any],
    ats_analysis: dict[str, Any],
    student_context: dict[str, Any] | None = None,
) -> dict[str, int]:
    skills = compute_skills_score(structured)
    experience = compute_experience_score(structured)
    education = compute_education_score(structured, student_context or {})
    formatting = compute_formatting_score(structured)
    ats = int(ats_analysis.get('compatibility_percent') or 0)
    readiness = compute_readiness_score(structured, student_context or {})

    global_score = int(
        skills * SCORE_WEIGHTS['skills']
        + experience * SCORE_WEIGHTS['experience']
        + education * SCORE_WEIGHTS['education']
        + formatting * SCORE_WEIGHTS['formatting']
        + ats * SCORE_WEIGHTS['ats']
        + readiness * SCORE_WEIGHTS['readiness']
    )
    potential = min(100, global_score + _potential_gain(structured, ats_analysis))

    return {
        'global': max(0, min(100, global_score)),
        'skills': skills,
        'experience': experience,
        'education': education,
        'formatting': formatting,
        'ats': ats,
        'readiness': readiness,
        'potential': potential,
    }


def compute_skills_score(structured: dict[str, Any]) -> int:
    skills = structured.get('skills') or []
    count = len(skills)
    if count >= 10:
        return 90
    if count >= 6:
        return 78
    if count >= 3:
        return 62
    if count >= 1:
        return 45
    return 15


def compute_experience_score(structured: dict[str, Any]) -> int:
    exp = structured.get('experience') or []
    internships = structured.get('internship_history') or []
    total = len(exp) + len(internships)
    if total >= 3:
        return 88
    if total == 2:
        return 72
    if total == 1:
        return 55
    projects = structured.get('projects') or []
    if projects:
        return 40
    return 20


def compute_education_score(
    structured: dict[str, Any],
    student_context: dict[str, Any],
) -> int:
    edu = structured.get('education') or []
    score = 50
    if edu:
        score += min(30, len(edu) * 15)
    if student_context.get('academic_level') or student_context.get('filiere'):
        score += 10
    if structured.get('certifications'):
        score += 10
    return max(0, min(100, score))


def compute_formatting_score(structured: dict[str, Any]) -> int:
    score = 100
    if not structured.get('name'):
        score -= 15
    if not structured.get('email'):
        score -= 15
    if not structured.get('phone'):
        score -= 10
    if not structured.get('professional_summary'):
        score -= 15
    if not structured.get('linkedin') and not structured.get('github'):
        score -= 10
    return max(0, min(100, score))


def compute_readiness_score(
    structured: dict[str, Any],
    student_context: dict[str, Any],
) -> int:
    score = 0
    if structured.get('skills'):
        score += 25
    if structured.get('experience') or structured.get('internship_history'):
        score += 25
    if structured.get('education'):
        score += 20
    if structured.get('professional_summary'):
        score += 10
    if structured.get('languages'):
        score += 10
    if student_context.get('career_objective') or structured.get('professional_summary'):
        score += 10
    return max(0, min(100, score))


def _potential_gain(structured: dict[str, Any], ats_analysis: dict[str, Any]) -> int:
    gain = 0
    if not structured.get('github'):
        gain += 4
    if not structured.get('linkedin'):
        gain += 3
    if not structured.get('achievements'):
        gain += 5
    if (ats_analysis.get('compatibility_percent') or 0) < 75:
        gain += 6
    if len(structured.get('skills') or []) < 6:
        gain += 5
    return min(20, gain)
