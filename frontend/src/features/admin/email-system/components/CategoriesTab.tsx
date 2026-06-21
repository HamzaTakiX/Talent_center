import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tags } from 'lucide-react';
import AdminFormSwitch from '../../shared/forms/AdminFormSwitch';
import type { CategoryConfig } from '../types/emailSystemTypes';
import {
  AdminButton,
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

  useEffect(() => {
    setDraft(items);
  }, [items]);

  const toggle = (id: number, field: 'email_enabled' | 'in_app_enabled' | 'digest_enabled', value: boolean) => {
    setDraft((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  return (
    <EmailSystemSectionShell
      icon={Tags}
      title={t(`${PREFIX}.title`, { defaultValue: 'Email categories' })}
      subtitle={t(`${PREFIX}.subtitle`, {
        defaultValue: 'Enable or disable notification channels per category.',
      })}
    >
      <div className="divide-y divide-[var(--admin-border)] rounded-xl border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-bg-subtle)_60%,var(--admin-bg-elevated))]">
        {draft.map((cat) => (
          <div
            key={cat.id}
            className="grid gap-4 px-4 py-4 sm:grid-cols-4 sm:items-center sm:px-5"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--admin-text)]">{cat.label}</p>
              <p className="mt-0.5 font-mono text-xs text-[var(--admin-text-secondary)]">{cat.category}</p>
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

      <EmailSystemFormActions className="mt-6 border-t-0 pt-0">
        <AdminButton variant="primary" size="md" disabled={saving} onClick={() => void onSave(draft)}>
          {t(`${PREFIX}.save`)}
        </AdminButton>
      </EmailSystemFormActions>
    </EmailSystemSectionShell>
  );
};

export default CategoriesTab;
