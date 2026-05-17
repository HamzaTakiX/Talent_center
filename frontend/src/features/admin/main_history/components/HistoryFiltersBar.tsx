import { FunctionComponent, useMemo } from 'react';
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

interface HistoryFiltersBarProps {
  search: string;
  moduleFilter: string;
  actionFilter: string;
  onSearchChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onActionChange: (value: string) => void;
}

const HistoryFiltersBar: FunctionComponent<HistoryFiltersBarProps> = ({
  search,
  moduleFilter,
  actionFilter,
  onSearchChange,
  onModuleChange,
  onActionChange,
}) => {
  const { t } = useTranslation();
  const searchPh = useAdminSearchPlaceholder('activity');

  const moduleOptions = useMemo(
    () =>
      HISTORY_MODULE_FILTERS.map((o) => ({
        value: o.value,
        label: t(`${MAIN_PREFIX}.modules.${o.labelKey}`),
      })),
    [t]
  );

  const actionOptions = useMemo(
    () =>
      HISTORY_ACTION_FILTERS.map((o) => ({
        value: o.value,
        label: t(`${MAIN_PREFIX}.actions.${o.labelKey}`),
      })),
    [t]
  );

  return (
    <AdminModuleHeader
      className="admin-history-page__header border-b-0"
      layout="toolbar"
      title={t('admin.modules.history.title')}
      subtitle={t('admin.modules.history.subtitle')}
      actions={
        <AdminListToolbar
          controlsLayout="grouped"
          searchValue={search}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPh}
          toolbarAriaLabel={t(`${MAIN_PREFIX}.toolbarAria`)}
          filter1={{
            value: moduleFilter,
            onChange: onModuleChange,
            options: moduleOptions,
            ariaLabel: t(`${MAIN_PREFIX}.moduleFilterAria`),
          }}
          filter2={{
            value: actionFilter,
            onChange: onActionChange,
            options: actionOptions,
            ariaLabel: t(`${MAIN_PREFIX}.actionFilterAria`),
          }}
        />
      }
    />
  );
};

export { HISTORY_MODULE_FILTER_ALL, HISTORY_ACTION_FILTER_ALL };
export default HistoryFiltersBar;
