import type { AnnouncementAttachmentView } from './announcementDetailViewModel';

export type AttachmentPreviewKind = 'image' | 'pdf' | 'text' | 'document';

const TEXT_MIME_PREFIXES = ['text/', 'application/json', 'application/xml', 'application/javascript'];
const TEXT_EXTENSIONS = ['.txt', '.csv', '.md', '.json', '.xml', '.log', '.yaml', '.yml', '.html', '.htm'];

export function attachmentDisplayName(attachment: AnnouncementAttachmentView): string {
  return attachment.label || attachment.originalFilename || 'file';
}

export function attachmentIsImage(attachment: AnnouncementAttachmentView): boolean {
  const mime = (attachment.mimeType || '').toLowerCase();
  const name = attachmentDisplayName(attachment).toLowerCase();
  return mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(name);
}

export function attachmentIsPdf(attachment: AnnouncementAttachmentView): boolean {
  const mime = (attachment.mimeType || '').toLowerCase();
  const name = attachmentDisplayName(attachment).toLowerCase();
  return mime.includes('pdf') || name.endsWith('.pdf');
}

export function attachmentIsText(attachment: AnnouncementAttachmentView): boolean {
  const mime = (attachment.mimeType || '').toLowerCase();
  const name = attachmentDisplayName(attachment).toLowerCase();
  if (TEXT_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix) || mime.includes(prefix))) {
    return true;
  }
  return TEXT_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function attachmentPreviewKind(attachment: AnnouncementAttachmentView): AttachmentPreviewKind {
  if (attachmentIsImage(attachment)) return 'image';
  if (attachmentIsPdf(attachment)) return 'pdf';
  if (attachmentIsText(attachment)) return 'text';
  return 'document';
}

export function attachmentTypeBadge(
  attachment: AnnouncementAttachmentView,
): { letter: string; tone: 'word' | 'pdf' | 'image' | 'file' } {
  const kind = attachmentPreviewKind(attachment);
  if (kind === 'image') return { letter: 'IMG', tone: 'image' };
  if (kind === 'pdf') return { letter: 'PDF', tone: 'pdf' };
  const name = attachmentDisplayName(attachment).toLowerCase();
  const mime = (attachment.mimeType || '').toLowerCase();
  if (
    mime.includes('word')
    || mime.includes('document')
    || name.endsWith('.doc')
    || name.endsWith('.docx')
  ) {
    return { letter: 'W', tone: 'word' };
  }
  return { letter: 'FILE', tone: 'file' };
}

/** Use Vite /media proxy in dev when the API returns an absolute backend URL. */
export function toProxiedMediaUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.pathname.startsWith('/media/')) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return url;
  }
  return url;
}

export const TEXT_PREVIEW_MAX_CHARS = 480;
