import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentAcademicFilterAccordion from './StudentAcademicFilterAccordion';
import type { StudentAcademicChatFilters, StudentAcademicFilterCounts } from './studentAcademicChatFilterTypes';
import SupportQuickFilterBar from '../admin-support-inbox/components/SupportQuickFilterBar';
import type { SupportQuickFilters } from '../admin-support-inbox/types/supportInboxTypes';

type Props = {
  quickFilters: SupportQuickFilters;
  studentFilters: StudentAcademicChatFilters;
  hasActiveFilters: boolean;
  filterCounts: StudentAcademicFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  onToggleQuick: (key: keyof SupportQuickFilters) => void;
  onToggleStudentAcademic: (key: keyof StudentAcademicChatFilters, value: string) => void;
  onClear: () => void;
  showQuickFilters?: boolean;
};

const DeskStudentFilterPanel: FunctionComponent<Props> = ({
  quickFilters,
  studentFilters,
  hasActiveFilters,
  filterCounts,
  programOptions,
  classOptions,
  academicLevelOptions,
  onToggleQuick,
  onToggleStudentAcademic,
  onClear,
  showQuickFilters = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className="isi-filters-panel">
      {showQuickFilters ? (
        <SupportQuickFilterBar
          filters={quickFilters}
          onToggle={onToggleQuick}
          onClear={onClear}
          labels={{
            unread: t('admin.chat.filterUnread', { defaultValue: 'Non lus' }),
            urgent: 'Urgent',
          }}
        />
      ) : null}
      <StudentAcademicFilterAccordion
        filters={studentFilters}
        filterCounts={filterCounts}
        programOptions={programOptions}
        classOptions={classOptions}
        academicLevelOptions={academicLevelOptions}
        onToggle={onToggleStudentAcademic}
      />
      {hasActiveFilters ? (
        <button type="button" onClick={onClear} className="isi-filters-clear">
          {t('admin.modules.offers.inbox.filterSections.clear')}
        </button>
      ) : null}
    </div>
  );
};

export default DeskStudentFilterPanel;
