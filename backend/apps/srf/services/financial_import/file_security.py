"""File security checks for financial imports."""

from __future__ import annotations

import hashlib
import re
from typing import Any

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB
MAX_IMPORT_ROWS = 10_000
CHUNK_SIZE = 500

ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.json'}
ALLOWED_MIME_PREFIXES = (
    'text/csv',
    'text/plain',
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream',
)

DANGEROUS_SIGNATURES = (
    b'MZ',  # PE executable
    b'\x7fELF',
    b'%PDF',
    b'PK\x03\x04',  # zip — xlsx is zip but validated by extension
)


def compute_sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def validate_upload(*, content: bytes, filename: str, content_type: str = '') -> dict[str, Any]:
    """Validate file before parsing. Raises ValueError on rejection."""
    lower = (filename or '').lower()
    if not any(lower.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise ValueError(
            'Format non autorisé. Utilisez CSV, Excel (.xlsx) ou JSON structuré.'
        )

    if len(content) == 0:
        raise ValueError('Le fichier est vide.')

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f'Fichier trop volumineux (max {MAX_FILE_SIZE_BYTES // (1024 * 1024)} Mo).')

    if content_type and not any(
        content_type.startswith(p) for p in ALLOWED_MIME_PREFIXES
    ):
        pass  # extension check is primary; MIME is advisory

    head = content[:8]
    if lower.endswith('.csv') or lower.endswith('.json'):
        if head.startswith(b'MZ') or head.startswith(b'\x7fELF'):
            raise ValueError('Fichier rejeté : signature binaire suspecte.')

    if lower.endswith('.csv'):
        sample = content[:4096].decode('utf-8', errors='ignore')
        if re.search(r'<script|javascript:', sample, re.I):
            raise ValueError('Fichier rejeté : contenu potentiellement dangereux.')

    if lower.endswith('.xlsx'):
        if not content.startswith(b'PK'):
            raise ValueError('Fichier Excel invalide ou corrompu.')

    return {
        'checksum_sha256': compute_sha256(content),
        'size_bytes': len(content),
        'filename': filename,
    }


def detect_file_format(filename: str) -> str:
    lower = filename.lower()
    if lower.endswith('.csv'):
        return 'CSV'
    if lower.endswith('.xlsx'):
        return 'XLSX'
    if lower.endswith('.json'):
        return 'JSON'
    return 'OTHER'
