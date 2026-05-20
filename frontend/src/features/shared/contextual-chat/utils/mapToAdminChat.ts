import type {
  AdminChatMessage,
  AdminChatParticipant,
} from '../../../admin/shared/admin-module-chat/adminChatTypes';
import type { ConversationDto, MessageDto } from '../types';

function initialsFrom(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (title.slice(0, 2) || '??').toUpperCase();
}

function formatTime(iso: string | null, language: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-GB';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  }
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(d);
}

export function mapConversationToParticipant(
  conv: ConversationDto,
  language: string
): AdminChatParticipant {
  const ctx = conv.context;
  const title = conv.title || ctx?.entity_label || `Conversation #${conv.id}`;
  return {
    id: String(conv.id),
    initials: initialsFrom(title),
    title,
    lastPreview: conv.last_preview || '',
    timeLabel: formatTime(conv.last_message_at, language),
    unreadCount: conv.unread_count,
    contextKind: ctx?.context_kind,
    urgency: ctx?.urgency,
    workflowStatus: ctx?.workflow_status,
    entityLabel: ctx?.entity_label,
  };
}

export function mapMessageToAdmin(msg: MessageDto, language: string): AdminChatMessage {
  return {
    id: String(msg.id),
    direction: msg.is_own ? 'out' : 'in',
    text: msg.body,
    time: formatTime(msg.created_at, language),
    messageType: msg.message_type as AdminChatMessage['messageType'],
    tags: msg.tags,
    senderName: msg.sender_name,
  };
}

export function mapConversationsToParticipants(
  convs: ConversationDto[],
  language: string
): AdminChatParticipant[] {
  return convs.map((c) => mapConversationToParticipant(c, language));
}

export function mapMessagesToAdmin(msgs: MessageDto[], language: string): AdminChatMessage[] {
  return msgs.map((m) => mapMessageToAdmin(m, language));
}

export function buildMessagesByConv(
  convs: ConversationDto[],
  messagesMap: Record<string, AdminChatMessage[]>
): Record<string, AdminChatMessage[]> {
  const out: Record<string, AdminChatMessage[]> = {};
  for (const c of convs) {
    out[String(c.id)] = messagesMap[String(c.id)] ?? [];
  }
  return out;
}
