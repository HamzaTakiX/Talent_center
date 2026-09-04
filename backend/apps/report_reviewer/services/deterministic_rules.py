"""Deterministic academic checks — no LLM required."""

from __future__ import annotations

import re
from typing import Any

SEVERITY_MINOR = 'minor'
SEVERITY_IMPORTANT = 'important'
SEVERITY_SUGGESTION = 'suggestion'
SEVERITY_CRITICAL = 'critical'

_PUNCT_BEFORE = re.compile(r'\s+([,.;:!?…])')
_MISSING_SPACE_AFTER = re.compile(r'([,.;:!?])(?=[A-Za-zÀ-ÖØ-öø-ÿ])')
_DOUBLE_SPACE = re.compile(r'  +')
_REPEATED_PUNCT = re.compile(r'([.?!…])\1{2,}|([!?])\2+')
_MULTI_BLANK = re.compile(r'\n{3,}')
_FIGURE_REF = re.compile(
    r'\b(?:la\s+)?(?:figure|fig\.?)\s*(\d+(?:\.\d+)*)\b',
    re.IGNORECASE,
)
_TABLE_REF = re.compile(
    r'\b(?:le\s+)?(?:tableau|table)\s*(\d+(?:\.\d+)*)\b',
    re.IGNORECASE,
)
_HEADING_NUMBER = re.compile(r'^(\d+(?:\.\d+)*)\b')
_CAPTION_NUMBER = re.compile(
    r'^(?:figure|fig\.?|tableau|table)\s*(\d+(?:\.\d+)*)',
    re.IGNORECASE,
)


def _issue(
    *,
    idx: int,
    category: str,
    severity: str,
    title: str,
    description: str,
    suggestion: str,
    quote: str,
    page_number: int,
    confidence: float = 0.98,
) -> dict[str, Any]:
    return {
        'id': f'det-{idx}',
        'category': category,
        'severity': severity,
        'title': title,
        'description': description,
        'suggestion': suggestion,
        'quote': quote[:240],
        'pageNumber': page_number,
        'confidence': confidence,
        'source': 'deterministic',
    }


def _snippet(text: str, start: int, radius: int = 40) -> str:
    a = max(0, start - radius)
    b = min(len(text), start + radius)
    return text[a:b].replace('\n', ' ').strip()


def _split_paragraphs(text: str) -> list[str]:
    return [p.strip() for p in re.split(r'\n\s*\n', text) if p is not None]


def _normalize_num(value: str) -> str:
    return value.strip()


def _collect_declared_numbers(items: list[str]) -> set[str]:
    found: set[str] = set()
    for raw in items:
        m = _CAPTION_NUMBER.search((raw or '').strip())
        if m:
            found.add(_normalize_num(m.group(1)))
        else:
            m2 = _HEADING_NUMBER.match((raw or '').strip())
            if m2:
                found.add(_normalize_num(m2.group(1)))
    return found


def _find_numbering_gaps(numbers: list[str]) -> list[str]:
    """Detect missing siblings only when a contiguous sequence is clearly broken."""
    parsed: list[tuple[str, ...]] = []
    for n in numbers:
        parts = tuple(n.split('.'))
        if all(p.isdigit() for p in parts):
            parsed.append(parts)
    gaps: list[str] = []
    by_parent: dict[tuple[str, ...], list[int]] = {}
    for parts in parsed:
        if len(parts) < 2:
            continue
        parent, last = parts[:-1], int(parts[-1])
        by_parent.setdefault(parent, []).append(last)
    for parent, leaves in by_parent.items():
        uniq = sorted(set(leaves))
        if len(uniq) < 2:
            continue
        for expected in range(uniq[0], uniq[-1] + 1):
            if expected not in uniq:
                gaps.append('.'.join([*parent, str(expected)]))
    return gaps


