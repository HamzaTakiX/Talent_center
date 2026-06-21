import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import StudentAcademicFilterAccordion from '../../../../shared/chat-filters/StudentAcademicFilterAccordion';
import type { StudentAcademicFilterCounts } from '../../../../shared/chat-filters/studentAcademicChatFilterTypes';
import { MEETING_STATUSES } from '../data/meetingsSupportMock';
import type { MeetingInboxFilters, MeetingStatus } from '../types/meetingsChatTypes';
import SupportQuickFilterBar from '../../../../shared/admin-support-inbox/components/SupportQuickFilterBar';

interface Props {
  filters: MeetingInboxFilters;
  hasActiveFilters: boolean;
  filterCounts: StudentAcademicFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  onToggleStatus: (status: MeetingStatus) => void;
  onToggleStudentAcademic: (key: keyof import('../../../../shared/chat-filters/studentAcademicChatFilterTypes').StudentAcademicChatFilters, value: string) => void;
  onToggleQuick: (key: 'unread' | 'urgent' | 'archived') => void;
  onClear: () => void;
}

const MeetingsFilterPanel: FunctionComponent<Props> = ({
  filters,
  hasActiveFilters,
  filterCounts,
  programOptions,
  classOptions,
  academicLevelOptions,
  onToggleStatus,
  onToggleStudentAcademic,
  onToggleQuick,
  onClear,
}) => {
  const { t } = useTranslation();

  return (
    <div className="isi-filters-panel">
      <SupportQuickFilterBar filters={filters} onToggle={onToggleQuick} onClear={onClear} />
      <StudentAcademicFilterAccordion
        filters={filters}
        filterCounts={filterCounts}
        programOptions={programOptions}
        classOptions={classOptions}
        academicLevelOptions={academicLevelOptions}
        onToggle={onToggleStudentAcademic}
      />
      <div className="isi-filters-quick mt-2">
        {MEETING_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onToggleStatus(status)}
            className={`isi-quick-filter ${filters.statuses.includes(status) ? 'isi-quick-filter--active' : ''}`}
          >
            {status}
          </button>
        ))}
      </div>
      {hasActiveFilters ? (
        <button type="button" onClick={onClear} className="isi-filters-clear">
          {t('admin.modules.offers.inbox.filterSections.clear')}
        </button>
      ) : null}
    </div>
  );
};

export default MeetingsFilterPanel;
