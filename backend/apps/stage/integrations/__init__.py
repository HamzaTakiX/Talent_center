"""
External integration interfaces — DO NOT implement real API calls.

Replace mock/placeholder implementations with production integrations
when credentials are available.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class LinkedInJobsAPI(ABC):
    """INTEGRATION POINT: LinkedIn Jobs API / Partner Program."""

    @abstractmethod
    def fetch_job_posting(self, job_id: str) -> dict[str, Any]:
        ...


class IndeedPublisherAPI(ABC):
    """INTEGRATION POINT: Indeed Publisher API."""

    @abstractmethod
    def fetch_job(self, job_key: str) -> dict[str, Any]:
        ...


class EmailNotificationProvider(ABC):
    """INTEGRATION POINT: SendGrid, AWS SES, Mailgun, etc."""

    @abstractmethod
    def send_email(self, *, to: str, subject: str, body: str, template_id: str = '') -> bool:
        ...


class SMSNotificationProvider(ABC):
    """INTEGRATION POINT: Twilio, Infobip, etc."""

    @abstractmethod
    def send_sms(self, *, to: str, body: str) -> bool:
        ...


class PushNotificationProvider(ABC):
    """INTEGRATION POINT: Firebase Cloud Messaging, OneSignal, etc."""

    @abstractmethod
    def send_push(self, *, user_id: int, title: str, body: str, data: dict) -> bool:
        ...


class AIMatchingProvider(ABC):
    """INTEGRATION POINT: LLM-based semantic matching enhancement."""

    @abstractmethod
    def score_semantic_fit(self, student_profile: dict, offer: dict) -> float:
        ...


class AIExtractionProvider(ABC):
    """INTEGRATION POINT: LLM/vision extraction from job posting pages."""

    @abstractmethod
    def extract_from_html(self, html: str, source_url: str) -> dict[str, Any]:
        ...


class CVParsingProvider(ABC):
    """INTEGRATION POINT: Affinda, Sovren, custom NLP pipeline."""

    @abstractmethod
    def parse_cv(self, file_bytes: bytes, filename: str) -> dict[str, Any]:
        ...


class MockLinkedInJobsAPI(LinkedInJobsAPI):
    def fetch_job_posting(self, job_id: str) -> dict[str, Any]:
        return {'id': job_id, 'title': 'Mock LinkedIn Job', 'status': 'mock'}


class MockEmailProvider(EmailNotificationProvider):
    """Deprecated — use apps.notifications.providers.mock.MockEmailProvider."""

    def send_email(self, *, to: str, subject: str, body: str, template_id: str = '') -> bool:
        from apps.notifications.providers.mock import MockEmailProvider as _Mock
        result = _Mock().send_email(
            to=to, subject=subject, body_html=body, body_text=body, template_id=template_id,
        )
        return result.success


class MockSMSProvider(SMSNotificationProvider):
    def send_sms(self, *, to: str, body: str) -> bool:
        return True


class MockPushProvider(PushNotificationProvider):
    def send_push(self, *, user_id: int, title: str, body: str, data: dict) -> bool:
        return True


class MockAIMatchingProvider(AIMatchingProvider):
    def score_semantic_fit(self, student_profile: dict, offer: dict) -> float:
        return 0.0


class MockAIExtractionProvider(AIExtractionProvider):
    def extract_from_html(self, html: str, source_url: str) -> dict[str, Any]:
        return {'title': 'Mock AI extraction', 'source_url': source_url}


class MockCVParsingProvider(CVParsingProvider):
    def parse_cv(self, file_bytes: bytes, filename: str) -> dict[str, Any]:
        return {'skills': [], 'filename': filename, 'mock': True}


class AIRecommendationProvider(ABC):
    """INTEGRATION POINT: LLM-powered personalized offer recommendations."""

    @abstractmethod
    def rank_offers(self, student_profile: dict, offers: list[dict]) -> list[dict]:
        ...


class SemanticSearchProvider(ABC):
    """INTEGRATION POINT: Vector/semantic search over offers and students."""

    @abstractmethod
    def search_offers(self, query: str, limit: int = 20) -> list[dict]:
        ...


class InterviewIntelligenceProvider(ABC):
    """INTEGRATION POINT: Interview Simulator / AI interview analysis."""

    @abstractmethod
    def create_simulator_session(self, application_id: int, config: dict) -> str:
        ...

    @abstractmethod
    def fetch_session_report(self, session_id: str) -> dict[str, Any]:
        ...


class MockAIRecommendationProvider(AIRecommendationProvider):
    def rank_offers(self, student_profile: dict, offers: list[dict]) -> list[dict]:
        return offers


class MockSemanticSearchProvider(SemanticSearchProvider):
    def search_offers(self, query: str, limit: int = 20) -> list[dict]:
        return []


class MockInterviewIntelligenceProvider(InterviewIntelligenceProvider):
    def create_simulator_session(self, application_id: int, config: dict) -> str:
        return f'mock-sim-{application_id}'

    def fetch_session_report(self, session_id: str) -> dict[str, Any]:
        return {'session_id': session_id, 'score': 0, 'mock': True}
