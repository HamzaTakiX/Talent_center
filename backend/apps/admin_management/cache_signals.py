"""Invalidate academic reference caches when catalog rows change."""

from __future__ import annotations

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.admin_management.models import Filiere
from apps.admin_management.services.academic_reference import invalidate_active_filieres_cache


@receiver(post_save, sender=Filiere)
@receiver(post_delete, sender=Filiere)
def _invalidate_filiere_cache(**kwargs):
    invalidate_active_filieres_cache()
