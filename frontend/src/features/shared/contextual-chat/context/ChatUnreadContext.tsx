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
import { useLocation } from 'react-router-dom';
import { fetchChatInboxSummary } from '../api/chatApi';
import { useChatPresenceWebSocket } from '../hooks/useChatPresenceWebSocket';
import type { ChatWsEvent } from '../hooks/useChatWebSocket';
import type { ChatModule } from '../types';

type ModuleUnreadMap = Partial<Record<ChatModule, number>>;

interface ChatUnreadContextValue {
  getModuleUnread: (module: ChatModule) => number;
  refresh: () => Promise<void>;
}

const ChatUnreadContext = createContext<ChatUnreadContextValue | null>(null);

const INBOX_REFRESH_EVENTS = new Set(['inbox.updated', 'message.created', 'read_receipt']);

export const ChatUnreadProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [unreadByModule, setUnreadByModule] = useState<ModuleUnreadMap>({});
  const refreshTimerRef = useRef<number | null>(null);
  const { pathname } = useLocation();

  const refresh = useCallback(async () => {
    try {
      const modules = await fetchChatInboxSummary();
      const next: ModuleUnreadMap = {};
      for (const item of modules) {
        if (item.unread > 0) {
          next[item.module] = item.unread;
        }
      }
      setUnreadByModule(next);
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
  }, [refresh, pathname]);

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
      refresh,
    }),
    [refresh, unreadByModule],
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

export function useChatUnreadCount(module: ChatModule | undefined): number {
  const { getModuleUnread } = useChatUnread();
  return module ? getModuleUnread(module) : 0;
}
