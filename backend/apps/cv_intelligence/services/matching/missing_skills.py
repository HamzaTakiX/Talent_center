"""Missing skills engine — compare CV against real offer database."""

from __future__ import annotations

from collections import Counter
from typing import Any

from django.db.models import Q

from apps.accounts_et_roles.models import StudentProfile
from apps.stage.models import InternshipOffer


def compute_missing_skills(
    student: StudentProfile,
    structured: dict[str, Any],
    matches: list[dict[str, Any]] | None = None,
    limit: int = 12,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Return (missing_skills, recommended_skills) from real offers."""
    cv_skills = {str(s).strip().lower() for s in (structured.get('skills') or []) if str(s).strip()}
    profile_skills = {str(s).strip().lower() for s in (getattr(student, 'skills', []) or []) if str(s).strip()}
    candidate_skills = cv_skills | profile_skills

    offer_ids = [m['id'] for m in (matches or [])[:5]]
    offers_qs = InternshipOffer.objects.filter(
        Q(status=InternshipOffer.Status.PUBLISHED) | Q(status=InternshipOffer.Status.OPEN),
    )
    if offer_ids:
        top_offers = offers_qs.filter(uuid__in=offer_ids)
    else:
        top_offers = offers_qs.order_by('-published_at')[:20]

    skill_counter: Counter[str] = Counter()
    skill_display: dict[str, str] = {}

    for offer in top_offers:
        for skill in (offer.required_skills or []) + (offer.preferred_skills or []):
            normalized = str(skill).strip().lower()
            if not normalized or normalized in candidate_skills:
                continue
            skill_counter[normalized] += 1
            skill_display[normalized] = str(skill).strip()

    missing: list[dict[str, Any]] = []
    recommended: list[dict[str, Any]] = []

    for skill_norm, count in skill_counter.most_common(limit):
        display_name = skill_display.get(skill_norm, skill_norm)
        priority = 'high' if count >= 3 else ('medium' if count >= 2 else 'optional')
        entry = {
            'id': f'ms-{skill_norm.replace(" ", "-")[:30]}',
            'name': display_name,
            'priority': priority,
            'demand_count': count,
        }
        missing.append(entry)
        if priority in ('high', 'medium'):
            recommended.append({**entry, 'reason': f'Requis par {count} offre(s) correspondante(s)'})

    return missing[:limit], recommended[:8]
