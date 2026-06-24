import type {
  PrimaryDeskFilter,
  PrimaryFilterCounts,
  SupportInboxStats,
  SupportMessage,
  SupportQuickFilters,
} from '../types/supportInboxTypes';

export function formatSupportChatTime(language = 'fr'): string {
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

export function computeSupportInboxStats<
  T extends {
    archived?: boolean;
    unreadCount: number;
    resolved?: boolean;
    messages: SupportMessage[];
  },
>(conversations: T[]): SupportInboxStats {
  const active = conversations.filter((c) => !c.archived);
  return {
    unread: active.filter((c) => c.unreadCount > 0).length,
    pending: active.filter((c) => {
      const last = c.messages[c.messages.length - 1];
      return !c.resolved && last?.direction === 'in';
    }).length,
    resolved: active.filter((c) => c.resolved).length,
  };
}

export function hasActiveQuickFilters(filters: SupportQuickFilters): boolean {
  return filters.unread || filters.urgent;
}

export function applyPrimaryDeskFilter<
  T extends { archived?: boolean },
>(conv: T, primary: PrimaryDeskFilter): boolean {
  if (primary === 'archived') return Boolean(conv.archived);
  return !conv.archived;
}

export function computePrimaryFilterCounts<
  T extends { archived?: boolean },
>(conversations: T[]): PrimaryFilterCounts {
  return {
    all: conversations.filter((c) => !c.archived).length,
    archived: conversations.filter((c) => c.archived).length,
  };
}

export function matchesQuickFilters<
  T extends { unreadCount: number; urgent?: boolean },
>(conv: T, filters: SupportQuickFilters): boolean {
  if (filters.unread && conv.unreadCount === 0) return false;
  if (filters.urgent && !conv.urgent) return false;
  return true;
}
