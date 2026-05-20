export type ChatContextKind =
  | 'workflow_thread'
  | 'channel'
  | 'direct'
  | 'announcement_thread'
  | 'meeting_thread';

export type ChatUrgency = 'NONE' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface AdminChatMessage {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  separatorBefore?: string;
  messageType?: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM' | 'EVENT';
  tags?: string[];
  senderName?: string;
}

export interface AdminChatParticipant {
  id: string;
  initials: string;
  title: string;
  lastPreview: string;
  timeLabel: string;
  unreadCount: number;
  contextKind?: ChatContextKind;
  urgency?: ChatUrgency;
  workflowStatus?: string;
  entityLabel?: string;
}
