export { default as ChatSidebarHeader } from './components/ChatSidebarHeader';
export type { ChatSidebarHeaderProps } from './components/ChatSidebarHeader';

export { default as ChatToolbarActions } from './components/ChatToolbarActions';
export type { ChatToolbarActionsProps } from './components/ChatToolbarActions';

export { default as ChatUnreadBadge } from './components/ChatUnreadBadge';
export type { ChatUnreadBadgeProps } from './components/ChatUnreadBadge';

export { default as ChatSidebar } from './components/ChatSidebar';
export type { ChatSidebarProps } from './components/ChatSidebar';

export { default as ChatConversationCard } from './components/ChatConversationCard';
export { default as ChatEmptyState } from './components/ChatEmptyState';
export { default as ChatHeader } from './components/ChatHeader';

export { default as ChatConversationMenu } from './components/ChatConversationMenu';
export type { ChatConversationMenuProps } from './components/ChatConversationMenu';
export { default as ChatConversationSearchBar } from './components/ChatConversationSearchBar';
export { default as ChatSharedAttachmentsPanel } from './components/ChatSharedAttachmentsPanel';
export { default as ChatConversationHistoryPanel } from './components/ChatConversationHistoryPanel';
export { default as ChatSearchTextHighlight } from './components/ChatSearchTextHighlight';
export { default as ChatWorkflowSystemMessage } from './components/ChatWorkflowSystemMessage';
export { default as ChatMessageReadStatus } from './components/ChatMessageReadStatus';
export type { ChatMessageReadStatusProps } from './components/ChatMessageReadStatus';
export { default as StandardChatMessageThread } from './components/StandardChatMessageThread';
export type {
  StandardChatMessage,
  StandardChatMessageThreadProps,
} from './components/StandardChatMessageThread';
export {
  formatChatSystemMessage,
  parseSmartActionCode,
  shouldHideSmartActionForInbox,
  STUDENT_HIDDEN_SMART_ACTIONS,
} from './utils/chatSystemMessageUtils';
export type {
  ChatSystemMessageInput,
  FormatChatSystemMessageOptions,
} from './utils/chatSystemMessageUtils';
export { useChatConversationTools } from './hooks/useChatConversationTools';
export type { UseChatConversationToolsOptions } from './hooks/useChatConversationTools';
export { toChatToolMessages } from './utils/chatConversationToolsUtils';
export type {
  ChatToolMessage,
  SharedAttachmentItem,
  ConversationHistoryEntry,
} from './types/chatConversationToolsTypes';
