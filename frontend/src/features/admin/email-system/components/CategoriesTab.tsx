import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tags } from 'lucide-react';
import { AdminFormField, AdminFormInput } from '../../shared/forms/AdminFormPrimitives';
import AdminFormSwitch from '../../shared/forms/AdminFormSwitch';
import type { CategoryConfig } from '../types/emailSystemTypes';
import {
  AdminButton,
  EmailSystemAlert,
  EmailSystemFormActions,
  EmailSystemSectionShell,
} from '../ui/EmailSystemPrimitives';

const PREFIX = 'admin.modules.emailSystem.categories';

interface Props {
  items: CategoryConfig[];
  saving: boolean;
  onSave: (items: CategoryConfig[]) => Promise<unknown>;
}

const CategoriesTab: FunctionComponent<Props> = ({ items, saving, onSave }) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CategoryConfig[]>(items);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setDraft(items);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return draft;
    return draft.filter(
      (c) => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q),
    );
  }, [draft, query]);

  const toggle = (id: number, field: 'email_enabled' | 'in_app_enabled' | 'digest_enabled', value: boolean) => {
    setDraft((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const setLabel = (id: number, label: string) => {
    setDraft((prev) => prev.map((c) => (c.id === id ? { ...c, label } : c)));
  };

  return (
    <EmailSystemSectionShell
      icon={Tags}
      title={t(`${PREFIX}.title`, { defaultValue: 'Email categories' })}
      subtitle={t(`${PREFIX}.subtitle`, {
        defaultValue: 'Enable or disable notification channels per category.',
      })}
    >
      <AdminFormField label={t(`${PREFIX}.search`)} htmlFor="cat-search">
        <AdminFormInput
          id="cat-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(`${PREFIX}.searchPlaceholder`)}
        />
      </AdminFormField>

      {draft.length === 0 ? (
        <EmailSystemAlert tone="info" className="mt-5">
          {t(`${PREFIX}.empty`)}
        </EmailSystemAlert>
      ) : filtered.length === 0 ? (
        <EmailSystemAlert tone="info" className="mt-5">
          {t(`${PREFIX}.noResults`)}
        </EmailSystemAlert>
      ) : (
        <div className="mt-5 divide-y divide-[var(--admin-border)] rounded-xl border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-bg-subtle)_60%,var(--admin-bg-elevated))]">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="grid gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] sm:items-center sm:px-5"
            >
              <div className="space-y-2">
                <AdminFormField label={t(`${PREFIX}.displayName`)} htmlFor={`cat-label-${cat.id}`}>
                  <AdminFormInput
                    id={`cat-label-${cat.id}`}
                    value={cat.label}
                    onChange={(e) => setLabel(cat.id, e.target.value)}
                  />
                </AdminFormField>
                <p className="font-mono text-xs text-[var(--admin-text-secondary)]">{cat.category}</p>
              </div>
              <AdminFormSwitch
                id={`cat-email-${cat.id}`}
                label={t(`${PREFIX}.email`)}
                layout="inline"
                checked={cat.email_enabled}
                onChange={(v) => toggle(cat.id, 'email_enabled', v)}
              />
              <AdminFormSwitch
                id={`cat-inapp-${cat.id}`}
                label={t(`${PREFIX}.inApp`)}
                layout="inline"
                checked={cat.in_app_enabled}
                onChange={(v) => toggle(cat.id, 'in_app_enabled', v)}
              />
              <AdminFormSwitch
                id={`cat-digest-${cat.id}`}
                label={t(`${PREFIX}.digest`)}
                layout="inline"
                checked={cat.digest_enabled}
                onChange={(v) => toggle(cat.id, 'digest_enabled', v)}
              />
            </div>
          ))}
        </div>
      )}

      <EmailSystemFormActions className="mt-6 border-t-0 pt-0">
        <AdminButton variant="primary" size="md" disabled={saving || draft.length === 0} onClick={() => void onSave(draft)}>
          {t(`${PREFIX}.save`)}
        </AdminButton>
      </EmailSystemFormActions>
    </EmailSystemSectionShell>
  );
};

export default CategoriesTab;
