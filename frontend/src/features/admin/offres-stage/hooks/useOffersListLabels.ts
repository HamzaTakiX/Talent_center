import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminCopy, useChatEmptyState } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type { InternshipOffer } from '../types';

export type OffersListToolbarKey =
  | 'filterAllOffers'
  | 'filterActiveOffers'
  | 'filterClosedOffers'
  | 'filterArchivedOffers'
  | 'filterDraftOffers'
  | 'filterExpiredOffers'
  | 'filterOffersWithApplications';

export function useOffersListLabels() {
  const { t } = useTranslation();
  const { emptyState, tableColumn, searchPlaceholder, filterLabel } = useAdminCopy();
  const { offerStatus } = useAdminTableValues();

  const emptyOffersTitle = emptyState('offersFilters');

  const statusFilterOptions = useMemo(
    () =>
      [
        { value: 'all' as const, label: filterLabel('allStatuses') },
        { value: 'Active' as const, label: offerStatus('Active') },
        { value: 'Draft' as const, label: offerStatus('Draft') },
        { value: 'Expired' as const, label: offerStatus('Expired') },
        { value: 'Closed' as const, label: offerStatus('Closed') },
        { value: 'Archived' as const, label: offerStatus('Archived') },
      ] satisfies { value: 'all' | InternshipOffer['status']; label: string }[],
    [filterLabel, offerStatus]
  );

  const toolbarAria = (key: OffersListToolbarKey) => t(`admin.common.aria.${key}`);

  return {
    emptyOffersTitle,
    tableColumn,
    searchPlaceholder: searchPlaceholder('offers'),
    filterByStatusAria: t('admin.common.aria.filterOffersByStatus'),
    filterByCompanyAria: t('admin.common.aria.filterOffersByCompany'),
    allCompaniesLabel: filterLabel('allCompanies'),
    statusFilterOptions,
    toolbarAria,
    actionView: t('admin.common.actions.view'),
    actionAccept: t('admin.common.actions.approve'),
    actionReject: t('admin.common.actions.reject'),
    actionMessage: t('admin.modules.offers.legacyView.message'),
  };
}

export const INBOX_PREFIX = 'admin.modules.offers.inbox';

export function useInternshipInboxCopy() {
  const { t } = useTranslation();
  const emptyState = useChatEmptyState('offers');

  return {
    t: (key: string, vars?: Record<string, string | number>) => t(`${INBOX_PREFIX}.${key}`, vars),
    emptyState,
    loading: t('admin.common.loading'),
  };
}
