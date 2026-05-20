import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, RefreshCw, Upload } from 'lucide-react';
import { adminEncadrantsApi } from '../../api/encadrants';
import { useAdminTableDeleteFlow } from '../../shared/hooks/useAdminTableDeleteFlow';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type { AdminEncadrantRow } from '../../api/types';
import { adminCrudRoutes } from '../../shared/navigation/adminCrudRoutes';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import {
  AdminListToolbar,
  AdminModuleHeader,
  AdminPagination,
  AdminSearchEmptyState,
  AdminTableEmptyState,
  AdminTableScroll,
  AdminMobileTableSkeleton,
  AdminTableSkeletonRows,
} from '../../ui';
import { adminTableBtn, adminTableBtnMobile } from '../../ui/adminTableButtons';
import EncadrantDetailModal from './EncadrantDetailModal';
import EncadrantsImportModal from './EncadrantsImportModal';
import { scopeProgramsPreview } from '../../shared/utils/programDisplay';
import { specializationDomainLabel } from '../utils/specializationDomainDisplay';
import AdminDeleteConfirmModal from '../../ui/AdminDeleteConfirmModal';
import AdminToolbarDeleteControl from '../../ui/AdminToolbarDeleteControl';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function scopePreview(row: AdminEncadrantRow, t: (k: string) => string): string {
  return scopeProgramsPreview(
    row.scopes?.filiere_codes,
    row.scopes?.filiere_labels,
    t('admin.tables.administrators.scopeGlobal'),
    3,
  );
}

function levelsCellContent(row: AdminEncadrantRow, t: (k: string) => string): string {
  const labelList = row.scopes?.level_labels ?? [];
  if (labelList.length > 0) {
    const preview = labelList.slice(0, 2).join(', ');
    if (labelList.length > 2) {
      return `${preview} +${labelList.length - 2}`;
    }
    return preview;
  }
  const gaps = row.scopes?.scope_gaps ?? [];
  if (gaps.includes('LEVELS')) {
    return t('admin.tables.encadrants.missingLevels');
  }
  const levelCount = row.scopes?.level_ids?.length ?? 0;
  if (levelCount > 0) {
    return t('admin.tables.encadrants.levelsCount', { count: levelCount });
  }
  return '—';
}

function scopeIncompleteHint(row: AdminEncadrantRow, t: (k: string) => string): string | null {
  const gaps = row.scopes?.scope_gaps ?? [];
  if (!gaps.length || row.scopes?.scope_is_complete !== false) return null;
  const otherGaps = gaps.filter((gap) => gap !== 'LEVELS');
  if (!otherGaps.length) return null;
  return otherGaps.map((gap) => t(`admin.tables.encadrants.scopeGap.${gap}`)).join(', ');
}