def run_deterministic_checks(
    *,
    page_text: str,
    page_number: int,
    headings: list[str] | None = None,
    figures: list[str] | None = None,
    tables: list[str] | None = None,
    captions: list[str] | None = None,
    outline: list[dict] | None = None,
    mode: str = 'full',
) -> list[dict[str, Any]]:
    text = page_text or ''
    headings = headings or []
    figures = figures or []
    tables = tables or []
    captions = captions or []
    outline = outline or []
    issues: list[dict[str, Any]] = []
    n = 0

    def add(**kwargs):
        nonlocal n
        n += 1
        issues.append(_issue(idx=n, page_number=page_number, **kwargs))

    lang_modes = {'full', 'language', 'formatting'}
    structure_modes = {'full', 'structure', 'formatting'}
    ref_modes = {'full', 'coherence', 'structure'}

    if mode in lang_modes:
        for m in _DOUBLE_SPACE.finditer(text):
            add(
                category='typography',
                severity=SEVERITY_MINOR,
                title='Double espace',
                description='Des espaces consécutifs ont été détectés.',
                suggestion='Remplacer par un seul espace.',
                quote=_snippet(text, m.start()),
            )
            if n >= 8:
                break

        for m in _PUNCT_BEFORE.finditer(text):
            # French typography allows thin space before ; : ! ? — flag only comma/period with space before
            if m.group(1) in ',.':
                add(
                    category='punctuation',
                    severity=SEVERITY_MINOR,
                    title='Espace avant ponctuation',
                    description=f'Espace incorrect avant « {m.group(1)} ».',
                    suggestion=f'Supprimer l\'espace avant « {m.group(1)} ».',
                    quote=_snippet(text, m.start()),
                )

        for m in _MISSING_SPACE_AFTER.finditer(text):
            add(
                category='punctuation',
                severity=SEVERITY_MINOR,
                title='Espace manquant après ponctuation',
                description='Il manque un espace après un signe de ponctuation.',
                suggestion='Ajouter un espace après la ponctuation.',
                quote=_snippet(text, m.start()),
            )

        for m in _REPEATED_PUNCT.finditer(text):
            add(
                category='punctuation',
                severity=SEVERITY_MINOR,
                title='Ponctuation répétée',
                description='Séquence de ponctuation suspecte.',
                suggestion='Réduire à une ponctuation standard.',
                quote=_snippet(text, m.start()),
            )

    if mode in structure_modes or mode in lang_modes:
        paragraphs = _split_paragraphs(text)
        for p in paragraphs:
            if p == '':
                add(
                    category='formatting',
                    severity=SEVERITY_MINOR,
                    title='Paragraphe vide',
                    description='Un paragraphe vide a été détecté.',
                    suggestion='Supprimer le paragraphe vide.',
                    quote='(paragraphe vide)',
                )
            elif 0 < len(p) < 12 and not _HEADING_NUMBER.match(p) and not _CAPTION_NUMBER.match(p):
                # Extremely short — skip pure numbers / labels
                if not re.fullmatch(r'[\d.\-\s]+', p):
                    add(
                        category='formatting',
                        severity=SEVERITY_SUGGESTION,
                        title='Paragraphe très court',
                        description='Ce paragraphe est extrêmement court pour un rapport académique.',
                        suggestion='Développer ou fusionner avec le paragraphe adjacent.',
                        quote=p[:120],
                    )
            elif len(p) > 1200:
                add(
                    category='clarity',
                    severity=SEVERITY_IMPORTANT,
                    title='Paragraphe trop long',
                    description='Ce paragraphe dépasse ~1200 caractères ; la lisibilité en souffre.',
                    suggestion='Découper en plusieurs paragraphes.',
                    quote=p[:160] + '…',
                )

        if _MULTI_BLANK.search(text):
            add(
                category='formatting',
                severity=SEVERITY_MINOR,
                title='Lignes blanches excessives',
                description='Plus de deux lignes vides consécutives.',
                suggestion='Limiter à une seule ligne vide entre paragraphes.',
                quote='(lignes vides)',
            )

    if mode in structure_modes:
        # Heading hierarchy on page headings list (levels inferred from numbering depth)
        levels: list[int] = []
        for h in headings:
            m = _HEADING_NUMBER.match(h.strip())
            if m:
                levels.append(len(m.group(1).split('.')))
            else:
                levels.append(1)
        for i in range(1, len(levels)):
            if levels[i] - levels[i - 1] > 1:
                add(
                    category='structure',
                    severity=SEVERITY_IMPORTANT,
                    title='Saut de hiérarchie de titres',
                    description='Un niveau de titre semble sauté (ex. H2 → H4).',
                    suggestion='Insérer le niveau intermédiaire manquant ou corriger le niveau.',
                    quote=headings[i][:120],
                )

        seen_titles: dict[str, int] = {}
        for h in headings:
            key = re.sub(r'\s+', ' ', h.strip().lower())
            if not key:
                continue
            seen_titles[key] = seen_titles.get(key, 0) + 1
        for title, count in seen_titles.items():
            if count > 1:
                add(
                    category='structure',
                    severity=SEVERITY_IMPORTANT,
                    title='Titre dupliqué',
                    description='Le même titre apparaît plusieurs fois sur la page.',
                    suggestion='Renommer ou fusionner les sections en double.',
                    quote=title[:120],
                )

        outline_numbers = []
        for item in outline:
            num = (item.get('number') or '').strip()
            if not num:
                m = _HEADING_NUMBER.match((item.get('title') or '').strip())
                if m:
                    num = m.group(1)
            if num:
                outline_numbers.append(_normalize_num(num))
        page_heading_numbers = []
        for h in headings:
            m = _HEADING_NUMBER.match(h.strip())
            if m:
                page_heading_numbers.append(_normalize_num(m.group(1)))
        combined = outline_numbers + page_heading_numbers
        for gap in _find_numbering_gaps(combined):
            add(
                category='structure',
                severity=SEVERITY_IMPORTANT,
                title='Numérotation de titre manquante',
                description=f'La séquence de titres suggère l\'absence de « {gap} ».',
                suggestion=f'Vérifier si la section {gap} manque ou si la numérotation est incorrecte.',
                quote=gap,
                confidence=0.9,
            )

        fig_nums = list(_collect_declared_numbers(figures + captions))
        for gap in _find_numbering_gaps(fig_nums):
            add(
                category='figure',
                severity=SEVERITY_IMPORTANT,
                title='Numérotation de figure manquante',
                description=f'La séquence de figures suggère l\'absence de la figure {gap}.',
                suggestion=f'Vérifier la figure {gap} ou corriger la numérotation.',
                quote=f'Figure {gap}',
                confidence=0.9,
            )

        tab_nums = list(_collect_declared_numbers(tables + captions))
        # Prefer captions that look like tables
        table_caps = [c for c in captions if re.search(r'\btableau\b|\btable\b', c, re.I)]
        tab_nums = list(_collect_declared_numbers(tables + table_caps)) or tab_nums
        for gap in _find_numbering_gaps(tab_nums):
            add(
                category='table',
                severity=SEVERITY_IMPORTANT,
                title='Numérotation de tableau manquante',
                description=f'La séquence de tableaux suggère l\'absence du tableau {gap}.',
                suggestion=f'Vérifier le tableau {gap} ou corriger la numérotation.',
                quote=f'Tableau {gap}',
                confidence=0.9,
            )

    if mode in ref_modes:
        declared_figs = _collect_declared_numbers(figures + [c for c in captions if re.search(r'\bfig', c, re.I)])
        declared_tabs = _collect_declared_numbers(
            tables + [c for c in captions if re.search(r'\btableau\b|\btable\b', c, re.I)]
        )
        # Only flag broken refs when we have at least one declared figure/table on page+captions
        for m in _FIGURE_REF.finditer(text):
            num = _normalize_num(m.group(1))
            # Skip caption definitions themselves
            window = text[max(0, m.start() - 2) : m.end() + 2]
            if declared_figs and num not in declared_figs:
                # Could be referring to a figure on another page — mark as À vérifier
                add(
                    category='reference',
                    severity=SEVERITY_SUGGESTION,
                    title='Référence de figure à vérifier',
                    description=(
                        f'Le texte mentionne la figure {num}, absente des figures/légendes '
                        'fournies pour cette page. À vérifier dans le reste du rapport.'
                    ),
                    suggestion=f'Confirmer l\'existence de la figure {num} ou corriger la référence.',
                    quote=_snippet(text, m.start()),
                    confidence=0.75,
                )

        for m in _TABLE_REF.finditer(text):
            num = _normalize_num(m.group(1))
            if declared_tabs and num not in declared_tabs:
                add(
                    category='reference',
                    severity=SEVERITY_SUGGESTION,
                    title='Référence de tableau à vérifier',
                    description=(
                        f'Le texte mentionne le tableau {num}, absent des tableaux/légendes '
                        'fournies pour cette page. À vérifier dans le reste du rapport.'
                    ),
                    suggestion=f'Confirmer l\'existence du tableau {num} ou corriger la référence.',
                    quote=_snippet(text, m.start()),
                    confidence=0.75,
                )

    # Cap deterministic noise
    return issues[:40]
