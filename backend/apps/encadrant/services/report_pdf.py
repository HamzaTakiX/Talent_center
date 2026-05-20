"""PDF export for supervision reports."""

from __future__ import annotations

from django.template.loader import render_to_string

from apps.encadrant.services.report_query import serialize_report_detail

_WEASYPRINT_INSTALL_HINT = (
    'WeasyPrint is unavailable. Install weasyprint and its system libraries '
    '(GTK/Pango). On Windows, see: '
    'https://doc.courtbouillon.org/weasyprint/stable/first_steps.html'
)


def _weasyprint_html():
    """Import WeasyPrint only when PDF export runs (avoids startup crash on Windows dev)."""
    try:
        from weasyprint import HTML
    except ImportError as exc:
        raise RuntimeError(_WEASYPRINT_INSTALL_HINT) from exc
    except OSError as exc:
        raise RuntimeError(_WEASYPRINT_INSTALL_HINT) from exc
    return HTML


def render_report_pdf_bytes(report) -> bytes:
    HTML = _weasyprint_html()
    data = serialize_report_detail(report)
    html = render_to_string('encadrant/report_export.html', {'report': data})
    return HTML(string=html).write_pdf()
