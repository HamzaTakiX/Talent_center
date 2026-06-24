import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Bell, CheckCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime, getNotificationIcon } from '../utils/notificationHelpers';
import type { NotificationItem } from '../types';

type NotificationBellVariant = 'admin' | 'encadrant';

interface NotificationBellProps {
  variant?: NotificationBellVariant;
  centerPath?: string;
  previewLimit?: number;
}

const NotificationBell: FunctionComponent<NotificationBellProps> = ({
  variant = 'admin',
  centerPath = '/notifications',
  previewLimit = 8,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, unreadCount, loading, markRead, markAllRead, openNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const previewItems = useMemo(
    () => items.filter((item) => !item.is_archived).slice(0, previewLimit),
    [items, previewLimit],
  );

  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? '99+' : String(unreadCount);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleOpenItem = async (item: NotificationItem) => {
    const url = await openNotification(item);
    setOpen(false);
    if (url) {
      if (url.startsWith('http')) {
        window.location.href = url;
      } else {
        navigate(url);
      }
    }
  };

  const isEncadrant = variant === 'encadrant';

  return (
    <motion.div ref={rootRef} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          hasUnread
            ? t('admin.notifications.ariaUnread', { count: unreadCount })
            : t('admin.notifications.aria')
        }
        className={
          isEncadrant
            ? 'relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[#101828] transition-colors hover:bg-neutral-100'
            : `admin-notification-btn group relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition-[border-color,box-shadow,background-color,color] duration-200 ${
                open ? 'bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]' : ''
              }`
        }
      >
        <Bell className={isEncadrant ? 'h-5 w-5' : 'admin-notification-icon h-[19px] w-[19px]'} strokeWidth={1.75} />

        {hasUnread && (
          <>
            {!isEncadrant && (
              <span className="admin-notification-pulse pointer-events-none absolute right-2 top-2 h-2.5 w-2.5 rounded-full" aria-hidden />
            )}
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 520, damping: 22 }}
              className={
                isEncadrant
                  ? 'absolute left-4 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#fb2c36] text-center text-[10px] font-medium leading-4 text-white'
                  : 'admin-notification-badge absolute -end-0.5 -top-0.5 z-[2] flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none tracking-tight'
              }
            >
              {displayCount}
            </motion.span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t('admin.notifications.title')}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={
              isEncadrant
                ? 'absolute end-0 top-[calc(100%+10px)] z-50 flex w-[min(100vw-24px,380px)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl'
                : 'admin-notification-dropdown absolute end-0 top-[calc(100%+10px)] z-50 flex w-[min(100vw-24px,380px)] flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] shadow-admin-lg'
            }
          >
            <div className={isEncadrant ? 'flex items-start justify-between gap-3 px-4 pb-3 pt-4' : 'admin-notification-dropdown-header flex items-start justify-between gap-3 px-4 pb-3 pt-4'}>
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={
                    isEncadrant
                      ? 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-neutral-100 text-[#155dfc]'
                      : 'admin-notification-header-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]'
                  }
                  aria-hidden
                >
                  <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold tracking-tight text-[var(--admin-text,#101828)]">
                    {t('admin.notifications.title')}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--admin-text-secondary,#6a7282)]">
                    {hasUnread
                      ? t('admin.notifications.unread', { count: unreadCount })
                      : t('admin.notifications.allCaughtUp')}
                  </p>
                </div>
              </div>
              {hasUnread && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className={
                    isEncadrant
                      ? 'inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium'
                      : 'admin-notification-mark-all inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all'
                  }
                >
                  <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  {t('admin.notifications.markAllRead')}
                </button>
              )}
            </div>

            <ul className={isEncadrant ? 'admin-notification-scroll m-0 max-h-[min(60vh,340px)] min-w-0 list-none overflow-x-hidden overflow-y-auto p-2 pt-0' : 'admin-notification-list admin-notification-scroll m-0 max-h-[min(60vh,340px)] min-w-0 list-none overflow-x-hidden overflow-y-auto overscroll-contain p-2 pt-0'}>
              {loading && previewItems.length === 0 ? (
                <li className="list-none rounded-xl px-4 py-10 text-center text-sm text-[var(--admin-text-secondary,#6a7282)]">
                  {t('notifications.center.loading')}
                </li>
              ) : previewItems.length === 0 ? (
                <li className="list-none rounded-xl px-4 py-10 text-center text-sm text-[var(--admin-text-secondary,#6a7282)]">
                  {t('admin.notifications.empty')}
                </li>
              ) : (
                previewItems.map((item, index) => {
                  const Icon = getNotificationIcon(item);
                  return (
                    <li key={item.id} className="list-none">
                      <button
                        type="button"
                        onClick={() => void handleOpenItem(item)}
                        className={`admin-notification-item group flex w-full min-w-0 gap-3 overflow-hidden rounded-xl p-3 text-start transition-all duration-200 ${
                          !item.is_read ? 'admin-notification-item--unread' : ''
                        }`}
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <span className="admin-notification-item-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 pt-0.5">
                          <span className="flex min-w-0 items-start justify-between gap-2">
                            <span
                              className={`block min-w-0 flex-1 truncate text-[13px] leading-snug ${
                                !item.is_read
                                  ? 'font-semibold text-[var(--admin-text,#101828)]'
                                  : 'font-medium text-[var(--admin-text-secondary,#6a7282)]'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="shrink-0 text-[11px] tabular-nums text-[var(--admin-text-muted,#9ca3af)]">
                              {formatRelativeTime(item.created_at, i18n.language)}
                            </span>
                          </span>
                          <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--admin-text-secondary,#6a7282)]">
                            {item.body}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            <div className={isEncadrant ? 'flex items-center justify-center border-t border-neutral-200 px-3 py-3' : 'admin-notification-dropdown-footer px-3 py-3'}>
              <Link
                to={centerPath}
                onClick={() => setOpen(false)}
                className={
                  isEncadrant
                    ? 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#155dfc]/20 bg-[#155dfc]/10 px-3 py-2 text-[11px] font-semibold text-[#155dfc] no-underline transition-all hover:bg-[#155dfc] hover:text-white'
                    : 'admin-notification-view-all'
                }
              >
                {t('admin.notifications.viewAll')}
                <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotificationBell;
