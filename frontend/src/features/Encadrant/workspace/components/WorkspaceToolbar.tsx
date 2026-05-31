import { FunctionComponent } from 'react';
import { ChevronDown, Filter, Search } from 'lucide-react';
import {
  WORKSPACE_FILTER_BTN,
  WORKSPACE_SEARCH_INPUT,
  WORKSPACE_SEARCH_WRAP,
  WORKSPACE_TOOLBAR_ROW,
} from '../constants/workspaceLayout';

interface WorkspaceToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const WorkspaceToolbar: FunctionComponent<WorkspaceToolbarProps> = ({
  searchQuery,
  onSearchChange,
}) => (
  <div className={WORKSPACE_TOOLBAR_ROW}>
    <label className={WORKSPACE_SEARCH_WRAP}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search student..."
        className={WORKSPACE_SEARCH_INPUT}
        aria-label="Search student"
      />
    </label>

    <button type="button" className={WORKSPACE_FILTER_BTN} aria-label="Filter students">
      <Filter className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      Filter
      <ChevronDown className="h-4 w-4 shrink-0 text-[#717182]" strokeWidth={1.75} aria-hidden />
    </button>
  </div>
);

export default WorkspaceToolbar;
