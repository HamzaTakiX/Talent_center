"""
Idempotent seed for ESCA academic hierarchy (programs, levels, sectors,
internship types, academic years, and class groups).

Run via: python manage.py seed_esca_academic
"""

from __future__ import annotations

from typing import Optional

from django.db import transaction

from apps.admin_management.models import (
    AcademicLevel,
    AcademicSector,
    AcademicYear,
    ClassGroup,
    Filiere,
    InternshipType,
)
from apps.admin_management.services.esca_catalog import ESCA_CATALOG_FILIERE_CODES
from apps.admin_management.services.esca_internship_competencies import COMPETENCIES_BY_INTERNSHIP_CODE


def _t(en: str, fr: str, ar: str) -> dict:
    return {'en': en, 'fr': fr, 'ar': ar}


def _upsert_filiere(
    *,
    code: str,
    name: str,
    family: str,
    name_i18n: dict,
    sort_order: int,
) -> Filiere:
    obj, _ = Filiere.objects.update_or_create(
        code=code,
        defaults={
            'name': name,
            'name_fr': name_i18n.get('fr', ''),
            'name_en': name_i18n.get('en', name),
            'name_i18n': name_i18n,
            'program_family': family,
            'department': 'ESCA',
            'sort_order': sort_order,
            'is_active': True,
            'is_archived': False,
        },
    )
    return obj


def _upsert_level(
    filiere: Filiere,
    *,
    code: str,
    name: str,
    name_i18n: dict,
    year_number: int,
    has_sectors: bool = False,
    sort_order: int = 0,
) -> AcademicLevel:
    obj, _ = AcademicLevel.objects.update_or_create(
        filiere=filiere,
        code=code,
        defaults={
            'name': name,
            'name_fr': name_i18n.get('fr', ''),
            'name_en': name_i18n.get('en', name),
            'name_i18n': name_i18n,
            'year_number': year_number,
            'has_sectors': has_sectors,
            'sort_order': sort_order,
            'is_active': True,
            'is_archived': False,
        },
    )
    return obj


def _upsert_sector(
    level: AcademicLevel,
    *,
    code: str,
    name: str,
    name_i18n: dict,
    sort_order: int = 0,
) -> AcademicSector:
    obj, _ = AcademicSector.objects.update_or_create(
        academic_level=level,
        code=code,
        defaults={
            'name': name,
            'name_fr': name_i18n.get('fr', ''),
            'name_en': name_i18n.get('en', name),
            'name_i18n': name_i18n,
            'sort_order': sort_order,
            'is_active': True,
        },
    )
    return obj


def _upsert_internship(
    level: AcademicLevel,
    *,
    code: str,
    name: str,
    name_i18n: dict,
    duration_hint: str = '',
    sector: Optional[AcademicSector] = None,
    sort_order: int = 0,
    competencies: Optional[list] = None,
) -> InternshipType:
    competency_payload = competencies if competencies is not None else COMPETENCIES_BY_INTERNSHIP_CODE.get(code, [])
    obj, _ = InternshipType.objects.update_or_create(
        academic_level=level,
        academic_sector=sector,
        code=code,
        defaults={
            'name': name,
            'name_fr': name_i18n.get('fr', ''),
            'name_en': name_i18n.get('en', name),
            'name_i18n': name_i18n,
            'duration_hint': duration_hint,
            'competencies': competency_payload,
            'sort_order': sort_order,
            'is_active': True,
            'is_archived': False,
        },
    )
    return obj


def _seed_academic_years() -> list[AcademicYear]:
    years = []
    for start in range(2023, 2030):
        end = start + 1
        code = f'{start}-{end}'
        obj, _ = AcademicYear.objects.update_or_create(
            code=code,
            defaults={
                'label': code,
                'start_year': start,
                'end_year': end,
                'is_current': start == 2025,
                'is_active': True,
            },
        )
        years.append(obj)
    return years


PGE_SECTORS = [
    (
        'fac',
        'Finance Audit et Contrôle',
        _t(
            'Finance, Audit and Control',
            'Finance Audit et Contrôle',
            'المالية والتدقيق والرقابة',
        ),
    ),
    (
        'mdc',
        'Marketing Digital et Communication',
        _t(
            'Digital Marketing and Communication',
            'Marketing Digital et Communication',
            'التسويق الرقمي والاتصال',
        ),
    ),
    (
        'ib',
        'International Business',
        _t(
            'International Business',
            'International Business',
            'الأعمال الدولية',
        ),
    ),
]

