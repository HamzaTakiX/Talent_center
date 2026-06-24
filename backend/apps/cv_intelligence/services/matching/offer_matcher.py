"""CV-aware internship matching — scores différenciés par CV, profil et offre."""

from __future__ import annotations

import re
import unicodedata
from typing import Any

from django.db.models import Q

from apps.accounts_et_roles.models import StudentProfile
from apps.stage.models import InternshipOffer
from apps.stage.services.chat_service import _offer_company_logo_url

# Pondération du score final (total = 100)
_WEIGHTS = {
    'required_skills': 35,
    'preferred_skills': 15,
    'domain': 20,
    'education': 10,
    'experience': 10,
    'languages': 5,
    'logistics': 5,
}

_SKILL_SYNONYMS: dict[str, set[str]] = {
    'excel': {'excel', 'microsoft excel', 'ms excel', 'tableur', 'spreadsheet'},
    'python': {'python', 'python3'},
    'react': {'react', 'react.js', 'reactjs'},
    'javascript': {'javascript', 'js', 'ecmascript'},
    'sql': {'sql', 'mysql', 'postgresql', 'postgres'},
    'finance': {'finance', 'financial', 'financier', 'financière', 'comptabilité', 'accounting'},
    'marketing': {'marketing', 'digital marketing', 'communication'},
    'rse': {'rse', 'csr', 'durabilité', 'sustainability', 'esg', 'responsabilité sociale'},
}

_DOMAIN_STOPWORDS = frozenset({
    'stage', 'stagiaire', 'intern', 'internship', 'fin', 'étude', 'etude', 'departement',
    'département', 'de', 'du', 'des', 'la', 'le', 'les', 'en', 'and', 'the', 'for',
})

EDUCATION_RANK = {
    '': 0, 'BAC': 1, 'BAC_PLUS_2': 2, 'LICENCE': 3, 'MASTER': 4, 'INGENIEUR': 5, 'DOCTORAT': 6,
}

MIN_RECOMMEND_SCORE = 45
# Cap offers scored during analysis to keep import/analysis responsive.
ANALYSIS_MATCH_POOL_SIZE = 60


def _normalize(text: str) -> str:
    text = unicodedata.normalize('NFKD', text or '')
    text = ''.join(c for c in text if not unicodedata.combining(c))
    return re.sub(r'\s+', ' ', text.lower().strip())


def _normalize_skills(skills: list) -> set[str]:
    return {_normalize(str(s)) for s in (skills or []) if str(s).strip()}


def _skill_tokens(skill: str) -> set[str]:
    base = _normalize(skill)
    tokens = {base}
    for key, synonyms in _SKILL_SYNONYMS.items():
        if base == key or base in synonyms or any(s in base for s in synonyms):
            tokens.add(key)
            tokens.update(synonyms)
    return tokens


def _skill_matches(required: str, candidate_skills: set[str]) -> bool:
    req_tokens = _skill_tokens(required)
    for cand in candidate_skills:
        cand_tokens = _skill_tokens(cand)
        if req_tokens & cand_tokens:
            return True
        if any(rt in cand or cand in rt for rt in req_tokens):
            return True
    return False


def _score_skill_list(required: list, preferred: list, candidate: set[str]) -> tuple[int, int, list[str], list[str]]:
    """Return (required_pct, preferred_pct, matched, missing)."""
    req_norm = [_normalize(s) for s in required if str(s).strip()]
    pref_norm = [_normalize(s) for s in preferred if str(s).strip()]

    matched_req = [s for s in req_norm if _skill_matches(s, candidate)]
    missing_req = [s for s in req_norm if s not in matched_req and not _skill_matches(s, candidate)]

    if req_norm:
        required_pct = int(len(matched_req) / len(req_norm) * 100)
    else:
        required_pct = 100

    matched_pref = [s for s in pref_norm if _skill_matches(s, candidate)]
    if pref_norm:
        preferred_pct = int(len(matched_pref) / len(pref_norm) * 100)
    else:
        preferred_pct = 100 if candidate else 50

    all_matched = list(dict.fromkeys(matched_req + matched_pref))
    all_missing = [s for s in req_norm if s not in matched_req]
    return required_pct, preferred_pct, all_matched, all_missing


