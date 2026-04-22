"""AI analysis of a CV.

Two providers are supported:
- ``RuleBasedProvider`` — deterministic, no API key, used as the safe default.
- ``ClaudeProvider`` — Anthropic Claude Haiku via the official SDK with prompt
  caching on the static rubric and structured output via ``messages.parse()``.

Selection via ``settings.CV_ANALYSIS_PROVIDER``.
"""

import json
import logging
from dataclasses import dataclass
from typing import Any, Dict, List

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from ..constants import SectionType
from ..models import CvAiAnalysis, StudentCv

logger = logging.getLogger(__name__)


# ---- Provider-neutral payload ------------------------------------------------

def _serialize_for_analysis(cv: StudentCv) -> Dict[str, Any]:
    sections = []
    for s in cv.sections.all().order_by('order_index', 'id'):
        sections.append({
            'section_type': s.section_type,
            'label': s.label,
            'is_visible': s.is_visible,
            'content': s.content_json,
        })
    return {
        'title': cv.title,
        'template_code': cv.template.code,
        'sections': sections,
    }


# ---- Rule-based provider (Phase 1 default) -----------------------------------

@dataclass
class _AnalysisResult:
    score: int
    suggestions: List[Dict[str, Any]]
    strengths: List[str]
    weaknesses: List[str]
    raw: Dict[str, Any]


class RuleBasedProvider:
    """Deterministic scoring used as the Phase 1 default.

    Score starts at 100 and penalties are deducted for missing content,
    short summary text, empty repeatable sections, etc.
    """

    name = 'rule-based'

    REQUIRED_SECTIONS = {
        SectionType.SUMMARY,
        SectionType.CONTACT,
        SectionType.EDUCATION,
        SectionType.EXPERIENCE,
        SectionType.SKILLS,
    }

    def analyze(self, payload: Dict[str, Any]) -> _AnalysisResult:
        suggestions: List[Dict[str, Any]] = []
        strengths: List[str] = []
        weaknesses: List[str] = []
        score = 100

        sections_by_type = {s['section_type']: s for s in payload.get('sections', [])}

        # Required-section presence.
        missing = self.REQUIRED_SECTIONS - sections_by_type.keys()
        for stype in missing:
            score -= 10
            suggestions.append({
                'section': stype,
                'severity': 'high',
                'message': f'Add a "{stype}" section — it is typically required on a professional CV.',
            })
            weaknesses.append(f'Missing {stype} section')

        # Summary length.
        summary = sections_by_type.get(SectionType.SUMMARY)
        if summary:
            text = (summary.get('content') or {}).get('text') or ''
            if len(text.strip()) < 80:
                score -= 8
                suggestions.append({
                    'section': SectionType.SUMMARY,
                    'severity': 'medium',
                    'message': 'Expand your profile summary — aim for 3-4 concise sentences.',
                })
                weaknesses.append('Profile summary is too short')
            else:
                strengths.append('Clear, sufficient profile summary')

        # Experience richness.
        exp = sections_by_type.get(SectionType.EXPERIENCE)
        if exp:
            items = (exp.get('content') or {}).get('items') or []
            if not items:
                score -= 8
                suggestions.append({
                    'section': SectionType.EXPERIENCE,
                    'severity': 'medium',
                    'message': 'Add at least one experience entry with measurable impact bullets.',
                })
                weaknesses.append('No experience entries')
            else:
                thin = [i for i in items if len((i.get('bullets') or [])) < 2]
                if thin:
                    score -= 4
                    suggestions.append({
                        'section': SectionType.EXPERIENCE,
                        'severity': 'low',
                        'message': 'Some experience entries have fewer than 2 bullet points. '
                                   'Quantify impact where possible.',
                    })

        # Skills.
        skills = sections_by_type.get(SectionType.SKILLS)
        if skills:
            items = (skills.get('content') or {}).get('items') or []
            if len(items) < 5:
                score -= 3
                suggestions.append({
                    'section': SectionType.SKILLS,
                    'severity': 'low',
                    'message': 'List at least 5 skills — include both hard and soft skills.',
                })
            else:
                strengths.append('Skills list is well populated')

        score = max(0, min(100, score))
        raw = {
            'provider': self.name,
            'checks_run': ['required_sections', 'summary_length', 'experience_bullets', 'skills_count'],
            'section_count': len(sections_by_type),
        }
        return _AnalysisResult(
            score=score,
            suggestions=suggestions,
            strengths=strengths,
            weaknesses=weaknesses,
            raw=raw,
        )


# ---- Claude provider ---------------------------------------------------------

_CLAUDE_RUBRIC = """You are a senior career coach reviewing CVs for university \
students and recent graduates. Score the CV from 0 to 100 based on:

1. Completeness — all expected sections present (summary, contact, education,
   experience, skills, projects).
2. Clarity of profile summary — 3-4 concise sentences, positions the candidate.
3. Experience quality — each role has quantified, action-oriented bullet points.
4. Skills breadth — hard and soft skills, at least 5 total, relevant to the
   candidate's target field.
5. Education structure — degree, school, dates clearly present.
6. Language, cohesion, professional tone — no typos, consistent tense.

Return:
- score: integer 0-100
- strengths: up to 4 short phrases describing what the CV does well
- weaknesses: up to 4 short phrases describing what the CV is missing or weak at
- suggestions: up to 6 actionable items, each with a target section, severity
  (low | medium | high), and a concrete, specific message the student can act on

Be direct and specific. Avoid generic advice like "add more detail" — point to
the exact section and say what to add. Do not invent experience the candidate
did not include.
"""