interface EncadrantsTablePanelProps {
  rows: AdminEncadrantRow[];
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  loading?: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const EncadrantsTablePanel: FunctionComponent<EncadrantsTablePanelProps> = ({
  rows,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  loading = false,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onRefresh,
}) => {
  const { t, i18n } = useTranslation();
  const { tableColumn, emptyState, createLabel, action } = useAdminCopy();
  const { accountStatus } = useAdminTableValues();
  const searchPh = useAdminSearchPlaceholder('encadrants');
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useAdminToast();
  const [viewRow, setViewRow] = useState<AdminEncadrantRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [repairingScopes, setRepairingScopes] = useState(false);
  const FORM_PREFIX = 'admin.forms.createEncadrant';

  const incompleteCount = useMemo(
    () => rows.filter((r) => r.scopes?.scope_is_complete === false).length,
    [rows],
  );

  const handleRepairScopes = async () => {
    setRepairingScopes(true);
    try {
      const result = await adminEncadrantsApi.repairScopes(false);
      toastSuccess(
        t('admin.modules.encadrants.repairScopesSuccess', { count: result.repaired }),
      );
      onRefresh();
    } catch {
      toastError(t('admin.modules.encadrants.repairScopesError'));
    } finally {
      setRepairingScopes(false);
    }
  };

  const {
    selectionMode,
    selection,
    deleteDialog,
    deleteTitle,
    deleteDescription,
    runDelete,
    closeDeleteDialog,
    enterSelectionMode,
    exitSelectionMode,
    confirmDelete,
  } = useAdminTableDeleteFlow({
    rows,
    kind: 'encadrant',
    deleteOne: adminEncadrantsApi.delete,
    deleteBulk: adminEncadrantsApi.bulkDelete,
    onRefresh,
  });

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('admin.tables.encadrants.filterAllStatuses') },
      { value: 'ACTIVE', label: accountStatus('ACTIVE') },
      { value: 'AUTHORIZED', label: accountStatus('AUTHORIZED') },
      { value: 'PENDING', label: accountStatus('PENDING') },
    ],
    [t, accountStatus, i18n.language],
  );

  const tableHeadings = [
    tableColumn('name'),
    tableColumn('email'),
    tableColumn('filieres'),
    tableColumn('levels'),
    tableColumn('specializations'),
    tableColumn('studentsWorkload'),
    tableColumn('accountStatus'),
    tableColumn('activeStatus'),
    tableColumn('actions'),
  ];

  const statusBadgeClass = (row: AdminEncadrantRow) => {
    if (!row.platform_access_granted) {
      return 'rounded-full bg-[var(--admin-surface-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--admin-text-secondary)]';
    }
    if (row.account_status === 'ACTIVE') {
      return 'rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400';
    }
    return 'rounded-full bg-[var(--admin-brand-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--admin-brand)]';
  };

  const activeBadgeClass = (active: boolean) =>
    active
      ? 'rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400'
      : 'rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400';

  return (
    <>
      <EncadrantsImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={onRefresh}
      />
      <AdminDeleteConfirmModal
        open={deleteDialog != null}
        onClose={closeDeleteDialog}
        onConfirm={runDelete}
        title={deleteTitle}
        description={deleteDescription}
      />
      <EncadrantDetailModal
        open={viewRow != null}
        encadrant={viewRow}
        onClose={() => setViewRow(null)}
        onEdit={(id) => {
          setViewRow(null);
          navigate(adminCrudRoutes.encadrantEdit(id));
        }}
      />

      <div className="box-border flex w-full min-w-0 flex-col admin-module-panel text-start font-inter shadow-sm">
        {incompleteCount > 0 ? (
          <div
            className="mx-4 mb-0 mt-4 flex flex-col gap-2 rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 sm:mx-6"
            role="status"
          >
            <p>{t('admin.modules.encadrants.incompleteScopeBanner', { count: incompleteCount })}</p>
            <button
              type="button"
              disabled={repairingScopes}
              onClick={() => void handleRepairScopes()}
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${repairingScopes ? 'animate-spin' : ''}`}
                aria-hidden
              />
              {t('admin.modules.encadrants.repairScopes')}
            </button>
          </div>
        ) : null}

        <AdminModuleHeader
          layout="toolbar"
          title={t('admin.modules.encadrants.title')}
          subtitle={t('admin.modules.encadrants.subtitle')}
          actions={
            <AdminListToolbar
              searchValue={query}
              onSearchChange={onQueryChange}
              searchPlaceholder={searchPh}
              toolbarAriaLabel={t('admin.tables.encadrants.filterByStatus')}
              filter1={{
                value: statusFilter,
                onChange: onStatusFilterChange,
                options: statusOptions,
                ariaLabel: t('admin.tables.encadrants.filterByStatus'),
              }}
              createLabel={createLabel('encadrant')}
              onCreate={() => navigate(adminCrudRoutes.encadrantCreate)}
              actionExtra={
                <>
                  <button
                    type="button"
                    className="admin-module-toolbar__btn"
                    disabled={repairingScopes || loading}
                    onClick={() => void handleRepairScopes()}
                  >
                    <RefreshCw
                      className={`h-4 w-4 shrink-0 ${repairingScopes ? 'animate-spin' : ''}`}
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span>{t('admin.modules.encadrants.repairScopes')}</span>
                  </button>
                  <button
                    type="button"
                    className="admin-module-toolbar__btn"
                    onClick={() => setImportOpen(true)}
                  >
                    <Upload className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span>{t('admin.common.actions.importExcel')}</span>
                  </button>
                </>
              }
              beforeCreate={
                <AdminToolbarDeleteControl
                  selectionMode={selectionMode}
                  selectedCount={selection.selectedCount}
                  onEnterSelectionMode={enterSelectionMode}
                  onExitSelectionMode={exitSelectionMode}
                  onConfirmDelete={confirmDelete}
                />
              }
            />
          }
        />

        <div className="space-y-3 px-4 pb-6 pt-0 sm:px-6 lg:hidden">
          {loading ? (
            <AdminMobileTableSkeleton />
          ) : rows.length === 0 ? (
            <AdminSearchEmptyState title={emptyState('encadrantsFilters')} />
          ) : (
            rows.map((row) => (
              <AdminMobileRowCard
                key={row.id}
                title={row.full_name}
                meta={row.email}
                badges={
                  <>
                    <span className={statusBadgeClass(row)}>
                      {row.platform_access_granted
                        ? accountStatus(row.account_status)
                        : t(`${FORM_PREFIX}.detail.accessDisabled`)}
                    </span>
                    <span className={activeBadgeClass(row.is_encadrant_active)}>
                      {row.is_encadrant_active
                        ? t('admin.tables.encadrants.active')
                        : t('admin.tables.encadrants.inactive')}
                    </span>
                  </>
                }
                fields={[
                  { label: tableColumn('filieres'), value: scopePreview(row, t) },
                  {
                    label: tableColumn('studentsWorkload'),
                    value: `${row.current_students} / ${row.max_students}`,
                  },
                ]}
                actions={
                  <>
                    <button
                      type="button"
                      className={adminTableBtnMobile}
                      onClick={() => setViewRow(row)}
                    >
                      <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      {action('view')}
                    </button>
                    <button
                      type="button"
                      className={adminTableBtnMobile}
                      onClick={() => navigate(adminCrudRoutes.encadrantEdit(row.id))}
                    >
                      <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      {action('edit')}
                    </button>
                  </>
                }
              />
            ))
          )}
        </div>

        <div className="admin-module-table-wrap hidden px-4 pb-6 pt-0 min-w-0 sm:px-6 lg:block">
          <AdminTableScroll
            minWidth={selectionMode ? '1320px' : '1280px'}
            className="admin-table-scroll--panel"
          >
            <thead>
              <tr className="box-border h-10 border-b border-solid border-[var(--admin-border)]">
                {selectionMode ? (
                  <th className="box-border w-10 py-2 pl-2 pr-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[var(--admin-border)] accent-[var(--admin-accent)]"
                      checked={selection.allOnPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = selection.someOnPageSelected;
                      }}
                      onChange={selection.toggleAllOnPage}
                      aria-label={t('admin.common.delete.clearSelection')}
                    />
                  </th>
                ) : null}
                {tableHeadings.map((heading, colIndex) => (
                  <th
                    key={heading}
                    className={`box-border py-2 pl-2 pr-2 text-num-14 font-medium leading-5 text-[var(--admin-text)] ${
                      colIndex === tableHeadings.length - 1 ? 'text-end' : 'text-start'
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <AdminTableSkeletonRows colSpan={selectionMode ? 10 : 9} />
              ) : rows.length === 0 ? (
                <AdminTableEmptyState
                  colSpan={selectionMode ? 10 : 9}
                  title={emptyState('encadrantsFilters')}
                />
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="box-border h-[52px] border-b border-solid border-[var(--admin-border)] last:border-b-0 transition-colors hover:bg-[var(--admin-brand-muted)]/20"
                  >
                    {selectionMode ? (
                      <td className="box-border py-2 pl-2 pr-2 align-middle">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[var(--admin-border)] accent-[var(--admin-accent)]"
                          checked={selection.isSelected(row.id)}
                          onChange={() => selection.toggleRow(row.id)}
                          aria-label={row.full_name || row.email}
                        />
                      </td>
                    ) : null}
                    <td className="box-border py-2 pl-2 pr-2 align-middle">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand-muted)] text-xs font-semibold text-[var(--admin-brand)]"
                          aria-hidden
                        >
                          {initialsFromName(row.full_name)}
                        </span>
                        <span className="text-num-14 font-medium leading-5 text-[var(--admin-text)]">
                          {row.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="box-border py-2 pl-2 pr-2 align-middle text-num-14 text-[var(--admin-text-secondary)]">
                      {row.email}
                    </td>
                    <td className="box-border max-w-[140px] py-2 pl-2 pr-2 align-middle text-num-14 text-[var(--admin-text)]">
                      {scopePreview(row, t)}
                    </td>
                    <td className="box-border max-w-[200px] py-2 pl-2 pr-2 align-middle text-num-14 text-[var(--admin-text)]">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={
                            (row.scopes?.scope_gaps ?? []).includes('LEVELS')
                              ? 'text-amber-600 dark:text-amber-400'
                              : undefined
                          }
                        >
                          {levelsCellContent(row, t)}
                        </span>
                        {scopeIncompleteHint(row, t) ? (
                          <span className="text-[11px] leading-tight text-[var(--admin-text-muted)]">
                            {scopeIncompleteHint(row, t)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="box-border py-2 pl-2 pr-2 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {(row.specialization_domains ?? []).slice(0, 3).map((d) => {
                          const key = typeof d === 'string' ? d : String(d.id);
                          return (
                            <span
                              key={key}
                              className="rounded-md bg-[var(--admin-brand-muted)] px-2 py-0.5 text-xs font-medium text-[var(--admin-brand)]"
                            >
                              {specializationDomainLabel(d, t)}
                            </span>
                          );
                        })}
                        {(row.specialization_domains ?? []).length === 0 ? (
                          <span className="text-xs text-[var(--admin-text-secondary)]">
                            {t(`${FORM_PREFIX}.detail.generalSupervision`)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="box-border py-2 pl-2 pr-2 align-middle tabular-nums text-num-14 text-[var(--admin-text)]">
                      {row.current_students} / {row.max_students}
                    </td>
                    <td className="box-border py-2 pl-2 pr-2 align-middle">
                      <span className={statusBadgeClass(row)}>
                        {row.platform_access_granted
                          ? accountStatus(row.account_status)
                          : t(`${FORM_PREFIX}.detail.accessDisabled`)}
                      </span>
                    </td>
                    <td className="box-border py-2 pl-2 pr-2 align-middle">
                      <span className={activeBadgeClass(row.is_encadrant_active)}>
                        {row.is_encadrant_active
                          ? t('admin.tables.encadrants.active')
                          : t('admin.tables.encadrants.inactive')}
                      </span>
                    </td>
                    <td className="box-border py-2 pl-2 pr-2 text-end align-middle">
                      <div className="flex h-8 items-start justify-end gap-2">
                        <button
                          type="button"
                          className={adminTableBtn}
                          onClick={() => setViewRow(row)}
                        >
                          <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          {action('view')}
                        </button>
                        <button
                          type="button"
                          className={adminTableBtn}
                          onClick={() => navigate(adminCrudRoutes.encadrantEdit(row.id))}
                        >
                          <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          {action('edit')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </AdminTableScroll>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            itemLabel={t('admin.pagination.encadrants', { defaultValue: 'encadrants' })}
          />
        </div>
      </div>
    </>
  );
};

export default EncadrantsTablePanel;
