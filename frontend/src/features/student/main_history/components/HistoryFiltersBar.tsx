import { FunctionComponent } from 'react';
import { ChevronDown, Funnel, Search } from 'lucide-react';
import {
  STUDENT_HISTORY_MODULE_FILTER_OPTIONS,
  STUDENT_HISTORY_STATUS_FILTER_OPTIONS,
} from '../constants/historyConstants';

interface HistoryFiltersBarProps {
  search: string;
  moduleFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const selectClassName =
  'h-9 w-full min-w-0 cursor-pointer appearance-none rounded-lg bg-[var(--admin-bg-elevated)]smoke py-2 pl-3 pr-9 text-left text-sm font-medium leading-5 text-[var(--admin-text-muted)] outline-none lg:w-40';

const HistoryFiltersBar: FunctionComponent<HistoryFiltersBarProps> = ({
  search,
  moduleFilter,
  statusFilter,
  onSearchChange,
  onModuleChange,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 lg:flex-row lg:items-start lg:justify-between lg:gap-5">
      <div className="flex min-w-0 w-full flex-col items-start lg:w-[279.1px] lg:shrink-0">
        <h2 className="text-base font-medium leading-5 text-[var(--admin-text)]">My Activity Timeline</h2>
        <p className="mt-1 text-base leading-6 text-[var(--admin-text-muted)]">
          Track and manage your applications, documents, and career activities
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap lg:justify-end lg:gap-3">
        <div className="relative w-full sm:min-w-[140px] sm:flex-1 lg:w-auto lg:flex-none">
          <select
            className={selectClassName}
            value={moduleFilter}
            onChange={(e) => onModuleChange(e.target.value)}
            aria-label="Filter by area"
          >
            {STUDENT_HISTORY_MODULE_FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)] opacity-50" />
        </div>

        <div className="relative w-full sm:min-w-[140px] sm:flex-1 lg:w-auto lg:flex-none">
          <select
            className={selectClassName}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by status"
          >
            {STUDENT_HISTORY_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)] opacity-50" />
        </div>

        <div className="flex w-full min-w-0 items-center gap-2 sm:flex-1 sm:min-w-[200px] lg:w-auto lg:max-w-none lg:flex-initial">
          <div className="relative min-w-0 flex-1 text-left">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search your activities..."
              className="h-9 w-full min-w-0 rounded-lg bg-[var(--admin-bg-elevated)]smoke py-1 pl-9 pr-3 text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-text-muted)] lg:w-64"
            />
          </div>
          <button
            type="button"
            onClick={() => console.log('Open advanced filters')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-[#4b5563]"
            aria-label="Open advanced filters"
          >
            <Funnel className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryFiltersBar;
