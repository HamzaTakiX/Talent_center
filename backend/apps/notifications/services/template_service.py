"""Template rendering service."""

from __future__ import annotations

from dataclasses import dataclass

import bleach
from django.conf import settings
from django.template import Context, Template
from django.template.loader import render_to_string

from apps.notifications.constants import DEFAULT_LANGUAGE
from apps.notifications.models import NotificationTemplate, NotificationTemplateTranslation


ALLOWED_TAGS = [
    'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3',
    'hr', 'i', 'li', 'ol', 'p', 'span', 'strong', 'table', 'tbody', 'td', 'th',
    'thead', 'tr', 'ul',
]
ALLOWED_ATTRIBUTES = {'a': ['href', 'title', 'style'], '*': ['style', 'class']}


@dataclass
class RenderedNotification:
    subject: str
    body_html: str
    body_text: str
    in_app_title: str
    in_app_body: str
    action_url: str


def _render_string(template_str: str, context: dict) -> str:
    if not template_str:
        return ''
    return Template(template_str).render(Context(context))


def get_template(template_code: str, channel: str) -> NotificationTemplate | None:
    template = NotificationTemplate.objects.filter(
        code=template_code,
        channel=channel,
        is_active=True,
    ).first()
    if not template and channel == 'IN_APP':
        template = NotificationTemplate.objects.filter(
            code=f'{template_code}_in_app',
            channel=channel,
            is_active=True,
        ).first()
    return template


def render_notification(
    *,
    template_code: str,
    channel: str,
    language: str,
    context: dict,
) -> RenderedNotification:
    lang = language if language in ('fr', 'en', 'ar') else DEFAULT_LANGUAGE
    template = get_template(template_code, channel)

    payload = dict(context)
    payload.setdefault('frontend_base_url', getattr(settings, 'FRONTEND_BASE_URL', ''))
    payload.setdefault('platform_name', 'Digital Talent Center')

    if template:
        translation = (
            NotificationTemplateTranslation.objects
            .filter(template=template, language=lang)
            .first()
        )
        if not translation:
            translation = (
                NotificationTemplateTranslation.objects
                .filter(template=template, language=DEFAULT_LANGUAGE)
                .first()
            )
        if translation:
            subject = _render_string(translation.subject_template, payload)
            body_html = _render_string(translation.body_html_template, payload)
            body_text = _render_string(translation.body_text_template, payload)
            in_app_title = _render_string(translation.in_app_title_template, payload)
            in_app_body = _render_string(translation.in_app_body_template, payload)
            action_url = _render_string(template.default_action_url, payload) if template.default_action_url else payload.get('action_url', '')
        elif template.html_file:
            subject = payload.get('title', template.code)
            body_html = render_to_string(template.html_file, payload)
            body_text = payload.get('body', '')
            in_app_title = payload.get('title', '')
            in_app_body = payload.get('body', '')
            action_url = payload.get('action_url', '')
        else:
            subject, body_html, body_text, in_app_title, in_app_body, action_url = _fallback(payload)
    else:
        subject, body_html, body_text, in_app_title, in_app_body, action_url = _fallback(payload)

    body_html = bleach.clean(body_html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)
    return RenderedNotification(
        subject=subject,
        body_html=body_html,
        body_text=body_text,
        in_app_title=in_app_title or payload.get('title', ''),
        in_app_body=in_app_body or payload.get('body', ''),
        action_url=action_url or payload.get('action_url', ''),
    )


def _fallback(payload: dict) -> tuple[str, str, str, str, str, str]:
    title = payload.get('title', 'Notification')
    body = payload.get('body', '')
    return title, f'<p>{body}</p>', body, title, body, payload.get('action_url', '')