LME_SECTORS = [
    (
        'gcf',
        'Gestion Comptable et Financière',
        _t(
            'Accounting and Financial Management',
            'Gestion Comptable et Financière',
            'الإدارة المحاسبية والمالية',
        ),
    ),
    (
        'ali',
        'Achat et Logistique et Internationale',
        _t(
            'Purchasing, Logistics and International',
            'Achat et Logistique et Internationale',
            'الشراء واللوجستيك والدولية',
        ),
    ),
    (
        'ebm',
        'E-Business et Marketing Digital',
        _t(
            'E-Business and Digital Marketing',
            'E-Business et Marketing Digital',
            'التجارة الإلكترونية والتسويق الرقمي',
        ),
    ),
]

MASTER_INTERNSHIPS = [
    (
        'pre-embauche',
        'Stage de pré-embauche',
        _t('Pre-employment internship', 'Stage de pré-embauche', 'تدريب ما قبل التوظيف'),
        '',
    ),
    (
        'fin-etudes',
        'Stage de fin d\'études',
        _t('End-of-studies internship', 'Stage de fin d\'études', 'تدريب نهاية الدراسة'),
        '',
    ),
    (
        'cadre',
        'Stage Cadre',
        _t('Executive internship', 'Stage Cadre', 'تدريب إطار'),
        '',
    ),
    (
        'ouvrier',
        'Stage Ouvrier',
        _t('Worker internship', 'Stage Ouvrier', 'تدريب عامل'),
        '',
    ),
    (
        'commercial',
        'Stage Commercial',
        _t('Sales internship', 'Stage Commercial', 'تدريب تجاري'),
        '',
    ),
]


def _seed_pge(filiere: Filiere) -> None:
    levels_spec = [
        (
            'y1',
            1,
            '1ère année Programme Grande Ecole',
            _t(
                '1st year — Grande École Program',
                '1ère année Programme Grande Ecole',
                'السنة الأولى — برنامج المدرسة العليا للتجارة',
            ),
            [('terrain', 'Stage Terrain (1 mois)', _t('Field internship (1 month)', 'Stage Terrain (1 mois)', 'تدريب ميداني (شهر)'), '1 mois')],
        ),
        (
            'y2',
            2,
            '2ème année Programme Grande Ecole',
            _t(
                '2nd year — Grande École Program',
                '2ème année Programme Grande Ecole',
                'السنة الثانية — برنامج المدرسة العليا للتجارة',
            ),
            [
                (
                    'application',
                    'Stage d\'application (6 semaines)',
                    _t('Application internship (6 weeks)', 'Stage d\'application (6 semaines)', 'تدريب تطبيقي (6 أسابيع)'),
                    '6 semaines',
                ),
            ],
        ),
        (
            'y3',
            3,
            '3ème année Programme Grande Ecole',
            _t(
                '3rd year — Grande École Program',
                '3ème année Programme Grande Ecole',
                'السنة الثالثة — برنامج المدرسة العليا للتجارة',
            ),
            [
                (
                    'operationnel',
                    'Stage Opérationnel (2 mois)',
                    _t('Operational internship (2 months)', 'Stage Opérationnel (2 mois)', 'تدريب تشغيلي (شهران)'),
                    '2 mois',
                ),
            ],
        ),
        (
            'y4',
            4,
            '4ème année Programme Grande Ecole',
            _t(
                '4th year — Grande École Program',
                '4ème année Programme Grande Ecole',
                'السنة الرابعة — برنامج المدرسة العليا للتجارة',
            ),
            [
                (
                    'bras-droit',
                    'Stage Mission Bras Droit (3 mois)',
                    _t('Right-hand mission internship (3 months)', 'Stage Mission Bras Droit (3 mois)', 'مهمة يمين (3 أشهر)'),
                    '3 mois',
                ),
            ],
            True,
        ),
        (
            'y5',
            5,
            '5ème année Programme Grande Ecole',
            _t(
                '5th year — Grande École Program',
                '5ème année Programme Grande Ecole',
                'السنة الخامسة — برنامج المدرسة العليا للتجارة',
            ),
            [
                (
                    'mission-pro',
                    'Mission Professionnelle (6 mois)',
                    _t('Professional mission (6 months)', 'Mission Professionnelle (6 mois)', 'مهمة مهنية (6 أشهر)'),
                    '6 mois',
                ),
            ],
            True,
        ),
    ]

    for spec in levels_spec:
        code, year_num, name, i18n, internships, *rest = spec
        has_sectors = bool(rest and rest[0])
        level = _upsert_level(
            filiere,
            code=code,
            name=name,
            name_i18n=i18n,
            year_number=year_num,
            has_sectors=has_sectors,
            sort_order=year_num,
        )
        if has_sectors:
            for idx, (s_code, s_name, s_i18n) in enumerate(PGE_SECTORS):
                _upsert_sector(level, code=s_code, name=s_name, name_i18n=s_i18n, sort_order=idx)
        for idx, (i_code, i_name, i_i18n, duration) in enumerate(internships):
            _upsert_internship(
                level,
                code=i_code,
                name=i_name,
                name_i18n=i_i18n,
                duration_hint=duration,
                sort_order=idx,
            )


