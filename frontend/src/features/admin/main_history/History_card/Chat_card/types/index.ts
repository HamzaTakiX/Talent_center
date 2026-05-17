export interface ChatStatCard {
  key: string;
  label: string;
  value: string;
  icon: 'total' | 'messages_sent' | 'conversations' | 'group_chats';
}

export type ChatActionType = 'create';

export interface ChatHistoryRow {
  id: string;
  module: string;
  actionType: ChatActionType;
  title: string;
  actor: string;
  timestamp: string;
  details: string;
}
