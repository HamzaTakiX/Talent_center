import type { ChatAttachmentView } from '../../contextual-chat/utils/chatAttachmentUtils';
import { resolveChatMessageBubbleText } from '../../contextual-chat/utils/chatAttachmentUtils';
import type {
  ChatSearchMatch,
  ChatToolMessage,
  ConversationHistoryEntry,
  SharedAttachmentItem,
} from '../types/chatConversationToolsTypes';

export function toChatToolMessages(
  messages: Array<{
    id: string;
    text: string;
    time: string;
    direction?: 'in' | 'out';
    separatorBefore?: string;
    attachments?: ChatAttachmentView[];
    attachmentName?: string;
    messageType?: string;
    createdAt?: string;
    senderName?: string;
    tags?: string[];
    entityRefs?: import('../../contextual-chat/types/chatEntityTypes').ChatEntityReference[];
  }>,
): ChatToolMessage[] {
  return messages.map((message) => ({
    id: message.id,
    text: message.text,
    time: message.time,
    direction: message.direction,
    separatorBefore: message.separatorBefore,
    attachments: message.attachments,
    attachmentName: message.attachmentName,
    messageType: message.messageType,
    createdAt: message.createdAt,
    senderName: message.senderName,
    tags: message.tags,
    entityRefs: message.entityRefs,
  }));
}

export function collectSharedAttachments(
  messages: ChatToolMessage[],
  labels: { self: string; other: string },
): SharedAttachmentItem[] {
  const items: SharedAttachmentItem[] = [];

  for (const message of messages) {
    const senderLabel =
      message.senderName ??
      (message.direction === 'out' ? labels.self : labels.other);

    if (message.attachments?.length) {
      for (const attachment of message.attachments) {
        items.push({
          key: `${message.id}-${attachment.id}`,
          messageId: message.id,
          attachment,
          senderLabel,
          dateLabel: message.time,
          createdAt: attachment.createdAt || message.createdAt || message.time,
        });
      }
    } else if (message.attachmentName) {
      const fallback: ChatAttachmentView = {
        id: Number(`${message.id}`.replace(/\D/g, '').slice(-8)) || 0,
        filename: message.attachmentName,
        extension: message.attachmentName.split('.').pop()?.toLowerCase() ?? '',
        mimeType: 'application/octet-stream',
        sizeBytes: 0,
        fileUrl: '',
        kind: 'document',
        attachmentType: 'FILE',
        createdAt: message.createdAt ?? new Date().toISOString(),
      };
      items.push({
        key: `${message.id}-legacy`,
        messageId: message.id,
        attachment: fallback,
        senderLabel,
        dateLabel: message.time,
        createdAt: message.createdAt ?? message.time,
      });
    }
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function buildConversationHistory(
  messages: ChatToolMessage[],
  labels: { firstMessage: string; event: string },
): ConversationHistoryEntry[] {
  if (!messages.length) return [];

  const entries: ConversationHistoryEntry[] = [];
  let lastDateGroup: string | undefined;

  messages.forEach((message, index) => {
    const dateGroup = message.separatorBefore;
    if (dateGroup && dateGroup !== lastDateGroup) {
      entries.push({
        id: `date-${dateGroup}`,
        messageId: message.id,
        label: dateGroup,
        preview: '',
        time: message.time,
        dateGroup,
        kind: 'date',
      });
      lastDateGroup = dateGroup;
    }

    const isEvent =
      message.messageType === 'EVENT' ||
      message.messageType === 'SYSTEM' ||
      message.messageType === 'SMART_ACTION';

    const preview = resolveChatMessageBubbleText(
      message.text,
      message.attachments,
      message.attachmentName,
      message.messageType,
    );

    entries.push({
      id: message.id,
      messageId: message.id,
      label: isEvent ? labels.event : index === 0 ? labels.firstMessage : message.time,
      preview: preview || (message.attachments?.length ? message.attachments[0].filename : ''),
      time: message.time,
      dateGroup,
      kind: isEvent ? 'event' : 'message',
    });
  });

  return entries;
}

export function findSearchMatches(messages: ChatToolMessage[], query: string): ChatSearchMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches: ChatSearchMatch[] = [];

  for (const message of messages) {
    const text = resolveChatMessageBubbleText(
      message.text,
      message.attachments,
      message.attachmentName,
      message.messageType,
    );
    if (!text) continue;
    const haystack = text.toLowerCase();
    let start = 0;
  outer: while (start < haystack.length) {
      const index = haystack.indexOf(q, start);
      if (index === -1) break;

      const indices: number[] = [];
      for (let i = 0; i < q.length; i++) indices.push(index + i);

      const existing = matches.find((m) => m.messageId === message.id);
      if (existing) {
        existing.indices.push(...indices);
        break outer;
      }

      matches.push({ messageId: message.id, indices });
      break;
    }
  }

  return matches;
}

export function getMatchedIndicesForMessage(
  matches: ChatSearchMatch[],
  messageId: string,
  activeMatchIndex: number,
): number[] {
  const matchIndex = matches.findIndex((m) => m.messageId === messageId);
  if (matchIndex === -1) return [];
  if (matchIndex !== activeMatchIndex) return [];
  return matches[matchIndex]?.indices ?? [];
}