_CLAUDE_OUTPUT_SCHEMA = {
    'type': 'json_schema',
    'schema': {
        'type': 'object',
        'additionalProperties': False,
        'required': ['score', 'strengths', 'weaknesses', 'suggestions'],
        'properties': {
            'score': {'type': 'integer', 'minimum': 0, 'maximum': 100},
            'strengths': {
                'type': 'array',
                'maxItems': 4,
                'items': {'type': 'string'},
            },
            'weaknesses': {
                'type': 'array',
                'maxItems': 4,
                'items': {'type': 'string'},
            },
            'suggestions': {
                'type': 'array',
                'maxItems': 6,
                'items': {
                    'type': 'object',
                    'additionalProperties': False,
                    'required': ['section', 'severity', 'message'],
                    'properties': {
                        'section': {'type': 'string'},
                        'severity': {'enum': ['low', 'medium', 'high']},
                        'message': {'type': 'string'},
                    },
                },
            },
        },
    },
}


class ClaudeProvider:
    """Anthropic Claude-backed CV analysis.

    Uses the static rubric as a cached system block so repeated requests pay
    the cache-read rate. Returns structured JSON via ``messages.parse()``.
    """

    name = 'claude'

    def __init__(self, *, api_key: str, model: str):
        try:
            from anthropic import Anthropic
        except ImportError as e:
            raise RuntimeError(
                'anthropic package is not installed. Run: pip install anthropic'
            ) from e
        self._client = Anthropic(api_key=api_key)
        self._model = model

    def analyze(self, payload: Dict[str, Any]) -> _AnalysisResult:
        response = self._client.messages.create(
            model=self._model,
            max_tokens=2048,
            system=[
                {
                    'type': 'text',
                    'text': _CLAUDE_RUBRIC,
                    'cache_control': {'type': 'ephemeral'},
                }
            ],
            messages=[
                {
                    'role': 'user',
                    'content': (
                        'Analyze the following CV and return the scored review. '
                        'CV data as JSON:\n\n'
                        + json.dumps(payload, ensure_ascii=False, indent=2)
                    ),
                }
            ],
            output_config={'format': _CLAUDE_OUTPUT_SCHEMA},
        )

        parsed = _extract_structured_output(response)
        score = int(parsed.get('score', 0))
        score = max(0, min(100, score))

        usage = getattr(response, 'usage', None)
        raw = {
            'provider': self.name,
            'model': self._model,
            'stop_reason': getattr(response, 'stop_reason', None),
            'usage': {
                'input_tokens': getattr(usage, 'input_tokens', None),
                'output_tokens': getattr(usage, 'output_tokens', None),
                'cache_read_input_tokens': getattr(
                    usage, 'cache_read_input_tokens', None
                ),
                'cache_creation_input_tokens': getattr(
                    usage, 'cache_creation_input_tokens', None
                ),
            } if usage else {},
        }

        return _AnalysisResult(
            score=score,
            suggestions=list(parsed.get('suggestions', [])),
            strengths=list(parsed.get('strengths', [])),
            weaknesses=list(parsed.get('weaknesses', [])),
            raw=raw,
        )


def _extract_structured_output(response) -> Dict[str, Any]:
    """Pull the JSON payload out of a structured-output Messages response."""
    for block in getattr(response, 'content', []) or []:
        btype = getattr(block, 'type', None)
        if btype == 'output_json':
            data = getattr(block, 'output', None) or getattr(block, 'json', None)
            if isinstance(data, dict):
                return data
        if btype == 'text':
            text = getattr(block, 'text', '') or ''
            try:
                return json.loads(text)
            except (ValueError, TypeError):
                continue
    raise RuntimeError('Claude response did not contain parseable JSON output')


def _provider():
    name = getattr(settings, 'CV_ANALYSIS_PROVIDER', 'rule-based')
    if name == 'rule-based':
        return RuleBasedProvider()
    if name == 'claude':
        api_key = getattr(settings, 'ANTHROPIC_API_KEY', '') or ''
        if not api_key:
            logger.warning(
                'CV_ANALYSIS_PROVIDER=claude but ANTHROPIC_API_KEY is empty; '
                'falling back to rule-based provider.'
            )
            return RuleBasedProvider()
        model = getattr(settings, 'CV_ANALYSIS_MODEL', 'claude-haiku-4-5')
        return ClaudeProvider(api_key=api_key, model=model)
    raise NotImplementedError(f'Unknown CV_ANALYSIS_PROVIDER: {name}')


# ---- Public entry point ------------------------------------------------------

@transaction.atomic
def analyze(cv: StudentCv) -> CvAiAnalysis:
    payload = _serialize_for_analysis(cv)
    result = _provider().analyze(payload)

    analysis = CvAiAnalysis.objects.create(
        student_cv=cv,
        score=result.score,
        suggestions_json=result.suggestions,
        strengths_json=result.strengths,
        weaknesses_json=result.weaknesses,
        raw_response_json=result.raw,
        provider=result.raw.get('provider', ''),
    )

    cv.current_score = result.score
    cv.last_analyzed_at = timezone.now()
    cv.save(update_fields=['current_score', 'last_analyzed_at', 'updated_at'])

    return analysis
