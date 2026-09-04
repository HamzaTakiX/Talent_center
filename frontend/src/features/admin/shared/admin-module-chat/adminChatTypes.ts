import type { ChatAttachmentView } from '../../../shared/contextual-chat/utils/chatAttachmentUtils';

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
  messageType?: 'TEXT' | 'FILE' | 'IMAGE' | 'VIDEO' | 'SYSTEM' | 'EVENT' | 'MEETING_REQUEST';
  tags?: string[];
  senderName?: string;
  attachmentName?: string;
  attachments?: ChatAttachmentView[];
  meetingRequest?: {
    requestId: string;
    mode: 'video' | 'voice';
    status: 'pending' | 'accepted' | 'declined';
    title?: string;
  };
}

export interface AdminChatParticipant {
  id: string;
  initials: string;
  title: string;
  lastPreview: string;
  timeLabel: string;
  unreadCount: number;
  program?: string;
  academicLevel?: string;
  className?: string;
  contextKind?: ChatContextKind;
  urgency?: ChatUrgency;
  workflowStatus?: string;
  entityLabel?: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  roleLabel?: string;
  userId?: number;
  archived?: boolean;
  resolved?: boolean;
  urgent?: boolean;
}
