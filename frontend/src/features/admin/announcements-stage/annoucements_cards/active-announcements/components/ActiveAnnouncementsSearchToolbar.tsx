import { FunctionComponent } from 'react';
import { AdminListToolbar, AdminListToolbarSection } from '../../../../ui';
import type { ActiveAnnouncementsTypeFilter } from '../data/activeAnnouncementsMockData';

interface ActiveAnnouncementsSearchToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: ActiveAnnouncementsTypeFilter;
  onTypeFilterChange: (value: ActiveAnnouncementsTypeFilter) => void;
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'Event', label: 'Event' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Info', label: 'Info' },
] as const;

const ActiveAnnouncementsSearchToolbar: FunctionComponent<ActiveAnnouncementsSearchToolbarProps> = ({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
}) => (
  <AdminListToolbarSection>
    <AdminListToolbar
      searchValue={query}
      onSearchChange={onQueryChange}
      searchPlaceholder="Search announcements..."
      searchAriaLabel="Search announcements"
      toolbarAriaLabel="Filter active announcements"
      filter1={{
        value: typeFilter,
        onChange: (v) => onTypeFilterChange(v as ActiveAnnouncementsTypeFilter),
        options: [...TYPE_OPTIONS],
        ariaLabel: 'Filter by type',
      }}
    />
  </AdminListToolbarSection>
);

export default ActiveAnnouncementsSearchToolbar;
