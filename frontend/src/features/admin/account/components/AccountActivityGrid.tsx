import { FunctionComponent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, Clock, LucideIcon, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../auth/api';
import { useAuth } from '../../../auth/hooks/useAuth';
import { formatAccountDate } from '../../dashboard/utils/adminUserDisplay';
import { staggerContainer, staggerItem } from '../../dashboard/ui/animations';

interface ActivityItem {
  labelKey: string;
  value: string;
  hintKey: string;
  icon: LucideIcon;
  accent?: 'brand' | 'success' | 'neutral';
}

const AccountActivityGrid: FunctionComponent = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [sessionsCount, setSessionsCount] = useState(1);

  const isFrontendOnlyAdmin = import.meta.env.VITE_FRONTEND_ONLY_ADMIN === 'true';
  const locale = i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'en' ? 'en-US' : 'fr-FR';

  useEffect(() => {
    if (isFrontendOnlyAdmin || !user) return;
    let cancelled = false;
    void authApi
      .getSessions()
      .then((sessions) => {
        if (!cancelled) setSessionsCount(sessions.length);
      })
      .catch(() => {
        if (!cancelled) setSessionsCount(1);
      });
    return () => {
      cancelled = true;
    };
  }, [isFrontendOnlyAdmin, user?.id]);

  const statusLabel =
    user?.account_status === 'ACTIVE'
      ? t('admin.account.activity.statusValue')
      : (user?.account_status ?? t('admin.account.activity.statusValue'));

  const items: ActivityItem[] = [
    {
      labelKey: 'admin.account.activity.lastLogin',
      value: formatAccountDate(user?.last_login_at, locale),
      hintKey: 'admin.account.activity.lastLoginHint',
      icon: Clock,
      accent: 'brand',
    },
    {
      labelKey: 'admin.account.activity.status',
      value: statusLabel,
      hintKey: 'admin.account.activity.statusHint',
      icon: Shield,
      accent: 'success',
    },
    {
      labelKey: 'admin.account.activity.memberSince',
      value: formatAccountDate(user?.profile?.created_at ?? user?.created_at, locale),
      hintKey: 'admin.account.activity.memberSinceHint',
      icon: Calendar,
      accent: 'neutral',
    },
    {
      labelKey: 'admin.account.activity.sessions',
      value: String(sessionsCount),
      hintKey: 'admin.account.activity.sessionsHint',
      icon: Activity,
      accent: 'brand',
    },
  ];

  const accentClass: Record<NonNullable<ActivityItem['accent']>, string> = {
    brand: 'admin-activity-card--brand',
    success: 'admin-activity-card--success',
    neutral: 'admin-activity-card--neutral',
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="admin-activity-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.labelKey}
            variants={staggerItem}
            className={`admin-activity-card group relative overflow-hidden rounded-xl border p-5 ${accentClass[item.accent ?? 'neutral']}`}
          >
            <span
              className={`admin-activity-card-accent admin-activity-card-accent--${item.accent ?? 'neutral'}`}
              aria-hidden
            />
            <span className="admin-activity-card-icon relative flex h-11 w-11 items-center justify-center rounded-xl">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="relative mt-4 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-secondary)]">
              {t(item.labelKey)}
            </p>
            <p className="relative mt-1 text-lg font-bold tracking-tight text-[var(--admin-text)]">{item.value}</p>
            <p className="relative mt-1 text-xs text-[var(--admin-text-muted)]">{t(item.hintKey)}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default AccountActivityGrid;
