import type { ConversationDto } from '../../../../shared/contextual-chat/types';

function conversationActivityMs(dto: ConversationDto): number {
  if (!dto.last_message_at) return 0;
  const ms = new Date(dto.last_message_at).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export function sortConversationsByRecent(items: ConversationDto[]): ConversationDto[] {
  return [...items].sort(
    (a, b) => conversationActivityMs(b) - conversationActivityMs(a),
  );
}

export function patchConversationArchiveState(
  items: ConversationDto[],
  conversationId: number,
  archived: boolean,
): ConversationDto[] {
  const targetId = Number(conversationId);
  return items.map((conversation) =>
    Number(conversation.id) === targetId
      ? {
          ...conversation,
          metadata_json: {
            ...(conversation.metadata_json ?? {}),
            admin_inbox_archived: archived,
          },
        }
      : conversation,
  );
}

function isExplicitlyArchived(metadata: Record<string, unknown> | undefined): boolean {
  return metadata?.admin_inbox_archived === true;
}

function isExplicitlyUnarchived(metadata: Record<string, unknown> | undefined): boolean {
  return metadata?.admin_inbox_archived === false;
}

function resolveAdminInboxArchived(
  prevMeta: Record<string, unknown>,
  fetchedMeta: Record<string, unknown>,
  activeListOnly: boolean,
  archiveOverride?: boolean,
): boolean {
  if (activeListOnly) return false;
  if (archiveOverride !== undefined) return archiveOverride;

  if (Object.prototype.hasOwnProperty.call(fetchedMeta, 'admin_inbox_archived')) {
    return fetchedMeta.admin_inbox_archived === true;
  }

  if (isExplicitlyArchived(prevMeta)) return true;
  if (isExplicitlyUnarchived(prevMeta)) return false;
  return false;
}

/** Keep fresher local sidebar previews when a refetch returns stale data. */
export function mergeFetchedConversations(
  fetched: ConversationDto[],
  previous: ConversationDto[],
  options?: { activeListOnly?: boolean; archiveOverrides?: ReadonlyMap<number, boolean> },
): ConversationDto[] {
  const activeListOnly = options?.activeListOnly ?? false;
  const archiveOverrides = options?.archiveOverrides;
  const prevById = new Map(previous.map((conversation) => [conversation.id, conversation]));
  const fetchedIds = new Set(fetched.map((conversation) => conversation.id));

  const merged = fetched.map((conversation) => {
    const prev = prevById.get(conversation.id);
    if (!prev) {
      if (!activeListOnly) return conversation;
      return {
        ...conversation,
        metadata_json: {
          ...(conversation.metadata_json ?? {}),
          admin_inbox_archived: false,
        },
      };
    }

    const prevMeta = (prev.metadata_json ?? {}) as Record<string, unknown>;
    const fetchedMeta = (conversation.metadata_json ?? {}) as Record<string, unknown>;

    let next = conversation;
    const prevMs = conversationActivityMs(prev);
    const fetchedMs = conversationActivityMs(conversation);
    if (prev?.last_message_at && prevMs > fetchedMs) {
      next = {
        ...next,
        last_preview: prev.last_preview,
        last_message_at: prev.last_message_at,
        last_message_is_own: prev.last_message_is_own,
      };
    }

    next = {
      ...next,
      metadata_json: {
        ...fetchedMeta,
        admin_inbox_archived: resolveAdminInboxArchived(
          prevMeta,
          fetchedMeta,
          activeListOnly,
          archiveOverrides?.get(conversation.id),
        ),
      },
    };

    return next;
  });

  for (const prev of previous) {
    if (fetchedIds.has(prev.id)) continue;
    const prevMeta = (prev.metadata_json ?? {}) as Record<string, unknown>;
    if (isExplicitlyUnarchived(prevMeta) || isExplicitlyArchived(prevMeta)) {
      merged.push(prev);
    }
  }

  return sortConversationsByRecent(merged);
}

export function patchConversationPreviewInList(
  items: ConversationDto[],
  conversationId: number,
  preview: string,
  options?: {
    isOwn?: boolean;
    at?: string;
    unreadCount?: number;
  },
): ConversationDto[] {
  const targetId = Number(conversationId);
  const at = options?.at ?? new Date().toISOString();
  return sortConversationsByRecent(
    items.map((conversation) =>
      Number(conversation.id) === targetId
        ? {
            ...conversation,
            last_preview: preview.slice(0, 200),
            last_message_is_own: options?.isOwn ?? conversation.last_message_is_own,
            last_message_at: at,
            unread_count:
              options?.unreadCount ?? conversation.unread_count,
          }
        : conversation,
    ),
  );
}

/** Clear unread for one conversation in local inbox state. */
export function zeroConversationUnreadInList(
  items: ConversationDto[],
  conversationId: number,
): ConversationDto[] {
  const targetId = Number(conversationId);
  return items.map((conversation) =>
    Number(conversation.id) === targetId ? { ...conversation, unread_count: 0 } : conversation,
  );
}

const SEEN_WS_MESSAGE_CAP = 500;

/**
 * Apply optimistic preview + unread bump for an incoming WS message.
 * Deduplicates by message_id and derives unread from prev list state (not refs).
 */
export function applyIncomingMessageUnreadPreview(
  prev: ConversationDto[],
  conversationId: number,
  preview: string,
  options: {
    isActiveConv: boolean;
    isOwn?: boolean;
    at?: string;
    messageId?: number | null;
    seenMessageIds: Set<number>;
  },
): ConversationDto[] {
  const messageId = options.messageId;
  if (messageId != null && Number.isFinite(messageId)) {
    if (options.seenMessageIds.has(messageId)) {
      return prev;
    }
    options.seenMessageIds.add(messageId);
    if (options.seenMessageIds.size > SEEN_WS_MESSAGE_CAP) {
      options.seenMessageIds.clear();
      options.seenMessageIds.add(messageId);
    }
  }

  const existing = prev.find((c) => Number(c.id) === Number(conversationId));
  const unreadCount = options.isActiveConv ? 0 : (existing?.unread_count ?? 0) + 1;

  return patchConversationPreviewInList(prev, conversationId, preview, {
    isOwn: options.isOwn ?? false,
    at: options.at,
    unreadCount,
  });
}
