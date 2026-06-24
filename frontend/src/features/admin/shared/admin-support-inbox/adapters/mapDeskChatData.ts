import type { AdminChatMessage, AdminChatParticipant } from '../../admin-module-chat/adminChatTypes';
import type {
  SupportChatThread,
  SupportConversationListItem,
  SupportMessage,
} from '../types/supportInboxTypes';

export interface DeskConversationRecord extends SupportChatThread {
  preview: string;
  timeLabel: string;
  unreadCount: number;
  contextLine?: string;
  statusLabel?: string;
  subtitle?: string;
  program: string;
  academicLevel: string;
  className: string;
  archived?: boolean;
  urgent?: boolean;
  resolved?: boolean;
  entityLabel?: string;
  workflowStatus?: string;
  urgency?: string;
  contextKind?: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  roleLabel?: string;
  userId?: number;
}

export function mapAdminMessages(messages: AdminChatMessage[]): SupportMessage[] {
  return messages.map((m) => ({
    id: m.id,
    direction: m.direction,
    text: m.text,
    time: m.time,
    separatorBefore: m.separatorBefore,
  }));
}

export function buildDeskConversations(
  participants: AdminChatParticipant[],
  messagesByConv: Record<string, AdminChatMessage[]>
): DeskConversationRecord[] {
  return participants.map((p) => ({
    id: p.id,
    avatarInitials: p.initials,
    title: p.title,
    meta: p.entityLabel ?? p.workflowStatus,
    preview: p.lastPreview,
    timeLabel: p.timeLabel,
    unreadCount: p.unreadCount,
    contextLine: p.entityLabel,
    statusLabel: p.workflowStatus,
    subtitle: p.entityLabel,
    program: p.program ?? '—',
    academicLevel: p.academicLevel ?? '—',
    className: p.className ?? '—',
    messages: mapAdminMessages(messagesByConv[p.id] ?? []),
    entityLabel: p.entityLabel,
    workflowStatus: p.workflowStatus,
    urgency: p.urgency,
    contextKind: p.contextKind,
    displayName: p.displayName,
    email: p.email,
    avatarUrl: p.avatarUrl,
    roleLabel: p.roleLabel,
    userId: p.userId,
    archived: p.archived,
    resolved: p.resolved,
    urgent: p.urgent,
  }));
}

export function toListItems(records: DeskConversationRecord[]): SupportConversationListItem[] {
  return records.map((r) => ({
    id: r.id,
    avatarInitials: r.avatarInitials,
    name: r.title,
    contextLine: r.contextLine ?? r.subtitle,
    preview: r.preview,
    timeLabel: r.timeLabel,
    unreadCount: r.unreadCount,
    statusLabel: r.statusLabel,
  }));
}

export function toActiveThread(record: DeskConversationRecord | null): SupportChatThread | null {
  if (!record) return null;
  return {
    id: record.id,
    avatarInitials: record.avatarInitials,
    title: record.title,
    meta: record.meta,
    messages: record.messages,
    resolved: record.resolved,
  };
}
