"""Create / edit / reorder CvSections."""

from typing import Iterable, List, Optional

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Max

from ..constants import SectionType, TemplateSlot
from ..models import CvSection, StudentCv
from ..schemas import default_content_for, default_label_for


def _next_order_index(cv: StudentCv) -> int:
    current = cv.sections.aggregate(m=Max('order_index'))['m']
    return 0 if current is None else current + 1


def _resolve_slot(cv: StudentCv, section_type: str, slot_name: Optional[str]) -> str:
    if slot_name:
        return slot_name
    mapping = (cv.template.layout_schema or {}).get('slot_mapping') or {}
    return mapping.get(section_type, TemplateSlot.MAIN)


@transaction.atomic
def seed_default_sections(cv: StudentCv) -> List[CvSection]:
    """Create the template's default section list on a fresh CV.

    Seeds content from the student's profile where a natural mapping exists
    (summary, contact, skills) so the first render isn't empty.
    """
    layout = cv.template.layout_schema or {}
    default_types = layout.get('default_sections') or [
        SectionType.SUMMARY,
        SectionType.EXPERIENCE,
        SectionType.EDUCATION,
        SectionType.CONTACT,
        SectionType.SKILLS,
        SectionType.LANGUAGES,
    ]

    profile = cv.student_profile
    user = profile.user
    # Common profile holds phone etc. (related_name='profile' on UserProfile).
    common_profile = getattr(user, 'profile', None)

    sections: List[CvSection] = []
    for idx, stype in enumerate(default_types):
        content = default_content_for(stype)

        if stype == SectionType.SUMMARY and profile.professional_summary:
            content['text'] = profile.professional_summary

        elif stype == SectionType.CONTACT:
            content['email'] = user.email or ''
            content['linkedin'] = profile.linkedin_url or ''
            content['location'] = profile.city or ''
            if common_profile is not None:
                content['phone'] = getattr(common_profile, 'phone', '') or ''

        elif stype == SectionType.SKILLS and profile.skills:
            content['items'] = [
                {'id': f's{i}', 'name': str(name), 'level': None}
                for i, name in enumerate(profile.skills, start=1)
            ]

        sections.append(
            CvSection.objects.create(
                student_cv=cv,
                section_type=stype,
                label=default_label_for(stype),
                order_index=idx,
                is_visible=True,
                slot_name=_resolve_slot(cv, stype, None),
                content_json=content,
            )
        )
    return sections


@transaction.atomic
def add_section(
    cv: StudentCv,
    *,
    section_type: str,
    label: Optional[str] = None,
    slot_name: Optional[str] = None,
) -> CvSection:
    if section_type not in SectionType.values:
        raise ValidationError({'section_type': 'Unknown section type.'})
    return CvSection.objects.create(
        student_cv=cv,
        section_type=section_type,
        label=label or default_label_for(section_type),
        order_index=_next_order_index(cv),
        slot_name=_resolve_slot(cv, section_type, slot_name),
        content_json=default_content_for(section_type),
    )


@transaction.atomic
def update_section(
    section: CvSection,
    *,
    label=None,
    is_visible=None,
    slot_name=None,
    config_json=None,
    content_json=None,
) -> CvSection:
    update_fields = ['updated_at']
    if label is not None:
        section.label = label
        update_fields.append('label')
    if is_visible is not None:
        section.is_visible = is_visible
        update_fields.append('is_visible')
    if slot_name is not None:
        section.slot_name = slot_name
        update_fields.append('slot_name')
    if config_json is not None:
        section.config_json = config_json
        update_fields.append('config_json')
    if content_json is not None:
        section.content_json = content_json
        update_fields.append('content_json')
    section.save(update_fields=update_fields)
    return section


@transaction.atomic
def reorder_sections(cv: StudentCv, ordered_ids: Iterable[int]) -> List[CvSection]:
    """Reassign ``order_index`` following ``ordered_ids``.

    Rejects any id that doesn't belong to this CV and any missing sections.
    """
    ordered_ids = list(ordered_ids)
    current = list(cv.sections.all().values_list('pk', flat=True))
    if set(ordered_ids) != set(current):
        raise ValidationError({'order': 'Provided ids do not match the CV sections exactly.'})

    position_by_id = {pk: idx for idx, pk in enumerate(ordered_ids)}
    sections = list(cv.sections.all())
    for s in sections:
        s.order_index = position_by_id[s.pk]
    CvSection.objects.bulk_update(sections, ['order_index'])
    return sorted(sections, key=lambda s: s.order_index)


@transaction.atomic
def delete_section(section: CvSection) -> None:
    section.delete()
