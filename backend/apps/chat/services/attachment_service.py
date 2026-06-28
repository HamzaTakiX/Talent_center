"""Create and serve chat message attachments."""

from __future__ import annotations

import mimetypes
import os
from typing import TYPE_CHECKING

from django.http import FileResponse, Http404

from ..models import MessageAttachment
from ..permissions import user_can_access_conversation
from .attachment_validation import AttachmentValidationError, validate_chat_uploads

if TYPE_CHECKING:
    from django.core.files.uploadedfile import UploadedFile

    from apps.accounts_et_roles.models import User

    from ..models import Message


def build_attachment_preview_body(filename: str) -> str:
    return f'📎 {filename}'


def create_message_attachments(message: 'Message', uploads: list['UploadedFile']) -> list[MessageAttachment]:
    validated = validate_chat_uploads(uploads)
    created: list[MessageAttachment] = []
    for item in validated:
        att = MessageAttachment.objects.create(
            message=message,
            file=item.file,
            original_filename=item.original_filename,
            file_size_bytes=item.file_size_bytes,
            mime_type=item.mime_type,
            attachment_type=item.attachment_type,
        )
        created.append(att)
    return created


def resolve_message_type_for_attachments(uploads: list['UploadedFile'], body: str) -> str:
    from ..models import Message

    if body.strip():
        return Message.MessageType.TEXT
    validated = validate_chat_uploads(uploads)
    if not validated:
        return Message.MessageType.TEXT
    types = {v.attachment_type for v in validated}
    if types == {MessageAttachment.AttachmentType.IMAGE}:
        return Message.MessageType.IMAGE
    return Message.MessageType.FILE


def stream_attachment_download(user: 'User', attachment_id: int) -> FileResponse:
    att = (
        MessageAttachment.objects.select_related('message', 'message__conversation')
        .filter(pk=attachment_id)
        .first()
    )
    if not att or not att.file:
        raise Http404('Attachment not found')
    if not user_can_access_conversation(user, att.message.conversation):
        raise Http404('Attachment not found')

    content_type = att.mime_type or mimetypes.guess_type(att.original_filename)[0] or 'application/octet-stream'
    response = FileResponse(att.file.open('rb'), content_type=content_type, as_attachment=True)
    response['Content-Disposition'] = f'attachment; filename="{att.original_filename}"'
    response['Content-Length'] = str(att.file_size_bytes or os.path.getsize(att.file.path))
    return response
