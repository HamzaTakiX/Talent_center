"""
Default JSON shapes for each CvSection.section_type.

A section's content_json is structured data, not HTML. Section renderers
(frontend) and the analysis/export services read these shapes to stay in
sync. Changing a shape is a migration concern — bump a schema version on
the section's config_json if you need to coexist with old content.
"""

from typing import Any, Dict

from .constants import SectionType


# ---- Default content per section type ----------------------------------------

_DEFAULTS: Dict[str, Dict[str, Any]] = {
    SectionType.HEADER: {
        'full_name': '',
        'headline': '',
    },
    SectionType.CONTACT: {
        'email': '',
        'phone': '',
        'linkedin': '',
        'website': '',
        'location': '',
    },
    SectionType.SUMMARY: {
        'text': '',
    },
    SectionType.EDUCATION: {
        'items': [],  # [{id, degree, school, location, start_date, end_date, description}]
    },
    SectionType.EXPERIENCE: {
        'items': [],  # [{id, title, company, location, start_date, end_date, bullets: [str]}]
    },
    SectionType.SKILLS: {
        'items': [],  # [{id, name, level}]
    },
    SectionType.LANGUAGES: {
        'items': [],  # [{id, name, level}]
    },
    SectionType.PROJECTS: {
        'items': [],  # [{id, name, description, url, tech}]
    },
    SectionType.CERTIFICATIONS: {
        'items': [],  # [{id, name, issuer, date, url}]
    },
    SectionType.CUSTOM: {
        'text': '',
    },
}

# ---- Default labels (section title shown in the CV body) ---------------------

_DEFAULT_LABELS: Dict[str, str] = {
    SectionType.HEADER: 'Header',
    SectionType.CONTACT: 'Contact',
    SectionType.SUMMARY: 'Profile Summary',
    SectionType.EDUCATION: 'Education',
    SectionType.EXPERIENCE: 'Professional Experience',
    SectionType.SKILLS: 'Skills',
    SectionType.LANGUAGES: 'Languages',
    SectionType.PROJECTS: 'Projects',
    SectionType.CERTIFICATIONS: 'Certifications',
    SectionType.CUSTOM: 'Section',
}


def default_content_for(section_type: str) -> Dict[str, Any]:
    """Return a deep-copied default content_json for a section type."""
    import copy
    return copy.deepcopy(_DEFAULTS.get(section_type, {}))


def default_label_for(section_type: str) -> str:
    return _DEFAULT_LABELS.get(section_type, 'Section')
