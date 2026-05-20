import { FunctionComponent } from 'react';
import { Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminToolbarDeleteControlProps {
  selectionMode: boolean;
  selectedCount: number;
  onEnterSelectionMode: () => void;
  onExitSelectionMode: () => void;
  onConfirmDelete: () => void;
}

const AdminToolbarDeleteControl: FunctionComponent<AdminToolbarDeleteControlProps> = ({
  selectionMode,
  selectedCount,
  onEnterSelectionMode,
  onExitSelectionMode,
  onConfirmDelete,
}) => {
  const { t } = useTranslation();

  if (!selectionMode) {
    return (
      <button
        type="button"
        className="admin-module-toolbar__btn admin-module-toolbar__btn--icon"
        onClick={onEnterSelectionMode}
        aria-label={t('admin.common.delete.startSelection')}
        title={t('admin.common.delete.startSelection')}
      >
        <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      </button>
    );
  }

  const canDelete = selectedCount > 0;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="admin-module-toolbar__btn"
        onClick={onExitSelectionMode}
        aria-label={t('admin.common.delete.cancelSelection')}
      >
        <X className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span>{t('admin.common.delete.cancelSelection')}</span>
      </button>
      <button
        type="button"
        className={`admin-module-toolbar__btn admin-module-toolbar__btn--danger ${
          canDelete ? '' : 'pointer-events-none opacity-45'
        }`}
        disabled={!canDelete}
        onClick={onConfirmDelete}
        aria-label={t('admin.common.delete.confirm')}
      >
        <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span>
          {t('admin.common.delete.confirmWithCount', {
            count: selectedCount,
            defaultValue: `Supprimer (${selectedCount})`,
          })}
        </span>
      </button>
    </div>
  );
};

export default AdminToolbarDeleteControl;
