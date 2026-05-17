import type { ChatHistoryRow, ChatStatCard } from '../types';

export const chatStats: ChatStatCard[] = [
  { key: 'total_actions', label: 'Total Actions', value: '892', icon: 'total' },
  { key: 'messages_sent', label: 'Messages Sent', value: '567', icon: 'messages_sent' },
  { key: 'conversations', label: 'Conversations', value: '234', icon: 'conversations' },
  { key: 'group_chats', label: 'Group Chats', value: '91', icon: 'group_chats' },
];

export const chatHistoryRows: ChatHistoryRow[] = [
  {
    id: 'chath-1',
    module: 'Chat',
    actionType: 'create',
    title: 'New conversation started',
    actor: 'Sarah Alami',
    timestamp: '21/04/2026 10:00:00',
    details: 'A new one-to-one conversation was opened from the messaging module.',
  },
  {
    id: 'chath-2',
    module: 'Chat',
    actionType: 'create',
    title: 'Message sent',
    actor: 'Multiple Users',
    timestamp: '20/04/2026 16:45:00',
    details: 'A new message was posted in an active conversation thread.',
  },
  {
    id: 'chath-3',
    module: 'Chat',
    actionType: 'create',
    title: 'Group chat created',
    actor: 'Admin Stage',
    timestamp: '19/04/2026 11:20:00',
    details: 'A group conversation was created and participants were added.',
  },
];
