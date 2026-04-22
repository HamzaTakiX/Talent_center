"""PDF export.

Two paths:

1. **Client-side** (default) — the React editor renders the live DOM to PDF
   with html2canvas + jsPDF. The backend endpoint records ``last_exported_at``
   and returns the structured payload.

2. **Server-side** — ``render_pdf_bytes(cv)`` uses WeasyPrint to render a
   server-generated HTML document to PDF. Triggered via the export endpoint
   with ``{"mode": "server"}``. Requires the ``weasyprint`` package.
"""

from html import escape
from typing import Any, Dict, List

from django.utils import timezone

from ..models import CvSection, StudentCv


def mark_exported(cv: StudentCv) -> StudentCv:
    cv.last_exported_at = timezone.now()
    cv.save(update_fields=['last_exported_at', 'updated_at'])
    return cv


def build_export_payload(cv: StudentCv) -> Dict[str, Any]:
    """Provider-neutral structured payload consumed by the client renderer."""
    return {
        'cv_id': cv.pk,
        'title': cv.title,
        'template': {
            'code': cv.template.code,
            'name': cv.template.name,
            'layout_schema': cv.template.layout_schema,
            'style_schema': cv.template.style_schema,
        },
        'sections': [
            {
                'id': s.id,
                'section_type': s.section_type,
                'label': s.label,
                'is_visible': s.is_visible,
                'slot_name': s.slot_name,
                'config_json': s.config_json,
                'content_json': s.content_json,
            }
            for s in cv.sections.all().order_by('order_index', 'id')
        ],
    }


# ---- Server-side PDF (WeasyPrint) -------------------------------------------

def render_pdf_bytes(cv: StudentCv) -> bytes:
    """Render the CV to PDF bytes via WeasyPrint."""
    try:
        from weasyprint import HTML
    except ImportError as e:
        raise RuntimeError(
            'WeasyPrint is not installed on the server. '
            'Run: pip install weasyprint (and its system dependencies).'
        ) from e

    html = _build_cv_html(cv)
    return HTML(string=html).write_pdf()


def _build_cv_html(cv: StudentCv) -> str:
    style = cv.template.style_schema or {}
    accent = escape(str(style.get('accent_color') or '#2563eb'))
    font_family = escape(str(style.get('font_family') or "'Inter', 'Helvetica', sans-serif"))

    sections_html: List[str] = []
    for section in cv.sections.filter(is_visible=True).order_by('order_index', 'id'):
        rendered = _render_section(section)
        if rendered:
            sections_html.append(rendered)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>{escape(cv.title)}</title>
