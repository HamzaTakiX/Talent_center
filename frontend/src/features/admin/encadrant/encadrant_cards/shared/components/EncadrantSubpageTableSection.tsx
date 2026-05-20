import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Search } from 'lucide-react';
import { useAdminSearchPlaceholder } from '../../../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../../../i18n/useAdminTableValues';
import type { AdminEncadrantRow } from '../../../../api/types';
import {
  AdminPagination,
  AdminSelectField,
  AdminTableEmptyState,
  AdminTableSkeletonRows,
} from '../../../../ui';
import { platformAccountStatusTableBadge } from '../../../../ui/adminStatusBadges';
import { adminTableBtn } from '../../../../ui/adminTableButtons';
import EncadrantDetailModal from '../../../components/EncadrantDetailModal';
import { encadrantMatchesDepartment, encadrantScopeLabel } from '../utils/encadrantDisplay';

interface EncadrantSubpageTableSectionProps {
  rows: AdminEncadrantRow[];
  query: string;
  onQueryChange: (v: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (v: string) => void;
  departmentOptions: string[];
  loading?: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  reportsEmpty?: boolean;
}

const EncadrantSubpageTableSection: FunctionComponent<EncadrantSubpageTableSectionProps> = ({
  rows,
  query,
  onQueryChange,
  departmentFilter,
  onDepartmentFilterChange,
  departmentOptions,
  loading = false,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  reportsEmpty = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchPh = useAdminSearchPlaceholder('encadrants');
  const { accountStatus } = useAdminTableValues();
  const [viewRow, setViewRow] = useState<AdminEncadrantRow | null>(null);

  const departmentSelectOptions = useMemo(
    () => [
      { value: 'all', label: t('admin.filters.allDepartments', { defaultValue: 'All programs' }) },
      ...departmentOptions.map((d) => ({ value: d, label: d })),
    ],
    [departmentOptions, t],
  );

  return (
    <>
      <EncadrantDetailModal
        open={viewRow != null}
        encadrant={viewRow}
        onClose={() => setViewRow(null)}
        onEdit={(id) => {
          setViewRow(null);
          navigate(`/admin/encadrants/${id}/edit`);
        }}
      />

      <div className="box-border flex w-full min-w-0 flex-col admin-module-panel font-inter shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <div className="relative min-h-0 min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-secondary)]"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={searchPh}
              className="box-border h-10 w-full rounded-lg border-0 admin-field border border-[var(--admin-border)] bg-[var(--admin-input-bg)] py-2 pl-10 pr-4 text-num-14 leading-num-20 text-[var(--admin-text)] placeholder:text-[var(--admin-text-secondary)] outline-none ring-1 ring-inset ring-transparent focus:ring-[var(--admin-brand-muted)]"
            />
          </div>
          <AdminSelectField
            aria-label="Filter by program"
            value={departmentFilter}
            onChange={onDepartmentFilterChange}
            options={departmentSelectOptions}
            wrapperClassName="min-w-[11rem] shrink-0"
          />
        </div>

        <div className="overflow-x-auto px-4 pb-6 pt-2 sm:px-6">
          <div className="text-left text-num-14 font-inter text-[var(--admin-text)]">
            <table className="admin-table w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="h-10 border-b border-solid border-[var(--admin-border)]">
                  <th className="box-border py-[8.75px] pl-2 pr-4 text-left font-medium leading-num-20">
                    {t('admin.tables.encadrants.name', { defaultValue: 'Name' })}
                  </th>
                  <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">
                    {t('admin.tables.encadrants.scope', { defaultValue: 'Programs' })}
                  </th>
                  <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">
                    {t('admin.tables.encadrants.students', { defaultValue: 'Students' })}
                  </th>
                  <th className="box-border px-4 py-[8.75px] text-left font-medium leading-num-20">
                    {t('admin.tables.encadrants.status', { defaultValue: 'Status' })}
                  </th>
                  <th className="box-border py-[8.75px] pl-4 pr-2 text-right font-medium leading-num-20">
                    {t('admin.tables.encadrants.actions', { defaultValue: 'Actions' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <AdminTableSkeletonRows colSpan={5} rows={6} />
                ) : rows.length === 0 ? (
                  <AdminTableEmptyState
                    colSpan={5}
                    titleKey={
                      reportsEmpty ? 'admin.empty.encadrantsNoReports' : undefined
                    }
                    descriptionKey={
                      reportsEmpty ? 'admin.empty.encadrantsNoReportsDesc' : undefined
                    }
                    title={
                      reportsEmpty
                        ? undefined
                        : t('admin.empty.encadrantsSearch', {
                            defaultValue: 'No encadrants match your filters.',
                          })
                    }
                  />
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="min-h-[49px] border-b border-solid border-[var(--admin-border)] last:border-b-0"
                    >
                      <td className="box-border min-h-[49px] py-[13.5px] pl-2 pr-4 align-middle font-medium leading-num-20">
                        <div>{row.full_name || row.email}</div>
                        <div className="text-xs text-[var(--admin-text-secondary)]">{row.email}</div>
                      </td>
                      <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle leading-num-20">
                        {encadrantScopeLabel(row)}
                      </td>
                      <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle leading-num-20">
                        {row.current_students} / {row.max_students}
                      </td>
                      <td className="box-border min-h-[49px] px-4 py-[13.5px] align-middle">
                        <span className={platformAccountStatusTableBadge(row.account_status)}>
                          {accountStatus(row.account_status)}
                        </span>
                      </td>
                      <td className="box-border min-h-[49px] py-[8.5px] pl-4 pr-2 text-right align-middle">
                        <div className="flex flex-wrap items-start justify-end gap-2">
                          <button
                            type="button"
                            className={adminTableBtn}
                            onClick={() => setViewRow(row)}
                          >
                            <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                            {t('admin.common.actions.view')}
                          </button>
                          <button
                            type="button"
                            className={adminTableBtn}
                            onClick={() => navigate(`/admin/encadrants/${row.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                            {t('admin.common.actions.edit')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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

export default EncadrantSubpageTableSection;
