import type { SupportInboxStats, SupportMessage, SupportQuickFilters } from '../types/supportInboxTypes';

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
  return filters.unread || filters.urgent || filters.archived;
}

export function matchesQuickFilters<
  T extends { archived?: boolean; unreadCount: number; urgent?: boolean },
>(conv: T, filters: SupportQuickFilters): boolean {
  if (filters.archived) {
    if (!conv.archived) return false;
  } else if (conv.archived) {
    return false;
  }
  if (filters.unread && conv.unreadCount === 0) return false;
  if (filters.urgent && !conv.urgent) return false;
  return true;
}
