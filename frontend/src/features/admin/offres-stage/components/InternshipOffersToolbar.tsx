import { FunctionComponent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import { AdminListToolbar, AdminSelectField } from '../../ui';
import {
  useOfferListFilterLabels,
  type OfferApplicantsFilter,
  type OfferDeadlineFilter,
} from '../hooks/useOfferListFilterLabels';
import type { InternshipOffer } from '../types';

export type InternshipOfferStatusFilter = 'all' | InternshipOffer['status'];

export interface InternshipOffersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: InternshipOfferStatusFilter;
  onStatusFilterChange: (value: InternshipOfferStatusFilter) => void;
  deadlineFilter: OfferDeadlineFilter;
  onDeadlineFilterChange: (value: OfferDeadlineFilter) => void;
  applicantsFilter: OfferApplicantsFilter;
  onApplicantsFilterChange: (value: OfferApplicantsFilter) => void;
}

const InternshipOffersToolbar: FunctionComponent<InternshipOffersToolbarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  deadlineFilter,
  onDeadlineFilterChange,
  applicantsFilter,
  onApplicantsFilterChange,
}) => {
  const navigate = useNavigate();
  const searchPh = useAdminSearchPlaceholder('offers');
  const { createLabel, filterLabel } = useAdminCopy();
  const { offerStatus } = useAdminTableValues();
  const { deadlineOptions, applicantsOptions, deadlineAria, applicantsAria } = useOfferListFilterLabels();

  const statusOptions = useMemo(
    () => [
      { value: 'all' as const, label: filterLabel('allStatuses') },
      { value: 'Active' as const, label: offerStatus('Active') },
      { value: 'Draft' as const, label: offerStatus('Draft') },
      { value: 'Expired' as const, label: offerStatus('Expired') },
      { value: 'Closed' as const, label: offerStatus('Closed') },
      { value: 'Archived' as const, label: offerStatus('Archived') },
    ],
    [filterLabel, offerStatus],
  );

  return (
    <AdminListToolbar
      controlsLayout="grouped"
      searchValue={search}
      onSearchChange={(v) => onSearchChange(v.slice(0, 120))}
      searchPlaceholder={searchPh}
      searchAriaLabel={searchPh}
      toolbarAriaLabel={filterLabel('filterByType')}
      filter1={{
        value: statusFilter,
        onChange: (v) => onStatusFilterChange(v as InternshipOfferStatusFilter),
        options: statusOptions,
        ariaLabel: filterLabel('filterByType'),
      }}
      filter2={{
        value: deadlineFilter,
        onChange: (v) => onDeadlineFilterChange(v as OfferDeadlineFilter),
        options: deadlineOptions,
        ariaLabel: deadlineAria,
      }}
      beforeCreate={
        <AdminSelectField
          value={applicantsFilter}
          onChange={(v) => onApplicantsFilterChange(v as OfferApplicantsFilter)}
          options={applicantsOptions}
          aria-label={applicantsAria}
        />
      }
      createLabel={createLabel('offer')}
      createVariant="primary"
      onCreate={() => navigate('/admin/internship-offers/create')}
    />
  );
};

export default InternshipOffersToolbar;
