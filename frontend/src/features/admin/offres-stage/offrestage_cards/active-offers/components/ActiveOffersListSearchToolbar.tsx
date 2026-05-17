import { FunctionComponent, useMemo } from 'react';
import { AdminListToolbar, AdminListToolbarSection } from '../../../../ui';

interface ActiveOffersListSearchToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  companyOptions: string[];
}

const ActiveOffersListSearchToolbar: FunctionComponent<ActiveOffersListSearchToolbarProps> = ({
  query,
  onQueryChange,
  companyFilter,
  onCompanyFilterChange,
  companyOptions,
}) => {
  const companySelectOptions = useMemo(
    () => [
      { value: 'all', label: 'All companies' },
      ...companyOptions.map((c) => ({ value: c, label: c })),
    ],
    [companyOptions]
  );

  return (
    <AdminListToolbarSection>
      <AdminListToolbar
        searchValue={query}
        onSearchChange={onQueryChange}
        searchPlaceholder="Search offers..."
        toolbarAriaLabel="Filter active offers"
        filter1={{
          value: companyFilter,
          onChange: onCompanyFilterChange,
          options: companySelectOptions,
          ariaLabel: 'Filter by company',
        }}
      />
    </AdminListToolbarSection>
  );
};

export default ActiveOffersListSearchToolbar;
