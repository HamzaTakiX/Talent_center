import { FunctionComponent, useMemo } from 'react';
import { AdminListToolbar, AdminListToolbarSection } from '../../../../ui';
import { clampSearchQuery } from '../../../../../../design-system/safeContent';

interface OffersWithApplicationsListSearchToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  companyOptions: string[];
}

const OffersWithApplicationsListSearchToolbar: FunctionComponent<OffersWithApplicationsListSearchToolbarProps> = ({
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
        onSearchChange={(v) => onQueryChange(clampSearchQuery(v))}
        searchPlaceholder="Search offers..."
        toolbarAriaLabel="Filter offers with applications"
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

export default OffersWithApplicationsListSearchToolbar;
