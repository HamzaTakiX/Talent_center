import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FunctionComponent,
  type ReactNode,
} from 'react';
import {
  archiveNotification,
  clickNotification,
  fetchNotificationFeed,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationsApi';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';
import { sortNotifications } from '../utils/notificationHelpers';
import type { NotificationFeedParams, NotificationItem, NotificationWsEvent } from '../types';

interface NotificationContextValue {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refresh: (params?: NotificationFeedParams) => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  archive: (id: number) => Promise<void>;
  openNotification: (item: NotificationItem) => Promise<string | null>;
  prependItem: (item: NotificationItem) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (params: NotificationFeedParams = { limit: 20 }) => {
    setLoading(true);
    try {
      const feed = await fetchNotificationFeed(params);
      setItems(sortNotifications(feed.items));
      setUnreadCount(feed.unread_count);
    } catch {
      /* silent — backend may be reloading or offline */
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUnreadOnly = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    void refresh({ limit: 20 });
  }, [refresh]);

  const handleWsEvent = useCallback(
    (event: NotificationWsEvent) => {
      if (event.event_type === 'notification.created' && event.notification) {
        setItems((prev) => sortNotifications([event.notification!, ...prev.filter((n) => n.id !== event.notification!.id)]));
        setUnreadCount((prev) => prev + 1);
      }
      if (event.event_type === 'notification.read' && event.notification_id) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === event.notification_id ? { ...item, is_read: true, read_at: new Date().toISOString() } : item,
          ),
        );
      }
      if (event.event_type === 'notification.unread_count' && typeof event.count === 'number') {
        setUnreadCount(event.count);
      }
    },
    [],
  );

  useNotificationWebSocket({ onEvent: handleWsEvent });

  const markRead = useCallback(async (id: number) => {
    const updated = await markNotificationRead(id);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true, read_at: new Date().toISOString() })));
    setUnreadCount(0);
  }, []);

  const archive = useCallback(async (id: number) => {
    const updated = await archiveNotification(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (!updated.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  const openNotification = useCallback(async (item: NotificationItem) => {
    const result = await clickNotification(item.id);
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, is_read: true, read_at: new Date().toISOString() } : entry,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    return result.action_url || item.action_url || null;
  }, []);

  const prependItem = useCallback((item: NotificationItem) => {
    setItems((prev) => sortNotifications([item, ...prev.filter((n) => n.id !== item.id)]));
    if (!item.is_read) setUnreadCount((prev) => prev + 1);
  }, []);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      loading,
      refresh,
      markRead,
      markAllRead,
      archive,
      openNotification,
      prependItem,
    }),
    [items, unreadCount, loading, refresh, markRead, markAllRead, archive, openNotification, prependItem],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshUnreadOnly();
    }, 120000);
    return () => window.clearInterval(interval);
  }, [refreshUnreadOnly]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}

export function useNotificationsOptional() {
  return useContext(NotificationContext);
}
