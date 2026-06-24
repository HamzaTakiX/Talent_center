"""Abstract AI provider interface — swap Ollama/OpenAI/Gemini without changing business logic."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Iterator
from dataclasses import dataclass
from typing import Any


@dataclass
class ChatMessage:
    role: str
    content: str


@dataclass
class ChatResponse:
    content: str
    model: str
    provider: str
    metadata: dict[str, Any] | None = None


class AIProvider(ABC):
    """Provider-agnostic chat interface."""

    name: str = 'base'

    @abstractmethod
    def is_available(self) -> bool:
        ...

    @abstractmethod
    def chat(
        self,
        messages: list[ChatMessage],
        *,
        temperature: float = 0.3,
        system_prompt: str | None = None,
    ) -> ChatResponse:
        ...

    def chat_stream(
        self,
        messages: list[ChatMessage],
        *,
        temperature: float = 0.3,
        system_prompt: str | None = None,
    ) -> Iterator[str]:
        """Default: non-streaming fallback."""
        response = self.chat(messages, temperature=temperature, system_prompt=system_prompt)
        yield response.content

    def embed(self, texts: list[str]) -> list[list[float]]:
        """Optional embedding support for RAG."""
        raise NotImplementedError(f'{self.name} does not support embeddings')
