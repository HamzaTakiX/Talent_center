import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  FileSpreadsheet,
  FileText,
  FileType,
  Film,
  ImageIcon,
  Presentation,
} from 'lucide-react';
import type { ChatAttachmentKind } from './chatAttachmentUtils';
import { getFileExtension } from './chatAttachmentUtils';

export type ChatFileAccent =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'ppt'
  | 'text'
  | 'zip'
  | 'image'
  | 'video'
  | 'other';

export type ChatFilePresentation = {
  accent: ChatFileAccent;
  icon: LucideIcon;
  typeLabelKey: string;
  typeLabelDefault: string;
};

const PRESENTATION: Record<ChatFileAccent, ChatFilePresentation> = {
  pdf: {
    accent: 'pdf',
    icon: FileText,
    typeLabelKey: 'shared.chat.attachments.types.pdf',
    typeLabelDefault: 'PDF Document',
  },
  word: {
    accent: 'word',
    icon: FileType,
    typeLabelKey: 'shared.chat.attachments.types.word',
    typeLabelDefault: 'Word Document',
  },
  excel: {
    accent: 'excel',
    icon: FileSpreadsheet,
    typeLabelKey: 'shared.chat.attachments.types.excel',
    typeLabelDefault: 'Excel Spreadsheet',
  },
  ppt: {
    accent: 'ppt',
    icon: Presentation,
    typeLabelKey: 'shared.chat.attachments.types.ppt',
    typeLabelDefault: 'PowerPoint Presentation',
  },
  text: {
    accent: 'text',
    icon: FileText,
    typeLabelKey: 'shared.chat.attachments.types.text',
    typeLabelDefault: 'Text Document',
  },
  zip: {
    accent: 'zip',
    icon: Archive,
    typeLabelKey: 'shared.chat.attachments.types.archive',
    typeLabelDefault: 'Archive',
  },
  image: {
    accent: 'image',
    icon: ImageIcon,
    typeLabelKey: 'shared.chat.attachments.types.image',
    typeLabelDefault: 'Image',
  },
  video: {
    accent: 'video',
    icon: Film,
    typeLabelKey: 'shared.chat.attachments.types.video',
    typeLabelDefault: 'Video',
  },
  other: {
    accent: 'other',
    icon: FileText,
    typeLabelKey: 'shared.chat.attachments.types.file',
    typeLabelDefault: 'File',
  },
};

export function resolveChatFileAccent(
  filename: string,
  kind?: ChatAttachmentKind,
): ChatFileAccent {
  if (kind === 'image') return 'image';
  if (kind === 'video') return 'video';
  if (kind === 'archive') return 'zip';

  const ext = getFileExtension(filename);
  if (ext === 'pdf') return 'pdf';
  if (ext === 'xls' || ext === 'xlsx') return 'excel';
  if (ext === 'ppt' || ext === 'pptx') return 'ppt';
  if (ext === 'txt') return 'text';
  if (ext === 'doc' || ext === 'docx') return 'word';
  if (ext === 'zip' || ext === 'rar' || ext === '7z') return 'zip';

  return 'other';
}

export function getChatFilePresentation(
  filename: string,
  kind?: ChatAttachmentKind,
): ChatFilePresentation {
  return PRESENTATION[resolveChatFileAccent(filename, kind)];
}
