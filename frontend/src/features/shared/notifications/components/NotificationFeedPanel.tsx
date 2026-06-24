import { FunctionComponent, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { fetchNotificationFeed, clickNotification } from '../api/notificationsApi';
import { formatRelativeTime, getNotificationIcon, sortNotifications } from '../utils/notificationHelpers';
import type { NotificationCategory, NotificationItem } from '../types';

interface NotificationFeedPanelProps {
  titleKey?: string;
  category?: NotificationCategory;
  limit?: number;
  className?: string;
  emptyTitleKey?: string;
  emptyDescriptionKey?: string;
}

const NotificationFeedPanel: FunctionComponent<NotificationFeedPanelProps> = ({
  titleKey = 'notifications.center.panelTitle',
  category,
  limit = 5,
  className = '',
  emptyTitleKey = 'notifications.center.emptyTitle',
  emptyDescriptionKey = 'notifications.center.emptyDesc',
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchNotificationFeed({ section: 'unread', category, limit })
      .then((feed) => {
        if (active) setItems(sortNotifications(feed.items));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, limit]);

  const handleOpen = async (item: NotificationItem) => {
    const result = await clickNotification(item.id);
    const url = result.action_url || item.action_url;
    if (url) {
      if (url.startsWith('http')) window.location.href = url;
      else navigate(url);
    }
  };

  return (
    <section className={className}>
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-5 w-5 text-[var(--admin-brand,#7c3aed)]" strokeWidth={1.75} aria-hidden />
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text,#101828)]">{t(titleKey)}</h2>
      </div>
      <div>
        {loading ? (
          <p className="text-sm text-[var(--admin-text-secondary,#6a7282)]">{t('notifications.center.loading')}</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl px-2 py-6 text-center">
            <p className="m-0 text-sm font-medium text-[var(--admin-text,#101828)]">{t(emptyTitleKey)}</p>
            <p className="m-0 mt-1 text-xs text-[var(--admin-text-muted,#9ca3af)]">{t(emptyDescriptionKey)}</p>
          </div>
        ) : (
          items.map((item) => {
            const Icon = getNotificationIcon(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => void handleOpen(item)}
                className="mb-2 flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-[var(--admin-brand-muted,#f3e8ff)]/60"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-brand-muted,#f3e8ff)] text-[var(--admin-brand,#7c3aed)]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-medium text-[var(--admin-text,#101828)]">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--admin-text-muted,#9ca3af)]">
                    {formatRelativeTime(item.created_at, i18n.language)}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
};

export default NotificationFeedPanel;
