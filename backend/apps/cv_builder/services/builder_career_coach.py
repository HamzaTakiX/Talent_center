"""Career-coach CV analysis — specialization-aware, ESCA-context driven."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.models import SpecializationDomain
from apps.admin_management.services.specialization_domains import (
    MASTER_TRACK_BY_FILIERE_CODE,
    match_student_to_domain_codes,
    master_tracks_for_filiere_ids,
    program_families_for_filiere_ids,
)

from .builder_analysis_messages import msg, normalize_lang
from .builder_career_labels import (
    localize_tool_examples,
    resolve_career_display_labels,
)

# Domain codes → career coach field profile (not hardcoded to tech only)
_DOMAIN_TO_PROFILE: Dict[str, str] = {
    'finance': 'finance',
    'financial_control': 'finance',
    'financial_management': 'finance',
    'corporate_finance': 'finance',
    'investment': 'finance',
    'banking': 'finance',
    'financial_analysis': 'finance',
    'financial_engineering': 'finance',
    'international_finance': 'finance',
    'asset_management': 'finance',
    'risk_management': 'finance',
    'audit': 'audit',
    'accounting': 'audit',
    'marketing': 'marketing',
    'digital_marketing': 'digital',
    'international_marketing': 'marketing',
    'global_marketing': 'marketing',
    'communication': 'marketing',
    'social_media': 'marketing',
    'branding': 'marketing',
    'seo_sea': 'digital',
    'content_strategy': 'marketing',
    'hr': 'hr',
    'hr_management': 'hr',
    'talent_management': 'hr',
    'recruitment': 'hr',
    'organizational_development': 'hr',
    'supply_chain': 'supply_chain',
    'logistics': 'supply_chain',
    'procurement': 'supply_chain',
    'purchasing': 'supply_chain',
    'operations_management': 'supply_chain',
    'international_business': 'international',
    'international_trade': 'international',
    'global_trade': 'international',
    'cross_cultural_management': 'international',
    'import_export': 'international',
    'export_management': 'international',
    'international_strategy': 'international',
    'international_commerce': 'international',
    'international_negotiation': 'international',
    'business_development': 'business',
    'management': 'business',
    'strategy': 'business',
    'entrepreneurship': 'business',
    'commercial_management': 'business',
    'project_management': 'business',
    'business_intelligence': 'digital',
    'data_analytics': 'digital',
    'e_business': 'digital',
    'web_development': 'tech',
    'mobile_development': 'tech',
    'data_science': 'tech',
    'artificial_intelligence': 'tech',
    'cybersecurity': 'tech',
    'cloud_computing': 'tech',
    'devops': 'tech',
    'software_engineering': 'tech',
    'ui_ux_design': 'tech',
    'erp_systems': 'tech',
    'sap': 'tech',
    'power_bi': 'digital',
    'data_engineering': 'tech',
}

_SECTOR_TOKEN_PROFILE: List[Tuple[str, str]] = [
    ('finance', 'finance'),
    ('financ', 'finance'),
    ('audit', 'audit'),
    ('comptab', 'audit'),
    ('marketing', 'marketing'),
    ('digital', 'digital'),
    ('rh', 'hr'),
    ('human resource', 'hr'),
    ('ressources humaines', 'hr'),
    ('supply', 'supply_chain'),
    ('logist', 'supply_chain'),
    ('international', 'international'),
    ('commerce', 'international'),
    ('informat', 'tech'),
    ('info ', 'tech'),
    ('data', 'digital'),
    ('système', 'tech'),
    ('system', 'tech'),
]

_GENERIC_SKILLS = frozenset({
    'communication', 'teamwork', 'microsoft office', 'excel', 'word', 'powerpoint',
    'leadership', 'management', 'organisation', 'organization', 'adaptability',
    'travail en équipe', 'esprit d\'équipe',
})

_LEADERSHIP_TOKENS = (
    'lead', 'president', 'vice', 'club', 'association', 'bureau', 'mentor',
    'coordinateur', 'coordinator', 'captain', 'responsible', 'responsable',
)

_PRACTICAL_TOKENS = (
    'internship', 'stage', 'project', 'projet', 'consulting', 'case study',
    'simulation', 'hackathon', 'competition', 'concours', 'volunteer', 'bénévol',
    'implemented', 'built', 'delivered', 'launched', 'client', 'kpi',
)

_THEORY_TOKENS = (
    'coursework', 'cours', 'theoretical', 'théorique', 'academic', 'university',
    'université', 'lecture', 'research paper', 'mémoire', 'dissertation',
)


@dataclass
class FieldPlaybook:
    """Expectations recruiters commonly have for a field profile."""

    code: str
    tool_examples: Tuple[str, ...]
    portfolio_kind: str  # message key suffix: github | behance | portfolio_generic
    wants_portfolio: bool
    wants_certifications: bool
    project_emphasis: str  # high | medium | low
    internship_focus: str  # message key param


FIELD_PLAYBOOKS: Dict[str, FieldPlaybook] = {
    'tech': FieldPlaybook(
        'tech',
        ('python', 'java', 'javascript', 'react', 'sql', 'git', 'docker', 'api'),
        'github',
        True,
        False,
        'high',
        'technical internship',
    ),
    'finance': FieldPlaybook(
        'finance',
        ('excel', 'financial modeling', 'bloomberg', 'valuation', 'vba', 'power bi'),
        'portfolio_generic',
        False,
        True,
        'medium',
        'finance internship',
    ),
    'audit': FieldPlaybook(
        'audit',
        ('excel', 'ifrs', 'internal control', 'audit', 'sap', 'risk'),
        'portfolio_generic',
        False,
        True,
        'medium',
        'audit internship',
    ),
    'marketing': FieldPlaybook(
        'marketing',
        ('google analytics', 'meta ads', 'canva', 'crm', 'seo', 'content', 'campaign'),
        'behance',
        True,
        False,
        'high',
        'marketing internship',
    ),
    'digital': FieldPlaybook(
        'digital',
        ('google analytics', 'hubspot', 'figma', 'seo', 'power bi', 'automation'),
        'behance',
        True,
        False,
        'high',
        'digital internship',
    ),
    'hr': FieldPlaybook(
        'hr',
        ('recruitment', 'hris', 'talent', 'onboarding', 'payroll', 'labor law'),
        'portfolio_generic',
        False,
        False,
        'medium',
        'HR internship',
    ),
    'supply_chain': FieldPlaybook(
        'supply_chain',
        ('sap', 'erp', 'inventory', 'logistics', 'procurement', 'lean', 'wms'),
        'portfolio_generic',
        False,
        False,
        'medium',
        'operations internship',
    ),
    'international': FieldPlaybook(
        'international',
        ('trade', 'export', 'incoterms', 'crm', 'market research', 'negotiation'),
        'portfolio_generic',
        False,
        False,
        'medium',
        'international business internship',
    ),
    'business': FieldPlaybook(
        'business',
        ('excel', 'power bi', 'project management', 'crm', 'market analysis'),
        'portfolio_generic',
        False,
        False,
        'medium',
        'management internship',
    ),
}


@dataclass
class CareerContext:
    program_major: str
    academic_sector: str
    academic_level: str
    internship_type: str
    filiere_name: str
    filiere_code: str
    program_family: str
    master_track: str
    career_objective: str
    profile_linkedin: str
    field_profile: str
    domain_codes: List[str]
    domain_names: List[str]
    playbook: FieldPlaybook
    coaching_brief: str


@dataclass
class CvSignals:
    has_about: bool
    has_role: bool
    about_len: int
    has_linkedin: bool
    has_github: bool
    has_website: bool
    has_portfolio_in_projects: bool
    project_count: int
    rich_projects: int
    experience_count: int
    has_metrics_in_exp: bool
    has_leadership: bool
    has_practical_verbs: bool
    theory_heavy: bool
    skill_names: List[str]
    generic_skill_ratio: float
    field_tool_hits: int
    missing_field_tools: List[str]
    language_count: int
    education_has_honors: bool
    mentions_certification: bool
    internship_aligned_summary: bool


def _text(value: Any) -> str:
    return (value or '').strip() if isinstance(value, str) else ''


def _lower_blob(*parts: str) -> str:
    return ' '.join(p for p in parts if p).lower()


def build_student_career_context(user) -> Dict[str, Any]:
    """Rich ESCA context for AI — uses admin taxonomy + specialization domains."""
    try:
        sp = StudentProfile.objects.select_related(
            'academic_level',
            'academic_sector',
            'internship_type',
            'filiere',
            'class_group',
        ).get(user=user)
    except StudentProfile.DoesNotExist:
        return {}

    filiere = sp.filiere
    filiere_name = getattr(filiere, 'name', None) or ''
    filiere_code = getattr(filiere, 'code', None) or ''
    program_family = getattr(filiere, 'program_family', None) or sp.internship_category or ''
    sector_name = getattr(sp.academic_sector, 'name', None) or ''
    sector_code = getattr(sp.academic_sector, 'code', None) or ''
    level_name = getattr(sp.academic_level, 'name', None) or ''
    internship_name = getattr(sp.internship_type, 'name', None) or ''
    program = sp.program_major or filiere_name or ''

    master_tracks: List[str] = []
    if sp.filiere_id:
        master_tracks = master_tracks_for_filiere_ids([sp.filiere_id])
    if not program_family and sp.filiere_id:
        families = program_families_for_filiere_ids([sp.filiere_id])
        program_family = families[0] if families else ''

    domain_codes = sorted(
        match_student_to_domain_codes(
            skills=sp.skills,
            sector_name=sector_name,
            internship_domain=internship_name,
            professional_summary=' '.join([
                sp.professional_summary or '',
                sp.career_objective or '',
                program,
                filiere_name,
                filiere_code,
            ]),
            filiere_program_family=program_family,
        )
    )
    if not domain_codes and filiere_code:
        track = MASTER_TRACK_BY_FILIERE_CODE.get(filiere_code.lower())
        if track:
            domain_codes = [
                d.code
                for d in SpecializationDomain.objects.filter(is_active=True)
                if track in (d.master_tracks or [])
            ][:3]

    domain_entries: List[Dict[str, Any]] = []
    domain_names: List[str] = []
    if domain_codes:
        for domain in SpecializationDomain.objects.filter(code__in=domain_codes):
            domain_entries.append({
                'code': domain.code,
                'name': domain.name,
                'name_i18n': domain.name_i18n or {},
            })
            domain_names.append(domain.name)

    field_profile = _resolve_field_profile(
        domain_codes=domain_codes,
        sector_name=sector_name,
        sector_code=sector_code,
        filiere_code=filiere_code,
        program_family=program_family,
    )
    playbook = FIELD_PLAYBOOKS.get(field_profile, FIELD_PLAYBOOKS['business'])

    coaching_brief = (
        f'Program: {program}; Level: {level_name}; Sector: {sector_name}; '
        f'Internship target: {internship_name}; Field profile: {field_profile}; '
        f'Domains: {", ".join(domain_names) or "general business"}; '
        f'Career objective: {_text(sp.career_objective)[:200]}'
    )

    return {
        'program_major': program,
        'current_class': sp.current_class or '',
        'academic_level': level_name,
        'academic_sector': sector_name,
        'academic_sector_code': sector_code,
        'internship_type': internship_name,
        'academic_year': sp.academic_year or '',
        'career_orientation': sector_name or program,
        'career_objective': sp.career_objective or '',
        'professional_summary': sp.professional_summary or '',
        'profile_skills': list(sp.skills or []),
        'profile_linkedin': sp.linkedin_url or '',
        'filiere_name': filiere_name,
        'filiere_name_i18n': getattr(filiere, 'name_i18n', None) or {} if filiere else {},
        'filiere_code': filiere_code,
        'academic_sector_i18n': getattr(sp.academic_sector, 'name_i18n', None) or {} if sp.academic_sector_id else {},
        'academic_level_i18n': getattr(sp.academic_level, 'name_i18n', None) or {} if sp.academic_level_id else {},
        'internship_type_i18n': getattr(sp.internship_type, 'name_i18n', None) or {} if sp.internship_type_id else {},
        'specialization_domain_entries': domain_entries,
        'program_family': program_family,
        'master_track': master_tracks[0] if master_tracks else '',
        'field_profile': field_profile,
        'specialization_domains': domain_codes,
        'specialization_domain_names': domain_names,
        'coaching_brief': coaching_brief,
        'playbook_code': playbook.code,
    }


def _resolve_field_profile(
    *,
    domain_codes: List[str],
    sector_name: str,
    sector_code: str,
    filiere_code: str,
    program_family: str,
) -> str:
    votes: Dict[str, int] = {}
    for code in domain_codes:
        profile = _DOMAIN_TO_PROFILE.get(code)
        if profile:
            votes[profile] = votes.get(profile, 0) + 2

    blob = _lower_blob(sector_name, sector_code, filiere_code)
    for token, profile in _SECTOR_TOKEN_PROFILE:
        if token in blob:
            votes[profile] = votes.get(profile, 0) + 1

    if votes:
        return max(votes, key=votes.get)

    if program_family == 'IBA':
        return 'international'
    return 'business'


def _career_context_from_dict(ctx: Dict[str, Any]) -> CareerContext:
    profile = ctx.get('field_profile') or 'business'
    playbook = FIELD_PLAYBOOKS.get(profile, FIELD_PLAYBOOKS['business'])
    return CareerContext(
        program_major=ctx.get('program_major') or ctx.get('career_orientation') or '',
        academic_sector=ctx.get('academic_sector') or '',
        academic_level=ctx.get('academic_level') or '',
        internship_type=ctx.get('internship_type') or '',
        filiere_name=ctx.get('filiere_name') or '',
        filiere_code=ctx.get('filiere_code') or '',
        program_family=ctx.get('program_family') or '',
        master_track=ctx.get('master_track') or '',
        career_objective=ctx.get('career_objective') or '',
        profile_linkedin=ctx.get('profile_linkedin') or '',
        field_profile=profile,
        domain_codes=list(ctx.get('specialization_domains') or []),
        domain_names=list(ctx.get('specialization_domain_names') or []),
        playbook=playbook,
        coaching_brief=ctx.get('coaching_brief') or '',
    )


def _collect_signals(payload: Dict[str, Any], career: CareerContext) -> CvSignals:
    details = payload.get('details') or {}
    about = _text(details.get('about'))
    role = _text(details.get('role'))
    linkedin = _text(details.get('linkedin')) or career.profile_linkedin
    github = _text(details.get('github'))
    website = _text(details.get('website'))
    blob = _lower_blob(
        about, role, career.career_objective,
        ' '.join(str(s) for s in (payload.get('skills') or [])),
    )

    work = payload.get('workExp') or []
    filled_exp = [
        w for w in work
        if isinstance(w, dict) and (_text(w.get('title')) or _text(w.get('company')))
    ]
    exp_text = _lower_blob(*(_text(w.get('desc')) for w in filled_exp))

    projects = [p for p in (payload.get('projects') or []) if isinstance(p, dict) and _text(p.get('name'))]
    proj_links = any(_text(p.get('link')) for p in projects)
    rich_projects = sum(1 for p in projects if len(_text(p.get('desc'))) > 55)

    sk_names = [
        _text(s.get('name'))
        for s in (payload.get('skills') or [])
        if isinstance(s, dict) and _text(s.get('name'))
    ]
    sk_lower = [n.lower() for n in sk_names]
    generic_count = sum(1 for n in sk_lower if n in _GENERIC_SKILLS)
    generic_ratio = generic_count / max(len(sk_lower), 1)

    tool_hits = 0
    missing_tools: List[str] = []
    for tool in career.playbook.tool_examples:
        if any(tool in n for n in sk_lower):
            tool_hits += 1
        elif len(missing_tools) < 3:
            missing_tools.append(tool)

    edu = payload.get('education') or []
    edu_text = _lower_blob(
        *(_text(e.get('qualification')) + ' ' + _text(e.get('desc')) for e in edu if isinstance(e, dict))
    )
    honors = any(
        tok in edu_text
        for tok in ('honor', 'mention', 'distinction', 'prix', 'award', 'dean', 'major')
    )
    cert_mention = any(
        tok in edu_text or tok in blob
        for tok in ('certif', 'cfa', 'pmp', 'google', 'aws', 'azure', 'hubspot', 'toeic', 'ielts')
    )

    internship_kw = career.internship_type.lower()[:24]
    internship_aligned = (
        bool(internship_kw)
        and internship_kw.split()[0] in _lower_blob(about, role, career.career_objective)
    )

    has_leadership = any(t in exp_text or t in blob for t in _LEADERSHIP_TOKENS)
    has_practical = any(t in exp_text or t in blob for t in _PRACTICAL_TOKENS)
    theory_score = sum(1 for t in _THEORY_TOKENS if t in about.lower())
    practical_score = sum(1 for t in _PRACTICAL_TOKENS if t in about.lower())

    return CvSignals(
        has_about=bool(about),
        has_role=bool(role),
        about_len=len(about),
        has_linkedin=bool(linkedin),
        has_github=bool(github) or 'github.com' in website.lower(),
        has_website=bool(website),
        has_portfolio_in_projects=proj_links,
        project_count=len(projects),
        rich_projects=rich_projects,
        experience_count=len(filled_exp),
        has_metrics_in_exp=any(any(c.isdigit() for c in _text(w.get('desc'))) for w in filled_exp),
        has_leadership=has_leadership,
        has_practical_verbs=has_practical,
        theory_heavy=theory_score > practical_score and theory_score >= 2,
        skill_names=sk_names,
        generic_skill_ratio=generic_ratio,
        field_tool_hits=tool_hits,
        missing_field_tools=missing_tools,
        language_count=len([
            l for l in (payload.get('languages') or [])
            if isinstance(l, dict) and _text(l.get('name'))
        ]),
        education_has_honors=honors,
        mentions_certification=cert_mention,
        internship_aligned_summary=internship_aligned,
    )


def run_career_coach_analysis(
    payload: Dict[str, Any],
    context: Dict[str, Any],
    lang: str,
) -> Dict[str, Any]:
    """Return overview + sections dicts for BuilderAnalysisResult."""
    lang = normalize_lang(lang)
    career = _career_context_from_dict(context)
    signals = _collect_signals(payload, career)
    labels = resolve_career_display_labels(context, lang)
    program = labels['program']
    internship_label = labels['internship']
    domain_label = labels['domain']

    sections_out: List[Dict[str, Any]] = []
    scores: Dict[str, int] = {}
    used_msg_keys: Set[str] = set()

    def _badge(severity: str, key: str, **kwargs: Any) -> Dict[str, Any]:
        used_msg_keys.add(key)
        return {'severity': severity, 'message': msg(lang, key, **kwargs), 'detail': ''}

    def _add(section_id: str, score: int, badges: List[Dict[str, Any]]) -> None:
        if not badges:
            return
        sections_out.append({
            'section_id': section_id,
            'section_score': max(0, min(100, score)),
            'badges': badges[:2],
        })
        scores[section_id] = score

    # —— Profile summary ——
    ps_score = 58
    ps_badges: List[Dict[str, Any]] = []
    if signals.has_about and signals.has_role and signals.internship_aligned_summary:
        ps_badges.append(_badge(
            'success', 'coach_summary_internship_aligned',
            internship=internship_label, program=program,
        ))
        ps_score += 20
    elif signals.has_about and signals.has_role:
        ps_badges.append(_badge(
            'warning', 'coach_summary_add_internship_intent',
            internship=internship_label, program=program,
        ))
        ps_score -= 5
    elif not signals.has_about:
        ps_badges.append(_badge('warning', 'coach_summary_missing'))
        ps_score -= 15
    if signals.theory_heavy and ps_badges:
        ps_badges.append(_badge('warning', 'coach_summary_theory_heavy', program=program))
        ps_score -= 8
    _add('profile_summary', ps_score, ps_badges)

    # —— Experience ——
    e_score = 50
    e_badges: List[Dict[str, Any]] = []
    if signals.experience_count >= 2 and signals.has_practical_verbs:
        e_badges.append(_badge(
            'success', 'coach_exp_practical_exposure', program=program,
        ))
        e_score += 22
    elif signals.experience_count >= 1:
        e_badges.append(_badge(
            'warning', 'coach_exp_weak_internship_fit',
            internship=internship_label, program=program,
        ))
        e_score += 8
    else:
        e_badges.append(_badge(
            'warning', 'coach_exp_none_suggest_extracurricular', program=program,
        ))
        e_score -= 5
    if not signals.has_leadership and signals.experience_count > 0:
        e_badges.append(_badge('info', 'coach_exp_highlight_leadership'))
        e_score -= 3
    _add('experience', e_score, e_badges)

    # —— Education ——
    ed_score = 60
    ed_badges: List[Dict[str, Any]] = []
    if signals.education_has_honors:
        ed_badges.append(_badge('success', 'coach_edu_academic_achievements'))
        ed_score += 15
    if career.playbook.wants_certifications and not signals.mentions_certification:
        ed_badges.append(_badge(
            'info', 'coach_edu_certifications', domain=domain_label,
        ))
        ed_score -= 5
    _add('education', ed_score, ed_badges)

    # —— Skills ——
    sk_score = 48
    sk_badges: List[Dict[str, Any]] = []
    if signals.skill_names and signals.field_tool_hits >= 2:
        sk_badges.append(_badge(
            'success', 'coach_skills_field_tools', domain=domain_label,
        ))
        sk_score += 20
    elif signals.skill_names and signals.generic_skill_ratio > 0.55:
        sk_badges.append(_badge(
            'warning', 'coach_skills_too_generic', domain=domain_label, program=program,
        ))
        sk_score -= 5
    elif signals.skill_names and signals.missing_field_tools:
        tools = localize_tool_examples(signals.missing_field_tools[:3], lang)
        sk_badges.append(_badge(
            'warning', 'coach_skills_missing_tools', tools=tools, domain=domain_label,
        ))
        sk_score -= 8
    _add('skills', sk_score, sk_badges)

    # —— Languages ——
    l_score = 55
    l_badges: List[Dict[str, Any]] = []
    if career.field_profile == 'international' and signals.language_count < 2:
        l_badges.append(_badge('warning', 'coach_lang_international_needs_more'))
        l_score -= 10
    elif signals.language_count >= 2:
        l_badges.append(_badge('success', 'coach_lang_asset'))
        l_score += 12
    _add('languages', l_score, l_badges)

    # —— Projects ——
    p_score = 52
    p_badges: List[Dict[str, Any]] = []
    if career.playbook.project_emphasis == 'high' and signals.project_count == 0:
        p_badges.append(_badge(
            'warning', 'coach_projects_missing_specialization', domain=domain_label,
        ))
        p_score -= 18
    elif signals.rich_projects >= 1:
        p_badges.append(_badge('success', 'coach_projects_strong', domain=domain_label))
        p_score += 22
    elif signals.project_count == 0 and signals.experience_count == 0:
        p_badges.append(_badge('warning', 'coach_projects_compensate_limited_exp'))
        p_score -= 10
    elif signals.project_count > 0 and not signals.has_portfolio_in_projects:
        p_badges.append(_badge('warning', 'coach_projects_add_links'))
        p_score -= 6
    _add('projects', p_score, p_badges)

    # —— Missing sections / trust signals (overview) ——
    missing_sections: List[str] = []
    if career.playbook.project_emphasis in ('high', 'medium') and signals.project_count == 0:
        missing_sections.append('projects')
    if not signals.has_linkedin:
        missing_sections.append('linkedin_presence')
    if career.playbook.wants_portfolio and not (
        signals.has_github or signals.has_portfolio_in_projects or signals.has_website
    ):
        missing_sections.append('portfolio')

    if not scores:
        scores = {'profile_summary': 50}
    strongest = max(scores, key=scores.get)
    weakest = min(scores, key=scores.get)
    overall = int(sum(scores.values()) / len(scores))

    strengths = [
        s['badges'][0]['message']
        for s in sections_out
        if s.get('badges') and s['badges'][0].get('severity') == 'success'
    ][:2]
    weaknesses = [
        s['badges'][0]['message']
        for s in sections_out
        if s.get('badges') and s['badges'][0].get('severity') == 'warning'
    ][:3]

    recommendations = _pick_diverse_recommendations(
        lang, career, signals, used_msg_keys, program, domain_label, internship_label,
    )

    overview = {
        'overall_score': overall,
        'ats_score': max(0, min(100, overall - 2)),
        'strongest_section': strongest,
        'weakest_section': weakest,
        'internship_readiness': msg(
            lang,
            'coach_readiness_high' if overall >= 68 else 'coach_readiness_build',
            internship=internship_label,
            program=program,
        ),
        'recruiter_attractiveness': msg(
            lang,
            'coach_attract_high' if overall >= 72 else 'coach_attract_improve',
            domain=domain_label,
        ),
        'missing_sections': missing_sections,
        'keyword_coverage': msg(
            lang,
            'coach_alignment_strong' if signals.field_tool_hits >= 2 else 'coach_alignment_weak',
            domain=domain_label,
            program=program,
        ),
        'strengths': strengths,
        'weaknesses': weaknesses,
        'recommendations': recommendations,
    }

    return {'overview': overview, 'sections': sections_out}


def _pick_diverse_recommendations(
    lang: str,
    career: CareerContext,
    signals: CvSignals,
    used_msg_keys: Set[str],
    program: str,
    domain_label: str,
    internship_label: str,
) -> List[str]:
    """Priority-ordered coaching tips — no repeated ATS/quantified spam."""
    pb = career.playbook
    candidates: List[Tuple[int, str, Dict[str, Any]]] = []

    def _c(priority: int, key: str, **kwargs: Any) -> None:
        if key in used_msg_keys:
            return
        candidates.append((priority, key, kwargs))

    if not signals.has_linkedin:
        _c(10, 'coach_rec_linkedin')
    if pb.wants_portfolio and not signals.has_github and not signals.has_portfolio_in_projects:
        _c(9, f'coach_rec_portfolio_{pb.portfolio_kind}', domain=domain_label)
    if signals.project_count == 0 and pb.project_emphasis in ('high', 'medium'):
        _c(9, 'coach_rec_specialization_projects', domain=domain_label, program=program)
    if signals.missing_field_tools:
        tools = localize_tool_examples(signals.missing_field_tools[:3], lang)
        _c(8, 'coach_rec_field_tools', tools=tools, domain=domain_label)
    if pb.wants_certifications and not signals.mentions_certification:
        _c(7, 'coach_rec_certifications', domain=domain_label)
    if signals.experience_count == 0:
        _c(8, 'coach_rec_extracurricular', program=program)
    if not signals.has_leadership:
        _c(6, 'coach_rec_leadership')
    if signals.theory_heavy:
        _c(7, 'coach_rec_practical_work', program=program)
    if not signals.internship_aligned_summary:
        _c(8, 'coach_rec_internship_focus', internship=internship_label)
    if signals.experience_count > 0 and not signals.has_practical_verbs:
        _c(5, 'coach_rec_communication_impact')
    if signals.generic_skill_ratio > 0.5 and signals.skill_names:
        _c(6, 'coach_rec_specialization_skills', domain=domain_label)
    if career.field_profile == 'international' and signals.language_count < 2:
        _c(7, 'coach_rec_languages_international')
    if signals.project_count > 0 and not signals.has_portfolio_in_projects:
        _c(5, 'coach_rec_project_links')

    # At most one “measurable outcomes” tip, only when experience exists but is thin
    if (
        signals.experience_count > 0
        and not signals.has_metrics_in_exp
        and 'experience_warning_quantified' not in used_msg_keys
    ):
        _c(4, 'coach_rec_measurable_sparingly')

    candidates.sort(key=lambda x: -x[0])
    out: List[str] = []
    seen: Set[str] = set()
    for _, key, kwargs in candidates:
        text = msg(lang, key, **kwargs)
        norm = text[:56]
        if norm in seen:
            continue
        seen.add(norm)
        out.append(text)
        if len(out) >= 5:
            break
    return out