def _seed_lme(filiere: Filiere) -> None:
    levels_spec = [
        (
            'y1',
            1,
            '1ère Année Licence en Management des entreprises',
            _t(
                '1st year — Business Management License',
                '1ère Année Licence en Management des entreprises',
                'السنة الأولى — إجازة إدارة المؤسسات',
            ),
            [
                (
                    'exploration',
                    'Stage d\'exploration (1 mois)',
                    _t('Exploration internship (1 month)', 'Stage d\'exploration (1 mois)', 'تدريب استكشافي (شهر)'),
                    '1 mois',
                ),
            ],
        ),
        (
            'y2',
            2,
            '2ème Année Licence en Management des entreprises',
            _t(
                '2nd year — Business Management License',
                '2ème Année Licence en Management des entreprises',
                'السنة الثانية — إجازة إدارة المؤسسات',
            ),
            [
                (
                    'management',
                    'Stage de Management (10 semaines)',
                    _t('Management internship (10 weeks)', 'Stage de Management (10 semaines)', 'تدريب إدارة (10 أسابيع)'),
                    '10 semaines',
                ),
            ],
        ),
        (
            'y3',
            3,
            '3ème Année Licence en Management des entreprises',
            _t(
                '3rd year — Business Management License',
                '3ème Année Licence en Management des entreprises',
                'السنة الثالثة — إجازة إدارة المؤسسات',
            ),
            [
                (
                    'specialite',
                    'Stage de spécialité (3 mois)',
                    _t('Specialization internship (3 months)', 'Stage de spécialité (3 mois)', 'تدريب التخصص (3 أشهر)'),
                    '3 mois',
                ),
            ],
            True,
        ),
    ]

    for spec in levels_spec:
        code, year_num, name, i18n, internships, *rest = spec
        has_sectors = bool(rest and rest[0])
        level = _upsert_level(
            filiere,
            code=code,
            name=name,
            name_i18n=i18n,
            year_number=year_num,
            has_sectors=has_sectors,
            sort_order=year_num,
        )
        if has_sectors:
            for idx, (s_code, s_name, s_i18n) in enumerate(LME_SECTORS):
                _upsert_sector(level, code=s_code, name=s_name, name_i18n=s_i18n, sort_order=idx)
        for idx, (i_code, i_name, i_i18n, duration) in enumerate(internships):
            _upsert_internship(
                level,
                code=i_code,
                name=i_name,
                name_i18n=i_i18n,
                duration_hint=duration,
                sort_order=idx,
            )


