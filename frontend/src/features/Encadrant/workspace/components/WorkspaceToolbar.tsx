import { ChangeEvent, FunctionComponent } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput } from '../../../admin/ui';
import {
  WORKSPACE_FILTER_BTN,
  WORKSPACE_TOOLBAR_ROW,
} from '../constants/workspaceLayout';

interface WorkspaceToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const WorkspaceToolbar: FunctionComponent<WorkspaceToolbarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className={WORKSPACE_TOOLBAR_ROW}>
      <AdminSearchInput
        value={searchQuery}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        placeholder={t('encadrant.common.searchStudent')}
        aria-label={t('encadrant.common.searchStudent')}
        containerClassName="min-w-0 flex-1"
      />

      <button type="button" className={WORKSPACE_FILTER_BTN} aria-label={t('encadrant.common.filter')}>
        <Filter className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        {t('encadrant.common.filter')}
        <ChevronDown
          className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]"
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
    </div>
  );
};

export default WorkspaceToolbar;
