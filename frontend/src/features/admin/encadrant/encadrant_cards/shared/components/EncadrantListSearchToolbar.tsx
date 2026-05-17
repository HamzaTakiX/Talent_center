import { FunctionComponent, useMemo } from 'react';
import { AdminListToolbar, AdminListToolbarSection } from '../../../../ui';

interface EncadrantListSearchToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  departmentOptions: string[];
}

const EncadrantListSearchToolbar: FunctionComponent<EncadrantListSearchToolbarProps> = ({
  query,
  onQueryChange,
  departmentFilter,
  onDepartmentFilterChange,
  departmentOptions,
}) => {
  const departmentSelectOptions = useMemo(
    () => [
      { value: 'all', label: 'All departments' },
      ...departmentOptions.map((d) => ({ value: d, label: d })),
    ],
    [departmentOptions]
  );

  return (
    <AdminListToolbarSection>
      <AdminListToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Search encadrants..."
        toolbarAriaLabel="Filter encadrants"
        filter1={{
          value: departmentFilter,
          onChange: onDepartmentFilterChange,
          options: departmentSelectOptions,
          ariaLabel: 'Filter by department',
        }}
      />
    </AdminListToolbarSection>
  );
};

export default EncadrantListSearchToolbar;
