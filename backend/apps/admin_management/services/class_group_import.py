"""Helpers for resolving and suggesting ClassGroup codes during CSV import."""

from __future__ import annotations

from typing import Optional

from django.db.models import Q

from apps.admin_management.models import ClassGroup, Filiere


def suggest_class_group_codes(
    unknown_code: str,
    *,
    filiere_id: Optional[int] = None,
    filiere_code: str = '',
    academic_year: str = '',
    limit: int = 10,
) -> list[str]:
    """Return active class group codes similar to *unknown_code* for import error hints."""
    needle = (unknown_code or '').strip()
    if not needle:
        return []

    qs = ClassGroup.objects.filter(is_active=True).select_related('filiere')
    if filiere_id:
        qs = qs.filter(filiere_id=filiere_id)
    elif filiere_code:
        qs = qs.filter(filiere__code__iexact=filiere_code.strip())
    if academic_year:
        qs = qs.filter(academic_year=academic_year.strip())

    exact = qs.filter(Q(code__iexact=needle) | Q(name__iexact=needle)).values_list('code', flat=True)
    if exact:
        return list(exact[:limit])

    prefix = qs.filter(code__istartswith=needle).order_by('code')
    contains = qs.filter(code__icontains=needle).exclude(
        pk__in=prefix.values('pk'),
    ).order_by('code')
    fallback = qs.order_by('filiere__sort_order', 'code')

    seen: set[str] = set()
    ordered: list[str] = []
    for candidate_qs in (prefix, contains, fallback):
        for code in candidate_qs.values_list('code', flat=True):
            if code in seen:
                continue
            seen.add(code)
            ordered.append(code)
            if len(ordered) >= limit:
                return ordered
    return ordered


def format_unknown_class_group_error(
    unknown_code: str,
    *,
    filiere_id: Optional[int] = None,
    filiere_code: str = '',
    academic_year: str = '',
    limit: int = 10,
) -> str:
    """Build a user-facing import error with valid class group suggestions."""
    suggestions = suggest_class_group_codes(
        unknown_code,
        filiere_id=filiere_id,
        filiere_code=filiere_code,
        academic_year=academic_year,
        limit=limit,
    )
    base = f'Unknown class group: {unknown_code}'
    if not suggestions:
        filiere = None
        if filiere_id:
            filiere = Filiere.objects.filter(pk=filiere_id, is_active=True).first()
        elif filiere_code:
            filiere = Filiere.objects.filter(code__iexact=filiere_code.strip(), is_active=True).first()
        hint = (
            f' No active class groups found'
            + (f' for program "{filiere.code}"' if filiere else '')
            + (f' and year "{academic_year}"' if academic_year else '')
            + '. Run: python manage.py seed_esca_academic'
        )
        return base + '.' + hint

    listed = ', '.join(suggestions)
    scope_parts = []
    if filiere_code:
        scope_parts.append(f'program={filiere_code}')
    if academic_year:
        scope_parts.append(f'year={academic_year}')
    scope = f' ({", ".join(scope_parts)})' if scope_parts else ''
    return f'{base}. Valid examples{scope}: {listed}'
