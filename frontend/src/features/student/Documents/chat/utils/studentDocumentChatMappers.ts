import type { ConversationContextDto, ConversationDto } from '../../../../shared/contextual-chat/types';
import type { ChatAttachmentView } from '../../../../shared/contextual-chat/utils/chatAttachmentUtils';

export type StudentDocumentMessage = {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
  seenTime?: string;
  messageType?: string;
  smartActionCode?: string;
  createdAt?: string;
  attachmentName?: string;
  attachments?: ChatAttachmentView[];
};

export type StudentDocumentConversation = {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  iconKey: string;
  colorTheme: string;
  category: string;
  description: string;
  slaHours: number;
  estimatedHours: number;
  onlineEnabled: boolean;
  physicalEnabled: boolean;
  reservationRequired: boolean;
  lastMessage: string;
  lastMessageIsOwn: boolean;
  timeLabel: string;
  lastMessageAt?: string | null;
  unreadCount: number;
  archived: boolean;
  messages: StudentDocumentMessage[];
};

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(d);
}

function snapshot(ctx: ConversationContextDto | null | undefined): Record<string, unknown> {
  return ctx?.context_snapshot_json ?? {};
}

export function mapDocumentConversation(
  dto: ConversationDto,
  messages: StudentDocumentMessage[] = [],
): StudentDocumentConversation {
  const ctx = dto.context;
  const snap = snapshot(ctx);
  const mappedMessages = [...messages];

  return {
    id: String(dto.id),
    serviceId: String(snap.document_service_id ?? ''),
    serviceName: String(snap.document_service_name ?? dto.title ?? ''),
    serviceCode: String(snap.document_service_code ?? ''),
    iconKey: String(snap.document_icon_key ?? 'file-text'),
    colorTheme: String(snap.document_color_theme ?? 'brand'),
    category: String(snap.document_category ?? ''),
    description: String(snap.document_description ?? ''),
    slaHours: Number(snap.sla_hours ?? 48),
    estimatedHours: Number(snap.estimated_hours ?? 24),
    onlineEnabled: Boolean(snap.online_enabled),
    physicalEnabled: Boolean(snap.physical_enabled),
    reservationRequired: Boolean(snap.reservation_required),
    lastMessage: dto.last_preview || mappedMessages[mappedMessages.length - 1]?.text || '',
    lastMessageIsOwn: dto.last_message_is_own ?? false,
    timeLabel: formatRelative(dto.last_message_at),
    lastMessageAt: dto.last_message_at ?? null,
    unreadCount: dto.unread_count ?? 0,
    archived: Boolean(dto.is_archived),
    messages: mappedMessages,
  };
}
