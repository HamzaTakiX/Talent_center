"""
ESCA internship competencies per program year / internship type code.

Each competency is stored trilingual (en / fr / ar) for student onboarding.
"""

from __future__ import annotations

import re
from typing import Any


def _slug(text: str) -> str:
    base = re.sub(r'[^a-z0-9]+', '-', text.lower().strip())
    return base.strip('-')[:64] or 'competency'


def _comp(en: str, fr: str, ar: str) -> dict[str, Any]:
    return {
        'code': _slug(fr or en),
        'name_en': en,
        'name_fr': fr,
        'name_ar': ar,
        'name_i18n': {'en': en, 'fr': fr, 'ar': ar},
    }


def _c(*triples: tuple[str, str, str]) -> list[dict[str, Any]]:
    return [_comp(en, fr, ar) for en, fr, ar in triples]


PGE_TERRAIN = _c(
    ('Field observation', 'Observation terrain', 'الملاحظة الميدانية'),
    ('Data collection', 'Collecte de données', 'جمع البيانات'),
    ('Professional communication', 'Communication professionnelle', 'التواصل المهني'),
    ('Teamwork', 'Travail en équipe', 'العمل الجماعي'),
    ('Time management', 'Gestion du temps', 'إدارة الوقت'),
    ('Adaptability', 'Adaptabilité', 'القدرة على التكيف'),
    ('Organization', 'Organisation', 'التنظيم'),
    ('Sense of observation', "Sens de l'observation", 'حس الملاحظة'),
)

PGE_APPLICATION = _c(
    ('Data analysis', 'Analyse de données', 'تحليل البيانات'),
    ('Market research', 'Étude de marché', 'دراسة السوق'),
    ('Project management', 'Gestion de projet', 'إدارة المشاريع'),
    ('Reporting', 'Reporting', 'إعداد التقارير'),
    ('Problem solving', 'Résolution de problèmes', 'حل المشكلات'),
    ('Research and analysis', 'Recherche et analyse', 'البحث والتحليل'),
    ('Critical thinking', 'Esprit critique', 'التفكير النقدي'),
    ('Priority management', 'Gestion des priorités', 'إدارة الأولويات'),
)

PGE_OPERATIONNEL = _c(
    ('Business Analysis', 'Business Analysis', 'تحليل الأعمال'),
    ('Process Improvement', 'Process Improvement', 'تحسين العمليات'),
    ('Operational management', 'Gestion opérationnelle', 'الإدارة التشغيلية'),
    ('Financial analysis', 'Analyse financière', 'التحليل المالي'),
    ('Data Analytics', 'Data Analytics', 'تحليل البيانات'),
    ('Process optimization', 'Optimisation des processus', 'تحسين العمليات'),
    ('Decision making', 'Prise de décision', 'اتخاذ القرار'),
    ('Performance management', 'Gestion de la performance', 'إدارة الأداء'),
)

PGE_BRAS_DROIT = _c(
    ('Leadership', 'Leadership', 'القيادة'),
    ('Strategic Thinking', 'Strategic Thinking', 'التفكير الاستراتيجي'),
    ('Project Management', 'Project Management', 'إدارة المشاريع'),
    ('Business Development', 'Business Development', 'تطوير الأعمال'),
    ('Decision Making', 'Decision Making', 'اتخاذ القرار'),
    ('Team management', "Management d'équipe", 'إدارة الفريق'),
    ('Cross-functional coordination', 'Coordination transversale', 'التنسيق بين الأقسام'),
    ('Activity steering', "Pilotage d'activités", 'توجيه الأنشطة'),
)

PGE_MISSION_PRO = _c(
    ('Consulting', 'Consulting', 'الاستشارات'),
    ('Change Management', 'Change Management', 'إدارة التغيير'),
    ('Strategic Management', 'Strategic Management', 'الإدارة الاستراتيجية'),
    ('Digital Transformation', 'Digital Transformation', 'التحول الرقمي'),
    ('Innovation Management', 'Innovation Management', 'إدارة الابتكار'),
    ('Change management', 'Gestion du changement', 'إدارة التغيير'),
    ('Strategic analysis', 'Analyse stratégique', 'التحليل الاستراتيجي'),
    ('Complex project management', 'Conduite de projet complexe', 'إدارة المشاريع المعقدة'),
)

LME_EXPLORATION = _c(
    ('Marketing Fundamentals', 'Marketing Fundamentals', 'أساسيات التسويق'),
    ('Customer Analysis', 'Customer Analysis', 'تحليل العملاء'),
    ('Market Research', 'Market Research', 'أبحاث السوق'),
    ('Communication', 'Communication', 'التواصل'),
    ('Competitive intelligence', 'Veille concurrentielle', 'مراقبة المنافسة'),
    ('Teamwork', 'Travail en équipe', 'العمل الجماعي'),
    ('Time management', 'Gestion du temps', 'إدارة الوقت'),
    ('Professional presentation', 'Présentation professionnelle', 'العرض المهني'),
)

