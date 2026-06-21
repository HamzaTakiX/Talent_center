export type SupportMessageDirection = 'in' | 'out';

export interface SupportMessage {
  id: string;
  direction: SupportMessageDirection;
  text: string;
  time: string;
  separatorBefore?: string;
  attachmentName?: string;
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

export interface SupportQuickFilters {
  unread: boolean;
  urgent: boolean;
  archived: boolean;
}

export const EMPTY_SUPPORT_QUICK_FILTERS: SupportQuickFilters = {
  unread: false,
  urgent: false,
  archived: false,
};
