"""
Ownership-based permissions for cv_builder.

Cross-student access is prevented in two layers:
1. Selectors always filter by `student_profile__user=request.user`.
2. Permissions re-check ownership here.

Anything missing on either layer results in a 404 (via selectors) or 403
(via these permissions) — never a leak.
"""

from rest_framework.permissions import BasePermission

from .models import CvAsset, CvSection, CvShareLink, CvVersion, StudentCv


class IsStudentCvOwner(BasePermission):
    """Caller must own the StudentCv whose pk is in the URL kwargs.

    Supports two URL conventions used by the views in this app:
    - Detail / action endpoints: ``<int:pk>`` → the CV pk.
    - Nested endpoints: ``<int:cv_id>`` when the URL also carries a
      child resource pk (e.g. ``restore-version/<int:version_id>``).
    """

    def has_permission(self, request, view) -> bool:
        if not (request.user and request.user.is_authenticated):
            return False

        kwargs = getattr(view, 'kwargs', {}) or {}
        cv_pk = kwargs.get('pk') or kwargs.get('cv_id')
        if cv_pk is None:
            # List / create — the view's queryset is scoped by user.
            return True

        return StudentCv.objects.filter(
            pk=cv_pk, student_profile__user=request.user
        ).exists()


class IsSectionOwner(BasePermission):
    """Caller must own the CvSection whose pk is in the URL."""

    def has_permission(self, request, view) -> bool:
        if not (request.user and request.user.is_authenticated):
            return False

        pk = (getattr(view, 'kwargs', {}) or {}).get('pk')
        if pk is None:
            return True

        return CvSection.objects.filter(
            pk=pk, student_cv__student_profile__user=request.user
        ).exists()


class IsAssetOwner(BasePermission):
    """Caller must own the CvAsset whose pk is in the URL."""

    def has_permission(self, request, view) -> bool:
        if not (request.user and request.user.is_authenticated):
            return False

        pk = (getattr(view, 'kwargs', {}) or {}).get('pk')
        if pk is None:
            return True

        return CvAsset.objects.filter(
            pk=pk, student_cv__student_profile__user=request.user
        ).exists()


class IsVersionOwner(BasePermission):
    """Caller must own the CvVersion whose pk is in the URL."""

    def has_permission(self, request, view) -> bool:
        if not (request.user and request.user.is_authenticated):
            return False

        pk = (getattr(view, 'kwargs', {}) or {}).get('version_id')
        if pk is None:
            return True

        return CvVersion.objects.filter(
            pk=pk, student_cv__student_profile__user=request.user
        ).exists()


class IsShareLinkOwner(BasePermission):
    """Caller must own the CvShareLink whose pk is in the URL."""

    def has_permission(self, request, view) -> bool:
        if not (request.user and request.user.is_authenticated):
            return False

        pk = (getattr(view, 'kwargs', {}) or {}).get('pk')
        if pk is None:
            return True

        return CvShareLink.objects.filter(
            pk=pk, student_cv__student_profile__user=request.user
        ).exists()
