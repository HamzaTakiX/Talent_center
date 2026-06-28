import type { ChatAttachmentView } from '../../../../shared/contextual-chat/utils/chatAttachmentUtils';

export type SupportMessageDirection = 'in' | 'out';

export interface SupportMessage {
  id: string;
  direction: SupportMessageDirection;
  text: string;
  time: string;
  separatorBefore?: string;
  messageType?: string;
  attachmentName?: string;
  attachments?: ChatAttachmentView[];
}

export interface SupportConversationListItem {
  id: string;
  avatarInitials: string;
  name: string;
  contextLine?: string;
  preview: string;
  timeLabel: string;
  unreadCount: number;
  statusLabel?: string;
}

export interface SupportChatThread {
  id: string;
  avatarInitials: string;
  title: string;
  meta?: string;
  messages: SupportMessage[];
  resolved?: boolean;
}

export interface SupportInboxStats {
  unread: number;
  pending: number;
  resolved: number;
}

export type SupportMobileView = 'list' | 'chat';

export type PrimaryDeskFilter = 'all' | 'archived';

export interface PrimaryFilterCounts {
  all: number;
  archived: number;
}

export interface SupportQuickFilters {
  unread: boolean;
  urgent: boolean;
}

export const EMPTY_SUPPORT_QUICK_FILTERS: SupportQuickFilters = {
  unread: false,
  urgent: false,
};
