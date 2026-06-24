"""Extract plain text from PDF using PyMuPDF and pdfplumber."""

from __future__ import annotations


def extract_text_from_pdf(file_bytes: bytes) -> tuple[str, dict]:
    """Return (text, metadata) combining PyMuPDF and pdfplumber extraction."""
    metadata: dict = {'extractors': []}
    if not file_bytes:
        return '', metadata

    pymupdf_text = _extract_pymupdf(file_bytes, metadata)
    plumber_text = _extract_pdfplumber(file_bytes, metadata)

    if len(plumber_text) > len(pymupdf_text) * 1.1:
        return plumber_text, metadata
    if pymupdf_text.strip():
        return pymupdf_text, metadata
    return plumber_text, metadata


def _extract_pymupdf(file_bytes: bytes, metadata: dict) -> str:
    try:
        import fitz
    except ImportError:
        metadata['pymupdf_error'] = 'not_installed'
        return ''

    parts: list[str] = []
    try:
        doc = fitz.open(stream=file_bytes, filetype='pdf')
        try:
            for page in doc:
                text = page.get_text('text')
                if text and text.strip():
                    parts.append(text.strip())
            metadata['extractors'].append('pymupdf')
            metadata['page_count'] = len(doc)
        finally:
            doc.close()
    except Exception as exc:
        metadata['pymupdf_error'] = str(exc)
    return '\n\n'.join(parts)


def _extract_pdfplumber(file_bytes: bytes, metadata: dict) -> str:
    try:
        import io

        import pdfplumber
    except ImportError:
        metadata['pdfplumber_error'] = 'not_installed'
        return ''

    parts: list[str] = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ''
                if text.strip():
                    parts.append(text.strip())
            metadata['extractors'].append('pdfplumber')
    except Exception as exc:
        metadata['pdfplumber_error'] = str(exc)
    return '\n\n'.join(parts)
