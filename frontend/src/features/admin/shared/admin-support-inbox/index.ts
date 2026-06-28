export { default as SupportInboxShell } from './components/SupportInboxShell';
export { default as SupportConversationList } from './components/SupportConversationList';
export { default as SupportConversationCard } from './components/SupportConversationCard';
export { default as SupportChatWorkspace } from './components/SupportChatWorkspace';
export { default as SupportChatHeader } from './components/SupportChatHeader';
export { default as SupportMessageThread } from './components/SupportMessageThread';
export { default as SupportMessageComposer } from './components/SupportMessageComposer';
export { default as SupportContextPanel } from './components/SupportContextPanel';
export { default as SupportSearchField } from './components/SupportSearchField';
export { default as SupportQuickFilterBar } from './components/SupportQuickFilterBar';

export { default as DeskSupportInbox } from './components/DeskSupportInbox';

export { useDeskSupportChat } from './hooks/useDeskSupportChat';

export type {
  SupportMessage,
  SupportConversationListItem,
  SupportChatThread,
  SupportInboxStats,
  SupportMobileView,
  SupportQuickFilters,
} from './types/supportInboxTypes';

export {
  computeSupportInboxStats,
  formatSupportChatTime,
  hasActiveQuickFilters,
  matchesQuickFilters,
} from './utils/supportInboxUtils';

export {
  buildDeskConversations,
  mapAdminMessages,
  toActiveThread,
  toListItems,
  type DeskConversationRecord,
} from './adapters/mapDeskChatData';
