"""Ollama provider — primary free development backend (Qwen3 / Llama3.1 fallback)."""

from __future__ import annotations

import json
import logging
import re
import time
from collections.abc import Iterator
from typing import Any

import requests
from django.conf import settings

from .base import AIProvider, ChatMessage, ChatResponse

logger = logging.getLogger(__name__)

_MODELS_CACHE: dict[str, Any] = {'models': [], 'expires': 0.0}
_AVAIL_CACHE: dict[str, Any] = {'ok': False, 'expires': 0.0}
_CACHE_TTL_SEC = 60.0

_THINK_START = '`' + 'think' + '>'
_THINK_END = '</' + 'think' + '>'
_THINK_BLOCK = re.compile(
    re.escape(_THINK_START) + r'[\s\S]*?' + re.escape(_THINK_END),
    re.IGNORECASE,
)


class OllamaProvider(AIProvider):
    name = 'ollama'

    def __init__(
        self,
        base_url: str | None = None,
        model: str | None = None,
        fallback_model: str | None = None,
        embedding_model: str | None = None,
        timeout: int | None = None,
    ):
        self.base_url = (base_url or getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')).rstrip('/')
        self.model = model or getattr(settings, 'OLLAMA_MODEL', 'qwen3:8b')
        self.fallback_model = fallback_model or getattr(settings, 'OLLAMA_FALLBACK_MODEL', 'llama3.1:8b')
        self.embedding_model = embedding_model or getattr(settings, 'CAREER_COACH_EMBEDDING_MODEL', 'bge-m3')
        self.timeout = timeout or getattr(
            settings,
            'CAREER_COACH_CHAT_TIMEOUT',
            getattr(settings, 'OLLAMA_CHAT_TIMEOUT', 60),
        )

    def is_available(self) -> bool:
        now = time.monotonic()
        if now < _AVAIL_CACHE['expires']:
            return bool(_AVAIL_CACHE['ok'])
        try:
            resp = requests.get(f'{self.base_url}/api/tags', timeout=2)
            ok = resp.status_code == 200
        except requests.RequestException:
            ok = False
        _AVAIL_CACHE['ok'] = ok
        _AVAIL_CACHE['expires'] = now + _CACHE_TTL_SEC
        return ok

    def _list_models(self) -> list[str]:
        now = time.monotonic()
        if now < _MODELS_CACHE['expires'] and _MODELS_CACHE['models']:
            return _MODELS_CACHE['models']
        try:
            resp = requests.get(f'{self.base_url}/api/tags', timeout=3)
            resp.raise_for_status()
            models = [m.get('name', '') for m in (resp.json().get('models') or []) if m.get('name')]
        except requests.RequestException:
            models = []
        _MODELS_CACHE['models'] = models
        _MODELS_CACHE['expires'] = now + _CACHE_TTL_SEC
        if models and now >= _AVAIL_CACHE['expires']:
            _AVAIL_CACHE['ok'] = True
            _AVAIL_CACHE['expires'] = now + _CACHE_TTL_SEC
        return models

    def _resolve_model(self, preferred: str) -> str:
        available = self._list_models()
        if not available:
            return preferred
        for candidate in (preferred, self.fallback_model):
            if any(candidate in m or m.startswith(candidate) for m in available):
                return candidate
        return available[0]

    @staticmethod
    def _model_uses_reasoning_tokens(model: str) -> bool:
        lowered = model.lower()
        return 'qwen3' in lowered or ':thinking' in lowered

    def _build_payload(
        self,
        messages: list[ChatMessage],
        *,
        model: str,
        temperature: float,
        system_prompt: str | None,
        stream: bool,
        num_predict: int | None = None,
    ) -> dict[str, Any]:
        ollama_messages: list[dict[str, str]] = []
        if system_prompt:
            ollama_messages.append({'role': 'system', 'content': system_prompt})
        for msg in messages:
            ollama_messages.append({'role': msg.role, 'content': msg.content})
        options: dict[str, Any] = {'temperature': temperature}
        if num_predict is not None:
            options['num_predict'] = num_predict
        payload: dict[str, Any] = {
            'model': model,
            'messages': ollama_messages,
            'stream': stream,
            'options': options,
        }
        # Qwen3 defaults to "thinking" mode and can spend the full token budget
        # in the reasoning field, leaving message.content empty for chat UIs.
        if self._model_uses_reasoning_tokens(model):
            payload['think'] = False
        return payload

    @staticmethod
    def _strip_thinking(content: str) -> str:
        cleaned = _THINK_BLOCK.sub('', content)
        lower = cleaned.lower()
        if _THINK_START.lower() in lower and _THINK_END.lower() in lower:
            cleaned = cleaned.split(_THINK_END, 1)[-1]
        elif _THINK_START.lower() in lower:
            cleaned = ''
        return cleaned.strip()

    def chat(
        self,
        messages: list[ChatMessage],
        *,
        temperature: float = 0.3,
        system_prompt: str | None = None,
        num_predict: int | None = None,
    ) -> ChatResponse:
        model = self._resolve_model(self.model)
        payload = self._build_payload(
            messages,
            model=model,
            temperature=temperature,
            system_prompt=system_prompt,
            stream=False,
            num_predict=num_predict,
        )
        try:
            resp = requests.post(f'{self.base_url}/api/chat', json=payload, timeout=self.timeout)
            resp.raise_for_status()
            message = resp.json().get('message', {})
            content = self._strip_thinking(message.get('content', ''))
            if not content and message.get('thinking'):
                logger.warning(
                    'Ollama model %s returned reasoning-only output (content empty); '
                    'check think=false support',
                    model,
                )
            return ChatResponse(content=content, model=model, provider=self.name)
        except requests.RequestException as exc:
            if model != self.fallback_model:
                logger.warning('Ollama primary model failed, trying fallback: %s', exc)
                fallback = self._resolve_model(self.fallback_model)
                payload = self._build_payload(
                    messages,
                    model=fallback,
                    temperature=temperature,
                    system_prompt=system_prompt,
                    stream=False,
                    num_predict=num_predict,
                )
                resp = requests.post(f'{self.base_url}/api/chat', json=payload, timeout=self.timeout)
                resp.raise_for_status()
                content = self._strip_thinking(resp.json().get('message', {}).get('content', ''))
                return ChatResponse(content=content.strip(), model=fallback, provider=self.name)
            raise

    def chat_stream(
        self,
        messages: list[ChatMessage],
        *,
        temperature: float = 0.3,
        system_prompt: str | None = None,
        num_predict: int | None = None,
    ) -> Iterator[str]:
        model = self._resolve_model(self.model)
        payload = self._build_payload(
            messages,
            model=model,
            temperature=temperature,
            system_prompt=system_prompt,
            stream=True,
            num_predict=num_predict,
        )
        stream_buffer = ''
        try:
            with requests.post(
                f'{self.base_url}/api/chat',
                json=payload,
                timeout=self.timeout,
                stream=True,
            ) as resp:
                resp.raise_for_status()
                for line in resp.iter_lines(decode_unicode=True):
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    token = chunk.get('message', {}).get('content', '')
                    if token:
                        previous = self._strip_thinking(stream_buffer)
                        stream_buffer += token
                        current = self._strip_thinking(stream_buffer)
                        delta = current[len(previous):]
                        if delta:
                            yield delta
                    if chunk.get('done'):
                        break
        except requests.RequestException as exc:
            logger.warning('Ollama stream failed, falling back to single response: %s', exc)
            response = self.chat(
                messages,
                temperature=temperature,
                system_prompt=system_prompt,
                num_predict=num_predict,
            )
            yield response.content

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        model = self._resolve_model(self.embedding_model)
        vectors: list[list[float]] = []
        for text in texts:
            payload = {'model': model, 'prompt': text}
            resp = requests.post(f'{self.base_url}/api/embeddings', json=payload, timeout=60)
            resp.raise_for_status()
            vectors.append(resp.json().get('embedding', []))
        return vectors
