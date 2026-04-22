"""CV lifecycle: create, update, switch template, make primary, delete."""

from typing import Optional

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q

from apps.accounts_et_roles.models import StudentProfile

from ..constants import TemplateSlot
from ..models import CvSection, CvTemplate, StudentCv

from . import section_service, template_service


# ---- Creation ----------------------------------------------------------------

@transaction.atomic
def create_student_cv(
    student_profile: StudentProfile,
    *,
    title: Optional[str] = None,
    template: Optional[CvTemplate] = None,
) -> StudentCv:
    """Create a CV. First CV for the student becomes primary automatically."""
    if template is None:
        template = template_service.get_default_template()
        if template is None:
            raise ValidationError(
                {'template': 'No active CV templates exist. Run seed_cv_templates.'}
            )

    is_first = not student_profile.cvs.exists()
    cv = StudentCv.objects.create(
        student_profile=student_profile,
        template=template,
        title=title or 'My CV',
        is_primary=is_first,
    )
    section_service.seed_default_sections(cv)
    return cv


# ---- Update ------------------------------------------------------------------

@transaction.atomic
def update_student_cv(cv: StudentCv, *, title=None, status=None) -> StudentCv:
    update_fields = ['updated_at']
    if title is not None:
        cv.title = title
        update_fields.append('title')
    if status is not None:
        cv.status = status
        update_fields.append('status')
    cv.save(update_fields=update_fields)
    return cv


# ---- Primary flag ------------------------------------------------------------

@transaction.atomic
def make_primary(cv: StudentCv) -> StudentCv:
    """Atomically make ``cv`` the student's primary CV."""
    (
        StudentCv.objects
        .filter(student_profile=cv.student_profile, is_primary=True)
        .exclude(pk=cv.pk)
        .update(is_primary=False)
    )
    if not cv.is_primary:
        cv.is_primary = True
        cv.save(update_fields=['is_primary', 'updated_at'])
    return cv


# ---- Template switching ------------------------------------------------------

@transaction.atomic
def switch_template(cv: StudentCv, new_template: CvTemplate) -> StudentCv:
    """Switch to a different template while preserving all content.

    Algorithm:
    1. Snapshot current state for rollback safety.
    2. Reassign ``cv.template``.
    3. Remap each section's ``slot_name`` from the new template's
       ``layout_schema.slot_mapping``; ``content_json`` is untouched.
    """
    if not new_template.is_active:
        raise ValidationError({'template': 'Template is not active.'})
    if new_template.pk == cv.template_id:
        return cv

    # Local import avoids circularity at module load time.
    from . import version_service
    version_service.snapshot(
        cv,
        note=f'Auto-snapshot before switching to template "{new_template.code}"',
    )

    cv.template = new_template
    cv.save(update_fields=['template', 'updated_at'])

    slot_map = (new_template.layout_schema or {}).get('slot_mapping') or {}
    sections = list(cv.sections.all())
    for s in sections:
        s.slot_name = slot_map.get(s.section_type, TemplateSlot.MAIN)
    CvSection.objects.bulk_update(sections, ['slot_name'])
    return cv


# ---- Deletion ----------------------------------------------------------------

@transaction.atomic
def delete_student_cv(cv: StudentCv) -> None:
    """Delete a CV. Forbid deleting primary if it isn't the only one."""
    if cv.is_primary:
        other_exists = (
            StudentCv.objects
            .filter(student_profile=cv.student_profile)
            .exclude(pk=cv.pk)
            .exists()
        )
        if other_exists:
            raise ValidationError({
                'is_primary': 'Transfer primary flag to another CV before deleting this one.'
            })
    cv.delete()
