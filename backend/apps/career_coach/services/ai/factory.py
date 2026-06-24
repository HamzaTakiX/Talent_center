"""AI provider factory — single switch point for provider selection."""

from __future__ import annotations

from django.conf import settings

from .base import AIProvider
from .ollama_provider import OllamaProvider
from .stub_providers import AzureOpenAIProvider, DeepSeekProvider, GeminiProvider, OpenAIProvider

_PROVIDERS: dict[str, type[AIProvider]] = {
    'ollama': OllamaProvider,
    'openai': OpenAIProvider,
    'gemini': GeminiProvider,
    'azure_openai': AzureOpenAIProvider,
    'deepseek': DeepSeekProvider,
}

_instance: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    global _instance
    if _instance is not None:
        return _instance
    provider_name = getattr(settings, 'CAREER_COACH_PROVIDER', 'ollama').lower()
    cls = _PROVIDERS.get(provider_name, OllamaProvider)
    _instance = cls()
    return _instance


def get_provider_config() -> dict:
    from django.conf import settings

    provider = get_ai_provider()
    running = provider.is_available()
    installed: list[str] = []
    if running and hasattr(provider, '_list_models'):
        installed = provider._list_models()  # noqa: SLF001

    primary = getattr(settings, 'OLLAMA_MODEL', 'qwen3:8b')

    def _has_model(name: str) -> bool:
        return any(name in m or m.startswith(name) for m in installed)

    models_ready = running and (_has_model(primary) or len(installed) > 0)

    return {
        'provider': provider.name,
        'available': models_ready,
        'ollama_running': running,
        'models_ready': models_ready,
        'installed_models': installed,
        'model': primary,
        'fallback_model': getattr(settings, 'OLLAMA_FALLBACK_MODEL', 'llama3.1:8b'),
        'embedding_model': getattr(settings, 'CAREER_COACH_EMBEDDING_MODEL', 'bge-m3'),
        'rag_enabled': getattr(settings, 'CAREER_COACH_RAG_ENABLED', True),
    }
