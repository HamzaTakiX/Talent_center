import { FunctionComponent } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminTableBulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
}

const AdminTableBulkActionsBar: FunctionComponent<AdminTableBulkActionsBarProps> = ({
  selectedCount,
  onClear,
  onDelete,
}) => {
  const { t } = useTranslation();
  if (selectedCount <= 0) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 py-2.5">
      <span className="text-sm font-medium text-[var(--admin-text)]">
        {t('admin.common.delete.selectedCount', { count: selectedCount })}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="admin-module-toolbar__btn" onClick={onClear}>
          {t('admin.common.delete.clearSelection')}
        </button>
        <button type="button" className="admin-table-btn admin-table-btn--danger" onClick={onDelete}>
          <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('admin.common.delete.deleteSelected')}
        </button>
      </div>
    </div>
  );
};

export default AdminTableBulkActionsBar;
