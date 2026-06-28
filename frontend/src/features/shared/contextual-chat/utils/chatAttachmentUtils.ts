export type ChatAttachmentKind = 'image' | 'document' | 'archive' | 'video' | 'other';

export interface MessageAttachmentDto {
  id: number;
  attachment_type: 'FILE' | 'IMAGE' | 'VIDEO' | 'AUDIO';
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  file_url: string;
  created_at: string;
}

export interface ChatAttachmentView {
  id: number;
  filename: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  fileUrl: string;
  kind: ChatAttachmentKind;
  attachmentType: MessageAttachmentDto['attachment_type'];
  createdAt: string;
}

export const CHAT_ACCEPTED_FILE_TYPES =
  '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar';

export const CHAT_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const CHAT_MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
export const CHAT_MAX_ARCHIVE_BYTES = 50 * 1024 * 1024;

const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'apk', 'dll', 'js', 'sh', 'msi', 'scr', 'com', 'vbs', 'ps1',
]);

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const DOC_EXT = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']);
const ARCHIVE_EXT = new Set(['zip', 'rar', '7z']);
const VIDEO_EXT = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv']);

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? '') : '';
}

export function classifyChatAttachment(filename: string, mimeType?: string): ChatAttachmentKind {
  const ext = getFileExtension(filename);
  if (IMAGE_EXT.has(ext) || mimeType?.startsWith('image/')) return 'image';
  if (VIDEO_EXT.has(ext) || mimeType?.startsWith('video/')) return 'video';
  if (ARCHIVE_EXT.has(ext)) return 'archive';
  if (DOC_EXT.has(ext)) return 'document';
  return 'other';
}

function maxBytesForKind(kind: ChatAttachmentKind): number {
  if (kind === 'image') return CHAT_MAX_IMAGE_BYTES;
  if (kind === 'archive') return CHAT_MAX_ARCHIVE_BYTES;
  return CHAT_MAX_DOCUMENT_BYTES;
}

export function formatChatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateChatFile(file: File): string | null {
  const ext = getFileExtension(file.name);
  if (!ext) return 'File must have an extension.';
  if (BLOCKED_EXTENSIONS.has(ext)) return `File type ".${ext}" is not allowed.`;
  const kind = classifyChatAttachment(file.name, file.type);
  if (kind === 'other' && !IMAGE_EXT.has(ext) && !DOC_EXT.has(ext) && !ARCHIVE_EXT.has(ext) && !VIDEO_EXT.has(ext)) {
    return `File type ".${ext}" is not supported.`;
  }
  const max = maxBytesForKind(kind);
  if (file.size > max) {
    const label = kind === 'image' ? 'Images' : kind === 'archive' ? 'Archives' : 'Documents';
    return `${label} must be under ${formatChatFileSize(max)}.`;
  }
  if (file.size <= 0) return 'File is empty.';
  return null;
}

export function validateChatFiles(files: File[]): string | null {
  if (files.length > 10) return 'Maximum 10 files per message.';
  for (const file of files) {
    const err = validateChatFile(file);
    if (err) return err;
  }
  return null;
}

/** True when body is only the auto-generated attachment caption (not user-typed text). */
export function isAttachmentOnlyCaption(
  text: string,
  attachments?: ChatAttachmentView[],
): boolean {
  if (!attachments?.length) return false;
  const trimmed = text.trim();
  if (!trimmed) return true;

  return attachments.some((att) => {
    const name = att.filename.trim();
    return (
      trimmed === name ||
      trimmed === `📎 ${name}` ||
      trimmed === `📎${name}`
    );
  });
}

/** Text to show in the message bubble; null when attachments carry the content. */
export function resolveChatMessageBubbleText(
  text: string,
  attachments?: ChatAttachmentView[],
  fallbackFilename?: string,
  messageType?: string,
): string | null {
  if (!text?.trim()) return null;
  if (attachments?.length && isAttachmentOnlyCaption(text, attachments)) return null;
  if (fallbackFilename) {
    const trimmed = text.trim();
    const name = fallbackFilename.trim();
    if (trimmed === name || trimmed === `📎 ${name}` || trimmed === `📎${name}`) return null;
  }
  const normalizedType = messageType?.toUpperCase();
  if (
    (normalizedType === 'IMAGE' || normalizedType === 'VIDEO' || normalizedType === 'FILE') &&
    /^📎\s*\S+/.test(text.trim())
  ) {
    return null;
  }
  return text;
}