LME_MANAGEMENT = _c(
    ('Brand Management', 'Brand Management', 'إدارة العلامة التجارية'),
    ('Digital Marketing', 'Digital Marketing', 'التسويق الرقمي'),
    ('CRM', 'CRM', 'إدارة علاقات العملاء'),
    ('Consumer Behavior', 'Consumer Behavior', 'سلوك المستهلك'),
    ('Digital marketing', 'Marketing digital', 'التسويق الرقمي'),
    ('Customer relationship management', 'Gestion de la relation client', 'إدارة علاقة العملاء'),
    ('Marketing analysis', 'Analyse marketing', 'التحليل التسويقي'),
    ('Business communication', 'Communication commerciale', 'التواصل التجاري'),
)

LME_SPECIALITE = _c(
    ('Marketing Strategy', 'Marketing Strategy', 'الاستراتيجية التسويقية'),
    ('Growth Marketing', 'Growth Marketing', 'تسويق النمو'),
    ('SEO', 'SEO', 'تحسين محركات البحث'),
    ('SEM', 'SEM', 'التسويق عبر محركات البحث'),
    ('Marketing Analytics', 'Marketing Analytics', 'تحليلات التسويق'),
    ('Product Management', 'Product Management', 'إدارة المنتجات'),
    ('Brand management', 'Gestion de marque', 'إدارة العلامة التجارية'),
    ('Marketing performance analysis', 'Analyse des performances marketing', 'تحليل أداء التسويق'),
)

IBA_FRESHMAN = _c(
    ('Business Communication', 'Business Communication', 'التواصل في الأعمال'),
    ('Critical Thinking', 'Critical Thinking', 'التفكير النقدي'),
    ('Team Collaboration', 'Team Collaboration', 'التعاون الجماعي'),
    ('Research Skills', 'Research Skills', 'مهارات البحث'),
    ('Intercultural communication', 'Communication interculturelle', 'التواصل بين الثقافات'),
    ('Collaborative work', 'Travail collaboratif', 'العمل التعاوني'),
    ('Document analysis', 'Analyse documentaire', 'تحليل الوثائق'),
    ('Organization', 'Organisation', 'التنظيم'),
)

IBA_SOPHOMORE = _c(
    ('Business Analysis', 'Business Analysis', 'تحليل الأعمال'),
    ('Financial Literacy', 'Financial Literacy', 'الثقافة المالية'),
    ('International Business', 'International Business', 'الأعمال الدولية'),
    ('Presentation Skills', 'Presentation Skills', 'مهارات العرض'),
    ('Commercial analysis', 'Analyse commerciale', 'التحليل التجاري'),
    ('Financial literacy', 'Compréhension financière', 'الفهم المالي'),
    ('Negotiation', 'Négociation', 'التفاوض'),
    ('Professional communication', 'Communication professionnelle', 'التواصل المهني'),
)

IBA_JUNIOR = _c(
    ('Strategic Management', 'Strategic Management', 'الإدارة الاستراتيجية'),
    ('Entrepreneurship', 'Entrepreneurship', 'ريادة الأعمال'),
    ('Cross-cultural Management', 'Cross-cultural Management', 'الإدارة بين الثقافات'),
    ('Data-driven Decision Making', 'Data-driven Decision Making', 'اتخاذ القرار المعتمد على البيانات'),
    ('International leadership', 'Leadership international', 'القيادة الدولية'),
    ('Innovation', 'Innovation', 'الابتكار'),
    ('Multicultural management', 'Gestion multiculturelle', 'الإدارة متعددة الثقافات'),
    ('Strategic decision making', 'Prise de décision stratégique', 'اتخاذ القرار الاستراتيجي'),
)

COMPETENCIES_BY_INTERNSHIP_CODE: dict[str, list[dict[str, Any]]] = {
    'terrain': PGE_TERRAIN,
    'application': PGE_APPLICATION,
    'operationnel': PGE_OPERATIONNEL,
    'bras-droit': PGE_BRAS_DROIT,
    'mission-pro': PGE_MISSION_PRO,
    'exploration': LME_EXPLORATION,
    'management': LME_MANAGEMENT,
    'specialite': LME_SPECIALITE,
    'freshman': IBA_FRESHMAN,
    'sophomore': IBA_SOPHOMORE,
    'junior': IBA_JUNIOR,
}


def sync_internship_competencies() -> int:
    """Update competencies JSON on all seeded internship types (idempotent)."""
    from apps.admin_management.models import InternshipType

    updated = 0
    for code, competencies in COMPETENCIES_BY_INTERNSHIP_CODE.items():
        count = InternshipType.objects.filter(code=code).update(competencies=competencies)
        updated += count
    return updated
