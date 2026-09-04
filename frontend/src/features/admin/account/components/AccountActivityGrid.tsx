import { FunctionComponent, useEffect, useState } from 'react';
import { Activity, Calendar, Clock, LucideIcon, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../../auth/api';
import { useAuth } from '../../../auth/hooks/useAuth';
import { formatAccountDate } from '../../dashboard/utils/adminUserDisplay';

interface ActivityItem {
  labelKey: string;
  value: string;
  hintKey: string;
  icon: LucideIcon;
  accent: 'brand' | 'success' | 'neutral';
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

  return (
    <ul className="admin-profile-activity" aria-label={t('admin.account.activity.title')}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.labelKey}
            className={`admin-profile-activity__item admin-activity-card--${item.accent}`}
          >
            <span className="admin-activity-card-icon admin-profile-activity__icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                {t(item.labelKey)}
              </p>
              <p className="m-0 mt-0.5 truncate text-sm font-semibold tracking-tight text-[var(--admin-text)]">
                {item.value}
              </p>
              <p className="m-0 mt-0.5 truncate text-[11px] text-[var(--admin-text-muted)]">{t(item.hintKey)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default AccountActivityGrid;
