import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, FileText, Megaphone, Wallet } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  initialAdminNotifications,
  type AdminNotification,
} from '../data/adminNotificationsMock';

const notificationIconById: Record<string, typeof Bell> = {
  '1': FileText,
  '2': Wallet,
  '3': Megaphone,
  '4': Bell,
};

const AdminNotificationButton: FunctionComponent = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>(() =>
    initialAdminNotifications.map((n) => ({ ...n }))
  );
  const rootRef = useRef<HTMLDivElement>(null);

  const displayNotifications = useMemo(
    () =>
      notifications.map((item) => ({
        ...item,
        title: t(`admin.notifications.items.${item.titleKey}`),
        message: t(`admin.notifications.items.${item.messageKey}`),
        time:
          item.timeKey === 'yesterday'
            ? t('admin.notifications.times.yesterday')
            : t(`admin.notifications.times.${item.timeKey}`, { count: item.timeCount ?? 0 }),
      })),
    [notifications, t]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

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
        className={`admin-notification-btn group relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition-[border-color,box-shadow,background-color,color] duration-200 ${
          open ? 'bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]' : ''
        }`}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, var(--admin-brand-muted) 0%, transparent 70%)',
          }}
          aria-hidden
        />

        <motion.span
          animate={hasUnread && !open ? { rotate: [0, -12, 12, -8, 0] } : {}}
          transition={
            hasUnread && !open
              ? { duration: 0.55, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 }
              : undefined
          }
          className="relative z-[1] flex items-center justify-center"
        >
          <Bell className="admin-notification-icon h-[19px] w-[19px]" strokeWidth={1.75} />
        </motion.span>

        {hasUnread && (
          <>
            <span
              className="admin-notification-pulse pointer-events-none absolute right-2 top-2 h-2.5 w-2.5 rounded-full"
              aria-hidden
            />
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 520, damping: 22 }}
              className="admin-notification-badge absolute -end-0.5 -top-0.5 z-[2] flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none tracking-tight"
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
            className="admin-notification-dropdown absolute end-0 top-[calc(100%+10px)] z-50 flex w-[min(100vw-24px,380px)] flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] shadow-admin-lg"
          >
            <div className="admin-notification-dropdown-header flex items-start justify-between gap-3 px-4 pb-3 pt-4">
              <motion.div>
                <h2 className="text-[15px] font-semibold tracking-tight text-[var(--admin-text)]">
                  {t('admin.notifications.title')}
                </h2>
                {hasUnread ? (
                  <p className="mt-1 text-xs text-[var(--admin-text-secondary)]">
                    {t('admin.notifications.unread', { count: unreadCount })}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                    {t('admin.notifications.allCaughtUp')}
                  </p>
                )}
              </motion.div>
              {hasUnread && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="admin-notification-mark-all inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                >
                  <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  {t('admin.notifications.markAllRead')}
                </button>
              )}
            </div>

            <ul className="admin-notification-list m-0 max-h-[min(60vh,340px)] list-none overflow-y-auto overscroll-contain p-2 pt-0">
              {displayNotifications.length === 0 ? (
                <li className="list-none rounded-xl px-4 py-10 text-center text-sm text-[var(--admin-text-secondary)]">
                  {t('admin.notifications.empty')}
                </li>
              ) : (
                displayNotifications.map((item, index) => {
                  const Icon = notificationIconById[item.id] ?? Bell;
                  return (
                    <li key={item.id} className="list-none">
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        className={`admin-notification-item group flex w-full gap-3 rounded-xl p-3 text-start transition-all duration-200 ${
                          !item.read ? 'admin-notification-item--unread' : ''
                        }`}
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <span className="admin-notification-item-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 pt-0.5">
                          <span className="flex items-start justify-between gap-2">
                            <span
                              className={`block text-[13px] leading-snug ${
                                !item.read
                                  ? 'font-semibold text-[var(--admin-text)]'
                                  : 'font-medium text-[var(--admin-text-secondary)]'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="shrink-0 text-[11px] tabular-nums text-[var(--admin-text-muted)]">
                              {item.time}
                            </span>
                          </span>
                          <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--admin-text-secondary)]">
                            {item.message}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminNotificationButton;
