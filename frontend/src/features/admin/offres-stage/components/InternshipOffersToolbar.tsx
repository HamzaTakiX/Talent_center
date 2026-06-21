import { FunctionComponent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import { AdminListToolbar } from '../../ui';
import type { InternshipOffer } from '../types';

export type InternshipOfferStatusFilter = 'all' | InternshipOffer['status'];

export interface InternshipOffersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: InternshipOfferStatusFilter;
  onStatusFilterChange: (value: InternshipOfferStatusFilter) => void;
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  companyOptions: readonly { value: string; label: string }[];
}

const InternshipOffersToolbar: FunctionComponent<InternshipOffersToolbarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  companyFilter,
  onCompanyFilterChange,
  companyOptions,
}) => {
  const navigate = useNavigate();
  const searchPh = useAdminSearchPlaceholder('offers');
  const { createLabel, filterLabel } = useAdminCopy();
  const { offerStatus } = useAdminTableValues();

  const statusOptions = useMemo(
    () => [
      { value: 'all' as const, label: filterLabel('allStatuses') },
      { value: 'Active' as const, label: offerStatus('Active') },
      { value: 'Draft' as const, label: offerStatus('Draft') },
      { value: 'Expired' as const, label: offerStatus('Expired') },
      { value: 'Closed' as const, label: offerStatus('Closed') },
    ],
    [filterLabel, offerStatus]
  );

  return (
    <AdminListToolbar
      searchValue={search}
      onSearchChange={(v) => onSearchChange(v.slice(0, 120))}
      searchPlaceholder={searchPh}
      searchAriaLabel={searchPh}
      toolbarAriaLabel={filterLabel('filterByCompany')}
      filter1={{
        value: statusFilter,
        onChange: (v) => onStatusFilterChange(v as InternshipOfferStatusFilter),
        options: statusOptions,
        ariaLabel: filterLabel('filterByType'),
      }}
      filter2={{
        value: companyFilter,
        onChange: onCompanyFilterChange,
        options: companyOptions,
        ariaLabel: filterLabel('filterByCompany'),
      }}
      createLabel={createLabel('offer')}
      onCreate={() => navigate('/admin/internship-offers/create')}
    />
  );
};

export default InternshipOffersToolbar;
