"""Validate chat message file uploads (type, size, extension, basic content sniffing)."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import BinaryIO

from django.core.files.uploadedfile import UploadedFile

# Size limits in bytes
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MAX_DOCUMENT_BYTES = 20 * 1024 * 1024
MAX_ARCHIVE_BYTES = 50 * 1024 * 1024

BLOCKED_EXTENSIONS = frozenset({
    'exe', 'bat', 'cmd', 'apk', 'dll', 'js', 'sh', 'msi', 'scr', 'com', 'vbs', 'ps1',
    'jar', 'wsf', 'hta', 'pif', 'cpl', 'inf', 'reg',
})

IMAGE_EXTENSIONS = frozenset({'jpg', 'jpeg', 'png', 'webp', 'gif'})
DOCUMENT_EXTENSIONS = frozenset({'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'})
ARCHIVE_EXTENSIONS = frozenset({'zip', 'rar'})
VIDEO_EXTENSIONS = frozenset({'mp4', 'webm', 'mov', 'avi', 'mkv'})

ALLOWED_EXTENSIONS = IMAGE_EXTENSIONS | DOCUMENT_EXTENSIONS | ARCHIVE_EXTENSIONS | VIDEO_EXTENSIONS

EXTENSION_MIME: dict[str, frozenset[str]] = {
    'jpg': frozenset({'image/jpeg'}),
    'jpeg': frozenset({'image/jpeg'}),
    'png': frozenset({'image/png'}),
    'webp': frozenset({'image/webp'}),
    'gif': frozenset({'image/gif'}),
    'pdf': frozenset({'application/pdf'}),
    'doc': frozenset({'application/msword'}),
    'docx': frozenset({
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip',
    }),
    'xls': frozenset({'application/vnd.ms-excel'}),
    'xlsx': frozenset({
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
    }),
    'ppt': frozenset({'application/vnd.ms-powerpoint'}),
    'pptx': frozenset({
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip',
    }),
    'txt': frozenset({'text/plain', 'application/octet-stream'}),
    'zip': frozenset({'application/zip', 'application/x-zip-compressed'}),
    'rar': frozenset({'application/vnd.rar', 'application/x-rar-compressed', 'application/octet-stream'}),
    'mp4': frozenset({'video/mp4'}),
    'webm': frozenset({'video/webm'}),
    'mov': frozenset({'video/quicktime'}),
    'avi': frozenset({'video/x-msvideo', 'video/avi'}),
    'mkv': frozenset({'video/x-matroska'}),
}

# Magic-byte signatures for content sniffing (prefix, offset)
_SIGNATURES: dict[str, list[tuple[bytes, int]]] = {
    'jpg': [(b'\xff\xd8\xff', 0)],
    'jpeg': [(b'\xff\xd8\xff', 0)],
    'png': [(b'\x89PNG\r\n\x1a\n', 0)],
    'gif': [(b'GIF87a', 0), (b'GIF89a', 0)],
    'webp': [(b'RIFF', 0)],  # RIFF....WEBP
    'pdf': [(b'%PDF', 0)],
    'zip': [(b'PK\x03\x04', 0), (b'PK\x05\x06', 0)],
    'rar': [(b'Rar!\x1a\x07', 0)],
}

_SAFE_FILENAME_RE = re.compile(r'[^a-zA-Z0-9._\- ()\[\]]+')


class AttachmentValidationError(Exception):
    def __init__(self, message: str, code: str = 'invalid_file'):
        super().__init__(message)
        self.code = code
        self.message = message


@dataclass(frozen=True)
class ValidatedUpload:
    file: UploadedFile
    original_filename: str
    extension: str
    mime_type: str
    file_size_bytes: int
    attachment_type: str  # IMAGE | FILE | VIDEO


def _safe_filename(name: str) -> str:
    base = os.path.basename(name or 'file').strip()
    base = _SAFE_FILENAME_RE.sub('_', base)
    return base[:255] or 'file'


def _extension(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext.lstrip('.').lower()


def _category_for_extension(ext: str) -> str:
    if ext in IMAGE_EXTENSIONS:
        return 'image'
    if ext in ARCHIVE_EXTENSIONS:
        return 'archive'
    if ext in VIDEO_EXTENSIONS:
        return 'video'
    return 'document'


def _max_bytes_for_category(category: str) -> int:
    if category == 'image':
        return MAX_IMAGE_BYTES
    if category == 'archive':
        return MAX_ARCHIVE_BYTES
    if category == 'video':
        return MAX_DOCUMENT_BYTES
    return MAX_DOCUMENT_BYTES


def _read_header(upload: UploadedFile, length: int = 16) -> bytes:
    pos = upload.tell() if hasattr(upload, 'tell') else None
    try:
        if hasattr(upload, 'seek'):
            upload.seek(0)
        data = upload.read(length)
        return data or b''
    finally:
        if hasattr(upload, 'seek'):
            upload.seek(0 if pos is None else pos)


def _matches_signature(ext: str, header: bytes) -> bool:
    sigs = _SIGNATURES.get(ext)
    if not sigs:
        return True  # office docs / txt — rely on extension + declared mime
    if ext == 'webp':
        return header.startswith(b'RIFF') and len(header) >= 12 and header[8:12] == b'WEBP'
    return any(header.startswith(sig) for sig, offset in sigs if offset == 0)


def _resolve_attachment_type(ext: str) -> str:
    from ..models import MessageAttachment

    if ext in IMAGE_EXTENSIONS:
        return MessageAttachment.AttachmentType.IMAGE
    if ext in VIDEO_EXTENSIONS:
        return MessageAttachment.AttachmentType.VIDEO
    return MessageAttachment.AttachmentType.FILE


def _format_size_limit(category: str) -> str:
    mb = _max_bytes_for_category(category) // (1024 * 1024)
    return f'{mb} MB'


def validate_chat_upload(upload: UploadedFile) -> ValidatedUpload:
    if not upload:
        raise AttachmentValidationError('No file provided.', 'missing_file')

    original = _safe_filename(getattr(upload, 'name', '') or 'file')
    ext = _extension(original)

    if not ext:
        raise AttachmentValidationError('File must have an extension.', 'missing_extension')
    if ext in BLOCKED_EXTENSIONS:
        raise AttachmentValidationError(f'File type ".{ext}" is not allowed for security reasons.', 'blocked_type')
    if ext not in ALLOWED_EXTENSIONS:
        raise AttachmentValidationError(
            f'File type ".{ext}" is not supported. Allowed: images, documents, archives.',
            'unsupported_type',
        )

    category = _category_for_extension(ext)
    size = int(getattr(upload, 'size', 0) or 0)
    max_bytes = _max_bytes_for_category(category)
    if size <= 0:
        raise AttachmentValidationError('File is empty.', 'empty_file')
    if size > max_bytes:
        raise AttachmentValidationError(
            f'File is too large. Maximum size for {category}s is {_format_size_limit(category)}.',
            'file_too_large',
        )

    declared_mime = (getattr(upload, 'content_type', '') or 'application/octet-stream').split(';')[0].strip().lower()
    allowed_mimes = EXTENSION_MIME.get(ext, frozenset())
    if allowed_mimes and declared_mime not in allowed_mimes and declared_mime != 'application/octet-stream':
        raise AttachmentValidationError(
            f'MIME type "{declared_mime}" does not match extension ".{ext}".',
            'mime_mismatch',
        )

    header = _read_header(upload)
    if header and not _matches_signature(ext, header):
        raise AttachmentValidationError(
            f'File content does not match extension ".{ext}".',
            'content_mismatch',
        )

    mime_type = declared_mime if declared_mime != 'application/octet-stream' else next(iter(allowed_mimes), 'application/octet-stream')

    return ValidatedUpload(
        file=upload,
        original_filename=original,
        extension=ext,
        mime_type=mime_type,
        file_size_bytes=size,
        attachment_type=_resolve_attachment_type(ext),
    )


def validate_chat_uploads(uploads: list[UploadedFile]) -> list[ValidatedUpload]:
    if not uploads:
        return []
    if len(uploads) > 10:
        raise AttachmentValidationError('Maximum 10 files per message.', 'too_many_files')
    return [validate_chat_upload(f) for f in uploads]
