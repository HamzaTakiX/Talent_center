"""Per-event variable catalog for email templates.

Each email-capable event declares the variables available to its templates.
The admin editor must only expose variables from this catalog for the selected event.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class TemplateVariable:
    key: str
    label: str
    description: str
    sample: str
    required: bool = False


COMMON_USER_VARS = (
    TemplateVariable('user_name', 'User name', 'Recipient display name', 'Amina Benali', True),
    TemplateVariable('user_email', 'User email', 'Recipient email address', 'amina.benali@etu.emsi.ma', True),
    TemplateVariable('platform_name', 'Platform name', 'Product / platform name', 'Digital Talent Center'),
    TemplateVariable('frontend_base_url', 'Frontend base URL', 'Public app base URL', 'https://talent-center.ma'),
    TemplateVariable('action_url', 'Action URL', 'Primary CTA link', 'https://talent-center.ma/app'),
    TemplateVariable('title', 'Title', 'Short notification title', 'Notification'),
    TemplateVariable('body', 'Body', 'Short notification body text', 'You have a new update.'),
)

PASSWORD_RESET_VARS = COMMON_USER_VARS + (
    TemplateVariable('reset_url', 'Reset URL', 'One-time password reset link', 'https://talent-center.ma/reset?token=abc', True),
    TemplateVariable('ttl_minutes', 'TTL minutes', 'Link validity in minutes', '30', True),
)

OFFER_VARS = COMMON_USER_VARS + (
    TemplateVariable('offer_title', 'Offer title', 'Internship offer title', 'Data Analyst Internship'),
    TemplateVariable('company_name', 'Company name', 'Company offering the internship', 'TechCorp'),
    TemplateVariable('deadline', 'Deadline', 'Application deadline', '2026-09-30'),
)

APPLICATION_VARS = COMMON_USER_VARS + (
    TemplateVariable('offer_title', 'Offer title', 'Related internship offer', 'Data Analyst Internship'),
    TemplateVariable('status', 'Status', 'Application status label', 'Submitted'),
    TemplateVariable('student_name', 'Student name', 'Applicant name', 'Amina Benali'),
)

DOCUMENT_VARS = COMMON_USER_VARS + (
    TemplateVariable('document_name', 'Document name', 'Document title', 'Convention de stage'),
    TemplateVariable('reason', 'Reason', 'Rejection or review reason', 'Missing signature'),
)

ANNOUNCEMENT_VARS = COMMON_USER_VARS + (
    TemplateVariable('announcement_title', 'Announcement title', 'Announcement headline', 'Welcome week'),
    TemplateVariable('announcement_body', 'Announcement body', 'Announcement summary', 'Join us on Monday.'),
)

CHAT_VARS = COMMON_USER_VARS + (
    TemplateVariable('sender_name', 'Sender name', 'Message author', 'Admin Support'),
    TemplateVariable('message_preview', 'Message preview', 'Short message excerpt', 'Hello, we reviewed your file.'),
    TemplateVariable('conversation_url', 'Conversation URL', 'Link to the chat thread', 'https://talent-center.ma/chat/1'),
)

SRF_VARS = COMMON_USER_VARS + (
    TemplateVariable('srf_reference', 'SRF reference', 'SRF request reference', 'SRF-2026-0042'),
    TemplateVariable('amount', 'Amount', 'Payment or installment amount', '1500 MAD'),
    TemplateVariable('due_date', 'Due date', 'Payment due date', '2026-10-15'),
)

SUPERVISION_VARS = COMMON_USER_VARS + (
    TemplateVariable('student_name', 'Student name', 'Supervised student', 'Amina Benali'),
    TemplateVariable('supervisor_name', 'Supervisor name', 'Assigned supervisor', 'Prof. Samar Mouchawrab'),
    TemplateVariable('report_title', 'Report title', 'Supervision report title', 'Internship Midterm Report'),
    TemplateVariable('submission_date', 'Submission date', 'Report submission date', '2026-08-20'),
    TemplateVariable('report_url', 'Report URL', 'Link to the report', 'https://talent-center.ma/reports/12'),
    TemplateVariable('note', 'Note', 'Reviewer note or comment', 'Please clarify section 3.'),
)

DIGEST_VARS = COMMON_USER_VARS + (
    TemplateVariable('period_label', 'Period label', 'Digest period description', 'Week of Aug 11'),
    TemplateVariable('item_count', 'Item count', 'Number of items in the digest', '5'),
    TemplateVariable('digest_summary', 'Digest summary', 'HTML or text summary of items', '3 offers, 2 messages'),
)


def _map_many(codes: tuple[str, ...], variables: tuple[TemplateVariable, ...]) -> dict[str, tuple[TemplateVariable, ...]]:
    return {code: variables for code in codes}


EVENT_VARIABLES: dict[str, tuple[TemplateVariable, ...]] = {}
EVENT_VARIABLES.update(_map_many(
    (
        'internship.offer.created', 'internship.offer.updated', 'internship.offer.published',
        'internship.offer.closed', 'internship.offer.expired', 'internship.offer.expiring',
        'internship.offer.deadline_reminder',
    ),
    OFFER_VARS,
))
EVENT_VARIABLES.update(_map_many(
    (
        'internship.application.submitted', 'internship.application.shortlisted',
        'internship.application.interview', 'internship.application.interview_scheduled',
        'internship.application.accepted', 'internship.application.rejected',
        'internship.application.withdrawn', 'internship.application.status_changed',
        'internship.internship.started', 'internship.internship.completed',
    ),
    APPLICATION_VARS,
))
EVENT_VARIABLES.update(_map_many(
    ('documents.uploaded', 'documents.approved', 'documents.rejected'),
    DOCUMENT_VARS,
))
EVENT_VARIABLES.update(_map_many(
    ('announcement.published', 'announcement.updated'),
    ANNOUNCEMENT_VARS,
))
EVENT_VARIABLES.update(_map_many(
    (
        'chat.message.received', 'chat.unread.reminder', 'chat.urgent',
        'chat.conversation.resolved', 'internship.chat.reply',
    ),
    CHAT_VARS,
))
EVENT_VARIABLES.update(_map_many(
    (
        'srf.submitted', 'srf.approved', 'srf.rejected', 'srf.payment.submitted',
        'srf.risk.alert', 'srf.installment.overdue',
    ),
    SRF_VARS,
))
EVENT_VARIABLES.update(_map_many(
    ('student.created', 'student.activated'),
    COMMON_USER_VARS,
))
EVENT_VARIABLES['student.password.reset'] = PASSWORD_RESET_VARS
EVENT_VARIABLES.update(_map_many(
    (
        'student.intelligence.critical_risk', 'student.intelligence.engagement_drop',
        'student.intelligence.readiness_drop', 'student.intelligence.low_placement',
    ),
    COMMON_USER_VARS,
))
EVENT_VARIABLES.update(_map_many(
    (
        'supervisor.assigned', 'supervisor.changed',
        'report.submitted', 'report.approved', 'report.rejected',
        'report.requires_changes', 'report.escalated',
    ),
    SUPERVISION_VARS,
))
EVENT_VARIABLES.update(_map_many(
    (
        'notification.digest.daily', 'notification.digest.weekly', 'notification.digest.monthly',
    ),
    DIGEST_VARS,
))
EVENT_VARIABLES.update(_map_many(
    (
        'cv.analysis.completed', 'cv.score.updated', 'cv.match.found',
        'cv.missing_skill.detected', 'cv.interview.recommendation',
        'interview.simulation.completed', 'interview.simulation.report_available',
        'interview.simulation.score_improved', 'interview.simulation.retry_recommended',
        'career_coach.recommendation.available', 'career_coach.matching_offer.found',
        'career_coach.cv_analysis.improved', 'career_coach.interview.recommendation',
    ),
    COMMON_USER_VARS,
))


def get_event_variables(event_code: str) -> list[dict]:
    variables = EVENT_VARIABLES.get(event_code, COMMON_USER_VARS)
    return [asdict(v) for v in variables]


def get_sample_context(event_code: str) -> dict[str, str]:
    variables = EVENT_VARIABLES.get(event_code, COMMON_USER_VARS)
    return {v.key: v.sample for v in variables}


def extract_template_placeholders(text: str) -> set[str]:
    return set(re.findall(r'\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}', text or ''))


def find_unknown_variables(event_code: str, *texts: str) -> list[str]:
    allowed = {v.key for v in EVENT_VARIABLES.get(event_code, COMMON_USER_VARS)}
    found: set[str] = set()
    for text in texts:
        found |= extract_template_placeholders(text)
    return sorted(found - allowed)
