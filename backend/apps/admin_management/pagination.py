"""Lightweight offset pagination for admin list endpoints."""

from __future__ import annotations

from typing import Any

from django.db.models import QuerySet


def parse_page_params(
    request,
    *,
    default_page_size: int = 15,
    max_page_size: int = 100,
) -> tuple[int, int]:
    try:
        page = int(request.query_params.get('page', 1))
    except (TypeError, ValueError):
        page = 1
    try:
        page_size = int(request.query_params.get('page_size', default_page_size))
    except (TypeError, ValueError):
        page_size = default_page_size
    page = max(1, page)
    page_size = max(1, min(page_size, max_page_size))
    return page, page_size


def paginate_queryset(qs: QuerySet, request, **kwargs) -> tuple[list[Any], dict[str, int]]:
    page, page_size = parse_page_params(request, **kwargs)
    total = qs.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    if page > total_pages:
        page = total_pages
    offset = (page - 1) * page_size
    items = list(qs[offset : offset + page_size])
    meta = {
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': total_pages,
    }
    return items, meta


def paginated_payload(items: list[Any], meta: dict[str, int]) -> dict[str, Any]:
    return {'items': items, **meta}
