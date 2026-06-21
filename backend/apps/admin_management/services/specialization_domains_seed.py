"""Idempotent seed for specialization domains used in encadrant assignment."""

from __future__ import annotations

from apps.admin_management.models import SpecializationDomain

# (code, name_en, category, program_families, master_tracks, keywords)
_DOMAIN_ROWS: list[tuple] = [
    # —— PGE ——
    ('finance', 'Finance', 'BUSINESS', ['PGE'], [], ['finance', 'financial']),
    ('audit', 'Audit', 'BUSINESS', ['PGE'], [], ['audit', 'auditing']),
    ('financial_control', 'Financial Control', 'BUSINESS', ['PGE'], [], ['control', 'controle']),
    ('accounting', 'Accounting', 'BUSINESS', ['PGE', 'LME'], [], ['accounting', 'comptable', 'comptabilité']),
    ('business_intelligence', 'Business Intelligence', 'BUSINESS', ['PGE'], [], ['bi', 'business intelligence']),
    ('marketing', 'Marketing', 'BUSINESS', ['PGE', 'LME'], [], ['marketing']),
    ('digital_marketing', 'Digital Marketing', 'BUSINESS', ['PGE', 'LME', 'MASTER'], ['MD'], ['digital', 'marketing']),
    ('communication', 'Communication', 'BUSINESS', ['PGE', 'MASTER'], ['MD'], ['communication']),
    ('international_business', 'International Business', 'BUSINESS', ['PGE', 'IBA', 'MASTER'], ['MIISS'], ['international', 'business']),
    ('supply_chain', 'Supply Chain', 'BUSINESS', ['PGE', 'LME', 'MASTER'], ['ASCM'], ['supply', 'chain']),
    ('logistics', 'Logistics', 'BUSINESS', ['PGE', 'LME', 'MASTER'], ['ASCM'], ['logistics', 'logistique']),
    ('entrepreneurship', 'Entrepreneurship', 'BUSINESS', ['PGE', 'LME'], [], ['entrepreneur', 'startup']),
    ('strategy', 'Strategy', 'BUSINESS', ['PGE'], [], ['strategy', 'stratégie']),
    ('data_analytics', 'Data Analytics', 'BUSINESS', ['PGE'], [], ['analytics', 'analytique']),
    ('management', 'Management', 'BUSINESS', ['PGE', 'LME'], [], ['management']),
    ('hr', 'Human Resources', 'BUSINESS', ['PGE', 'LME', 'MASTER'], ['MRH'], ['hr', 'human resources', 'rh']),
    ('commercial_management', 'Commercial Management', 'BUSINESS', ['PGE', 'LME'], [], ['commercial', 'vente']),
    ('crm', 'CRM', 'BUSINESS', ['PGE'], [], ['crm', 'customer']),
    ('project_management', 'Project Management', 'BUSINESS', ['PGE', 'LME'], [], ['project', 'projet']),
    ('business_development', 'Business Development', 'BUSINESS', ['PGE', 'IBA', 'MASTER'], ['MIISS'], ['business development', 'bd']),
    # —— LME ——
    ('financial_management', 'Financial Management', 'BUSINESS', ['LME'], [], ['financial management']),
    ('e_business', 'E-Business', 'BUSINESS', ['LME'], [], ['e-business', 'ecommerce', 'e-commerce']),
    ('international_trade', 'International Trade', 'BUSINESS', ['LME', 'IBA'], [], ['trade', 'commerce international']),
    ('purchasing', 'Purchasing', 'BUSINESS', ['LME', 'MASTER'], ['ASCM'], ['purchasing', 'achat']),
    ('sme_management', 'SME Management', 'BUSINESS', ['LME'], [], ['sme', 'pme']),
    ('hr_management', 'HR Management', 'BUSINESS', ['LME'], [], ['hr management']),
    ('business_administration', 'Business Administration', 'BUSINESS', ['LME'], [], ['administration']),
    # —— IBA ——
    ('international_marketing', 'International Marketing', 'BUSINESS', ['IBA'], [], ['international marketing']),
    ('global_trade', 'Global Trade', 'BUSINESS', ['IBA'], [], ['global trade']),
    ('cross_cultural_management', 'Cross-Cultural Management', 'BUSINESS', ['IBA'], [], ['cross-cultural', 'culture']),
    ('international_finance', 'International Finance', 'BUSINESS', ['IBA'], [], ['international finance']),
    ('business_communication', 'Business Communication', 'BUSINESS', ['IBA'], [], ['business communication']),
    ('international_negotiation', 'International Negotiation', 'BUSINESS', ['IBA'], [], ['negotiation', 'négociation']),
    ('import_export', 'Import / Export', 'BUSINESS', ['IBA', 'MASTER'], ['MIISS'], ['import', 'export']),
    # —— MASTER ASCM ——
    ('procurement', 'Procurement', 'BUSINESS', ['MASTER'], ['ASCM'], ['procurement', 'achats']),
    ('operations_management', 'Operations Management', 'BUSINESS', ['MASTER'], ['ASCM'], ['operations', 'ops']),
    # —— MASTER MD ——
    ('social_media', 'Social Media', 'BUSINESS', ['MASTER'], ['MD'], ['social media', 'réseaux sociaux']),
    ('branding', 'Branding', 'BUSINESS', ['MASTER'], ['MD'], ['branding', 'marque']),
    ('seo_sea', 'SEO / SEA', 'BUSINESS', ['MASTER'], ['MD'], ['seo', 'sea', 'sem']),
    ('content_strategy', 'Content Strategy', 'BUSINESS', ['MASTER'], ['MD'], ['content', 'contenu']),
    # —— MASTER MRH ——
    ('talent_management', 'Talent Management', 'BUSINESS', ['MASTER'], ['MRH'], ['talent']),
    ('recruitment', 'Recruitment', 'BUSINESS', ['MASTER'], ['MRH'], ['recruitment', 'recrutement']),
    ('organizational_development', 'Organizational Development', 'BUSINESS', ['MASTER'], ['MRH'], ['organizational', 'od']),
    # —— MASTER ACG-SICG ——
    ('risk_management', 'Risk Management', 'BUSINESS', ['MASTER'], ['ACG-SICG'], ['risk', 'risque']),
    ('corporate_finance', 'Corporate Finance', 'BUSINESS', ['MASTER'], ['ACG-SICG', 'MF-FIF'], ['corporate finance']),
    # —— MASTER MF-FIF ——
    ('financial_engineering', 'Financial Engineering', 'BUSINESS', ['MASTER'], ['MF-FIF'], ['financial engineering']),
    ('investment', 'Investment', 'BUSINESS', ['MASTER'], ['MF-FIF'], ['investment', 'investissement']),
    ('banking', 'Banking', 'BUSINESS', ['MASTER'], ['MF-FIF'], ['banking', 'banque']),
    ('financial_analysis', 'Financial Analysis', 'BUSINESS', ['MASTER'], ['MF-FIF'], ['financial analysis']),
    ('asset_management', 'Asset Management', 'BUSINESS', ['MASTER'], ['MF-FIF'], ['asset', 'gestion d\'actifs']),
    # —— MASTER MIISS ——
    ('international_strategy', 'International Strategy', 'BUSINESS', ['MASTER'], ['MIISS'], ['international strategy']),
    ('export_management', 'Export Management', 'BUSINESS', ['MASTER'], ['MIISS'], ['export management']),
    ('international_commerce', 'International Commerce', 'BUSINESS', ['MASTER'], ['MIISS'], ['international commerce']),
    ('global_marketing', 'Global Marketing', 'BUSINESS', ['MASTER'], ['MIISS'], ['global marketing']),
    # —— TECH (cross-program) ——
    ('web_development', 'Web Development', 'TECH', [], [], ['web', 'frontend', 'backend', 'react', 'javascript']),
    ('mobile_development', 'Mobile Development', 'TECH', [], [], ['mobile', 'android', 'ios', 'flutter']),
    ('data_science', 'Data Science', 'TECH', [], [], ['data science', 'machine learning', 'ml']),
    ('artificial_intelligence', 'Artificial Intelligence', 'TECH', [], [], ['ai', 'artificial intelligence', 'deep learning']),
    ('cybersecurity', 'Cybersecurity', 'TECH', [], [], ['cyber', 'security', 'sécurité']),
    ('cloud_computing', 'Cloud Computing', 'TECH', [], [], ['cloud', 'aws', 'azure', 'gcp']),
    ('devops', 'DevOps', 'TECH', [], [], ['devops', 'ci/cd', 'kubernetes']),
    ('networking', 'Networking', 'TECH', [], [], ['network', 'réseau', 'cisco']),
    ('ui_ux_design', 'UI/UX Design', 'TECH', [], [], ['ui', 'ux', 'design', 'figma']),
    ('software_engineering', 'Software Engineering', 'TECH', [], [], ['software', 'engineering', 'java', 'python']),
    ('erp_systems', 'ERP Systems', 'TECH', [], [], ['erp', 'sap', 'oracle']),
    ('sap', 'SAP', 'TECH', [], [], ['sap']),
    ('power_bi', 'Power BI', 'TECH', [], [], ['power bi', 'powerbi', 'bi']),
    ('data_engineering', 'Data Engineering', 'TECH', [], [], ['data engineering', 'etl', 'spark']),
]

