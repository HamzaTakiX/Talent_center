import { ChangeEvent, FunctionComponent } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput } from '../../../../../admin/ui';
import {
  ASSIGNED_STUDENTS_FILTER_BUTTON,
  ASSIGNED_STUDENTS_FILTER_GROUP,
  ASSIGNED_STUDENTS_TOOLBAR_ROW,
} from '../constants/assignedStudentsLayout';

interface AssignedStudentsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const AssignedStudentsToolbar: FunctionComponent<AssignedStudentsToolbarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className={ASSIGNED_STUDENTS_TOOLBAR_ROW}>
      <AdminSearchInput
        value={searchQuery}
        onChange={handleChange}
        onClear={() => onSearchChange('')}
        placeholder={t('encadrant.common.searchStudent')}
        aria-label={t('encadrant.common.searchStudent')}
        containerClassName="min-w-0 flex-1"
      />

      <div className={ASSIGNED_STUDENTS_FILTER_GROUP}>
        <button
          type="button"
          className={ASSIGNED_STUDENTS_FILTER_BUTTON}
          aria-label={t('encadrant.common.filterByClass')}
        >
          <Filter className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('encadrant.common.filterByClass')}
        </button>
        <button
          type="button"
          className={ASSIGNED_STUDENTS_FILTER_BUTTON}
          aria-label={t('encadrant.common.filterByStatus')}
        >
          <Filter className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('encadrant.common.filterByStatus')}
        </button>
      </div>
    </div>
  );
};

export default AssignedStudentsToolbar;
