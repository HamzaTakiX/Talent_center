export interface ChatMessage {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  separatorBefore?: string;
  messageType?: string;
  meetingRequest?: {
    requestId: string;
    mode: 'video' | 'voice';
    status: 'pending' | 'accepted' | 'declined';
    title?: string;
  };
}

export interface ChatParticipant {
  id: string;
  initials: string;
  title: string;
  lastPreview: string;
  timeLabel: string;
  unreadCount: number;
}
