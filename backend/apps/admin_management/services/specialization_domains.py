"""Specialization domain catalog — list, validate, serialize, student matching."""



from __future__ import annotations



import re

from typing import Optional



from django.db.models import Q



from apps.admin_management.models import Filiere, SpecializationDomain





from apps.admin_management.services.i18n_labels import entity_localized_name, management_name_fields





def localized_name(domain: SpecializationDomain, lang: str = '') -> str:

    return entity_localized_name(domain, lang)





def serialize_specialization_domain(domain: SpecializationDomain, lang: str = '') -> dict:

    return {

        'id': domain.id,

        'code': domain.code,

        **management_name_fields(domain, lang),

        'category': domain.category,

        'program_families': list(domain.program_families or []),

        'master_tracks': list(domain.master_tracks or []),

    }





MASTER_TRACK_BY_FILIERE_CODE: dict[str, str] = {

    'master-fta': 'FTA',

}





def master_tracks_for_filiere_ids(filiere_ids: list[int]) -> list[str]:

    if not filiere_ids:

        return []

    tracks: list[str] = []

    for filiere in Filiere.objects.filter(pk__in=filiere_ids, is_active=True, program_family='MASTER'):

        track = MASTER_TRACK_BY_FILIERE_CODE.get((filiere.code or '').lower())

        if track and track not in tracks:

            tracks.append(track)

    return tracks





def domains_for_filiere_ids(

    filiere_ids: list[int],

    *,

    category: str = '',

    search: str = '',

) -> list[SpecializationDomain] | None:

    """

    Return domains linked to the given filières in Structure académique.



    Returns None when none of the filières have domain links yet (caller may

    fall back to program_families JSON filtering).

    """

    if not filiere_ids:

        return None

    linked_exists = SpecializationDomain.objects.filter(

        is_active=True,

        filieres__id__in=filiere_ids,

    ).exists()

    if not linked_exists:

        return None

    qs = SpecializationDomain.objects.filter(

        is_active=True,

        filieres__id__in=filiere_ids,

    ).distinct()

    if category:

        qs = qs.filter(category=category)

    if search:

        qs = qs.filter(

            Q(name__icontains=search)

            | Q(code__icontains=search)

            | Q(keywords__icontains=search.lower()),

        )

    return list(qs.order_by('category', 'sort_order', 'name'))





def list_specialization_domains(

    *,

    filiere_ids: Optional[list[int]] = None,

    program_families: Optional[list[str]] = None,

    master_tracks: Optional[list[str]] = None,

    category: str = '',

    include_tech: bool = False,

    lang: str = '',

    search: str = '',

) -> list[SpecializationDomain]:

    # Prefer per-program config from Structure académique when filiere_ids given.

    if filiere_ids:

        linked = domains_for_filiere_ids(

            filiere_ids,

            category=category,

            search=search,

        )

        if linked is not None:

            return linked



    qs = SpecializationDomain.objects.filter(is_active=True)

    if category:

        qs = qs.filter(category=category)

    if search:

        qs = qs.filter(

            Q(name__icontains=search)

            | Q(code__icontains=search)

            | Q(keywords__icontains=search.lower()),

        )

    domains = list(qs.order_by('category', 'sort_order', 'name'))

    families = {f.upper() for f in (program_families or []) if f}

    tracks = {t.upper() for t in (master_tracks or []) if t}



    # Catalog / settings mode: no program filter → return category slice.

    if not families:

        if category:

            return domains

        return [

            domain

            for domain in domains

            if domain.category != SpecializationDomain.Category.TECH or include_tech

        ]



    filtered: list[SpecializationDomain] = []

    for domain in domains:

        domain_families = {f.upper() for f in (domain.program_families or [])}

        # Empty families = all programs; otherwise require overlap.

        if domain_families and not (domain_families & families):

            continue

        if tracks:

            domain_tracks = {t.upper() for t in (domain.master_tracks or [])}

            if domain_tracks and not (domain_tracks & tracks):

                continue

        is_tech = domain.category == SpecializationDomain.Category.TECH

        if is_tech and not include_tech and category != SpecializationDomain.Category.TECH:

            # When listing mixed domains for a program without category=TECH,

            # still include TECH that matches the program families (settings-linked).

            pass

        filtered.append(domain)

    return filtered





def validate_specialization_domain_ids(domain_ids: list[int]) -> list[SpecializationDomain]:

    if not domain_ids:

        return []

    unique_ids = list(dict.fromkeys(int(i) for i in domain_ids if i))

    domains = list(

        SpecializationDomain.objects.filter(pk__in=unique_ids, is_active=True),

    )

    found = {d.id for d in domains}

    missing = [i for i in unique_ids if i not in found]

    if missing:

        raise ValueError(f'Invalid or inactive specialization domain ids: {", ".join(map(str, missing))}')

    return domains





def sync_encadrant_specialization_domains(encadrant, domain_ids: list[int]) -> list[str]:

    """Set M2M and return canonical domain codes for expertise_areas cache."""

    domains = validate_specialization_domain_ids(domain_ids)

    encadrant.specialization_domains.set(domains)

    codes = [d.code for d in domains]

    encadrant.expertise_areas = codes

    encadrant.save(update_fields=['expertise_areas', 'updated_at'])

    return codes





def get_encadrant_domain_codes(encadrant) -> list[str]:

    if encadrant.specialization_domains.exists():

        return list(encadrant.specialization_domains.values_list('code', flat=True))

    return list(encadrant.expertise_areas or [])





def program_families_for_filiere_ids(filiere_ids: list[int]) -> list[str]:

    if not filiere_ids:

        return []

    return list(

        Filiere.objects.filter(pk__in=filiere_ids, is_active=True)

        .exclude(program_family='')

        .values_list('program_family', flat=True)

        .distinct(),

    )





def set_filiere_specialization_domains(filiere: Filiere, domain_ids: list[int]) -> list[int]:

    domains = validate_specialization_domain_ids(domain_ids)

    filiere.specialization_domains.set(domains)

    return [d.id for d in domains]





def _tokenize(text: str) -> set[str]:

    return {t for t in re.split(r'[\s,;/|+]+', (text or '').lower()) if len(t) > 2}





def match_student_to_domain_codes(

    *,

    skills: Optional[list] = None,

    sector_name: str = '',

    internship_domain: str = '',

    professional_summary: str = '',

    filiere_program_family: str = '',

) -> set[str]:

    """Match student profile text to catalog domain codes."""

    active = list(SpecializationDomain.objects.filter(is_active=True))

    if not active:

        return set()



    text_parts = [

        sector_name,

        internship_domain,

        professional_summary,

        ' '.join(str(s) for s in (skills or [])),

    ]

    combined = ' '.join(text_parts).lower()

    tokens = _tokenize(combined)



    matched: set[str] = set()

    family = (filiere_program_family or '').upper()



    for domain in active:

        domain_families = {f.upper() for f in (domain.program_families or [])}

        if domain_families and family and family not in domain_families:

            continue

        name_lower = domain.name.lower()

        if name_lower in combined:

            matched.add(domain.code)

            continue

        for kw in domain.keywords or []:

            kw_l = str(kw).lower()

            if kw_l in combined or kw_l in tokens:

                matched.add(domain.code)

                break

    return matched


