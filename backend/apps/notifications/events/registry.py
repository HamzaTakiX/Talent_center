"""Event registry — maps event codes to delivery configuration."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

from apps.notifications.constants import Category, Priority
from apps.notifications.models import NotificationRecipient


@dataclass(frozen=True)
class EventConfig:
    category: str
    priority: str
    template_code: str
    channels: tuple[str, ...]
    resolver: str
    digestible: bool = False
    urgent: bool = False


RESOLVER_NAMES = {
    'internship_admins': 'internship_admins',
    'targeted_students_and_admins': 'targeted_students_and_admins',
    'application_parties': 'application_parties',
    'student_only': 'student_only',
    'finance_admins': 'finance_admins',
    'srf_student_and_admins': 'srf_student_and_admins',
    'document_student': 'document_student',
    'document_admins': 'document_admins',
    'announcement_audience': 'announcement_audience',
    'chat_participants': 'chat_participants',
    'user_from_payload': 'user_from_payload',
    'supervision_parties': 'supervision_parties',
    'actor_only': 'actor_only',
}


EVENT_REGISTRY: dict[str, EventConfig] = {
    # Internship offers
    'internship.offer.created': EventConfig(
        Category.OFFERS, Priority.NORMAL, 'offer_published',
        (NotificationRecipient.Channel.IN_APP,), 'internship_admins',
    ),
    'internship.offer.updated': EventConfig(
        Category.OFFERS, Priority.NORMAL, 'offer_published',
        (NotificationRecipient.Channel.IN_APP,), 'internship_admins',
    ),
    'internship.offer.published': EventConfig(
        Category.OFFERS, Priority.HIGH, 'offer_published',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'targeted_students_and_admins', digestible=True,
    ),
    'internship.offer.closed': EventConfig(
        Category.OFFERS, Priority.NORMAL, 'offer_published',
        (NotificationRecipient.Channel.IN_APP,), 'internship_admins',
    ),
    'internship.offer.expired': EventConfig(
        Category.OFFERS, Priority.NORMAL, 'offer_published',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'internship_admins',
    ),
    'internship.offer.expiring': EventConfig(
        Category.OFFERS, Priority.NORMAL, 'offer_published',
        (NotificationRecipient.Channel.IN_APP,), 'internship_admins',
    ),
    'internship.offer.deadline_reminder': EventConfig(
        Category.OFFERS, Priority.HIGH, 'offer_published',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'internship_admins',
    ),
    # Applications
    'internship.application.submitted': EventConfig(
        Category.APPLICATIONS, Priority.HIGH, 'application_submitted',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'application_parties',
    ),
    'internship.application.shortlisted': EventConfig(
        Category.APPLICATIONS, Priority.HIGH, 'application_submitted',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'student_only',
    ),
    'internship.application.interview': EventConfig(
        Category.APPLICATIONS, Priority.HIGH, 'interview_scheduled',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'student_only',
    ),
    'internship.application.interview_scheduled': EventConfig(
        Category.APPLICATIONS, Priority.HIGH, 'interview_scheduled',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'student_only',
    ),
    'internship.application.accepted': EventConfig(
        Category.APPLICATIONS, Priority.URGENT, 'application_accepted',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'application_parties', urgent=True,
    ),
    'internship.application.rejected': EventConfig(
        Category.APPLICATIONS, Priority.HIGH, 'application_rejected',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'student_only',
    ),
    'internship.application.withdrawn': EventConfig(
        Category.APPLICATIONS, Priority.NORMAL, 'application_submitted',
        (NotificationRecipient.Channel.IN_APP,), 'application_parties',
    ),
    'internship.application.status_changed': EventConfig(
        Category.APPLICATIONS, Priority.HIGH, 'application_submitted',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'application_parties',
    ),
    'internship.internship.started': EventConfig(
        Category.APPLICATIONS, Priority.HIGH, 'internship_started',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'application_parties',
    ),
    'internship.internship.completed': EventConfig(
        Category.APPLICATIONS, Priority.HIGH, 'internship_completed',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'application_parties',
    ),
    'internship.chat.reply': EventConfig(
        Category.CHAT, Priority.HIGH, 'chat_admin_reply',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'student_only',
    ),
    # Documents
    'documents.uploaded': EventConfig(
        Category.DOCUMENTS, Priority.NORMAL, 'document_approved',
        (NotificationRecipient.Channel.IN_APP,), 'document_admins',
    ),
    'documents.approved': EventConfig(
        Category.DOCUMENTS, Priority.HIGH, 'document_approved',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'document_student',
    ),
    'documents.rejected': EventConfig(
        Category.DOCUMENTS, Priority.HIGH, 'document_rejected',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'document_student',
    ),
    # Announcements
    'announcement.published': EventConfig(
        Category.ANNOUNCEMENTS, Priority.NORMAL, 'announcement_published',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'announcement_audience', digestible=True,
    ),
    'announcement.updated': EventConfig(
        Category.ANNOUNCEMENTS, Priority.LOW, 'announcement_published',
        (NotificationRecipient.Channel.IN_APP,), 'announcement_audience',
    ),
    # Chat
    'chat.message.received': EventConfig(
        Category.CHAT, Priority.HIGH, 'chat_new_message',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'chat_participants',
    ),
    'chat.unread.reminder': EventConfig(
        Category.CHAT, Priority.NORMAL, 'chat_reminder',
        (NotificationRecipient.Channel.EMAIL,), 'chat_participants',
    ),
    'chat.urgent': EventConfig(
        Category.CHAT, Priority.URGENT, 'chat_reminder',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'chat_participants', urgent=True,
    ),
    # CV
    'cv.analysis.completed': EventConfig(
        Category.CV_ANALYSIS, Priority.NORMAL, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'student_only', digestible=True,
    ),
    'cv.score.updated': EventConfig(
        Category.CV_ANALYSIS, Priority.LOW, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'student_only', digestible=True,
    ),
    'cv.match.found': EventConfig(
        Category.CV_ANALYSIS, Priority.NORMAL, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'student_only', digestible=True,
    ),
    'cv.missing_skill.detected': EventConfig(
        Category.CV_ANALYSIS, Priority.NORMAL, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'student_only', digestible=True,
    ),
    'cv.interview.recommendation': EventConfig(
        Category.INTERVIEW_SIMULATOR, Priority.NORMAL, 'interview_scheduled',
        (NotificationRecipient.Channel.IN_APP,), 'student_only',
    ),
    # Interview simulator
    'interview.simulation.completed': EventConfig(
        Category.INTERVIEW_SIMULATOR, Priority.NORMAL, 'interview_scheduled',
        (NotificationRecipient.Channel.IN_APP,), 'student_only',
    ),
    # SRF
    'srf.submitted': EventConfig(
        Category.SRF, Priority.HIGH, 'welcome',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'finance_admins',
    ),
    'srf.approved': EventConfig(
        Category.SRF, Priority.HIGH, 'welcome',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'srf_student_and_admins',
    ),
    'srf.rejected': EventConfig(
        Category.SRF, Priority.HIGH, 'welcome',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'srf_student_and_admins',
    ),
    'srf.payment.submitted': EventConfig(
        Category.SRF, Priority.HIGH, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'finance_admins',
    ),
    'srf.risk.alert': EventConfig(
        Category.SRF, Priority.URGENT, 'welcome',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'finance_admins', urgent=True,
    ),
    'srf.installment.overdue': EventConfig(
        Category.SRF, Priority.HIGH, 'welcome',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'srf_student_and_admins',
    ),
    # Students / system
    'student.created': EventConfig(
        Category.SYSTEM, Priority.NORMAL, 'welcome',
        (NotificationRecipient.Channel.EMAIL,), 'user_from_payload',
    ),
    'student.activated': EventConfig(
        Category.SYSTEM, Priority.HIGH, 'welcome',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'user_from_payload',
    ),
    'student.password.reset': EventConfig(
        Category.SYSTEM, Priority.URGENT, 'password_reset',
        (NotificationRecipient.Channel.EMAIL,), 'user_from_payload', urgent=True,
    ),
    # Student intelligence alerts
    'student.intelligence.critical_risk': EventConfig(
        Category.SYSTEM, Priority.URGENT, 'welcome',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'internship_admins', urgent=True,
    ),
    'student.intelligence.engagement_drop': EventConfig(
        Category.SYSTEM, Priority.HIGH, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'internship_admins',
    ),
    'student.intelligence.readiness_drop': EventConfig(
        Category.SYSTEM, Priority.HIGH, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'internship_admins',
    ),
    'student.intelligence.low_placement': EventConfig(
        Category.SYSTEM, Priority.HIGH, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'internship_admins',
    ),
    # Supervision
    'supervisor.assigned': EventConfig(
        Category.SUPERVISION, Priority.HIGH, 'welcome',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'supervision_parties',
    ),
    'supervisor.changed': EventConfig(
        Category.SUPERVISION, Priority.NORMAL, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'supervision_parties',
    ),
    'report.submitted': EventConfig(
        Category.SUPERVISION, Priority.NORMAL, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'supervision_parties',
    ),
    'report.approved': EventConfig(
        Category.SUPERVISION, Priority.NORMAL, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'supervision_parties',
    ),
    'report.escalated': EventConfig(
        Category.SUPERVISION, Priority.URGENT, 'welcome',
        (NotificationRecipient.Channel.IN_APP, NotificationRecipient.Channel.EMAIL),
        'supervision_parties', urgent=True,
    ),
    # Digests (jobs)
    'notification.digest.daily': EventConfig(
        Category.SYSTEM, Priority.LOW, 'weekly_summary',
        (NotificationRecipient.Channel.EMAIL,), 'user_from_payload', digestible=False,
    ),
    'notification.digest.weekly': EventConfig(
        Category.SYSTEM, Priority.LOW, 'weekly_summary',
        (NotificationRecipient.Channel.EMAIL,), 'user_from_payload',
    ),
    'notification.digest.monthly': EventConfig(
        Category.SYSTEM, Priority.LOW, 'monthly_summary',
        (NotificationRecipient.Channel.EMAIL,), 'user_from_payload',
    ),
    # AI Career Coach
    'career_coach.recommendation.available': EventConfig(
        Category.CAREER_COACH, Priority.NORMAL, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'user_from_payload', digestible=True,
    ),
    'career_coach.matching_offer.found': EventConfig(
        Category.CAREER_COACH, Priority.HIGH, 'offer_published',
        (NotificationRecipient.Channel.IN_APP,), 'user_from_payload', digestible=True,
    ),
    'career_coach.cv_analysis.improved': EventConfig(
        Category.CAREER_COACH, Priority.NORMAL, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'user_from_payload',
    ),
    'career_coach.interview.recommendation': EventConfig(
        Category.CAREER_COACH, Priority.NORMAL, 'welcome',
        (NotificationRecipient.Channel.IN_APP,), 'user_from_payload', digestible=True,
    ),
}


def get_event_config(event_code: str) -> EventConfig | None:
    return EVENT_REGISTRY.get(event_code)


def get_default_config(event_code: str) -> EventConfig:
    """Fallback for unregistered events."""
    return EventConfig(
        category=Category.SYSTEM,
        priority=Priority.NORMAL,
        template_code='welcome',
        channels=(NotificationRecipient.Channel.IN_APP,),
        resolver='user_from_payload',
    )
