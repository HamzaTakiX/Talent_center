"""
Read-only query functions for cv_builder.

Every selector that touches a StudentCv is scoped by the requesting user,
so leaking another student's data is impossible without bypassing this
module entirely.
"""

from django.shortcuts import get_object_or_404

from django.utils import timezone

from .models import (
    CvAiAnalysis,
    CvAsset,
    CvSection,
    CvShareLink,
    CvTemplate,
    CvVersion,
    StudentCv,
)


# ---- Templates ---------------------------------------------------------------

def list_active_templates():
    return CvTemplate.objects.filter(is_active=True)


def get_template(pk):
    return get_object_or_404(CvTemplate, pk=pk, is_active=True)


def get_default_template():
    """First active template with ``is_default=True``, else the first active."""
    return (
        CvTemplate.objects.filter(is_active=True, is_default=True).first()
        or CvTemplate.objects.filter(is_active=True).first()
    )


# ---- Student CVs -------------------------------------------------------------

def list_student_cvs_for_user(user):
    return (
        StudentCv.objects
        .filter(student_profile__user=user)
        .select_related('template', 'student_profile')
    )


def get_student_cv_for_user(user, pk):
    return get_object_or_404(
        StudentCv.objects.select_related('template', 'student_profile'),
        pk=pk,
        student_profile__user=user,
    )


# ---- Sections ----------------------------------------------------------------

def list_sections_for_cv(cv):
    return cv.sections.all().order_by('order_index', 'id')


def get_section_for_user(user, pk):
    return get_object_or_404(
        CvSection,
        pk=pk,
        student_cv__student_profile__user=user,
    )


# ---- Assets ------------------------------------------------------------------

def list_assets_for_cv(cv):
    return cv.assets.all()


def get_asset_for_user(user, pk):
    return get_object_or_404(
        CvAsset,
        pk=pk,
        student_cv__student_profile__user=user,
    )


# ---- Versions ----------------------------------------------------------------

def list_versions_for_cv(cv):
    return cv.versions.all().order_by('-version_number')


def get_version_for_user(user, pk):
    return get_object_or_404(
        CvVersion,
        pk=pk,
        student_cv__student_profile__user=user,
    )


# ---- AI analyses -------------------------------------------------------------

def list_analyses_for_cv(cv):
    return cv.analyses.all().order_by('-analyzed_at')


# ---- Share links -------------------------------------------------------------

def list_share_links_for_cv(cv):
    return cv.share_links.all().order_by('-created_at')


def get_share_link_for_user(user, pk):
    return get_object_or_404(
        CvShareLink,
        pk=pk,
        student_cv__student_profile__user=user,
    )


def get_active_share_link_by_token(token):
    """Resolve a public share token — ``None`` if revoked or expired."""
    link = (
        CvShareLink.objects
        .select_related('student_cv', 'student_cv__template')
        .filter(token=token, is_active=True)
        .first()
    )
    if link is None:
        return None
    if link.expires_at and link.expires_at < timezone.now():
        return None
    return link