<style>
  @page {{ size: A4; margin: 18mm 16mm; }}
  * {{ box-sizing: border-box; }}
  html, body {{ margin: 0; padding: 0; font-family: {font_family}; color: #1f2937; font-size: 10.5pt; line-height: 1.45; }}
  h1 {{ font-size: 22pt; margin: 0 0 2pt 0; color: #111827; }}
  h2 {{ font-size: 12pt; margin: 14pt 0 6pt 0; color: {accent}; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1.2pt solid {accent}; padding-bottom: 2pt; }}
  h3 {{ font-size: 11pt; margin: 6pt 0 1pt 0; color: #111827; }}
  p {{ margin: 0 0 4pt 0; }}
  ul {{ margin: 2pt 0 6pt 16pt; padding: 0; }}
  li {{ margin-bottom: 1.5pt; }}
  .sub {{ font-size: 9.5pt; color: #6b7280; margin-bottom: 3pt; }}
  .row {{ display: flex; justify-content: space-between; gap: 12pt; align-items: baseline; }}
  .chips {{ display: flex; flex-wrap: wrap; gap: 4pt; }}
  .chip {{ background: #eef2ff; color: #3730a3; border-radius: 10pt; padding: 1.5pt 8pt; font-size: 9.5pt; }}
  .contact {{ color: #4b5563; font-size: 10pt; margin-top: 2pt; }}
  .contact span + span::before {{ content: " · "; color: #9ca3af; }}
  .muted {{ color: #6b7280; }}
</style>
</head>
<body>
<h1>{escape(cv.title)}</h1>
{''.join(sections_html)}
</body>
</html>
"""


def _render_section(section: CvSection) -> str:
    content = section.content_json or {}
    label = escape(section.label or section.section_type.title())

    # Dispatch by section type; unknown types render as plain text or skip.
    renderer = _SECTION_RENDERERS.get(section.section_type)
    if renderer is None:
        return ''
    body = renderer(content)
    if not body:
        return ''
    # 'header' sections look better without an <h2> title bar.
    if section.section_type == 'header':
        return body
    return f'<section><h2>{label}</h2>{body}</section>'


def _render_header(content: Dict[str, Any]) -> str:
    name = escape(str(content.get('name') or ''))
    headline = escape(str(content.get('headline') or ''))
    location = escape(str(content.get('location') or ''))
    if not (name or headline or location):
        return ''
    parts = []
    if name:
        parts.append(f'<h1 style="margin-bottom:1pt;">{name}</h1>')
    if headline:
        parts.append(f'<div class="sub" style="font-size:11pt;">{headline}</div>')
    if location:
        parts.append(f'<div class="contact"><span>{location}</span></div>')
    return ''.join(parts)


def _render_contact(content: Dict[str, Any]) -> str:
    fields = [
        ('email', content.get('email')),
        ('phone', content.get('phone')),
        ('linkedin', content.get('linkedin')),
        ('website', content.get('website')),
        ('location', content.get('location')),
    ]
    spans = [f'<span>{escape(str(v))}</span>' for _, v in fields if v]
    if not spans:
        return ''
    return f'<div class="contact">{"".join(spans)}</div>'


def _render_summary(content: Dict[str, Any]) -> str:
    text = str(content.get('text') or '').strip()
    if not text:
        return ''
    return f'<p>{escape(text)}</p>'


def _render_experience(content: Dict[str, Any]) -> str:
    items = content.get('items') or []
    if not items:
        return ''
    parts: List[str] = []
    for item in items:
        title = escape(str(item.get('title') or ''))
        company = escape(str(item.get('company') or ''))
        location = escape(str(item.get('location') or ''))
        start = escape(str(item.get('start_date') or ''))
        end = escape(str(item.get('end_date') or 'Present'))
        bullets = item.get('bullets') or []
        head = ' · '.join(filter(None, [company, location]))
        date_range = ' – '.join(filter(None, [start, end])) if (start or end) else ''
        bullets_html = ''.join(f'<li>{escape(str(b))}</li>' for b in bullets if b)
        parts.append(
            f'<div class="row"><h3>{title}</h3><span class="muted">{date_range}</span></div>'
            f'<div class="sub">{head}</div>'
            f'{f"<ul>{bullets_html}</ul>" if bullets_html else ""}'
        )
    return ''.join(parts)


def _render_education(content: Dict[str, Any]) -> str:
    items = content.get('items') or []
    if not items:
        return ''
    parts: List[str] = []
    for item in items:
        degree = escape(str(item.get('degree') or ''))
        school = escape(str(item.get('school') or ''))
        location = escape(str(item.get('location') or ''))
        start = escape(str(item.get('start_date') or ''))
        end = escape(str(item.get('end_date') or ''))
        description = escape(str(item.get('description') or ''))
        head = ' · '.join(filter(None, [school, location]))
        date_range = ' – '.join(filter(None, [start, end])) if (start or end) else ''
        parts.append(
            f'<div class="row"><h3>{degree}</h3><span class="muted">{date_range}</span></div>'
            f'<div class="sub">{head}</div>'
            f'{f"<p>{description}</p>" if description else ""}'
        )
    return ''.join(parts)


def _render_chip_items(content: Dict[str, Any]) -> str:
    items = content.get('items') or []
    if not items:
        return ''
    chips: List[str] = []
    for item in items:
        name = escape(str(item.get('name') or ''))
        if not name:
            continue
        level = item.get('level')
        label = f'{name} — {escape(str(level))}' if level else name
        chips.append(f'<span class="chip">{label}</span>')
    if not chips:
        return ''
    return f'<div class="chips">{"".join(chips)}</div>'


def _render_projects(content: Dict[str, Any]) -> str:
    items = content.get('items') or []
    if not items:
        return ''
    parts: List[str] = []
    for item in items:
        title = escape(str(item.get('title') or item.get('name') or ''))
        role = escape(str(item.get('role') or ''))
        link = escape(str(item.get('link') or item.get('url') or ''))
        description = escape(str(item.get('description') or ''))
        bullets = item.get('bullets') or []
        bullets_html = ''.join(f'<li>{escape(str(b))}</li>' for b in bullets if b)
        link_html = f' · <span class="muted">{link}</span>' if link else ''
        parts.append(
            f'<div class="row"><h3>{title}</h3><span class="muted">{role}</span></div>'
            f'{f"<p>{description}</p>" if description else ""}'
            f'{f"<ul>{bullets_html}</ul>" if bullets_html else ""}'
            f'{f"<div class=\"sub\">{link_html[3:]}</div>" if link_html else ""}'
        )
    return ''.join(parts)


def _render_certifications(content: Dict[str, Any]) -> str:
    items = content.get('items') or []
    if not items:
        return ''
    parts: List[str] = []
    for item in items:
        title = escape(str(item.get('title') or item.get('name') or ''))
        issuer = escape(str(item.get('issuer') or ''))
        date = escape(str(item.get('date') or ''))
        head = ' · '.join(filter(None, [issuer, date]))
        parts.append(f'<div class="row"><h3>{title}</h3><span class="muted">{head}</span></div>')
    return ''.join(parts)


def _render_custom(content: Dict[str, Any]) -> str:
    text = str(content.get('text') or '').strip()
    if text:
        return f'<p>{escape(text)}</p>'
    items = content.get('items') or []
    if items:
        lis = ''.join(f'<li>{escape(str(i))}</li>' for i in items if i)
        return f'<ul>{lis}</ul>' if lis else ''
    return ''


_SECTION_RENDERERS = {
    'header': _render_header,
    'contact': _render_contact,
    'summary': _render_summary,
    'experience': _render_experience,
    'education': _render_education,
    'skills': _render_chip_items,
    'languages': _render_chip_items,
    'projects': _render_projects,
    'certifications': _render_certifications,
    'custom': _render_custom,
}