def _seed_iba(filiere: Filiere) -> None:
    levels_spec = [
        (
            'y1',
            1,
            '1st year International Business Administration',
            _t(
                '1st year — International Business Administration',
                '1ère année International Business Administration',
                'السنة الأولى — إدارة الأعمال الدولية',
            ),
            [
                (
                    'freshman',
                    'Freshman Internship (1 mois)',
                    _t('Freshman Internship (1 month)', 'Freshman Internship (1 mois)', 'تدريب السنة الأولى (شهر)'),
                    '1 mois',
                ),
            ],
        ),
        (
            'y2',
            2,
            '2nd year International Business Administration',
            _t(
                '2nd year — International Business Administration',
                '2ème année International Business Administration',
                'السنة الثانية — إدارة الأعمال الدولية',
            ),
            [
                (
                    'sophomore',
                    'Sophomore Internship (2 mois)',
                    _t('Sophomore Internship (2 months)', 'Sophomore Internship (2 mois)', 'تدريب السنة الثانية (شهران)'),
                    '2 mois',
                ),
            ],
        ),
        (
            'y3',
            3,
            '3rd year International Business Administration',
            _t(
                '3rd year — International Business Administration',
                '3ème année International Business Administration',
                'السنة الثالثة — إدارة الأعمال الدولية',
            ),
            [
                (
                    'junior',
                    'Junior Internship (3 mois)',
                    _t('Junior Internship (3 months)', 'Junior Internship (3 mois)', 'تدريب السنة الثالثة (3 أشهر)'),
                    '3 mois',
                ),
            ],
        ),
    ]

    for code, year_num, name, i18n, internships in levels_spec:
        level = _upsert_level(
            filiere,
            code=code,
            name=name,
            name_i18n=i18n,
            year_number=year_num,
            sort_order=year_num,
        )
        for idx, (i_code, i_name, i_i18n, duration) in enumerate(internships):
            _upsert_internship(
                level,
                code=i_code,
                name=i_name,
                name_i18n=i_i18n,
                duration_hint=duration,
                sort_order=idx,
            )


def _seed_master(filiere: Filiere) -> None:
    """Single Master (Formation en temps aménagé) level with shared internship types."""
    level = _upsert_level(
        filiere,
        code='fta',
        name='Master (Formation en temps aménagé)',
        name_i18n=_t(
            'Master (Part-time program)',
            'Master (Formation en temps aménagé)',
            'ماستر (تكوين في وقت مخفف)',
        ),
        year_number=1,
        sort_order=1,
    )
    for idx, (i_code, i_name, i_i18n, duration) in enumerate(MASTER_INTERNSHIPS):
        _upsert_internship(
            level,
            code=i_code,
            name=i_name,
            name_i18n=i_i18n,
            duration_hint=duration,
            sort_order=idx,
        )


LEGACY_MASTER_FILIERE_CODES = (
    'master-ascm',
    'master-md',
    'master-mrh',
    'master-acg-sicg',
    'master-mf-fif',
    'master-miiss',
)


def _archive_legacy_master_filieres() -> int:
    """Archive superseded per-track Master filières and their dependent rows."""
    legacy_ids = list(
        Filiere.objects.filter(code__in=LEGACY_MASTER_FILIERE_CODES).values_list('id', flat=True),
    )
    if not legacy_ids:
        return 0

    Filiere.objects.filter(id__in=legacy_ids).update(is_active=False, is_archived=True)

    level_ids = list(
        AcademicLevel.objects.filter(filiere_id__in=legacy_ids).values_list('id', flat=True),
    )
    AcademicLevel.objects.filter(id__in=level_ids).update(is_active=False, is_archived=True)
    InternshipType.objects.filter(academic_level_id__in=level_ids).update(
        is_active=False,
        is_archived=True,
    )
    ClassGroup.objects.filter(filiere_id__in=legacy_ids).update(is_active=False, is_archived=True)
    return len(legacy_ids)


def _class_group_code(
    filiere_code: str,
    level_code: str,
    year_code: str,
    *,
    sector_code: str | None = None,
    section: str = 'a',
) -> str:
    if sector_code:
        return f'{filiere_code}-{level_code}-{sector_code}-{section}-{year_code}'
    return f'{filiere_code}-{level_code}-{section}-{year_code}'


def _class_group_display_name(
    filiere: Filiere,
    level: AcademicLevel,
    year: AcademicYear,
    *,
    sector: AcademicSector | None = None,
    section: str = 'A',
) -> str:
    label = f'{filiere.code.upper()} {level.code.upper()}'
    if sector:
        label += f' {sector.code.upper()}'
    return f'{label} — Groupe {section} ({year.code})'


def _upsert_class_group(
    *,
    code: str,
    name: str,
    filiere: Filiere,
    level: AcademicLevel,
    year: AcademicYear,
    sector: AcademicSector | None = None,
) -> ClassGroup:
    obj, _ = ClassGroup.objects.update_or_create(
        code=code,
        defaults={
            'name': name,
            'filiere': filiere,
            'academic_level': level,
            'academic_sector': sector,
            'academic_year_ref': year,
            'academic_year': year.code,
            'level': level.code,
            'student_capacity': 0,
            'is_active': True,
        },
    )
    return obj


