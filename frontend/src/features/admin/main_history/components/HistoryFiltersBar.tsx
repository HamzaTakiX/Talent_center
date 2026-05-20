import { FunctionComponent, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { AdminListToolbar, AdminModuleHeader } from '../../ui';
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
}) => {
  const { t } = useTranslation();
  const searchPh = useAdminSearchPlaceholder('activity');

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
    <AdminModuleHeader
      className="admin-history-page__header border-b-0"
      layout="toolbar"
      title={title ?? t('admin.modules.history.title')}
      subtitle={subtitle ?? t('admin.modules.history.subtitle')}
      actions={
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <AdminListToolbar
            controlsLayout="grouped"
            searchValue={search}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPh}
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
          />
          <div className="flex flex-wrap items-center gap-2">
            {onCriticalityChange ? (
              <label className="flex flex-col gap-1 text-xs text-[var(--admin-text-secondary)]">
                {t(`${AUDIT_PREFIX}.filters.criticality`)}
                <select
                  className="admin-native-select-fallback rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2 py-1.5 text-sm text-[var(--admin-text)]"
                  value={criticalityFilter}
                  onChange={(e) => onCriticalityChange(e.target.value)}
                >
                  {criticalityOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {onAutomatedChange ? (
              <label className="flex flex-col gap-1 text-xs text-[var(--admin-text-secondary)]">
                {t(`${AUDIT_PREFIX}.filters.automated`)}
                <select
                  className="admin-native-select-fallback rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2 py-1.5 text-sm text-[var(--admin-text)]"
                  value={automatedFilter}
                  onChange={(e) => onAutomatedChange(e.target.value)}
                >
                  {automatedOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {trailingActions}
          </div>
        </div>
      }
    />
  );
};

export { HISTORY_MODULE_FILTER_ALL, HISTORY_ACTION_FILTER_ALL };
export default HistoryFiltersBar;
