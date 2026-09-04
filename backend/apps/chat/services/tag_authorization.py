"""Role- and module-aware chat tag / business-context authorization."""

from __future__ import annotations

from typing import Iterable

from django.db.models import QuerySet

from apps.accounts_et_roles.models import User

from ..constants import ADMIN_ONLY_TAG_CODES, MODULE_TAG_CATALOG, STAFF_ONLY_TAG_CODES
from ..models import Tag


def normalize_chat_module(module: str | None) -> str | None:
    if not module:
        return None
    normalized = str(module).strip().lower()
    return normalized or None


def module_tag_catalog(module: str | None) -> frozenset[str]:
    normalized = normalize_chat_module(module)
    if not normalized:
        return frozenset()
    return MODULE_TAG_CATALOG.get(normalized, frozenset())


def allowed_tag_codes_for_user(user: User, module: str | None = None) -> frozenset[str]:
    """Return tag codes a user may apply in the given chat module."""
    catalog = module_tag_catalog(module)
    if not catalog:
        return frozenset()

    if user.is_superuser or user.role == User.RoleChoices.ADMIN:
        return catalog

    if user.role == User.RoleChoices.SUPERVISOR:
        return catalog - ADMIN_ONLY_TAG_CODES

    if user.role == User.RoleChoices.STUDENT:
        return catalog - STAFF_ONLY_TAG_CODES - ADMIN_ONLY_TAG_CODES

    return frozenset()


def tags_queryset_for_user(user: User, module: str | None = None) -> QuerySet[Tag]:
    allowed = allowed_tag_codes_for_user(user, module)
    if not allowed:
        return Tag.objects.none()
    return Tag.objects.filter(code__in=allowed).order_by('code')


def filter_authorized_tag_codes(
    user: User,
    tag_codes: Iterable[str] | None,
    *,
    module: str | None = None,
) -> list[str]:
    if not tag_codes:
        return []
    requested = [str(code).strip() for code in tag_codes if str(code).strip()]
    if not requested:
        return []
    allowed = allowed_tag_codes_for_user(user, module)
    return [code for code in requested if code in allowed]
