"""Template definitions, upserts and default selection.

The three built-in templates live here (Modern Split, Classic Single,
Minimal Clean). They are upserted idempotently by the
``seed_cv_templates`` management command.
"""

from typing import Any, Dict, List

from django.db import transaction

from ..constants import SectionType, TemplateCategory, TemplateSlot
from ..models import CvTemplate
from ..selectors import get_default_template as _get_default_template


# ---- Built-in template definitions ------------------------------------------

_MODERN_SPLIT_SECTIONS: List[str] = [
    SectionType.SUMMARY,
    SectionType.EXPERIENCE,
    SectionType.EDUCATION,
    SectionType.CONTACT,
    SectionType.SKILLS,
    SectionType.LANGUAGES,
]

_MODERN_SPLIT_SLOTS: Dict[str, str] = {
    SectionType.CONTACT: TemplateSlot.LEFT,
    SectionType.SKILLS: TemplateSlot.LEFT,
    SectionType.LANGUAGES: TemplateSlot.LEFT,
    SectionType.SUMMARY: TemplateSlot.MAIN,
    SectionType.EDUCATION: TemplateSlot.MAIN,
    SectionType.EXPERIENCE: TemplateSlot.MAIN,
    SectionType.PROJECTS: TemplateSlot.MAIN,
    SectionType.CERTIFICATIONS: TemplateSlot.MAIN,
    SectionType.CUSTOM: TemplateSlot.MAIN,
}

_CLASSIC_SLOTS: Dict[str, str] = {s: TemplateSlot.MAIN for s in SectionType.values}
_MINIMAL_SLOTS: Dict[str, str] = dict(_MODERN_SPLIT_SLOTS)  # same split, lighter styling


BUILTIN_TEMPLATES: List[Dict[str, Any]] = [
    {
        'code': 'modern-split',
        'name': 'Modern Split',
        'description': 'Two-column layout with a coloured header and sidebar.',
        'category': TemplateCategory.MODERN,
        'layout_schema': {
            'columns': 2,
            'header': True,
            'default_sections': _MODERN_SPLIT_SECTIONS,
            'slot_mapping': _MODERN_SPLIT_SLOTS,
        },
        'style_schema': {
            'accent_color': '#155dfc',
            'heading_font': 'Inter',
            'body_font': 'Inter',
            'spacing': 'comfortable',
        },
        'is_default': True,
    },
    {
        'code': 'classic-single',
        'name': 'Classic Single',
        'description': 'Single-column, traditional chronological CV layout.',
        'category': TemplateCategory.CLASSIC,
        'layout_schema': {
            'columns': 1,
            'header': True,
            'default_sections': _MODERN_SPLIT_SECTIONS,
            'slot_mapping': _CLASSIC_SLOTS,
        },
        'style_schema': {
            'accent_color': '#111827',
            'heading_font': 'Inter',
            'body_font': 'Inter',
            'spacing': 'tight',
        },
        'is_default': False,
    },
    {
        'code': 'minimal-clean',
        'name': 'Minimal Clean',
        'description': 'Airy, understated layout with subtle accents.',
        'category': TemplateCategory.MINIMAL,
        'layout_schema': {
            'columns': 2,
            'header': False,
            'default_sections': _MODERN_SPLIT_SECTIONS,
            'slot_mapping': _MINIMAL_SLOTS,
        },
        'style_schema': {
            'accent_color': '#0f766e',
            'heading_font': 'Inter',
            'body_font': 'Inter',
            'spacing': 'airy',
        },
        'is_default': False,
    },
]


# ---- Public API --------------------------------------------------------------

def get_default_template():
    """Return the default active template (or None if none seeded yet)."""
    return _get_default_template()


@transaction.atomic
def seed_builtin_templates() -> Dict[str, CvTemplate]:
    """Idempotently upsert the built-in templates. Returns code -> instance."""
    created: Dict[str, CvTemplate] = {}
    for data in BUILTIN_TEMPLATES:
        obj, _ = CvTemplate.objects.update_or_create(
            code=data['code'],
            defaults={
                'name': data['name'],
                'description': data['description'],
                'category': data['category'],
                'layout_schema': data['layout_schema'],
                'style_schema': data['style_schema'],
                'is_active': True,
                'is_default': data['is_default'],
            },
        )
        created[obj.code] = obj

    # Enforce a single default: if multiple rows have is_default=True,
    # keep only the built-in flagged one.
    CvTemplate.objects.filter(is_default=True).exclude(
        code__in=[t['code'] for t in BUILTIN_TEMPLATES if t['is_default']]
    ).update(is_default=False)

    return created
