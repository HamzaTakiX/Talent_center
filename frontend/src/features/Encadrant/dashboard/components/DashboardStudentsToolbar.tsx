import { ChangeEvent, FunctionComponent } from 'react';
import { Filter, Search } from 'lucide-react';
import {
  DASHBOARD_FILTER_BUTTON,
  DASHBOARD_SEARCH_INPUT,
  DASHBOARD_SEARCH_INPUT_WRAP,
  DASHBOARD_SEARCH_ROW,
} from '../constants/dashboardLayout';

interface DashboardStudentsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const DashboardStudentsToolbar: FunctionComponent<DashboardStudentsToolbarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className={DASHBOARD_SEARCH_ROW}>
      <label className={DASHBOARD_SEARCH_INPUT_WRAP}>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717182]"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Search student..."
          className={DASHBOARD_SEARCH_INPUT}
          aria-label="Search student"
        />
      </label>

      <button
        type="button"
        className={DASHBOARD_FILTER_BUTTON}
        aria-label="Filter students"
      >
        <Filter className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
};

export default DashboardStudentsToolbar;