_NAME_I18N: dict[str, dict[str, str]] = {
    'finance': {'fr': 'Finance', 'ar': 'المالية'},
    'audit': {'fr': 'Audit', 'ar': 'التدقيق'},
    'data_science': {'fr': 'Science des données', 'ar': 'علوم البيانات'},
    'digital_marketing': {'fr': 'Marketing digital', 'ar': 'التسويق الرقمي'},
    'hr': {'fr': 'Ressources humaines', 'ar': 'الموارد البشرية'},
    'supply_chain': {'fr': 'Supply chain', 'ar': 'سلسلة التوريد'},
    'web_development': {'fr': 'Développement web', 'ar': 'تطوير الويب'},
    'cybersecurity': {'fr': 'Cybersécurité', 'ar': 'الأمن السيبراني'},
}


def seed_specialization_domains() -> dict[str, int]:
    created = 0
    updated = 0
    for idx, row in enumerate(_DOMAIN_ROWS):
        code, name, category, families, tracks, keywords = row
        i18n = _NAME_I18N.get(code, {})
        defaults = {
            'name': name,
            'name_fr': i18n.get('fr', ''),
            'name_en': i18n.get('en', name),
            'name_i18n': i18n,
            'category': category,
            'program_families': families,
            'master_tracks': tracks,
            'keywords': keywords,
            'sort_order': idx,
            'is_active': True,
        }
        _, was_created = SpecializationDomain.objects.update_or_create(
            code=code,
            defaults=defaults,
        )
        if was_created:
            created += 1
        else:
            updated += 1
    return {'created': created, 'updated': updated, 'total': len(_DOMAIN_ROWS)}
