"""Rich HTML email preview for admin announcement detail."""

from __future__ import annotations

import html
import re
from datetime import datetime

import bleach
from django.utils import timezone

from apps.announcements.models import Announcement, AnnouncementAttachment

ALLOWED_BODY_TAGS = [
    'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3',
    'hr', 'i', 'li', 'ol', 'p', 'span', 'strong', 'table', 'tbody', 'td', 'th',
    'thead', 'tr', 'ul',
]
ALLOWED_BODY_ATTRS = {'a': ['href', 'title', 'style'], '*': ['style', 'class']}

LABELS = {
    'fr': {
        'summary': 'Résumé',
        'content': 'Contenu',
        'deadline': 'Date limite',
        'external_link': 'Lien externe',
        'attachments': 'Pièces jointes',
        'company': 'Entreprise',
        'type': 'Type',
    },
    'en': {
        'summary': 'Summary',
        'content': 'Content',
        'deadline': 'Application deadline',
        'external_link': 'External link',
        'attachments': 'Attachments',
        'company': 'Company',
        'type': 'Type',
    },
    'ar': {
        'summary': 'الملخص',
        'content': 'المحتوى',
        'deadline': 'الموعد النهائي',
        'external_link': 'رابط خارجي',
        'attachments': 'المرفقات',
        'company': 'الشركة',
        'type': 'النوع',
    },
}


def _looks_like_html(text: str) -> bool:
    return bool(re.search(r'<\/?[a-z][\s\S]*>', text, re.I))


def _cover_url(announcement: Announcement, request) -> str | None:
    if not announcement.cover_image:
        return None
    if request:
        return request.build_absolute_uri(announcement.cover_image.url)
    return announcement.cover_image.url


def _attachment_url(attachment: AnnouncementAttachment, request) -> str | None:
    if attachment.file:
        if request:
            return request.build_absolute_uri(attachment.file.url)
        return attachment.file.url
    return attachment.external_url or None


def _format_date(value: datetime | None, language: str) -> str:
    if not value:
        return '—'
    locale = 'fr-FR' if language == 'fr' else 'en-GB' if language == 'en' else 'ar-MA'
    try:
        local = timezone.localtime(value) if timezone.is_aware(value) else value
        return local.strftime('%d %b %Y') if language != 'ar' else local.strftime('%Y-%m-%d')
    except Exception:
        return str(value)


def _type_name(announcement: Announcement, language: str) -> str:
    ann_type = announcement.announcement_type
    if not ann_type:
        return ''
    i18n = ann_type.name_i18n or {}
    return i18n.get(language) or i18n.get('fr') or ann_type.name or ann_type.code


def build_announcement_email_preview_html(
    announcement: Announcement,
    request,
    language: str = 'fr',
) -> str:
    labels = LABELS.get(language, LABELS['fr'])
    parts: list[str] = [
        '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">',
    ]

    cover = _cover_url(announcement, request)
    if cover:
        parts.append(
            f'<img src="{html.escape(cover)}" alt="" '
            'style="display:block;width:100%;max-height:220px;object-fit:cover;'
            'border-radius:10px;margin:0 0 18px;" />'
        )

    parts.append(
        f'<h2 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#111827;">'
        f'{html.escape(announcement.title)}</h2>'
    )

    meta: list[str] = []
    type_name = _type_name(announcement, language)
    if type_name:
        meta.append(
            f'<span style="display:inline-block;padding:2px 10px;border-radius:999px;'
            f'background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:600;">'
            f'{html.escape(type_name)}</span>'
        )
    if announcement.company_name:
        meta.append(
            f'<span style="font-size:13px;color:#4b5563;">'
            f'<strong>{html.escape(labels["company"])}:</strong> '
            f'{html.escape(announcement.company_name)}</span>'
        )
    if meta:
        parts.append(
            f'<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 14px;">'
            f'{"".join(meta)}</div>'
        )

    if announcement.summary:
        parts.append(
            f'<p style="margin:0 0 14px;font-size:15px;color:#374151;">'
            f'<strong>{html.escape(labels["summary"])}:</strong> '
            f'{html.escape(announcement.summary)}</p>'
        )

    body = (announcement.body or '').strip()
    if body:
        parts.append(
            '<div style="margin:0 0 14px;font-size:14px;color:#374151;">'
            f'<p style="margin:0 0 8px;font-weight:700;color:#111827;">{html.escape(labels["content"])}</p>'
        )
        if _looks_like_html(body):
            cleaned = bleach.clean(
                body,
                tags=ALLOWED_BODY_TAGS,
                attributes=ALLOWED_BODY_ATTRS,
                strip=True,
            )
            parts.append(cleaned)
        else:
            for line in body.splitlines():
                line = line.strip()
                if line:
                    parts.append(f'<p style="margin:0 0 8px;">{html.escape(line)}</p>')
        parts.append('</div>')

    if announcement.application_deadline:
        parts.append(
            f'<p style="margin:0 0 12px;font-size:13px;color:#6b7280;">'
            f'<strong>{html.escape(labels["deadline"])}:</strong> '
            f'{html.escape(_format_date(announcement.application_deadline, language))}</p>'
        )

    if announcement.external_link:
        safe_link = html.escape(announcement.external_link, quote=True)
        parts.append(
            f'<p style="margin:0 0 14px;font-size:14px;">'
            f'<a href="{safe_link}" style="color:#2563eb;font-weight:600;">'
            f'{html.escape(labels["external_link"])}</a></p>'
        )

    attachments = list(announcement.attachments.all())
    # Attachments are rendered in the admin email preview chrome (Gmail-style cards).

    parts.append('</div>')
    return ''.join(parts)
