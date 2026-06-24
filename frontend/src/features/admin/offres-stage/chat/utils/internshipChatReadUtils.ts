import type { MessageDto } from '../../../../shared/contextual-chat/types';

export function applyReadReceiptToMessages(
  messages: MessageDto[],
  readerUserId: number,
  lastReadMessageId: number,
  readAt: string,
): MessageDto[] {
  return messages.map((message) => {
    if (!message.is_own || message.sender_id === readerUserId) return message;

    const numericId = Number(message.id);
    if (!Number.isFinite(numericId) || numericId > lastReadMessageId) return message;

    const readBy = [...(message.read_by ?? [])];
    const existingIndex = readBy.findIndex((entry) => entry.user_id === readerUserId);
    if (existingIndex >= 0) {
      readBy[existingIndex] = { ...readBy[existingIndex], read_at: readAt };
    } else {
      readBy.push({ user_id: readerUserId, read_at: readAt });
    }

    return {
      ...message,
      read_by: readBy,
      delivery_status: 'read',
    };
  });
}
