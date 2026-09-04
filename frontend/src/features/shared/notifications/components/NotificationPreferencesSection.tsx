import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, Loader2, Mail, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  fetchNotificationCategories,
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '../api/notificationsApi';
import type { NotificationCategory, NotificationPreference } from '../types';

interface NotificationPreferencesSectionProps {
  onSaved?: () => void;
}

const CHANNELS = ['IN_APP', 'EMAIL', 'PUSH'] as const;
const CHANNEL_ICONS = {
  IN_APP: Bell,
  EMAIL: Mail,
  PUSH: Smartphone,
} as const;

const NotificationPreferencesSection: FunctionComponent<NotificationPreferencesSectionProps> = ({
  onSaved,
}) => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<NotificationPreference[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void Promise.all([fetchNotificationPreferences(), fetchNotificationCategories()])
      .then(([items, meta]) => {
        setPrefs(items);
        setCategories(meta.categories);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, NotificationPreference[]>();
    for (const pref of prefs) {
      const list = map.get(pref.category) ?? [];
      list.push(pref);
      map.set(pref.category, list);
    }
    return map;
  }, [prefs]);

  const persist = useCallback(
    async (next: NotificationPreference[]) => {
      setSaving(true);
      setSaved(false);
      try {
        await updateNotificationPreferences(next);
        setSaved(true);
        onSaved?.();
      } finally {
        setSaving(false);
      }
    },
    [onSaved],
  );

  const togglePref = (
    category: NotificationCategory,
    channel: NotificationPreference['channel'],
    enabled: boolean,
  ) => {
    setPrefs((prev) => {
      const exists = prev.some((item) => item.category === category && item.channel === channel);
      const next = exists
        ? prev.map((item) =>
            item.category === category && item.channel === channel
              ? { ...item, is_enabled: enabled }
              : item,
          )
        : [
            ...prev,
            {
              category,
              channel,
              is_enabled: enabled,
              frequency: 'REALTIME' as const,
            },
          ];
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        void persist(next);
      }, 350);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="admin-notif-prefs" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-notif-prefs__row">
            <span className="admin-shimmer h-4 w-28 rounded" aria-hidden />
            <span className="flex gap-1.5">
              <span className="admin-shimmer h-8 w-16 rounded-full" aria-hidden />
              <span className="admin-shimmer h-8 w-16 rounded-full" aria-hidden />
              <span className="admin-shimmer h-8 w-16 rounded-full" aria-hidden />
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-notif-prefs-wrap">
      <div className="admin-notif-prefs" role="list">
        {categories.map((category) => {
          const categoryPrefs = grouped.get(category.value as NotificationCategory) ?? [];
          return (
            <div key={category.value} className="admin-notif-prefs__row" role="listitem">
              <p className="admin-notif-prefs__label">{category.label}</p>
              <div className="admin-notif-prefs__channels">
                {CHANNELS.map((channel) => {
                  const pref = categoryPrefs.find((item) => item.channel === channel);
                  const on = pref?.is_enabled ?? true;
                  const Icon = CHANNEL_ICONS[channel];
                  return (
                    <button
                      key={channel}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        togglePref(category.value as NotificationCategory, channel, !on)
                      }
                      className={`admin-notif-chip${on ? ' admin-notif-chip--on' : ''}`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                      {t(`notifications.preferences.channels.${channel.toLowerCase()}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="admin-notif-prefs__status" aria-live="polite">
        {saving ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            {t('notifications.center.loading')}
          </>
        ) : saved ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden />
            {t('notifications.preferences.saved')}
          </>
        ) : null}
      </p>
    </div>
  );
};

export default NotificationPreferencesSection;
