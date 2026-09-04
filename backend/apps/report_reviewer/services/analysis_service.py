"""Orchestrate deterministic rules + Ollama page analysis + cache."""

from __future__ import annotations

import logging
from typing import Any

import requests
from django.conf import settings
from django.db import transaction

from apps.cv_intelligence.services.ai.ollama_client import OllamaClient
from apps.report_reviewer.models import PageAnalysisCache
from apps.report_reviewer.prompts import SYSTEM_PROMPT, build_user_prompt
from apps.report_reviewer.services.deterministic_rules import run_deterministic_checks
from apps.report_reviewer.services.json_validation import (
    build_summary,
    compute_score,
    merge_issues,
    normalize_ai_payload,
)

logger = logging.getLogger(__name__)

# Page review can be slower than CV micro-calls.
REVIEW_TIMEOUT_SECONDS = getattr(settings, 'OLLAMA_PAGE_ANALYSIS_TIMEOUT', 180)


class ReportReviewerError(Exception):
    """User-facing analysis failure."""

    def __init__(self, message: str, *, code: str = 'analysis_failed'):
        super().__init__(message)
        self.message = message
        self.code = code


def get_reviewer_ollama_client() -> OllamaClient:
    return OllamaClient(timeout=REVIEW_TIMEOUT_SECONDS)


def analyze_page(
    *,
    user,
    report_id: str,
    page_number: int,
    page_id: str,
    content_hash: str,
    mode: str,
    include_context: bool,
    page: dict[str, Any],
    context: dict[str, Any] | None = None,
    force: bool = False,
) -> dict[str, Any]:
    context = context or {}

    if not force:
        cached = (
            PageAnalysisCache.objects.filter(
                user=user,
                report_id=report_id,
                page_number=page_number,
                content_hash=content_hash,
                mode=mode,
            )
            .order_by('-updated_at')
            .first()
        )
        if cached:
            return {
                'pageId': page_id,
                'pageNumber': page_number,
                'cached': True,
                'model': cached.model_name or None,
                'analysis': {
                    'score': cached.score,
                    'summary': cached.summary_json or build_summary(cached.issues_json or []),
                    'issues': cached.issues_json or [],
                },
            }

    page_text = page.get('text') or ''
    headings = list(page.get('headings') or [])
    figures = list(page.get('figures') or [])
    tables = list(page.get('tables') or [])
    captions = list(page.get('captions') or [])
    outline = list(context.get('outline') or [])

    det_issues = run_deterministic_checks(
        page_text=page_text,
        page_number=page_number,
        headings=headings,
        figures=figures,
        tables=tables,
        captions=captions,
        outline=outline,
        mode=mode,
    )

    client = get_reviewer_ollama_client()
    if not client.is_available():
        raise ReportReviewerError(
            'Impossible d\'analyser cette page. Vérifiez la connexion au service IA.',
            code='ollama_unavailable',
        )

    user_prompt = build_user_prompt(
        page_number=page_number,
        mode=mode,
        page_text=page_text,
        headings=headings,
        figures=figures,
        tables=tables,
        captions=captions,
        chapter_title=str(context.get('chapterTitle') or ''),
        section_title=str(context.get('sectionTitle') or ''),
        previous_excerpt=str(context.get('previousExcerpt') or ''),
        next_excerpt=str(context.get('nextExcerpt') or ''),
        outline=outline,
        include_context=include_context,
    )

    ai_issues: list[dict[str, Any]] = []
    ai_score: int | None = None
    model_used = ''

    try:
        raw, model_used = client.chat_json(
            SYSTEM_PROMPT,
            user_prompt,
            temperature=0.1,
            max_tokens=2048,
        )
        normalized = normalize_ai_payload(raw, page_number=page_number)
        ai_issues = normalized['issues']
        ai_score = normalized['summary'].get('score')
    except (requests.Timeout, TimeoutError) as exc:
        logger.warning(
            'report_reviewer timeout reportId=%s page=%s hash=%s',
            report_id,
            page_number,
            content_hash[:12],
        )
        # Hybride : si le moteur déterministe a trouvé au moins une issue,
        # on renvoie ces résultats même si Ollama a timeout (évite un 503).
        if det_issues:
            issues = merge_issues(det_issues, [])
            score = compute_score(issues, None)
            summary = build_summary(issues)
            model_used = 'deterministic-only'

            with transaction.atomic():
                PageAnalysisCache.objects.update_or_create(
                    user=user,
                    report_id=report_id,
                    page_number=page_number,
                    content_hash=content_hash,
                    mode=mode,
                    defaults={
                        'model_name': model_used or '',
                        'score': score,
                        'issues_json': issues,
                        'summary_json': summary,
                    },
                )

            return {
                'pageId': page_id,
                'pageNumber': page_number,
                'cached': False,
                'model': model_used or None,
                'analysis': {
                    'score': score,
                    'summary': summary,
                    'issues': issues,
                },
            }

        raise ReportReviewerError(
            'Impossible d\'analyser cette page. Vérifiez la connexion au service IA.',
            code='ollama_timeout',
        ) from exc
    except (requests.RequestException, ValueError, TypeError) as first_exc:
        logger.warning(
            'report_reviewer AI parse/request failed, retrying once: %s',
            first_exc,
        )
        try:
            raw, model_used = client.chat_json(
                SYSTEM_PROMPT + '\n\nIMPORTANT: retourne uniquement du JSON valide.',
                user_prompt,
                temperature=0.0,
                max_tokens=2048,
            )
            normalized = normalize_ai_payload(raw, page_number=page_number)
            ai_issues = normalized['issues']
            ai_score = normalized['summary'].get('score')
        except Exception as second_exc:
            logger.warning(
                'report_reviewer AI failed after retry reportId=%s page=%s: %s',
                report_id,
                page_number,
                second_exc,
            )
            # Deterministic-only fallback if AI fails entirely
            if not det_issues:
                raise ReportReviewerError(
                    'Impossible d\'analyser cette page. Vérifiez la connexion au service IA.',
                    code='ollama_failed',
                ) from second_exc
            model_used = model_used or 'deterministic-only'

    issues = merge_issues(det_issues, ai_issues)
    score = compute_score(issues, ai_score)
    summary = build_summary(issues)

    with transaction.atomic():
        PageAnalysisCache.objects.update_or_create(
            user=user,
            report_id=report_id,
            page_number=page_number,
            content_hash=content_hash,
            mode=mode,
            defaults={
                'model_name': model_used or '',
                'score': score,
                'issues_json': issues,
                'summary_json': summary,
            },
        )

    logger.info(
        'report_reviewer done reportId=%s page=%s mode=%s issues=%s cached=0',
        report_id,
        page_number,
        mode,
        len(issues),
    )

    return {
        'pageId': page_id,
        'pageNumber': page_number,
        'cached': False,
        'model': model_used or None,
        'analysis': {
            'score': score,
            'summary': summary,
            'issues': issues,
        },
    }


def analyze_pages_placeholder() -> None:
    """Reserved for future chapter-level analysis (reuse analyze_page per page)."""
    raise NotImplementedError('Chapter analysis is not implemented yet.')
