import { FunctionComponent } from 'react';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../../i18n/useAdminCopy';
import { AdminListToolbar } from '../../../ui';

export interface InternshipOffersDraftsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  companyOptions: readonly { value: string; label: string }[];
}

const InternshipOffersDraftsToolbar: FunctionComponent<InternshipOffersDraftsToolbarProps> = ({
  search,
  onSearchChange,
  companyFilter,
  onCompanyFilterChange,
  companyOptions,
}) => {
  const searchPh = useAdminSearchPlaceholder('offers');
  const { filterLabel } = useAdminCopy();

  return (
    <AdminListToolbar
      searchValue={search}
      onSearchChange={(v) => onSearchChange(v.slice(0, 120))}
      searchPlaceholder={searchPh}
      searchAriaLabel={searchPh}
      toolbarAriaLabel={filterLabel('filterByCompany')}
      filter1={{
        value: companyFilter,
        onChange: onCompanyFilterChange,
        options: companyOptions,
        ariaLabel: filterLabel('filterByCompany'),
      }}
    />
  );
};

export default InternshipOffersDraftsToolbar;
