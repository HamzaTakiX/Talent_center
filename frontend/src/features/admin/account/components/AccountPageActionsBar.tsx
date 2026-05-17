import { FunctionComponent } from 'react';
import { RotateCcw, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AccountPageActionsBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
}

const AccountPageActionsBar: FunctionComponent<AccountPageActionsBarProps> = ({
  isDirty,
  isSaving,
  onSave,
  onCancel,
  onReset,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="admin-account-actions-bar mt-8 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-4 sm:px-5"
      role="group"
      aria-label={t('admin.account.actionsBarLabel')}
    >
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={isSaving}
          className="admin-btn-reset inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          {t('admin.settings.preferences.reset')}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={!isDirty || isSaving}
          className="admin-btn-secondary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          {t('common.cancel')}
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className="admin-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          {isSaving ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </div>
  );
};

export default AccountPageActionsBar;
