"""Extract plain text from PDF bytes using PyMuPDF (fitz)."""

from __future__ import annotations


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        import fitz
    except ImportError as exc:
        raise RuntimeError(
            'PyMuPDF is not installed. Run: pip install pymupdf'
        ) from exc

    if not file_bytes:
        return ''

    doc = fitz.open(stream=file_bytes, filetype='pdf')
    try:
        parts: list[str] = []
        for page in doc:
            text = page.get_text('text')
            if text and text.strip():
                parts.append(text.strip())
        return '\n\n'.join(parts)
    finally:
        doc.close()
