import { FunctionComponent, type ComponentType, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminCopy } from '../../i18n/useAdminCopy';
import AdminLayout from '../../dashboard/components/AdminLayout';
import { AdminEmptyState, AdminListToolbar, AdminListToolbarSection } from '../../ui';
import type { AdminHistoryRowDisplay, AdminHistoryFilterConfig } from './adminHistoryTypes';

export type AdminModuleHistoryLayoutProps = {
  children: ReactNode;
  mainFillHeight?: boolean;
  contentFlush?: boolean;
};

export interface AdminModuleHistoryProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: readonly [AdminHistoryFilterConfig, AdminHistoryFilterConfig];
  rows: AdminHistoryRowDisplay[];
  emptyMessage?: string;
  /** Shell layout (default: AdminLayout). Student portal passes StudentLayout. */
  Layout?: ComponentType<AdminModuleHistoryLayoutProps>;
  /** Contenu imbriqué dans un panneau parent (évite double fond/bordure). */
  embeddedInPanel?: boolean;
}

const AdminModuleHistory: FunctionComponent<AdminModuleHistoryProps> = ({
  searchValue,
  onSearchChange,
  filters,
  rows,
  emptyMessage,
  Layout = AdminLayout,
  embeddedInPanel = false,
}) => {
  const { t } = useTranslation();
  const { emptyState } = useAdminCopy();
  const resolvedEmpty = emptyMessage ?? emptyState('historyFilters');

  return (
    <Layout mainFillHeight contentFlush>
      <div
        className={`admin-history-page font-inter flex h-0 min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden text-start ${
          embeddedInPanel ? '' : 'bg-[var(--admin-bg-elevated)]'
        }`}
      >
        <header className="admin-history-page__header shrink-0 border-b border-[var(--admin-border)] px-4 pb-5 pt-3 sm:px-5 md:px-6 md:pb-6 md:pt-4">
          <AdminListToolbarSection>
            <AdminListToolbar
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              searchPlaceholder={t('admin.historyUi.searchPlaceholder')}
              toolbarAriaLabel={t('admin.historyUi.filterToolbar')}
              filter1={{
                value: filters[0].value,
                onChange: filters[0].onChange,
                options: [
                  { value: 'all', label: filters[0].placeholderOptionLabel },
                  ...filters[0].options,
                ],
                ariaLabel: filters[0].ariaLabel,
              }}
              filter2={{
                value: filters[1].value,
                onChange: filters[1].onChange,
                options: [
                  { value: 'all', label: filters[1].placeholderOptionLabel },
                  ...filters[1].options,
                ],
                ariaLabel: filters[1].ariaLabel,
              }}
            />
          </AdminListToolbarSection>
        </header>

        <div className="admin-history-page__content min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-6 sm:px-5 md:px-6">
          <div className="admin-history-page__timeline relative min-w-0 max-w-full overflow-x-hidden">
            <div className="admin-timeline-rail absolute bottom-0 left-[27px] top-2 w-0.5" aria-hidden />

            <div className="relative space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="admin-history-row relative flex min-w-0 items-start gap-0">
                  <div className="admin-history-row__icon-col relative z-[1] flex w-14 shrink-0 justify-center">
                    <div
                      className={`ring-2 ring-[var(--admin-bg-elevated)] ${row.circleBgClassName}`}
                      data-history-variant={row.circleVariant}
                    >
                      {row.glyph}
                    </div>
                  </div>

                  <div className="admin-history-row__body min-w-0 flex-1 pl-3 sm:pl-4">
                    <div className="admin-mobile-card admin-history-card min-h-[5rem] justify-center overflow-hidden">
                      <div className="admin-history-card__inner min-w-0">
                        <div className="admin-history-card__top grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-3">
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className={row.badgeClassName} title={row.badgeLabel}>
                              {row.badgeLabel}
                            </span>
                            <span className="min-w-0 truncate text-sm font-medium leading-5 text-[var(--admin-text)]">
                              {row.actorName}
                            </span>
                          </div>
                          <div
                            className="admin-history-card__date shrink-0 text-end text-[0.6875rem] font-medium leading-4 tabular-nums text-[var(--admin-text-secondary)]"
                            aria-label={`${row.date} ${row.time}`}
                          >
                            <span className="block whitespace-nowrap">{row.date}</span>
                            <span className="block whitespace-nowrap">{row.time}</span>
                          </div>
                        </div>
                        <p className="admin-history-card__summary mt-1.5 line-clamp-2 text-sm leading-5 text-[var(--admin-text)]">
                          <span className="font-medium">{row.headline}</span>
                          <span className="text-[var(--admin-text-secondary)]"> • {row.metaLine}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {rows.length === 0 ? <AdminEmptyState title={resolvedEmpty} /> : null}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminModuleHistory;
