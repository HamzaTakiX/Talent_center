import { FunctionComponent, useEffect, useMemo, useState } from 'react';
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

const NotificationPreferencesSection: FunctionComponent<NotificationPreferencesSectionProps> = ({ onSaved }) => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<NotificationPreference[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([fetchNotificationPreferences(), fetchNotificationCategories()])
      .then(([items, meta]) => {
        setPrefs(items);
        setCategories(meta.categories);
      })
      .finally(() => setLoading(false));
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

  const togglePref = (category: NotificationCategory, channel: NotificationPreference['channel'], enabled: boolean) => {
    setPrefs((prev) =>
      prev.map((item) =>
        item.category === category && item.channel === channel ? { ...item, is_enabled: enabled } : item,
      ),
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateNotificationPreferences(prefs);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-[var(--admin-text-secondary,#6a7282)]">{t('notifications.center.loading')}</p>;
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const categoryPrefs = grouped.get(category.value as NotificationCategory) ?? [];
        const inApp = categoryPrefs.find((p) => p.channel === 'IN_APP');
        const email = categoryPrefs.find((p) => p.channel === 'EMAIL');
        const push = categoryPrefs.find((p) => p.channel === 'PUSH');
        return (
          <div key={category.value} className="rounded-xl border border-[var(--admin-border,#e5e7eb)] p-4">
            <h3 className="m-0 text-sm font-semibold text-[var(--admin-text,#101828)]">{category.label}</h3>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              {CHANNELS.map((channel) => {
                const pref =
                  channel === 'IN_APP' ? inApp : channel === 'EMAIL' ? email : push;
                if (!pref) return null;
                return (
                  <label key={channel} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pref.is_enabled}
                      onChange={(e) => togglePref(category.value as NotificationCategory, channel, e.target.checked)}
                    />
                    <span>{t(`notifications.preferences.channels.${channel.toLowerCase()}`)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded-xl bg-[var(--admin-brand,#7c3aed)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? t('notifications.center.loading') : t('notifications.preferences.save')}
      </button>
    </div>
  );
};

export default NotificationPreferencesSection;
