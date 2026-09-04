"""Validate and normalize AI JSON for page analysis."""

from __future__ import annotations

from typing import Any

VALID_CATEGORIES = {
    'orthography',
    'grammar',
    'punctuation',
    'typography',
    'academic_style',
    'clarity',
    'repetition',
    'coherence',
    'technical_coherence',
    'structure',
    'terminology',
    'figure',
    'table',
    'reference',
    'formatting',
}

VALID_SEVERITIES = {'critical', 'important', 'minor', 'suggestion'}

MIN_AI_CONFIDENCE = 0.6

SEVERITY_PENALTY = {
    'critical': 18,
    'important': 10,
    'minor': 4,
    'suggestion': 1,
}


def _as_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_ai_payload(raw: Any, *, page_number: int) -> dict[str, Any]:
    """Return {summary, issues} from raw LLM JSON; raises ValueError if unusable."""
    if not isinstance(raw, dict):
        raise ValueError('AI response is not a JSON object')

    issues_raw = raw.get('issues')
    if issues_raw is None:
        issues_raw = []
    if not isinstance(issues_raw, list):
        raise ValueError('AI issues must be a list')

    issues: list[dict[str, Any]] = []
    for i, item in enumerate(issues_raw):
        if not isinstance(item, dict):
            continue
        category = str(item.get('category') or '').strip().lower().replace(' ', '_')
        severity = str(item.get('severity') or '').strip().lower()
        confidence = _as_float(item.get('confidence'), 0.0)
        if category not in VALID_CATEGORIES:
            continue
        if severity not in VALID_SEVERITIES:
            continue
        if confidence < MIN_AI_CONFIDENCE:
            continue
        title = str(item.get('title') or '').strip()
        description = str(item.get('description') or '').strip()
        if not title and not description:
            continue
        quote = str(item.get('quote') or '').strip()
        suggestion = str(item.get('suggestion') or '').strip()
        issues.append(
            {
                'id': str(item.get('id') or f'ai-{i + 1}'),
                'category': category,
                'severity': severity,
                'title': title or 'Problème détecté',
                'description': description or title,
                'suggestion': suggestion,
                'quote': quote[:240],
                'pageNumber': page_number,
                'confidence': round(min(1.0, max(0.0, confidence)), 3),
                'source': 'ai',
            }
        )

    summary_raw = raw.get('summary') if isinstance(raw.get('summary'), dict) else {}
    score = summary_raw.get('score')
    try:
        score_int = int(score) if score is not None else None
    except (TypeError, ValueError):
        score_int = None

    return {
        'summary': {
            'score': score_int,
            'totalIssues': len(issues),
        },
        'issues': issues,
    }


def merge_issues(
    deterministic: list[dict[str, Any]],
    ai_issues: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Merge and dedupe by normalized quote + category."""
    merged: list[dict[str, Any]] = []
    seen: set[str] = set()

    def key(issue: dict[str, Any]) -> str:
        q = re_normalize(str(issue.get('quote') or ''))
        cat = str(issue.get('category') or '')
        return f'{cat}::{q}' if q else f'{cat}::{issue.get("title", "")}'

    for issue in [*deterministic, *ai_issues]:
        k = key(issue)
        if k in seen and issue.get('quote'):
            continue
        seen.add(k)
        merged.append(issue)

    # Re-id sequentially for stability
    for i, issue in enumerate(merged, start=1):
        src = issue.get('source') or 'ai'
        prefix = 'det' if src == 'deterministic' else 'ai'
        issue['id'] = f'{prefix}-{i}'
    return merged


def re_normalize(text: str) -> str:
    return ' '.join(text.lower().split())


def compute_score(issues: list[dict[str, Any]], ai_score: int | None = None) -> int:
    if ai_score is not None and 0 <= ai_score <= 100 and not issues:
        return ai_score

    penalty = 0
    for issue in issues:
        penalty += SEVERITY_PENALTY.get(str(issue.get('severity')), 2)

    base = 100 - penalty
    if ai_score is not None and 0 <= ai_score <= 100:
        # Blend lightly toward AI score when present
        base = round((base * 0.7) + (ai_score * 0.3))
    return max(0, min(100, base))


def build_summary(issues: list[dict[str, Any]]) -> dict[str, int]:
    summary = {'critical': 0, 'important': 0, 'minor': 0, 'suggestion': 0}
    for issue in issues:
        sev = str(issue.get('severity') or '')
        if sev in summary:
            summary[sev] += 1
    return summary
