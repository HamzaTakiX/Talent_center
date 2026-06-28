import type { MessageAttachmentDto, MessageDto } from '../types';
import {
  classifyChatAttachment,
  getFileExtension,
  type ChatAttachmentKind,
  type ChatAttachmentView,
} from './chatAttachmentUtils';

export function resolveAttachmentKind(
  filename: string,
  attachmentType: MessageAttachmentDto['attachment_type'],
  mimeType?: string,
): ChatAttachmentKind {
  if (attachmentType === 'IMAGE') return 'image';
  if (attachmentType === 'VIDEO') return 'video';
  return classifyChatAttachment(filename, mimeType);
}

export function isLocalAttachmentDto(dto: MessageAttachmentDto): boolean {
  return dto.id < 0 || dto.file_url.startsWith('blob:');
}

export function isLocalChatAttachment(att: ChatAttachmentView): boolean {
  return att.id < 0 || att.fileUrl.startsWith('blob:');
}

export function resolveOptimisticMessageType(files: File[], trimmedBody: string): string {
  if (!files.length) return 'TEXT';
  if (trimmedBody) return 'TEXT';
  const kind = classifyChatAttachment(files[0].name, files[0].type);
  if (kind === 'image') return 'IMAGE';
  if (kind === 'video') return 'VIDEO';
  return 'FILE';
}

export function buildOptimisticMessageAttachments(files: File[]): MessageAttachmentDto[] {
  const base = Date.now();
  return files.map((file, index) => {
    const kind = classifyChatAttachment(file.name, file.type);
    const attachmentType: MessageAttachmentDto['attachment_type'] =
      kind === 'image' ? 'IMAGE' : kind === 'video' ? 'VIDEO' : 'FILE';

    return {
      id: -(base + index),
      attachment_type: attachmentType,
      original_filename: file.name,
      file_size_bytes: file.size,
      mime_type: file.type || 'application/octet-stream',
      file_url: URL.createObjectURL(file),
      created_at: new Date().toISOString(),
    };
  });
}

export function revokeMessageAttachmentUrls(message: MessageDto | undefined): void {
  if (!message?.attachments?.length) return;
  for (const att of message.attachments) {
    if (isLocalAttachmentDto(att)) {
      URL.revokeObjectURL(att.file_url);
    }
  }
}

export function mapAttachmentDto(dto: MessageAttachmentDto): ChatAttachmentView {
  const filename = dto.original_filename || 'file';
  return {
    id: dto.id,
    filename,
    extension: getFileExtension(filename),
    mimeType: dto.mime_type,
    sizeBytes: dto.file_size_bytes,
    fileUrl: dto.file_url,
    kind: resolveAttachmentKind(filename, dto.attachment_type, dto.mime_type),
    attachmentType: dto.attachment_type,
    createdAt: dto.created_at,
  };
}

export function mapMessageAttachments(dto: MessageDto): ChatAttachmentView[] {
  return (dto.attachments ?? []).map(mapAttachmentDto);
}

export function firstAttachmentName(dto: MessageDto): string | undefined {
  const first = dto.attachments?.[0];
  return first?.original_filename;
}
