import { FunctionComponent } from 'react';
import { AdminListToolbar, AdminListToolbarSection } from '../../../../ui';
import type { AllAnnouncementsTypeFilter } from '../data/allAnnouncementsMockData';

interface AllAnnouncementsSearchToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: AllAnnouncementsTypeFilter;
  onTypeFilterChange: (value: AllAnnouncementsTypeFilter) => void;
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'Event', label: 'Event' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Info', label: 'Info' },
] as const;

const AllAnnouncementsSearchToolbar: FunctionComponent<AllAnnouncementsSearchToolbarProps> = ({
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
      toolbarAriaLabel="Filter all announcements"
      filter1={{
        value: typeFilter,
        onChange: (v) => onTypeFilterChange(v as AllAnnouncementsTypeFilter),
        options: [...TYPE_OPTIONS],
        ariaLabel: 'Filter by type',
      }}
    />
  </AdminListToolbarSection>
);

export default AllAnnouncementsSearchToolbar;
