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
  if (filters?.q) params.q = filters.q;
  const { data } = await apiClient.get<ApiEnvelope<ListPayload>>(`${BASE}/conversations`, { params });
  if (!data.success || !data.data) return [];
  return data.data.items;
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
