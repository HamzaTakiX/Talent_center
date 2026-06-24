import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminSearchPlaceholder } from '../../../i18n/useAdminCopy';
import { AdminListToolbar, AdminSelectField } from '../../../ui';
import {
  useOfferListFilterLabels,
  type OfferApplicantsFilter,
  type OfferDeadlineFilter,
} from '../../hooks/useOfferListFilterLabels';
import type { DraftOfferFilter } from '../utils/filterDraftOffers';

export interface InternshipOffersDraftsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  draftFilter: DraftOfferFilter;
  onDraftFilterChange: (value: DraftOfferFilter) => void;
  deadlineFilter: OfferDeadlineFilter;
  onDeadlineFilterChange: (value: OfferDeadlineFilter) => void;
  applicantsFilter: OfferApplicantsFilter;
  onApplicantsFilterChange: (value: OfferApplicantsFilter) => void;
}

const InternshipOffersDraftsToolbar: FunctionComponent<InternshipOffersDraftsToolbarProps> = ({
  search,
  onSearchChange,
  draftFilter,
  onDraftFilterChange,
  deadlineFilter,
  onDeadlineFilterChange,
  applicantsFilter,
  onApplicantsFilterChange,
}) => {
  const { t } = useTranslation();
  const searchPh = useAdminSearchPlaceholder('offers');
  const filterPrefix = 'admin.modules.offers.draftsPage.filters';
  const { deadlineOptions, applicantsOptions, deadlineAria, applicantsAria } = useOfferListFilterLabels();

  const draftFilterOptions = useMemo(
    () =>
      (
        [
          'all',
          'ready',
          'incomplete',
          'pending_review',
          'no_deadline',
        ] as const
      ).map((value) => ({
        value,
        label: t(`${filterPrefix}.${value}`),
      })),
    [t],
  );

  return (
    <AdminListToolbar
      controlsLayout="grouped"
      searchValue={search}
      onSearchChange={(v) => onSearchChange(v.slice(0, 120))}
      searchPlaceholder={searchPh}
      searchAriaLabel={searchPh}
      toolbarAriaLabel={t(`${filterPrefix}.aria`)}
      filter1={{
        value: draftFilter,
        onChange: (v) => onDraftFilterChange(v as DraftOfferFilter),
        options: draftFilterOptions,
        ariaLabel: t(`${filterPrefix}.aria`),
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
    />
  );
};

export default InternshipOffersDraftsToolbar;
