"""Deterministic CV content hashing for analysis caching and versioning."""

from __future__ import annotations

import hashlib
import json
from typing import Any


def _normalize_builder_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Strip volatile keys and normalize lists for stable hashing."""

    def _strip(obj: Any) -> Any:
        if isinstance(obj, dict):
            return {k: _strip(v) for k, v in sorted(obj.items()) if not str(k).startswith('_')}
        if isinstance(obj, list):
            return [_strip(item) for item in obj]
        if isinstance(obj, str):
            return obj.strip()
        return obj

    return _strip(payload)


def compute_cv_hash_from_builder(builder_payload: dict[str, Any]) -> str:
    normalized = _normalize_builder_payload(builder_payload)
    canonical = json.dumps(normalized, sort_keys=True, ensure_ascii=False, separators=(',', ':'))
    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()


def compute_cv_hash_from_bytes(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()
