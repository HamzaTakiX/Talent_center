"""Premium section-aware CV analysis for the QuickCV builder."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from django.conf import settings
from django.contrib.auth import get_user_model

from .builder_analysis_messages import SUPPORTED_LANGS, msg, normalize_lang
from .builder_career_coach import build_student_career_context, run_career_coach_analysis
from .builder_validation import validate_builder_payload

logger = logging.getLogger(__name__)
User = get_user_model()

SECTION_IDS = (
    'profile_summary',
    'contact',
    'experience',
    'education',
    'skills',
    'languages',
    'projects',
)


@dataclass
class BuilderAnalysisResult:
    provider: str
    overview: Dict[str, Any]
    sections: List[Dict[str, Any]]
    raw: Dict[str, Any]


@dataclass
class MultilingualBuilderAnalysis:
    """API bundle: three locale slices (fr / en / ar). Field is ``by_locale`` to avoid
    clashing with Django/DRF helpers named ``localized`` on some runtimes."""

    provider: str
    by_locale: Dict[str, Dict[str, Any]]
    raw: Dict[str, Any]

    def to_api_dict(self) -> Dict[str, Any]:
        return {
            'provider': self.provider,
            'localized': self.by_locale,
            'raw': self.raw,
        }


def get_analysis_config() -> Dict[str, Any]:
    provider = getattr(settings, 'CV_ANALYSIS_PROVIDER', 'rule-based')
    api_key = (getattr(settings, 'ANTHROPIC_API_KEY', '') or '').strip()
    model = getattr(settings, 'CV_ANALYSIS_MODEL', 'claude-haiku-4-5')
    ready = provider == 'rule-based' or (provider == 'claude' and bool(api_key))
    return {
        'provider': provider,
        'model': model if provider == 'claude' else None,
        'ai_available': ready,
        'requires_api_key': provider == 'claude' and not api_key,
    }


def _student_context(user) -> Dict[str, Any]:
    return build_student_career_context(user)


def _resolve_provider():
    name = getattr(settings, 'CV_ANALYSIS_PROVIDER', 'rule-based')
    if name == 'rule-based':
        return 'rule-based', None
    if name == 'claude':
        api_key = (getattr(settings, 'ANTHROPIC_API_KEY', '') or '').strip()
        if not api_key:
            return 'unconfigured', None
        model = getattr(settings, 'CV_ANALYSIS_MODEL', 'claude-haiku-4-5')
        return 'claude', (api_key, model)
    raise RuntimeError(f'Unknown CV_ANALYSIS_PROVIDER: {name}')


_PREMIUM_RUBRIC = """You are an ESCA career coach and internship recruiter mentor.

Use the student's academic context (program, filière, sector, internship type, \
specialization domains, career objective) from the payload. Behave like a smart coach \
for THEIR field (finance, marketing, HR, audit, supply chain, international business, \
digital, tech, general management) — not a generic ATS keyword bot.

NEVER comment on trivial presence (email listed, phone visible, name added).
NEVER repeat the same advice in every section (especially quantified metrics or keyword stuffing).

Focus on:
- missing portfolio / LinkedIn / certifications when relevant to the field
- weak specialization alignment and missing field tools
- weak practical exposure vs theory-heavy CVs
- project gaps, extracurricular alternatives, leadership/communication signals
- internship-type alignment

Per section (profile_summary, experience, education, skills, languages, projects): \
0–2 badges max. severity: success | warning | info.
Messages: concrete, human, career-oriented, actionable. Respond in the language code given.
Do not output a contact section.

