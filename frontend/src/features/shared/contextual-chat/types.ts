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
  workflow_state?: string;
  urgency: ChatUrgency;
  student_user_id: number | null;
  is_internal_only: boolean;
  context_snapshot_json: Record<string, unknown>;
  company_logo_url?: string | null;
  cover_image_url?: string | null;
  student_avatar_url?: string | null;
  student_display_name?: string | null;
  announcement_published_at?: string | null;
  announcement_publish_end_at?: string | null;
}

export interface ConversationDto {
  id: number;
  title: string;
  conversation_type: string;
  last_message_at: string | null;
  is_archived?: boolean;
  context: ConversationContextDto | null;
  unread_count: number;
  last_preview: string;
  last_message_is_own?: boolean;
  participants: {
    user_id: number;
    email: string;
    full_name: string;
    role: string;
  }[];
  metadata_json: Record<string, unknown>;
}

export type MessageReadReceiptDto = {
  user_id: number;
  read_at: string;
};

export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read';

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
  read_by?: MessageReadReceiptDto[];
  delivery_status?: MessageDeliveryStatus;
}

export interface ContextualChatFilters {
  urgency?: ChatUrgency;
  contextKind?: ChatContextKind;
  tag?: string;
  unreadOnly?: boolean;
  includeArchived?: boolean;
  q?: string;
}

export type SmartActionCode =
  | 'create_task'
  | 'create_meeting'
  | 'request_correction'
  | 'validate'
  | 'escalate'
  | 'notify_admin'
  | 'mark_urgent'
  | 'mark_resolved'
  | 'archive_conversation'
  | 'unarchive_conversation'
  | 'assign_admin'
  | 'set_priority'
  | 'add_internal_note';