def _extract_domain_tokens(*texts: str) -> set[str]:
    tokens: set[str] = set()
    for text in texts:
        for word in re.findall(r'[\wÀ-ÿ]{3,}', _normalize(text)):
            if word not in _DOMAIN_STOPWORDS:
                tokens.add(word)
    return tokens


def _score_domain(student: StudentProfile, structured: dict[str, Any], offer: InternshipOffer) -> tuple[int, list[str]]:
    offer_tokens = _extract_domain_tokens(
        offer.title,
        offer.description or '',
        offer.company_name or '',
    )
    profile_tokens = _extract_domain_tokens(
        getattr(student, 'career_objective', '') or '',
        getattr(student, 'professional_summary', '') or '',
        structured.get('professional_summary') or '',
        getattr(getattr(student, 'filiere', None), 'name', '') or '',
        ' '.join(structured.get('education') or []),
        ' '.join(structured.get('experience') or []),
        ' '.join(structured.get('projects') or []),
        ' '.join(structured.get('skills') or []),
    )
    if not offer_tokens:
        return 50, []

    overlap = offer_tokens & profile_tokens
    ratio = len(overlap) / max(len(offer_tokens), 1)
    score = max(0, min(100, int(ratio * 100 + (10 if len(overlap) >= 2 else 0))))
    return score, sorted(overlap)[:6]


def _score_education(student: StudentProfile, structured: dict[str, Any], offer: InternshipOffer) -> tuple[int, str]:
    min_level = offer.min_education_level or ''
    if not min_level:
        edu_entries = structured.get('education') or []
        return (80 if edu_entries else 50), 'Aucun niveau minimum exigé sur l\'offre'

    student_level = getattr(getattr(student, 'academic_level', None), 'code', '') or ''
    student_rank = EDUCATION_RANK.get(student_level.upper()[:10], 3)
    required_rank = EDUCATION_RANK.get(min_level, 0)
    if student_rank >= required_rank:
        return 100, 'Niveau d\'études compatible'
    gap = required_rank - student_rank
    return max(0, 100 - gap * 25), f'Écart de niveau d\'études ({gap} niveau(x))'


def _score_experience(structured: dict[str, Any], offer: InternshipOffer, domain_overlap: list[str]) -> tuple[int, str]:
    experiences = (structured.get('experience') or []) + (structured.get('internship_history') or [])
    projects = structured.get('projects') or []
    offer_text = _normalize(f'{offer.title} {offer.description or ""}')

    relevant = 0
    for exp in experiences:
        exp_text = _normalize(str(exp))
        if any(tok in exp_text for tok in domain_overlap) or any(w in exp_text for w in offer_text.split() if len(w) > 4):
            relevant += 1

    if relevant >= 2:
        return 90, f'{relevant} expériences pertinentes pour cette offre'
    if relevant == 1:
        return 70, '1 expérience pertinente identifiée'
    if projects:
        return 45, 'Projets présents mais peu d\'expérience directement liée'
    if experiences:
        return 35, 'Expérience présente mais peu alignée avec le poste'
    return 15, 'Aucune expérience/stage lié à cette offre'


def _score_languages(structured: dict[str, Any], offer: InternshipOffer) -> tuple[int, list[str], list[str]]:
    required = [_normalize(str(l)) for l in (offer.required_languages or []) if str(l).strip()]
    if not required:
        return 100, [], []

    cv_langs: set[str] = set()
    for lang in structured.get('languages') or []:
        if isinstance(lang, dict):
            cv_langs.add(_normalize(lang.get('language') or lang.get('name') or ''))
        elif isinstance(lang, str):
            cv_langs.add(_normalize(lang))

    matched, missing = [], []
    for req in required:
        if any(req in cl or cl in req for cl in cv_langs if cl):
            matched.append(req)
        else:
            missing.append(req)

    pct = int(len(matched) / len(required) * 100) if required else 100
    return pct, matched, missing


