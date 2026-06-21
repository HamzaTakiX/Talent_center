import { FunctionComponent } from 'react';
import { AdminListToolbar } from '../../../../ui';
import { clampSearchQuery } from '../../../../../../design-system/safeContent';
import type { InternshipOffer } from '../../../types';

export type AllOffersStatus = InternshipOffer['status'];

interface AllOffersSearchToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: 'all' | AllOffersStatus;
  onStatusFilterChange: (value: 'all' | AllOffersStatus) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Closed', label: 'Closed' },
] as const;

const AllOffersSearchToolbar: FunctionComponent<AllOffersSearchToolbarProps> = ({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
}) => (
  <div className="admin-panel-toolbar">
    <AdminListToolbar
      searchValue={query}
      onSearchChange={(v) => onQueryChange(clampSearchQuery(v))}
      searchPlaceholder="Search offers..."
      toolbarAriaLabel="Filter all offers"
      filter1={{
        value: statusFilter,
        onChange: (v) => onStatusFilterChange(v as 'all' | AllOffersStatus),
        options: [...STATUS_OPTIONS],
        ariaLabel: 'Filter by status',
      }}
    />
  </div>
);

export default AllOffersSearchToolbar;
