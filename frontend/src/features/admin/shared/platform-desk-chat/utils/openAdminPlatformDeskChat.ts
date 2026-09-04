import { adminEncadrantsApi } from '../../../api/encadrants';
import { adminStudentsApi } from '../../../api/students';

export async function openAdminStudentDeskChat(studentId: number): Promise<number> {
  const { conversation_id } = await adminStudentsApi.openChat(studentId);
  return conversation_id;
}

export async function openAdminEncadrantDeskChat(encadrantId: number): Promise<number> {
  const { conversation_id } = await adminEncadrantsApi.openChat(encadrantId);
  return conversation_id;
}

export function adminStudentDeskChatPath(conversationId: number): string {
  return `/admin/student/chat?conversation=${conversationId}`;
}

export function adminEncadrantDeskChatPath(conversationId: number): string {
  return `/admin/encadrant/chat?conversation=${conversationId}`;
}