@transaction.atomic
def seed_class_groups() -> dict:
    """
    Idempotent cohort seed for every filière × level [× sector] × academic year.
    Codes follow: {filiere}-{level}[-{sector}]-a-{year} (e.g. pge-y4-fac-a-2025-2026).
    """
    years = list(AcademicYear.objects.filter(is_active=True).order_by('start_year'))
    if not years:
        years = _seed_academic_years()

    created_or_updated = 0
    for year in years:
        levels = (
            AcademicLevel.objects.filter(is_active=True)
            .select_related('filiere')
            .prefetch_related('sectors')
            .order_by('filiere__sort_order', 'sort_order', 'year_number')
        )
        for level in levels:
            filiere = level.filiere
            sectors = list(
                level.sectors.filter(is_active=True).order_by('sort_order', 'code'),
            )
            if level.has_sectors and sectors:
                for sector in sectors:
                    code = _class_group_code(
                        filiere.code,
                        level.code,
                        year.code,
                        sector_code=sector.code,
                    )
                    name = _class_group_display_name(
                        filiere, level, year, sector=sector,
                    )
                    _upsert_class_group(
                        code=code,
                        name=name,
                        filiere=filiere,
                        level=level,
                        year=year,
                        sector=sector,
                    )
                    created_or_updated += 1
            else:
                code = _class_group_code(filiere.code, level.code, year.code)
                name = _class_group_display_name(filiere, level, year)
                _upsert_class_group(
                    code=code,
                    name=name,
                    filiere=filiere,
                    level=level,
                    year=year,
                )
                created_or_updated += 1

    return {
        'class_groups': ClassGroup.objects.filter(is_active=True).count(),
        'class_group_upserts': created_or_updated,
    }


@transaction.atomic
def seed_esca_academic() -> dict:
    """Populate ESCA programs, levels, sectors, internship types, academic years, and class groups."""
    years = _seed_academic_years()

    pge = _upsert_filiere(
        code='pge',
        name='PGE (Programme Grande École)',
        family=Filiere.ProgramFamily.PGE,
        name_i18n=_t(
            'PGE — Grande École Program',
            'PGE — Programme Grande École',
            'PGE — برنامج المدرسة العليا للتجارة',
        ),
        sort_order=1,
    )
    _seed_pge(pge)

    lme = _upsert_filiere(
        code='lme',
        name='LME (Licence en Management des Entreprises)',
        family=Filiere.ProgramFamily.LME,
        name_i18n=_t(
            'LME — Business Management License',
            'LME — Licence en Management des Entreprises',
            'LME — إجازة إدارة المؤسسات',
        ),
        sort_order=2,
    )
    _seed_lme(lme)

    iba = _upsert_filiere(
        code='iba',
        name='IBA (International Business Administration)',
        family=Filiere.ProgramFamily.IBA,
        name_i18n=_t(
            'IBA — International Business Administration',
            'IBA — International Business Administration',
            'IBA — إدارة الأعمال الدولية',
        ),
        sort_order=3,
    )
    _seed_iba(iba)

    _archive_legacy_master_filieres()

    master = _upsert_filiere(
        code='master-fta',
        name='Master (Formation en temps aménagé)',
        family=Filiere.ProgramFamily.MASTER,
        name_i18n=_t(
            'Master (Part-time program)',
            'Master (Formation en temps aménagé)',
            'ماستر (تكوين في وقت مخفف)',
        ),
        sort_order=4,
    )
    _seed_master(master)
    master_count = 1

    class_group_stats = seed_class_groups()

    # Deactivate orphan filières (e.g. legacy ing-info) not in the official ESCA catalog.
    deactivated = (
        Filiere.objects.filter(is_active=True)
        .exclude(code__in=ESCA_CATALOG_FILIERE_CODES)
        .update(is_active=False)
    )

    return {
        'academic_years': len(years),
        'filieres': Filiere.objects.filter(is_active=True).count(),
        'levels': AcademicLevel.objects.filter(is_active=True).count(),
        'sectors': AcademicSector.objects.filter(is_active=True).count(),
        'internship_types': InternshipType.objects.filter(is_active=True).count(),
        'masters': master_count,
        'filieres_deactivated': deactivated,
        **class_group_stats,
    }
