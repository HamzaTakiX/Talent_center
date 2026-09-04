import { ChangeEvent, FunctionComponent } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput } from '../../../admin/ui';
import {
  DASHBOARD_FILTER_BUTTON,
  DASHBOARD_SEARCH_ROW,
} from '../constants/dashboardLayout';

interface DashboardStudentsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const DashboardStudentsToolbar: FunctionComponent<DashboardStudentsToolbarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className={DASHBOARD_SEARCH_ROW}>
      <AdminSearchInput
        value={searchQuery}
        onChange={handleChange}
        onClear={() => onSearchChange('')}
        placeholder={t('encadrant.common.searchStudent')}
        aria-label={t('encadrant.common.searchStudent')}
        containerClassName="min-w-0 flex-1"
      />

      <button
        type="button"
        className={`${DASHBOARD_FILTER_BUTTON} opacity-60`}
        aria-label={t('encadrant.common.filter')}
        aria-disabled="true"
        disabled
        title={t('encadrant.common.filter')}
      >
        <Filter className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
};

export default DashboardStudentsToolbar;
