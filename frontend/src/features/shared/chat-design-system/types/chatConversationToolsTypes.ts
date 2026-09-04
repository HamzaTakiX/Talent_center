import type { ChatAttachmentView } from '../../contextual-chat/utils/chatAttachmentUtils';

export type ChatToolMessage = {
  id: string;
  text: string;
  time: string;
  createdAt?: string;
  senderName?: string;
  direction?: 'in' | 'out';
  separatorBefore?: string;
  messageType?: string;
  attachments?: ChatAttachmentView[];
  attachmentName?: string;
  tags?: string[];
  entityRefs?: import('../../contextual-chat/types/chatEntityTypes').ChatEntityReference[];
};

export type SharedAttachmentItem = {
  key: string;
  messageId: string;
  attachment: ChatAttachmentView;
  senderLabel: string;
  dateLabel: string;
  createdAt: string;
};

export type ConversationHistoryEntry = {
  id: string;
  messageId: string;
  label: string;
  preview: string;
  time: string;
  dateGroup?: string;
  kind: 'message' | 'event' | 'date';
};

export type ChatSearchMatch = {
  messageId: string;
  indices: number[];
};
