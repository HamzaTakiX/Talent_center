"""Email / SMS / Push provider interfaces."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class EmailResult:
    success: bool
    message_id: str = ''
    error: str = ''
    raw_response: dict[str, Any] | None = None


class EmailProvider(ABC):
    name: str = 'base'

    @abstractmethod
    def send_email(
        self,
        *,
        to: str,
        subject: str,
        body_html: str,
        body_text: str = '',
        template_id: str = '',
        metadata: dict | None = None,
        from_email: str = '',
        from_name: str = '',
        reply_to: str = '',
    ) -> EmailResult:
        ...


class SMSProvider(ABC):
    name: str = 'base'

    @abstractmethod
    def send_sms(self, *, to: str, body: str) -> bool:
        ...


class PushProvider(ABC):
    name: str = 'base'

    @abstractmethod
    def send_push(self, *, user_id: int, title: str, body: str, data: dict) -> bool:
        ...
