import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { OfferApplicantsFilter, OfferDeadlineFilter } from '../utils/filterOfferList';

const DEADLINE_VALUES = ['all', 'no_deadline', 'overdue', 'this_week', 'this_month'] as const;
const APPLICANTS_VALUES = ['all', 'none', 'has_applicants', 'high'] as const;

export function useOfferListFilterLabels() {
  const { t } = useTranslation();
  const prefix = 'admin.modules.offers.listFilters';

  const deadlineOptions = useMemo(
    () =>
      DEADLINE_VALUES.map((value) => ({
        value,
        label: t(`${prefix}.deadline.${value}`),
      })),
    [t],
  );

  const applicantsOptions = useMemo(
    () =>
      APPLICANTS_VALUES.map((value) => ({
        value,
        label: t(`${prefix}.applicants.${value}`),
      })),
    [t],
  );

  return {
    deadlineOptions,
    applicantsOptions,
    deadlineAria: t(`${prefix}.deadline.aria`),
    applicantsAria: t(`${prefix}.applicants.aria`),
  };
}

export type { OfferApplicantsFilter, OfferDeadlineFilter };
