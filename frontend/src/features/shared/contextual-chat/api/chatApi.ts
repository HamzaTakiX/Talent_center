import apiClient from '../../../../shared/api/client';
import type { ApiEnvelope } from '../../../admin/api/types';
import type {
  ChatModule,
  ContextualChatFilters,
  ConversationDto,
  MessageDto,
  SmartActionCode,
} from '../types';

const BASE = '/chat';

interface ListPayload {
  items: ConversationDto[];
  total: number;
}

interface MessagesPayload {
  items: MessageDto[];
}

export async function fetchConversations(
  module: ChatModule,
  filters?: ContextualChatFilters
): Promise<ConversationDto[]> {
  const params: Record<string, string> = { module };
  if (filters?.urgency) params.urgency = filters.urgency;
  if (filters?.contextKind) params.context_kind = filters.contextKind;
  if (filters?.unreadOnly) params.unread = '1';
  if (filters?.includeArchived) params.include_archived = '1';
  if (filters?.q) params.q = filters.q;
  const { data } = await apiClient.get<ApiEnvelope<ListPayload>>(`${BASE}/conversations`, { params });
  if (!data.success || !data.data) return [];
  return data.data.items;
}

export async function fetchConversation(conversationId: number): Promise<ConversationDto | null> {
  const { data } = await apiClient.get<ApiEnvelope<ConversationDto>>(
    `${BASE}/conversations/${conversationId}`
  );
  if (!data.success || !data.data) return null;
  return data.data;
}

export async function fetchMessages(conversationId: number): Promise<MessageDto[]> {
  const { data } = await apiClient.get<ApiEnvelope<MessagesPayload>>(
    `${BASE}/conversations/${conversationId}/messages`
  );
  if (!data.success || !data.data) return [];
  return data.data.items;
}

export async function sendChatMessage(
  conversationId: number,
  body: string,
  tagCodes?: string[]
): Promise<MessageDto | null> {
  const { data } = await apiClient.post<ApiEnvelope<MessageDto>>(
    `${BASE}/conversations/${conversationId}/messages`,
    { body, tag_codes: tagCodes ?? [] }
  );
  if (!data.success || !data.data) return null;
  return data.data;
}

export async function markConversationRead(
  conversationId: number,
  messageId: number
): Promise<void> {
  await apiClient.post(`${BASE}/conversations/${conversationId}/read`, { message_id: messageId });
}

export async function applySmartAction(
  conversationId: number,
  actionCode: SmartActionCode,
  payload?: Record<string, unknown>
): Promise<boolean> {
  const { data } = await apiClient.post<ApiEnvelope<unknown>>(
    `${BASE}/conversations/${conversationId}/actions`,
    { action_code: actionCode, payload: payload ?? {} }
  );
  return Boolean(data.success);
}

export async function sendTypingIndicator(
  conversationId: number,
  isTyping: boolean
): Promise<void> {
  await apiClient.post(`${BASE}/conversations/${conversationId}/typing`, { is_typing: isTyping });
}

export async function fetchChatTags(): Promise<{ code: string; name: string; color: string }[]> {
  const { data } = await apiClient.get<ApiEnvelope<{ code: string; name: string; color: string }[]>>(
    `${BASE}/tags`
  );
  return data.data ?? [];
}

export async function fetchEnterpriseChannels(): Promise<
  { id: number; code: string; name: string; channel_type: string }[]
> {
  const { data } = await apiClient.get<
    ApiEnvelope<{ id: number; code: string; name: string; channel_type: string }[]>
  >(`${BASE}/channels`);
  return data.data ?? [];
}

export interface ChatMetricsDto {
  open_conversations: number;
  waiting_admin: number;
  waiting_student: number;
  average_response_time_seconds: number;
  average_resolution_time_seconds: number;
  resolved_today: number;
  unread_messages: number;
  most_active_offers: { label: string; count: number }[];
  most_active_companies: { label: string; count: number }[];
  top_students_by_activity: { label: string; count: number }[];
}

export interface ContextPanelDto {
  conversation_id: number;
  student?: Record<string, unknown>;
  offer?: Record<string, unknown>;
  application?: Record<string, unknown>;
  current_applications?: unknown[];
  readiness?: Record<string, unknown>;
}

export interface ChatInboxModuleSummary {
  module: ChatModule;
  conversation_count: number;
  unread: number;
}

export async function fetchChatInboxSummary(): Promise<ChatInboxModuleSummary[]> {
  const { data } = await apiClient.get<ApiEnvelope<{ modules: ChatInboxModuleSummary[] }>>(
    `${BASE}/inbox/summary`,
  );
  if (!data.success || !data.data) return [];
  return data.data.modules;
}

export async function fetchModuleChatMetrics(module: ChatModule): Promise<ChatMetricsDto | null> {
  const { data } = await apiClient.get<ApiEnvelope<ChatMetricsDto>>(`${BASE}/modules/${module}/metrics`);
  return data.success && data.data ? data.data : null;
}

export async function fetchContextPanel(conversationId: number): Promise<ContextPanelDto | null> {
  const { data } = await apiClient.get<ApiEnvelope<ContextPanelDto>>(
    `${BASE}/conversations/${conversationId}/context-panel`
  );
  return data.success && data.data ? data.data : null;
}
