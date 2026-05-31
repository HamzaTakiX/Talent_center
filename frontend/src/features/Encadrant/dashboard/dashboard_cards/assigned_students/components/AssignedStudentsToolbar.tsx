import { ChangeEvent, FunctionComponent } from 'react';
import { Filter, Search } from 'lucide-react';
import {
  ASSIGNED_STUDENTS_FILTER_BUTTON,
  ASSIGNED_STUDENTS_FILTER_GROUP,
  ASSIGNED_STUDENTS_SEARCH_INPUT,
  ASSIGNED_STUDENTS_SEARCH_WRAP,
  ASSIGNED_STUDENTS_TOOLBAR_ROW,
} from '../constants/assignedStudentsLayout';

interface AssignedStudentsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const AssignedStudentsToolbar: FunctionComponent<AssignedStudentsToolbarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className={ASSIGNED_STUDENTS_TOOLBAR_ROW}>
      <label className={ASSIGNED_STUDENTS_SEARCH_WRAP}>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9ca3af]"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Search student..."
          className={ASSIGNED_STUDENTS_SEARCH_INPUT}
          aria-label="Search student"
        />
      </label>

      <div className={ASSIGNED_STUDENTS_FILTER_GROUP}>
        <button type="button" className={ASSIGNED_STUDENTS_FILTER_BUTTON} aria-label="Filter by Class">
          <Filter className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Filter by Class
        </button>
        <button type="button" className={ASSIGNED_STUDENTS_FILTER_BUTTON} aria-label="Filter by Status">
          <Filter className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Filter by Status
        </button>
      </div>
    </div>
  );
};

export default AssignedStudentsToolbar;

