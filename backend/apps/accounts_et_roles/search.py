"""Shared queryset filters for user profile name search."""

from django.db.models import Q


def profile_name_search_q(
    search: str,
    *,
    first_name_field: str,
    last_name_field: str,
) -> Q:
    """
    Match free-text search against first/last name fields.

    Single terms match either field. Multi-word queries require each term to
    appear in first_name or last_name (supports full-name search).
    """
    q = (search or '').strip()
    if not q:
        return Q()

    terms = q.split()
    if len(terms) <= 1:
        return (
            Q(**{f'{first_name_field}__icontains': q})
            | Q(**{f'{last_name_field}__icontains': q})
        )

    name_q = Q()
    for term in terms:
        name_q &= (
            Q(**{f'{first_name_field}__icontains': term})
            | Q(**{f'{last_name_field}__icontains': term})
        )
    return name_q
