import { FunctionComponent, useMemo } from 'react';
import { AdminListToolbar, AdminListToolbarSection } from '../../../../ui';

interface ClosedOffersListSearchToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  companyOptions: string[];
}

const ClosedOffersListSearchToolbar: FunctionComponent<ClosedOffersListSearchToolbarProps> = ({
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
        toolbarAriaLabel="Filter closed offers"
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

export default ClosedOffersListSearchToolbar;
