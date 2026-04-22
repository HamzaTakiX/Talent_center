"""Public share-link lifecycle."""

from typing import Optional

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from ..models import CvShareLink, StudentCv


@transaction.atomic
def create_share_link(
    cv: StudentCv,
    *,
    label: str = '',
    expires_at=None,
    user=None,
) -> CvShareLink:
    return CvShareLink.objects.create(
        student_cv=cv,
        label=label or '',
        expires_at=expires_at,
        created_by=user,
    )


@transaction.atomic
def update_share_link(
    link: CvShareLink,
    *,
    label: Optional[str] = None,
    is_active: Optional[bool] = None,
    expires_at=...,
) -> CvShareLink:
    if label is not None:
        link.label = label
    if is_active is not None:
        link.is_active = is_active
    if expires_at is not ...:
        link.expires_at = expires_at
    link.save()
    return link


@transaction.atomic
def revoke(link: CvShareLink) -> CvShareLink:
    link.is_active = False
    link.save(update_fields=['is_active', 'updated_at'])
    return link


def record_view(link: CvShareLink) -> None:
    """Cheap view-count bookkeeping; not atomic with the GET itself."""
    CvShareLink.objects.filter(pk=link.pk).update(
        view_count=F('view_count') + 1,
        last_viewed_at=timezone.now(),
    )