def _score_logistics(student: StudentProfile, offer: InternshipOffer) -> tuple[int, str]:
    score = 0
    notes: list[str] = []

    if offer.is_remote:
        score += 60
        notes.append('Offre en remote')
    else:
        student_city = _normalize(getattr(student, 'city', '') or '')
        offer_city = _normalize(offer.location_city or '')
        if student_city and offer_city and student_city in offer_city or offer_city in student_city:
            score += 60
            notes.append(f'Même ville ({offer.location_city})')
        else:
            mobility = getattr(student, 'mobility', None) or []
            mob_list = mobility if isinstance(mobility, list) else str(mobility).split(',')
            if any(m.strip().lower() in ('national', 'international', 'high', 'oui', 'yes') for m in mob_list):
                score += 40
                notes.append('Mobilité géographique du profil')
            else:
                score += 10
                notes.append('Localisation différente')

    student_type = getattr(getattr(student, 'internship_type', None), 'name', '') or ''
    st = _normalize(student_type)
    ot = _normalize(offer.offer_type or '')
    type_keywords = {
        'pfe': ['pfe', 'fin etude', 'fin étude'],
        'internship': ['stage', 'intern'],
        'alternance': ['alternance'],
    }
    aligned = any(k in st for k in type_keywords.get(ot, [ot])) or ot in st
    if aligned:
        score += 40
        notes.append('Type de stage compatible')
    else:
        score += 10

    return min(100, score), ' · '.join(notes)


def _match_level(score: int, required_pct: int, has_required: bool) -> str:
    if has_required and required_pct == 0 and score < 40:
        return 'none'
    if score >= 70:
        return 'strong'
    if score >= MIN_RECOMMEND_SCORE:
        return 'partial'
    if score >= 25:
        return 'weak'
    return 'none'


def _build_explanation(
    *,
    score: int,
    match_level: str,
    matched_skills: list[str],
    missing_skills: list[str],
    domain_overlap: list[str],
    missing_langs: list[str],
    logistics_note: str,
    education_note: str,
    experience_note: str,
) -> str:
    parts: list[str] = []

    if match_level == 'none':
        parts.append('Ce stage ne correspond pas actuellement à votre profil CV.')
    elif match_level == 'weak':
        parts.append('Compatibilité faible — amélioration du CV recommandée avant de postuler.')
    elif match_level == 'strong':
        parts.append('Bonne compatibilité entre votre CV et cette offre.')
    else:
        parts.append('Compatibilité partielle — certains critères restent à combler.')

    if matched_skills:
        parts.append(f'Compétences alignées : {", ".join(matched_skills[:5])}')
    if missing_skills:
        parts.append(f'Compétences manquantes : {", ".join(missing_skills[:4])}')
    if domain_overlap:
        parts.append(f'Domaines communs : {", ".join(domain_overlap[:4])}')
    elif not matched_skills and missing_skills:
        parts.append('Aucune compétence requise ne figure dans votre CV.')
    if missing_langs:
        parts.append(f'Langues manquantes : {", ".join(missing_langs)}')
    parts.append(education_note)
    parts.append(experience_note)
    if logistics_note:
        parts.append(logistics_note)

    return ' '.join(p for p in parts if p)


def _company_initials(name: str) -> str:
    parts = [p for p in (name or '').split() if p]
    if not parts:
        return '??'
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[1][0]).upper()


def _collect_candidate_skills(student: StudentProfile, structured: dict[str, Any]) -> set[str]:
    skills = set()
    skills.update(_normalize_skills(structured.get('skills') or []))
    skills.update(_normalize_skills(getattr(student, 'skills', []) or []))
    return skills


