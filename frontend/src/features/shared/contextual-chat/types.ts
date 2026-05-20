import type { ChatContextKind, ChatUrgency } from '../../admin/shared/admin-module-chat/adminChatTypes';

export type ChatModule =
  | 'platform'
  | 'documents'
  | 'srf'
  | 'announcements'
  | 'encadrant'
  | 'meetings'
  | 'smart_assignment'
  | 'offers';

export interface ConversationContextDto {
  module: ChatModule;
  context_kind: ChatContextKind;
  entity_type: string;
  entity_id: string;
  entity_label: string;
  workflow_status: string;
  urgency: ChatUrgency;
  student_user_id: number | null;
  is_internal_only: boolean;
  context_snapshot_json: Record<string, unknown>;
}

export interface ConversationDto {
  id: number;
  title: string;
  conversation_type: string;
  last_message_at: string | null;
  context: ConversationContextDto | null;
  unread_count: number;
  last_preview: string;
  participants: {
    user_id: number;
    email: string;
    full_name: string;
    role: string;
  }[];
  metadata_json: Record<string, unknown>;
}

export interface MessageDto {
  id: number;
  conversation_id: number;
  sender_id: number | null;
  sender_name: string;
  body: string;
  message_type: string;
  created_at: string;
  tags: string[];
  is_own: boolean;
  metadata_json: Record<string, unknown>;
}

export interface ContextualChatFilters {
  urgency?: ChatUrgency;
  contextKind?: ChatContextKind;
  tag?: string;
  unreadOnly?: boolean;
  q?: string;
}

export type SmartActionCode =
  | 'create_task'
  | 'create_meeting'
  | 'request_correction'
  | 'validate'
  | 'escalate'
  | 'notify_admin'
  | 'mark_urgent';
