export interface AdminChatMessage {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  separatorBefore?: string;
}

export interface AdminChatParticipant {
  id: string;
  initials: string;
  title: string;
  lastPreview: string;
  timeLabel: string;
  unreadCount: number;
}