Overview recommendations: max 5 diverse coaching tips, not repetitive ATS phrases.
"""


_PREMIUM_SCHEMA = {
    'type': 'json_schema',
    'schema': {
        'type': 'object',
        'additionalProperties': False,
        'required': ['overview', 'sections'],
        'properties': {
            'overview': {
                'type': 'object',
                'additionalProperties': False,
                'required': [
                    'overall_score',
                    'ats_score',
                    'strongest_section',
                    'weakest_section',
                    'internship_readiness',
                    'recruiter_attractiveness',
                    'missing_sections',
                    'keyword_coverage',
                    'strengths',
                    'weaknesses',
                    'recommendations',
                ],
                'properties': {
                    'overall_score': {'type': 'integer', 'minimum': 0, 'maximum': 100},
                    'ats_score': {'type': 'integer', 'minimum': 0, 'maximum': 100},
                    'strongest_section': {'type': 'string'},
                    'weakest_section': {'type': 'string'},
                    'internship_readiness': {'type': 'string'},
                    'recruiter_attractiveness': {'type': 'string'},
                    'missing_sections': {
                        'type': 'array',
                        'items': {'type': 'string'},
                    },
                    'keyword_coverage': {'type': 'string'},
                    'strengths': {
                        'type': 'array',
                        'maxItems': 5,
                        'items': {'type': 'string'},
                    },
                    'weaknesses': {
                        'type': 'array',
                        'maxItems': 5,
                        'items': {'type': 'string'},
                    },
                    'recommendations': {
                        'type': 'array',
                        'maxItems': 6,
                        'items': {'type': 'string'},
                    },
                },
            },
            'sections': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'additionalProperties': False,
                    'required': ['section_id', 'badges'],
                    'properties': {
                        'section_id': {
                            'type': 'string',
                            'enum': list(SECTION_IDS),
                        },
                        'section_score': {
                            'type': 'integer',
                            'minimum': 0,
                            'maximum': 100,
                        },
                        'badges': {
                            'type': 'array',
                            'maxItems': 5,
                            'items': {
                                'type': 'object',
                                'additionalProperties': False,
                                'required': ['severity', 'message'],
                                'properties': {
                                    'severity': {
                                        'enum': ['success', 'warning', 'info'],
                                    },
                                    'message': {'type': 'string'},
                                    'detail': {'type': 'string'},
                                },
                            },
                        },
                    },
                },
            },
        },
    },
}


def _extract_structured_output(response) -> Dict[str, Any]:
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


class _ClaudePremiumProvider:
    def __init__(self, api_key: str, model: str):
        try:
            from anthropic import Anthropic
        except ImportError as e:
            raise RuntimeError(
                'anthropic package is not installed. Run: pip install anthropic'
            ) from e
        self._client = Anthropic(api_key=api_key)
        self._model = model

    def analyze(
        self,
        payload: Dict[str, Any],
        context: Dict[str, Any],
        lang: str,
    ) -> BuilderAnalysisResult:
        response = self._client.messages.create(
            model=self._model,
            max_tokens=4096,
            system=[
                {
                    'type': 'text',
                    'text': _PREMIUM_RUBRIC,
                    'cache_control': {'type': 'ephemeral'},
                }
            ],
            messages=[
                {
                    'role': 'user',
                    'content': (
                        f'Respond with insights in language code: {lang}.\n'
                        f'Act as ESCA career coach — specialization-aware, practical, not ATS-spam.\n\n'
                        f'Student academic context:\n'
                        f'{json.dumps(context, ensure_ascii=False, indent=2)}\n\n'
                        f'CV builder data:\n'
                        f'{json.dumps(payload, ensure_ascii=False, indent=2)}'
                    ),
                }
            ],
            output_config={'format': _PREMIUM_SCHEMA},
        )
        parsed = _extract_structured_output(response)
        usage = getattr(response, 'usage', None)
        raw = {
            'provider': 'claude',
            'model': self._model,
            'usage': {
                'input_tokens': getattr(usage, 'input_tokens', None),
                'output_tokens': getattr(usage, 'output_tokens', None),
            } if usage else {},
        }
        return BuilderAnalysisResult(
            provider='claude',
            overview=parsed.get('overview', {}),
            sections=list(parsed.get('sections', [])),
            raw=raw,
        )


def _text(value: Any) -> str:
    return (value or '').strip() if isinstance(value, str) else ''


class _RuleBasedPremiumProvider:
    """Career-coach analysis — specialization-aware, ESCA context driven."""

    name = 'rule-based'

    def analyze(
        self,
        payload: Dict[str, Any],
        context: Dict[str, Any],
        lang: str,
    ) -> BuilderAnalysisResult:
        parsed = run_career_coach_analysis(payload, context, lang)
        return BuilderAnalysisResult(
            provider='rule-based',
            overview=parsed['overview'],
            sections=parsed['sections'],
            raw={
                'provider': 'rule-based',
                'career_coach': True,
                'field_profile': context.get('field_profile'),
                'specialization_domains': context.get('specialization_domains', []),
            },
        )


def _result_to_payload(result: BuilderAnalysisResult) -> Dict[str, Any]:
    return {
        'overview': result.overview,
        'sections': result.sections,
    }


def analyze_builder(
    *,
    user,
    payload: Dict[str, Any],
    lang: str = 'fr',
) -> MultilingualBuilderAnalysis:
    del lang  # always return fr, en, ar
    is_valid, issues = validate_builder_payload(payload)
    if not is_valid:
        raise ValueError(json.dumps({'validation_issues': issues}))

    provider_name, creds = _resolve_provider()
    if provider_name == 'unconfigured':
        raise RuntimeError(
            'AI analysis is not configured. Set CV_ANALYSIS_PROVIDER=claude and '
            'ANTHROPIC_API_KEY in your backend environment (.env).'
        )

    context = _student_context(user)
    if provider_name == 'claude':
        api_key, model = creds
        provider = _ClaudePremiumProvider(api_key, model)
    else:
        provider = _RuleBasedPremiumProvider()

    by_locale: Dict[str, Dict[str, Any]] = {}
    raw_meta: Dict[str, Any] = {'provider': provider_name, 'languages': list(SUPPORTED_LANGS)}

    for code in SUPPORTED_LANGS:
        single = provider.analyze(payload, context, code)
        processed = _post_process_result(single)
        by_locale[code] = _result_to_payload(processed)
        if code == 'fr':
            raw_meta.update(processed.raw)

    return MultilingualBuilderAnalysis(
        provider=provider_name,
        by_locale=by_locale,
        raw=raw_meta,
    )


def _is_trivial_message(message: str) -> bool:
    m = (message or '').lower()
    trivial_fragments = (
        'email contact',
        'phone number',
        'phone visible',
        'title is present',
        'title present',
        'linkedin',
        'listed.',
        'visible.',
        'add credibility',
        'academic foundation',
        'multinational recruiters',
        'beyond coursework',
        'ats parsing',
        'quantified achievements',
        'measurable impact',
        'keyword alignment',
        'mirror ',
        'denser in summary',
    )
    return any(frag in m for frag in trivial_fragments)


def _post_process_result(result: BuilderAnalysisResult) -> BuilderAnalysisResult:
    sections = []
    for sec in result.sections:
        if sec.get('section_id') == 'contact':
            continue
        badges = [
            b for b in sec.get('badges', [])
            if not _is_trivial_message(b.get('message', ''))
        ][:2]
        if badges:
            sections.append({**sec, 'badges': badges})

    overview = dict(result.overview)
    overview['strengths'] = [s for s in overview.get('strengths', []) if not _is_trivial_message(s)]
    overview['weaknesses'] = [w for w in overview.get('weaknesses', []) if not _is_trivial_message(w)]
    overview['recommendations'] = [
        r for r in overview.get('recommendations', []) if not _is_trivial_message(r)
    ]

    return BuilderAnalysisResult(
        provider=result.provider,
        overview=overview,
        sections=sections,
        raw=result.raw,
    )