def compute_cv_offer_match(
    student: StudentProfile,
    structured: dict[str, Any],
    offer: InternshipOffer,
) -> dict[str, Any]:
    candidate_skills = _collect_candidate_skills(student, structured)

    req_pct, pref_pct, matched_skills, missing_skills = _score_skill_list(
        offer.required_skills or [],
        offer.preferred_skills or [],
        candidate_skills,
    )
    domain_score, domain_overlap = _score_domain(student, structured, offer)
    edu_score, edu_note = _score_education(student, structured, offer)
    exp_score, exp_note = _score_experience(structured, offer, domain_overlap)
    lang_score, matched_langs, missing_langs = _score_languages(structured, offer)
    log_score, log_note = _score_logistics(student, offer)

    has_required = bool(offer.required_skills)

    weighted = (
        req_pct * _WEIGHTS['required_skills']
        + pref_pct * _WEIGHTS['preferred_skills']
        + domain_score * _WEIGHTS['domain']
        + edu_score * _WEIGHTS['education']
        + exp_score * _WEIGHTS['experience']
        + lang_score * _WEIGHTS['languages']
        + log_score * _WEIGHTS['logistics']
    ) / 100
    match_percent = max(0, min(100, int(round(weighted))))

    # Pénalité si compétences obligatoires absentes (sans écraser la différenciation)
    if has_required and req_pct == 0:
        match_percent = max(0, match_percent - 15)

    match_level = _match_level(match_percent, req_pct, has_required)
    is_recommended = (
        match_level in ('strong', 'partial')
        and match_percent >= MIN_RECOMMEND_SCORE
        and not (has_required and req_pct == 0)
    )

    explanation = _build_explanation(
        score=match_percent,
        match_level=match_level,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        domain_overlap=domain_overlap,
        missing_langs=missing_langs,
        logistics_note=log_note,
        education_note=edu_note,
        experience_note=exp_note,
    )

    return {
        'id': str(offer.uuid),
        'company': offer.company_name or (offer.company.name if offer.company else 'Entreprise'),
        'companyInitials': _company_initials(offer.company_name or ''),
        'companyLogoUrl': _offer_company_logo_url(offer),
        'title': offer.title,
        'location': offer.location_city or (offer.location_country if offer.location_country else 'Remote' if offer.is_remote else ''),
        'matchPercent': match_percent,
        'matchLevel': match_level,
        'isRecommended': is_recommended,
        'matchedSkills': matched_skills,
        'missingSkills': missing_skills,
        'breakdown': {
            'skills': int(req_pct * 0.7 + pref_pct * 0.3),
            'location': log_score,
            'experience': exp_score,
            'education': edu_score,
            'domain': domain_score,
            'languages': lang_score,
        },
        'explanation': explanation,
        'required_skills': offer.required_skills or [],
        'preferred_skills': offer.preferred_skills or [],
    }


def enrich_internship_match_logos(
    matches: list[dict[str, Any]],
    request=None,
) -> list[dict[str, Any]]:
    """Attach company logos to match rows (cached dashboards may omit them)."""
    if not matches:
        return matches

    missing_ids = [
        str(m['id'])
        for m in matches
        if m.get('id') and not m.get('companyLogoUrl')
    ]
    offers_by_uuid: dict[str, InternshipOffer] = {}
    if missing_ids:
        offers_by_uuid = {
            str(offer.uuid): offer
            for offer in InternshipOffer.objects.filter(uuid__in=missing_ids).select_related('company')
        }

    enriched: list[dict[str, Any]] = []
    for match in matches:
        row = dict(match)
        logo = row.get('companyLogoUrl')
        if not logo:
            offer = offers_by_uuid.get(str(row.get('id', '')))
            if offer:
                row['companyLogoUrl'] = _offer_company_logo_url(offer, request)
        elif request and isinstance(logo, str) and logo.startswith('/'):
            row['companyLogoUrl'] = request.build_absolute_uri(logo)
        enriched.append(row)
    return enriched


def _active_offers_queryset(offer_uuids: list[str] | None = None):
    qs = (
        InternshipOffer.objects.filter(
            Q(status=InternshipOffer.Status.PUBLISHED) | Q(status=InternshipOffer.Status.OPEN),
        )
        .select_related('company')
        .order_by('-published_at', '-created_at')
    )
    if offer_uuids:
        qs = qs.filter(uuid__in=offer_uuids)
    return qs


def compute_all_cv_offer_matches(
    student: StudentProfile,
    structured: dict[str, Any],
    *,
    offer_uuids: list[str] | None = None,
    limit: int | None = None,
) -> list[dict[str, Any]]:
    """Score toutes les offres actives — même logique que l'analyse CV, sans filtre recommandation."""
    offers = _active_offers_queryset(offer_uuids)
    if limit:
        offers = offers[:limit]

    matches = [compute_cv_offer_match(student, structured, offer) for offer in offers]
    matches.sort(key=lambda m: m['matchPercent'], reverse=True)
    return matches


def compute_cv_offer_matches(
    student: StudentProfile,
    structured: dict[str, Any],
    limit: int = 10,
    *,
    pool_size: int | None = ANALYSIS_MATCH_POOL_SIZE,
) -> list[dict[str, Any]]:
    """Score active offers and return the best matches with differentiated scores."""
    matches = compute_all_cv_offer_matches(
        student,
        structured,
        limit=pool_size,
    )
    matches.sort(key=lambda m: (m['isRecommended'], m['matchPercent']), reverse=True)

    recommended = [m for m in matches if m['isRecommended']]
    if recommended:
        return recommended[:limit]

    # Aucune recommandation forte : montrer les offres triées avec explication honnête
    return matches[:limit]
