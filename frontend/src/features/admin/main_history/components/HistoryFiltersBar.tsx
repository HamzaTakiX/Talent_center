import { FunctionComponent, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { AdminListToolbar, AdminModuleHeader, AdminSelectField } from '../../ui';
import HistoryFilterRefreshBar from './HistoryFilterRefreshBar';
import {
  HISTORY_ACTION_FILTER_ALL,
  HISTORY_ACTION_FILTERS,
  HISTORY_MODULE_FILTER_ALL,
  HISTORY_MODULE_FILTERS,
} from '../constants/historyFilterConfig';

const MAIN_PREFIX = 'admin.historyUi.main';
const AUDIT_PREFIX = 'admin.auditCenter';

interface HistoryFiltersBarProps {
  search: string;
  moduleFilter: string;
  actionFilter: string;
  criticalityFilter?: string;
  automatedFilter?: string;
  onSearchChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onCriticalityChange?: (value: string) => void;
  onAutomatedChange?: (value: string) => void;
  trailingActions?: ReactNode;
  showModuleFilter?: boolean;
  title?: string;
  subtitle?: string;
  isRefreshing?: boolean;
  searchLoading?: boolean;
}

const HistoryFiltersBar: FunctionComponent<HistoryFiltersBarProps> = ({
  search,
  moduleFilter,
  actionFilter,
  criticalityFilter = 'all',
  automatedFilter = 'all',
  onSearchChange,
  onModuleChange,
  onActionChange,
  onCriticalityChange,
  onAutomatedChange,
  trailingActions,
  showModuleFilter = true,
  title,
  subtitle,
  isRefreshing = false,
  searchLoading = false,
}) => {
  const { t } = useTranslation();
  const searchPh = useAdminSearchPlaceholder('activity');
  const refreshLabel = t('admin.localHistory.refreshingResults');

  const moduleOptions = useMemo(
    () =>
      HISTORY_MODULE_FILTERS.map((o) => ({
        value: o.value,
        label: t(`${MAIN_PREFIX}.modules.${o.labelKey}`),
      })),
    [t],
  );

  const actionOptions = useMemo(
    () =>
      HISTORY_ACTION_FILTERS.map((o) => ({
        value: o.value,
        label: t(`${MAIN_PREFIX}.actions.${o.labelKey}`),
      })),
    [t],
  );

  const criticalityOptions = useMemo(
    () =>
      ['all', 'INFO', 'IMPORTANT', 'CRITICAL', 'AUTOMATED'].map((value) => ({
        value,
        label: t(`${AUDIT_PREFIX}.criticality.${value === 'all' ? 'all' : value}`),
      })),
    [t],
  );

  const automatedOptions = useMemo(
    () =>
      ['all', 'yes', 'no'].map((value) => ({
        value,
        label: t(`${AUDIT_PREFIX}.automated.${value}`),
      })),
    [t],
  );

  return (
    <div className="admin-history-filters">
      <AdminModuleHeader
        className="admin-history-page__header border-b-0"
        layout="toolbar"
        title={title ?? t('admin.modules.history.title')}
        subtitle={subtitle ?? t('admin.modules.history.subtitle')}
        actions={
          <AdminListToolbar
            controlsLayout="grouped"
            searchValue={search}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPh}
            searchLoading={searchLoading || isRefreshing}
            toolbarAriaLabel={t(`${MAIN_PREFIX}.toolbarAria`)}
            filter1={
              showModuleFilter
                ? {
                    value: moduleFilter,
                    onChange: onModuleChange,
                    options: moduleOptions,
                    ariaLabel: t(`${MAIN_PREFIX}.moduleFilterAria`),
                  }
                : undefined
            }
            filter2={{
              value: actionFilter,
              onChange: onActionChange,
              options: actionOptions,
              ariaLabel: t(`${MAIN_PREFIX}.actionFilterAria`),
            }}
            actionExtra={
              <>
                {onCriticalityChange ? (
                  <AdminSelectField
                    value={criticalityFilter}
                    onChange={onCriticalityChange}
                    options={criticalityOptions}
                    aria-label={t(`${AUDIT_PREFIX}.filters.criticality`)}
                    wrapperClassName="admin-history-filters__select"
                  />
                ) : null}
                {onAutomatedChange ? (
                  <AdminSelectField
                    value={automatedFilter}
                    onChange={onAutomatedChange}
                    options={automatedOptions}
                    aria-label={t(`${AUDIT_PREFIX}.filters.automated`)}
                    wrapperClassName="admin-history-filters__select"
                  />
                ) : null}
                {trailingActions}
              </>
            }
          />
        }
      />
      <HistoryFilterRefreshBar active={isRefreshing} label={refreshLabel} />
    </div>
  );
};

export { HISTORY_MODULE_FILTER_ALL, HISTORY_ACTION_FILTER_ALL };
export default HistoryFiltersBar;
