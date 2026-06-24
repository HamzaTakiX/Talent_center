import type { ConversationDto } from '../../../../shared/contextual-chat/types';
import type {
  StudentAnnouncementInboxFilters,
  StudentAnnouncementPrimaryFilter,
  StudentAnnouncementPrimaryFilterCounts,
  StudentAnnouncementPriority,
} from '../types/studentAnnouncementChatTypes';
import type { StudentAnnouncementConversation } from './studentAnnouncementChatMappers';

export function patchStudentConversationArchiveState(
  items: ConversationDto[],
  conversationId: number,
  archived: boolean,
): ConversationDto[] {
  const targetId = Number(conversationId);
  return items.map((conversation) =>
    Number(conversation.id) === targetId ? { ...conversation, is_archived: archived } : conversation,
  );
}

export function mapStudentAnnouncementPriority(raw: string): StudentAnnouncementPriority {
  const normalized = raw.trim().toUpperCase();
  if (normalized === 'URGENT' || normalized === 'HIGH' || normalized === 'CRITICAL') {
    return 'Urgent';
  }
  if (normalized === 'IMPORTANT' || normalized === 'MEDIUM') {
    return 'Important';
  }
  return 'Normal';
}

function applyPrimaryFilter(
  conversation: StudentAnnouncementConversation,
  primary: StudentAnnouncementPrimaryFilter,
): boolean {
  if (primary === 'archived') return conversation.archived;
  return !conversation.archived;
}

export function applyStudentAnnouncementModuleFilters(
  conversation: StudentAnnouncementConversation,
  filters: StudentAnnouncementInboxFilters,
): boolean {
  if (!applyPrimaryFilter(conversation, filters.primary)) return false;
  if (filters.unread && conversation.unreadCount === 0) return false;
  if (filters.urgent && !conversation.urgent) return false;
  if (
    filters.announcementTypes.length > 0 &&
    !filters.announcementTypes.includes(conversation.announcementType)
  ) {
    return false;
  }
  if (filters.priorities.length > 0 && !filters.priorities.includes(conversation.priority)) {
    return false;
  }
  return true;
}

export function computeStudentAnnouncementPrimaryFilterCounts(
  conversations: StudentAnnouncementConversation[],
): StudentAnnouncementPrimaryFilterCounts {
  return {
    all: conversations.filter((conversation) => !conversation.archived).length,
    archived: conversations.filter((conversation) => conversation.archived).length,
  };
}

export function collectStudentAnnouncementTypeOptions(
  conversations: StudentAnnouncementConversation[],
): string[] {
  const values = new Set<string>();
  for (const conversation of conversations) {
    const type = conversation.announcementType.trim();
    if (type) values.add(type);
  }
  return [...values].sort((a, b) => a.localeCompare(b, 'fr'));
}
