"""Seed announcement taxonomy types."""

from django.db import transaction

from apps.announcements.models import AnnouncementType

ANNOUNCEMENT_TYPE_DEFINITIONS = [
    ('recruitment-interview', 'Recruitment Interview', False, 'NORMAL', 1.0, 'users'),
    ('internship-offer', 'Internship Offer', True, 'IMPORTANT', 1.5, 'briefcase'),
    ('pfe-opportunity', 'PFE Opportunity', True, 'IMPORTANT', 1.4, 'graduation-cap'),
    ('forum-career-fair', 'Forum / Career Fair', False, 'NORMAL', 1.1, 'building-2'),
    ('hackathon', 'Hackathon', False, 'NORMAL', 1.2, 'laptop'),
    ('competition', 'Competition', False, 'NORMAL', 1.1, 'trophy'),
    ('seminar', 'Seminar', False, 'NORMAL', 1.0, 'presentation'),
    ('workshop', 'Workshop', False, 'NORMAL', 1.0, 'hammer'),
    ('webinar', 'Webinar', False, 'NORMAL', 1.0, 'video'),
    ('internal-procedure', 'Internal Procedure', False, 'IMPORTANT', 0.9, 'file-text'),
    ('academic-deadline', 'Academic Deadline', False, 'URGENT', 1.3, 'calendar-clock'),
    ('institutional-communication', 'Institutional Communication', False, 'INSTITUTIONAL_CRITICAL', 1.6, 'building-2'),
    ('emergency', 'Emergency Announcement', False, 'INSTITUTIONAL_CRITICAL', 2.0, 'alert-triangle'),
    ('other', 'Other', False, 'NORMAL', 0.8, 'megaphone'),
]

I18N = {
    'recruitment-interview': {'en': 'Recruitment Interview', 'fr': 'Entretien de recrutement', 'ar': 'مقابلة توظيف'},
    'internship-offer': {'en': 'Internship Offer', 'fr': "Offre de stage", 'ar': 'عرض تدريب'},
    'pfe-opportunity': {'en': 'PFE Opportunity', 'fr': 'Opportunité PFE', 'ar': 'فرصة مشروع نهاية الدراسة'},
    'forum-career-fair': {'en': 'Forum / Career Fair', 'fr': 'Forum / Salon emploi', 'ar': 'معرض التوظيف'},
    'hackathon': {'en': 'Hackathon', 'fr': 'Hackathon', 'ar': 'هاكاثون'},
    'competition': {'en': 'Competition', 'fr': 'Compétition', 'ar': 'مسابقة'},
    'seminar': {'en': 'Seminar', 'fr': 'Séminaire', 'ar': 'ندوة'},
    'workshop': {'en': 'Workshop', 'fr': 'Atelier', 'ar': 'ورشة عمل'},
    'webinar': {'en': 'Webinar', 'fr': 'Webinaire', 'ar': 'ندوة عبر الإنترنت'},
    'internal-procedure': {'en': 'Internal Procedure', 'fr': 'Procédure interne', 'ar': 'إجراء داخلي'},
    'academic-deadline': {'en': 'Academic Deadline', 'fr': 'Échéance académique', 'ar': 'موعد أكاديمي'},
    'institutional-communication': {'en': 'Institutional Communication', 'fr': 'Communication institutionnelle', 'ar': 'تواصل مؤسسي'},
    'emergency': {'en': 'Emergency Announcement', 'fr': 'Annonce urgente', 'ar': 'إعلان طارئ'},
    'other': {'en': 'Other', 'fr': 'Autre', 'ar': 'أخرى'},
}


@transaction.atomic
def seed_announcement_types() -> dict:
    created = 0
    for idx, (code, name, internship, priority, weight, icon) in enumerate(ANNOUNCEMENT_TYPE_DEFINITIONS):
        _, was_created = AnnouncementType.objects.update_or_create(
            code=code,
            defaults={
                'name': name,
                'name_i18n': I18N.get(code, {'en': name, 'fr': name, 'ar': name}),
                'icon': icon,
                'is_system': True,
                'is_active': True,
                'is_internship_related': internship,
                'default_priority': priority,
                'recommendation_weight': weight,
                'sort_order': idx,
                'is_mutable': code not in ('emergency', 'institutional-communication', 'academic-deadline'),
                'is_bannable': code not in ('emergency', 'institutional-communication'),
            },
        )
        if was_created:
            created += 1
    return {'types': len(ANNOUNCEMENT_TYPE_DEFINITIONS), 'created': created}
