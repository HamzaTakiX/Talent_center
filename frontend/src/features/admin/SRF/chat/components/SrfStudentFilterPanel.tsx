import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentAcademicFilterAccordion from '../../../shared/chat-filters/StudentAcademicFilterAccordion';
import type { StudentAcademicChatFilters, StudentAcademicFilterCounts } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';

type Props = {
  filters: StudentAcademicChatFilters;
  hasActiveFilters: boolean;
  filterCounts: StudentAcademicFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  onToggle: (key: keyof StudentAcademicChatFilters, value: string) => void;
  onClear: () => void;
};

const SrfStudentFilterPanel: FunctionComponent<Props> = ({
  filters,
  hasActiveFilters,
  filterCounts,
  programOptions,
  classOptions,
  academicLevelOptions,
  onToggle,
  onClear,
}) => {
  const { t } = useTranslation();

  return (
    <div className="isi-filters-panel">
      <StudentAcademicFilterAccordion
        filters={filters}
        filterCounts={filterCounts}
        programOptions={programOptions}
        classOptions={classOptions}
        academicLevelOptions={academicLevelOptions}
        onToggle={onToggle}
      />
      {hasActiveFilters ? (
        <button type="button" onClick={onClear} className="isi-filters-clear">
          {t('admin.modules.offers.inbox.filterSections.clear')}
        </button>
      ) : null}
    </div>
  );
};

export default SrfStudentFilterPanel;
