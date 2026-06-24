import type { AnnouncementConversation } from '../types/announcementChatTypes';

export type AnnouncementStudentGroup = {
  key: string;
  studentName: string;
  studentInitials: string;
  studentAvatarUrl?: string;
  studentEmail?: string;
  program: string;
  conversations: AnnouncementConversation[];
  totalUnread: number;
};

export function groupAnnouncementConversationsByStudent(
  conversations: AnnouncementConversation[],
): AnnouncementStudentGroup[] {
  const map = new Map<string, AnnouncementStudentGroup>();
  const order: string[] = [];

  for (const conv of conversations) {
    const studentKey = String(conv.studentUserId ?? conv.studentEmail ?? conv.studentName);
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
