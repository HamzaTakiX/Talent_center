"""Post-process assistant text for clean chat display."""

from __future__ import annotations

import re

_BOLD = re.compile(r'\*\*(.+?)\*\*')
_ITALIC = re.compile(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)')
_CODE = re.compile(r'`([^`]+)`')
_STRAY_MARKERS = re.compile(r'\*{1,2}')


def sanitize_assistant_text(text: str) -> str:
    """Remove markdown markers while keeping readable plain text."""
    if not text:
        return ''
    cleaned = _BOLD.sub(r'\1', text)
    cleaned = _ITALIC.sub(r'\1', cleaned)
    cleaned = _CODE.sub(r'\1', cleaned)
    cleaned = _STRAY_MARKERS.sub('', cleaned)
    return cleaned.strip()
