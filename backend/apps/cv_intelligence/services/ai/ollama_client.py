"""Reusable Ollama AI client for local development (budget = 0 DH)."""

from __future__ import annotations

import json
import logging
import threading
import time
from typing import Any

import requests
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

_CONFIG_CACHE_KEY = 'cv_intelligence:ollama_config'
_CONFIG_CACHE_TTL = 120
# Ollama handles one generation efficiently at a time on most dev machines.
_CHAT_LOCK = threading.Lock()


class OllamaClient:
    """HTTP client for Ollama /api/chat with model fallback."""

    def __init__(
        self,
        base_url: str | None = None,
        model: str | None = None,
        fallback_model: str | None = None,
        timeout: int | None = None,
    ):
        self.base_url = (base_url or getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')).rstrip('/')
        self.model = model or getattr(settings, 'OLLAMA_MODEL', 'qwen3:8b')
        self.fallback_model = fallback_model or getattr(settings, 'OLLAMA_FALLBACK_MODEL', 'llama3.1:8b')
        self.timeout = timeout if timeout is not None else getattr(settings, 'OLLAMA_CHAT_TIMEOUT', 60)
        self._cached_model: str | None = None

    def warm_model(self) -> str:
        """Resolve and cache the model name once per analysis run."""
        return self._resolve_model()

    def is_available(self) -> bool:
        try:
            resp = requests.get(f'{self.base_url}/api/tags', timeout=1)
            return resp.status_code == 200
        except requests.RequestException:
            return False

    def list_models(self) -> list[str]:
        try:
            resp = requests.get(f'{self.base_url}/api/tags', timeout=2)
            resp.raise_for_status()
            models = resp.json().get('models') or []
            return [m.get('name', '') for m in models if m.get('name')]
        except requests.RequestException:
            return []

    def _resolve_model(self) -> str:
        if self._cached_model:
            return self._cached_model
        available = self.list_models()
        if not available:
            self._cached_model = self.model
            return self._cached_model
        if any(self.model in m or m.startswith(self.model) for m in available):
            self._cached_model = self.model
            return self._cached_model
        if any(self.fallback_model in m or m.startswith(self.fallback_model) for m in available):
            self._cached_model = self.fallback_model
            return self._cached_model
        self._cached_model = available[0]
        return self._cached_model

    def _post_chat(self, payload: dict[str, Any]) -> dict[str, Any]:
        with _CHAT_LOCK:
            resp = requests.post(
                f'{self.base_url}/api/chat',
                json=payload,
                timeout=self.timeout,
            )
            resp.raise_for_status()
            return resp.json()

    def chat_json(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: float = 0.1,
        max_tokens: int | None = None,
    ) -> tuple[dict[str, Any], str]:
        """Return (parsed_json, model_used). Raises on failure."""
        model = self._resolve_model()
        options: dict[str, Any] = {'temperature': temperature}
        if max_tokens is not None:
            options['num_predict'] = max_tokens
        payload = {
            'model': model,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
            'stream': False,
            'format': 'json',
            'options': options,
        }
        try:
            data = self._post_chat(payload)
            content = data.get('message', {}).get('content', '{}')
            return json.loads(content), model
        except requests.Timeout as exc:
            logger.warning('Ollama timed out after %ss (model=%s)', self.timeout, model)
            raise
        except (requests.RequestException, json.JSONDecodeError) as exc:
            if model != self.fallback_model:
                logger.warning('Ollama primary model failed, trying fallback: %s', exc)
                payload['model'] = self.fallback_model
                try:
                    data = self._post_chat(payload)
                    content = data.get('message', {}).get('content', '{}')
                    return json.loads(content), self.fallback_model
                except requests.Timeout:
                    logger.warning('Ollama fallback timed out after %ss', self.timeout)
                    raise
            raise


def get_ollama_client() -> OllamaClient:
    return OllamaClient()


def get_intelligence_config() -> dict[str, Any]:
    cached = cache.get(_CONFIG_CACHE_KEY)
    if cached is not None:
        return cached

    client = get_ollama_client()
    provider = getattr(settings, 'CV_INTELLIGENCE_PROVIDER', 'ollama')
    ollama_up = client.is_available()
    ready = provider == 'rule-based' or (provider == 'ollama' and ollama_up)
    payload = {
        'provider': provider,
        'model': client.model if ollama_up else None,
        'fallback_model': client.fallback_model,
        'ai_available': ready,
        'ollama_available': ollama_up,
        'available_models': client.list_models() if ollama_up else [],
        'light_ai': getattr(settings, 'CV_INTELLIGENCE_LIGHT_AI', True),
        'cached_at': time.time(),
    }
    cache.set(_CONFIG_CACHE_KEY, payload, _CONFIG_CACHE_TTL)
    return payload
