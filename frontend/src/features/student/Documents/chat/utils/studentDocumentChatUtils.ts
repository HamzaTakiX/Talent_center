import type { ConversationDto } from '../../../../shared/contextual-chat/types';
import type {
  StudentDocumentInboxFilters,
  StudentDocumentPrimaryFilter,
  StudentDocumentPrimaryFilterCounts,
} from '../types/studentDocumentChatTypes';
import type { StudentDocumentConversation } from './studentDocumentChatMappers';

export function patchStudentDocumentConversationArchiveState(
  items: ConversationDto[],
  conversationId: number,
  archived: boolean,
): ConversationDto[] {
  const targetId = Number(conversationId);
  return items.map((conversation) =>
    Number(conversation.id) === targetId ? { ...conversation, is_archived: archived } : conversation,
  );
}

function applyPrimaryFilter(
  conversation: StudentDocumentConversation,
  primary: StudentDocumentPrimaryFilter,
): boolean {
  if (primary === 'archived') return conversation.archived;
  return !conversation.archived;
}

export function applyStudentDocumentModuleFilters(
  conversation: StudentDocumentConversation,
  filters: StudentDocumentInboxFilters,
): boolean {
  if (!applyPrimaryFilter(conversation, filters.primary)) return false;
  if (filters.unread && conversation.unreadCount === 0) return false;
  return true;
}

export function computeStudentDocumentPrimaryFilterCounts(
  conversations: StudentDocumentConversation[],
): StudentDocumentPrimaryFilterCounts {
  return {
    all: conversations.filter((conversation) => !conversation.archived).length,
    archived: conversations.filter((conversation) => conversation.archived).length,
  };
}
