import { FunctionComponent, useMemo } from 'react';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { AdminListToolbar } from '../../ui';
import type { AnnouncementType } from '../types';

export type AnnouncementTypeFilter = 'all' | AnnouncementType;

interface AnnouncementsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: AnnouncementTypeFilter;
  onTypeFilterChange: (value: AnnouncementTypeFilter) => void;
  onCreate: () => void;
}

const AnnouncementsToolbar: FunctionComponent<AnnouncementsToolbarProps> = ({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  onCreate,
}) => {
  const searchPh = useAdminSearchPlaceholder('announcements');
  const { createLabel, filterLabel, announcementTypeLabel, t } = useAdminCopy();

  const typeFilterOptions = useMemo(
    () => [
      { value: 'all' as const, label: filterLabel('allTypes') },
      { value: 'Event' as const, label: announcementTypeLabel('Event') },
      { value: 'Interview' as const, label: announcementTypeLabel('Interview') },
      { value: 'Info' as const, label: announcementTypeLabel('Info') },
    ],
    [filterLabel, announcementTypeLabel]
  );

  return (
    <AdminListToolbar
      controlsLayout="grouped"
      searchValue={query}
      onSearchChange={onQueryChange}
      searchPlaceholder={searchPh}
      searchAriaLabel={t('admin.common.aria.searchAnnouncements')}
      toolbarAriaLabel={t('admin.common.aria.filterAnnouncements')}
      createLabel={createLabel('announcement')}
      onCreate={onCreate}
      filter1={{
        value: typeFilter,
        onChange: (value) => onTypeFilterChange(value as AnnouncementTypeFilter),
        options: typeFilterOptions,
        ariaLabel: t('admin.common.aria.filterAnnouncementType'),
      }}
    />
  );
};

export default AnnouncementsToolbar;
