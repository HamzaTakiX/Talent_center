import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { fetchChatInboxSummary } from '../api/chatApi';
import { scopeUnreadKey } from '../config/chatNavModuleMap';
import { useChatPresenceWebSocket } from '../hooks/useChatPresenceWebSocket';
import type { ChatWsEvent } from '../hooks/useChatWebSocket';
import type { ChatModule } from '../types';

type ModuleUnreadMap = Partial<Record<ChatModule, number>>;
type ScopedUnreadMap = Partial<Record<string, number>>;

interface ChatUnreadContextValue {
  getModuleUnread: (module: ChatModule) => number;
  getScopedUnread: (module: ChatModule, entityType?: string) => number;
  refresh: () => Promise<void>;
}

const ChatUnreadContext = createContext<ChatUnreadContextValue | null>(null);

const INBOX_REFRESH_EVENTS = new Set(['inbox.updated', 'message.created', 'read_receipt']);

export const ChatUnreadProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [unreadByModule, setUnreadByModule] = useState<ModuleUnreadMap>({});
  const [unreadByScope, setUnreadByScope] = useState<ScopedUnreadMap>({});
  const refreshTimerRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const { modules, scopes } = await fetchChatInboxSummary();
      const nextModule: ModuleUnreadMap = {};
      for (const item of modules) {
        if (item.unread > 0) {
          nextModule[item.module] = item.unread;
        }
      }

      const nextScope: ScopedUnreadMap = {};
      for (const item of scopes) {
        if (item.unread > 0) {
          nextScope[scopeUnreadKey(item.module, item.entity_type)] = item.unread;
        }
      }

      setUnreadByModule(nextModule);
      setUnreadByScope(nextScope);
    } catch {
      /* silent — sidebar badge is non-critical */
    }
  }, []);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;
      void refresh();
    }, 300);
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(
    () => () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    },
    [],
  );

  const handleWsEvent = useCallback(
    (event: ChatWsEvent) => {
      if (INBOX_REFRESH_EVENTS.has(event.event_type)) {
        scheduleRefresh();
      }
    },
    [scheduleRefresh],
  );

  useChatPresenceWebSocket({ onEvent: handleWsEvent });

  const value = useMemo<ChatUnreadContextValue>(
    () => ({
      getModuleUnread: (module: ChatModule) => unreadByModule[module] ?? 0,
      getScopedUnread: (module: ChatModule, entityType?: string) =>
        unreadByScope[scopeUnreadKey(module, entityType)] ??
        (entityType ? 0 : unreadByModule[module] ?? 0),
      refresh,
    }),
    [refresh, unreadByModule, unreadByScope],
  );

  return <ChatUnreadContext.Provider value={value}>{children}</ChatUnreadContext.Provider>;
};

export function useChatUnread(): ChatUnreadContextValue {
  const ctx = useContext(ChatUnreadContext);
  if (!ctx) {
    throw new Error('useChatUnread must be used within ChatUnreadProvider');
  }
  return ctx;
}

export function useChatUnreadCount(module: ChatModule | undefined, entityType?: string): number {
  const { getScopedUnread } = useChatUnread();
  return module ? getScopedUnread(module, entityType) : 0;
}
