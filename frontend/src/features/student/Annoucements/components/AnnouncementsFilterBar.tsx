import { FunctionComponent } from 'react';
import { AlertCircle, Filter, Search } from 'lucide-react';
import AnnouncementsFilterDropdown from './AnnouncementsFilterDropdown';
import {
  ANNOUNCEMENT_PRIORITY_FILTER_OPTIONS,
  ANNOUNCEMENT_TYPE_FILTER_OPTIONS,
} from '../data/allAnnouncementsMock';
import {
  ALL_ANNOUNCEMENTS_FILTER_ACTIONS,
  ALL_ANNOUNCEMENTS_FILTER_BAR,
  ALL_ANNOUNCEMENTS_SEARCH_INPUT,
} from '../constants/allAnnouncementsStyles';

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
  return (
    <div className={ALL_ANNOUNCEMENTS_FILTER_BAR} role="search">
      <div className="relative w-full min-w-0 sm:min-w-[200px] sm:flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-text-muted)] max-[429px]:left-2.5 max-[429px]:size-3.5"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search announcements..."
          className={ALL_ANNOUNCEMENTS_SEARCH_INPUT}
          aria-label="Search announcements"
        />
      </div>

      <div className={ALL_ANNOUNCEMENTS_FILTER_ACTIONS}>
        <AnnouncementsFilterDropdown
          label="Type"
          icon={Filter}
          value={typeFilter}
          options={ANNOUNCEMENT_TYPE_FILTER_OPTIONS}
          onChange={onTypeFilterChange}
          ariaLabel="Filter by announcement type"
        />
        <AnnouncementsFilterDropdown
          label="Priority"
          icon={AlertCircle}
          value={priorityFilter}
          options={ANNOUNCEMENT_PRIORITY_FILTER_OPTIONS}
          onChange={onPriorityFilterChange}
          ariaLabel="Filter by priority"
        />
      </div>
    </div>
  );
};

export default AnnouncementsFilterBar;
