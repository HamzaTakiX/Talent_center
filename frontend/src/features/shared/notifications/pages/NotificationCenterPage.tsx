import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, Bell, CheckCheck, Filter, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  archiveNotification,
  fetchNotificationCategories,
  fetchNotificationFeed,
  fetchNotificationStats,
  markAllNotificationsRead,
  markNotificationRead,
  clickNotification,
} from '../api/notificationsApi';
import { formatRelativeTime, getNotificationIcon, sortNotifications } from '../utils/notificationHelpers';
import type {
  NotificationCategory,
  NotificationFeedParams,
  NotificationItem,
  NotificationPriority,
  NotificationSection,
  NotificationUserStats,
} from '../types';

const SECTIONS: NotificationSection[] = ['all', 'unread', 'read', 'archived', 'action_required'];

interface NotificationCenterPageProps {
  title?: string;
}

const NotificationCenterPage: FunctionComponent<NotificationCenterPageProps> = ({ title }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [section, setSection] = useState<NotificationSection>('all');
  const [category, setCategory] = useState<NotificationCategory | ''>('');
  const [priority, setPriority] = useState<NotificationPriority | ''>('');
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<NotificationUserStats | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [priorities, setPriorities] = useState<{ value: string; label: string }[]>([]);
  const limit = 20;

  const loadMeta = useCallback(async () => {
    const meta = await fetchNotificationCategories();
    setCategories(meta.categories);
    setPriorities(meta.priorities);
  }, []);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params: NotificationFeedParams = { section, limit, offset };
      if (category) params.category = category;
      if (priority) params.priority = priority;
      const [feed, userStats] = await Promise.all([fetchNotificationFeed(params), fetchNotificationStats()]);
      setItems((prev) => (offset === 0 ? sortNotifications(feed.items) : sortNotifications([...prev, ...feed.items])));
      setTotal(feed.total);
      setStats(userStats);
    } finally {
      setLoading(false);
    }
  }, [section, category, priority, offset]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const handleOpen = async (item: NotificationItem) => {
    const result = await clickNotification(item.id);
    setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, is_read: true } : entry)));
    const url = result.action_url || item.action_url;
    if (url) {
      if (url.startsWith('http')) window.location.href = url;
      else navigate(url);
    }
  };

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    await loadFeed();
  };

  const handleArchive = async (id: number) => {
    await archiveNotification(id);
    await loadFeed();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await loadFeed();
  };

  const canLoadMore = offset + limit < total;

  const sectionCounts = useMemo(
    () => ({
      all: stats?.total ?? 0,
      unread: stats?.unread ?? 0,
      read: stats?.read ?? 0,
      archived: stats?.archived ?? 0,
      action_required: stats?.action_required ?? 0,
    }),
    [stats],
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-[var(--admin-brand,#7c3aed)]">
            <Bell className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-sm font-medium">{t('notifications.center.badge')}</span>
          </div>
          <h1 className="m-0 text-2xl font-bold text-[var(--admin-text,#101828)]">
            {title ?? t('notifications.center.title')}
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-text-secondary,#6a7282)]">
            {t('notifications.center.subtitle')}
          </p>
        </div>
        {(stats?.unread ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--admin-border,#e5e7eb)] px-4 py-2 text-sm font-medium"
          >
            <CheckCheck className="h-4 w-4" />
            {t('admin.notifications.markAllRead')}
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {SECTIONS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => {
              setSection(entry);
              setOffset(0);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              section === entry
                ? 'bg-[var(--admin-brand,#7c3aed)] text-white'
                : 'bg-[var(--admin-brand-muted,#f3e8ff)] text-[var(--admin-brand,#7c3aed)]'
            }`}
          >
            {t(`notifications.center.sections.${entry}`)} ({sectionCounts[entry]})
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--admin-border,#e5e7eb)] bg-white p-4">
        <Filter className="h-4 w-4 text-[var(--admin-text-muted,#9ca3af)]" />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as NotificationCategory | '');
            setOffset(0);
          }}
          className="rounded-lg border border-[var(--admin-border,#e5e7eb)] px-3 py-2 text-sm"
        >
          <option value="">{t('notifications.center.filters.allCategories')}</option>
          {categories.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as NotificationPriority | '');
            setOffset(0);
          }}
          className="rounded-lg border border-[var(--admin-border,#e5e7eb)] px-3 py-2 text-sm"
        >
          <option value="">{t('notifications.center.filters.allPriorities')}</option>
          {priorities.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--admin-border,#e5e7eb)] bg-white">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-[var(--admin-text-secondary,#6a7282)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('notifications.center.loading')}
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-[var(--admin-text-secondary,#6a7282)]">
            {t('admin.notifications.empty')}
          </div>
        ) : (
          <ul className="m-0 list-none divide-y divide-[var(--admin-border,#e5e7eb)] p-0">
            {items.map((item) => {
              const Icon = getNotificationIcon(item);
              return (
                <li key={item.id} className="list-none">
                  <div className="flex flex-wrap items-start gap-3 px-4 py-4 sm:px-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-brand-muted,#f3e8ff)] text-[var(--admin-brand,#7c3aed)]">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => void handleOpen(item)}
                          className="m-0 border-0 bg-transparent p-0 text-left"
                        >
                          <span className={`block text-sm ${!item.is_read ? 'font-semibold' : 'font-medium'} text-[var(--admin-text,#101828)]`}>
                            {item.title}
                          </span>
                        </button>
                        <span className="text-xs text-[var(--admin-text-muted,#9ca3af)]">
                          {formatRelativeTime(item.created_at, i18n.language)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--admin-text-secondary,#6a7282)]">{item.body}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5">{item.category}</span>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5">{item.priority}</span>
                        {item.requires_action && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                            {t('notifications.center.actionRequired')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!item.is_read && (
                        <button
                          type="button"
                          aria-label={t('notifications.center.markRead')}
                          onClick={() => void handleMarkRead(item.id)}
                          className="rounded-lg p-2 hover:bg-neutral-100"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      )}
                      {!item.is_archived && (
                        <button
                          type="button"
                          aria-label={t('notifications.center.archive')}
                          onClick={() => void handleArchive(item.id)}
                          className="rounded-lg p-2 hover:bg-neutral-100"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {canLoadMore && (
        <div className="mt-4 text-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => setOffset((prev) => prev + limit)}
            className="rounded-xl border border-[var(--admin-border,#e5e7eb)] px-4 py-2 text-sm font-medium"
          >
            {loading ? t('notifications.center.loading') : t('notifications.center.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenterPage;
