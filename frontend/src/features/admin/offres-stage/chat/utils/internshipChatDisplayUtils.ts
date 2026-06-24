import type { InternshipConversation, InternshipMessage } from '../types/internshipChatTypes';

export type StudentConversationGroup = {
  key: string;
  studentName: string;
  studentInitials: string;
  studentAvatarUrl?: string;
  studentEmail?: string;
  program: string;
  conversations: InternshipConversation[];
  totalUnread: number;
};

export function groupConversationsByStudent(
  conversations: InternshipConversation[],
): StudentConversationGroup[] {
  const map = new Map<string, StudentConversationGroup>();
  const order: string[] = [];

  for (const conv of conversations) {
    const studentKey = String(conv.studentProfileId ?? conv.studentEmail ?? conv.studentName);
    let group = map.get(studentKey);
    if (!group) {
      group = {
        key: studentKey,
        studentName: conv.studentName,
        studentInitials: conv.studentInitials,
        studentAvatarUrl: conv.studentAvatarUrl,
        studentEmail: conv.studentEmail,
        program: conv.program,
        conversations: [],
        totalUnread: 0,
      };
      map.set(studentKey, group);
      order.push(studentKey);
    }
    if (!group.conversations.some((existing) => existing.id === conv.id)) {
      group.conversations.push(conv);
    }
    group.totalUnread += conv.unreadCount;
  }

  return order.map((studentKey) => map.get(studentKey)!);
}

export function conversationHasApplication(conversation: InternshipConversation): boolean {
  if (conversation.applicationId || conversation.applicationUuid) return true;
  return conversation.applicationStatus !== 'Not Applied';
}

export function isEmailLike(value: string | undefined): boolean {
  const trimmed = (value ?? '').trim();
  return trimmed.includes('@');
}

export function resolveStudentDisplayName(
  rawName: string,
  email: string | undefined,
  participantName?: string,
): string {
  const candidates = [rawName, participantName].filter(Boolean) as string[];
  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    if (trimmed && trimmed !== email && !isEmailLike(trimmed)) {
      return trimmed;
    }
  }
  return 'Étudiant';
}

export function formatConversationPreview(text: string | undefined): string {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return '';
  if (/^\[Action:/i.test(trimmed)) return '';
  return trimmed;
}

export function findLatestChatPreview(
  messages: InternshipMessage[],
): { text: string; isOwn: boolean; createdAt?: string } | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg.messageType === 'EVENT' || msg.messageType === 'SYSTEM') continue;
    const preview = formatConversationPreview(msg.text);
    if (preview) {
      return {
        text: preview,
        isOwn: msg.direction === 'out',
        createdAt: msg.createdAt,
      };
    }
  }
  return null;
}

export function resolveConversationPreview(
  conversation: InternshipConversation,
  options?: { youPrefix?: string },
): string {
  let text = '';
  let isOwn = conversation.lastMessageIsOwn ?? false;

  const fromMessages = findLatestChatPreview(conversation.messages);
  if (fromMessages) {
    text = fromMessages.text;
    isOwn = fromMessages.isOwn;
  } else {
    const fromDto = formatConversationPreview(conversation.lastMessage);
    if (fromDto) {
      text = fromDto;
    }
  }

  if (!text) return '';
  const youPrefix = options?.youPrefix;
  if (isOwn && youPrefix) {
    return `${youPrefix}${text}`;
  }
  return text;
}
