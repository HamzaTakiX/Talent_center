import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminListToolbar, AdminListToolbarSection } from '../../../admin/ui';
import {
  ANNOUNCEMENT_PRIORITY_FILTER_VALUES,
  ANNOUNCEMENT_TYPE_FILTER_VALUES,
} from '../data/allAnnouncementsMock';

interface AnnouncementsFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
}

const AnnouncementsFilterBar: FunctionComponent<AnnouncementsFilterBarProps> = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
}) => {
  const { t, i18n } = useTranslation();

  const typeOptions = useMemo(
    () =>
      ANNOUNCEMENT_TYPE_FILTER_VALUES.map((value) => ({
        value,
        label:
          value === 'all'
            ? t('student.announcements.mocks.filters.allTypes')
            : t(`student.announcements.mocks.tags.${value}`),
      })),
    [t, i18n.language],
  );

  const priorityOptions = useMemo(
    () =>
      ANNOUNCEMENT_PRIORITY_FILTER_VALUES.map((value) => ({
        value,
        label:
          value === 'all'
            ? t('student.announcements.mocks.filters.allPriorities')
            : t(
                `student.announcements.priority.${value === 'Urgent' ? 'urgent' : value === 'Important' ? 'important' : 'normal'}`,
              ),
      })),
    [t, i18n.language],
  );

  return (
    <AdminListToolbarSection>
      <AdminListToolbar
        searchValue={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={t('student.announcements.searchPlaceholder')}
        searchAriaLabel={t('student.announcements.searchAria')}
        toolbarAriaLabel={t('student.announcements.filterToolbarAria')}
        filter1={{
          value: typeFilter,
          onChange: onTypeFilterChange,
          options: typeOptions,
          ariaLabel: t('student.announcements.filterTypeAria'),
        }}
        filter2={{
          value: priorityFilter,
          onChange: onPriorityFilterChange,
          options: priorityOptions,
          ariaLabel: t('student.announcements.filterPriorityAria'),
        }}
      />
    </AdminListToolbarSection>
  );
};

export default AnnouncementsFilterBar;
