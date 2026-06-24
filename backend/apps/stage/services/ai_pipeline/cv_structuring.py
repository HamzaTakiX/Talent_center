"""Structure raw CV text into profile fields via GPT-4o Mini."""

from __future__ import annotations

import json
import logging
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)

_CV_SCHEMA_HINT = """
Return JSON with these keys:
- full_name (string)
- email (string)
- phone (string)
- professional_summary (string)
- career_objective (string)
- skills (array of strings)
- education (array of short strings)
- experience (array of short strings)
- languages (array of strings)
Use empty strings/arrays when unknown. Skills must be concise technical or soft skills.
"""


def structure_cv_text(raw_text: str) -> dict[str, Any]:
    api_key = getattr(settings, 'OPENAI_API_KEY', '')
    if not api_key:
        raise RuntimeError('OPENAI_API_KEY is not configured')

    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError(
            'openai package is not installed. Run: pip install openai'
        ) from exc

    model = getattr(settings, 'OPENAI_CV_MODEL', 'gpt-4o-mini')
    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model=model,
        temperature=0.1,
        response_format={'type': 'json_object'},
        messages=[
            {
                'role': 'system',
                'content': (
                    'You extract structured data from CV/resume text for a student '
                    'internship platform. ' + _CV_SCHEMA_HINT
                ),
            },
            {
                'role': 'user',
                'content': raw_text[:120_000],
            },
        ],
    )

    content = response.choices[0].message.content or '{}'
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        logger.warning('GPT CV parse returned invalid JSON')
        parsed = {}

    return {
        'full_name': str(parsed.get('full_name', '')).strip(),
        'email': str(parsed.get('email', '')).strip(),
        'phone': str(parsed.get('phone', '')).strip(),
        'professional_summary': str(parsed.get('professional_summary', '')).strip(),
        'career_objective': str(parsed.get('career_objective', '')).strip(),
        'skills': [str(s).strip() for s in (parsed.get('skills') or []) if str(s).strip()],
        'education': [str(s).strip() for s in (parsed.get('education') or []) if str(s).strip()],
        'experience': [str(s).strip() for s in (parsed.get('experience') or []) if str(s).strip()],
        'languages': [str(s).strip() for s in (parsed.get('languages') or []) if str(s).strip()],
        'provider': 'openai',
        'model': model,
    }
