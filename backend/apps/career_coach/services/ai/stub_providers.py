"""Stub providers for future cloud migration — implement when API keys are available."""

from __future__ import annotations

import logging

from django.conf import settings

from .base import AIProvider, ChatMessage, ChatResponse

logger = logging.getLogger(__name__)


class _StubProvider(AIProvider):
    def __init__(self, name: str, setting_key: str):
        self.name = name
        self._setting_key = setting_key

    def is_available(self) -> bool:
        return bool(getattr(settings, self._setting_key, ''))

    def chat(
        self,
        messages: list[ChatMessage],
        *,
        temperature: float = 0.3,
        system_prompt: str | None = None,
    ) -> ChatResponse:
        raise NotImplementedError(f'{self.name} provider is not yet implemented')


class OpenAIProvider(_StubProvider):
    def __init__(self):
        super().__init__('openai', 'OPENAI_API_KEY')


class GeminiProvider(_StubProvider):
    def __init__(self):
        super().__init__('gemini', 'GEMINI_API_KEY')


class AzureOpenAIProvider(_StubProvider):
    def __init__(self):
        super().__init__('azure_openai', 'AZURE_OPENAI_API_KEY')


class DeepSeekProvider(_StubProvider):
    def __init__(self):
        super().__init__('deepseek', 'DEEPSEEK_API_KEY')
