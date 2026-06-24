"""Provider factory — selects mock vs OpenAI implementations."""

from __future__ import annotations

from django.conf import settings

from apps.stage.integrations import (
    AIMatchingProvider,
    CVParsingProvider,
    MockAIMatchingProvider,
    MockCVParsingProvider,
    MockSemanticSearchProvider,
    SemanticSearchProvider,
)


def get_cv_parsing_provider() -> CVParsingProvider:
    if getattr(settings, 'OPENAI_API_KEY', '') and getattr(settings, 'AI_CV_PARSING_ENABLED', True):
        from apps.stage.integrations.openai_providers import OpenAICVParsingProvider
        return OpenAICVParsingProvider()
    return MockCVParsingProvider()


def get_semantic_search_provider() -> SemanticSearchProvider:
    if getattr(settings, 'OPENAI_API_KEY', '') and getattr(settings, 'AI_SEMANTIC_SEARCH_ENABLED', True):
        from apps.stage.integrations.openai_providers import OpenAISemanticSearchProvider
        return OpenAISemanticSearchProvider()
    return MockSemanticSearchProvider()


def get_ai_matching_provider() -> AIMatchingProvider:
    if getattr(settings, 'OPENAI_API_KEY', '') and getattr(settings, 'AI_MATCHING_ENABLED', True):
        from apps.stage.integrations.openai_providers import OpenAIMatchingProvider
        return OpenAIMatchingProvider()
    return MockAIMatchingProvider()
