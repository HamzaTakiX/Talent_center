import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { Eye, UserPlus, FileText, Users } from 'lucide-react';
import type { EncadrantRow } from '../data/encadrantsMockData';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import { AdminListToolbar, AdminModuleHeader, AdminSearchEmptyState, AdminTableEmptyState, AdminTableScroll } from '../../ui';

import { adminTableBtn, adminTableBtnMobile, adminTableBtnMobilePrimary, adminTableBtnPrimary } from '../../ui/adminTableButtons';

interface EncadrantsTablePanelProps {
  rows: EncadrantRow[];
  query: string;
  onQueryChange: (value: string) => void;
}

const EncadrantsTablePanel: FunctionComponent<EncadrantsTablePanelProps> = ({
  rows,
  query,
  onQueryChange
}) => {
  const { t } = useTranslation();
  const { tableColumn, emptyState, createLabel, filterLabel } = useAdminCopy();
  const searchPh = useAdminSearchPlaceholder('encadrants');
  const tableHeadings = [
    tableColumn('name'),
    tableColumn('department'),
    tableColumn('studentsAssigned'),
    tableColumn('reportsInProgress'),
    tableColumn('actions'),
  ];
  const navigate = useNavigate();
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const departmentOptions = useMemo(
    () => [...new Set(rows.map((r) => r.department))].sort(),
    [rows]
  );

  const departmentSelectOptions = useMemo(
    () => [
      { value: 'all', label: filterLabel('allDepartments') },
      ...departmentOptions.map((d) => ({ value: d, label: d })),
    ],
    [departmentOptions, filterLabel]
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchDept = departmentFilter === 'all' || r.department === departmentFilter;
      if (!q) return matchDept;
      const matchQuery =
        r.name.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        String(r.studentsAssigned).includes(q) ||
        String(r.reportsInProgress).includes(q);
      return matchDept && matchQuery;
    });
  }, [rows, query, departmentFilter]);

  return (
    <div className="box-border flex w-full min-w-0 flex-col admin-module-panel text-start font-inter shadow-sm">
      <AdminModuleHeader
        layout="toolbar"
        title={t('admin.modules.encadrants.title')}
        subtitle={t('admin.modules.encadrants.subtitle')}
        actions={
          <AdminListToolbar
            searchValue={query}
            onSearchChange={onQueryChange}
            searchPlaceholder={searchPh}
            toolbarAriaLabel={filterLabel('filterByDepartment')}
            filter1={{
              value: departmentFilter,
              onChange: setDepartmentFilter,
              options: departmentSelectOptions,
              ariaLabel: filterLabel('filterByDepartment'),
            }}
            createLabel={createLabel('encadrant')}
            onCreate={() => navigate('/admin/encadrants/new')}
          />
        }
      />

      <div className="space-y-3 px-4 pb-6 pt-0 sm:px-6 lg:hidden">
        {filteredRows.length === 0 ? (
          <AdminSearchEmptyState title={emptyState('encadrantsFilters')} />
        ) : (
        filteredRows.map((row, index) => (
          <AdminMobileRowCard
            key={`${row.name}-${index}`}
            title={row.name}
            fields={[
              { label: tableColumn('department'), value: row.department },
              {
                label: tableColumn('studentsAssigned'),
                value: (
                  <span className="inline-flex items-center gap-2 tabular-nums">
                    <Users className="h-4 w-4 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
                    {row.studentsAssigned}
                  </span>
                )
              },
              {
                label: tableColumn('reportsInProgress'),
                value: (
                  <span className="inline-flex items-center gap-2 tabular-nums">
                    <FileText className="h-4 w-4 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
                    {row.reportsInProgress}
                  </span>
                )
              }
            ]}
            actions={
              <>
                <button type="button" className={adminTableBtnMobile}>
                  <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {t('admin.common.actions.viewDetails')}
                </button>
                <button type="button" className={adminTableBtnMobilePrimary}>
                  <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                  {t('admin.common.actions.manageStudents')}
                </button>
              </>
            }
          />
        ))
        )}
      </div>

      <div className="admin-module-table-wrap hidden px-4 pb-6 pt-0 min-w-0 sm:px-6 lg:block">
        <AdminTableScroll minWidth="1195px" className="admin-table-scroll--panel">
              <thead>
                <tr className="box-border h-10 border-b border-solid border-[var(--admin-border)]">
                  {tableHeadings.map((heading, colIndex) => {
                    const isActions = colIndex === tableHeadings.length - 1;
                    return (
                      <th
                        key={heading}
                        className={`box-border py-2 pl-2 pr-2 text-num-14 font-medium leading-5 text-[var(--admin-text)] ${
                          isActions ? 'text-end' : 'text-start'
                        }`}
                      >
                        {heading}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <AdminTableEmptyState colSpan={5} title={emptyState('encadrantsFilters')} />
                ) : (
                filteredRows.map((row, index) => (
                  <tr
                    key={`${row.name}-${index}`}
                    className={`box-border h-[49px] border-b border-solid border-[var(--admin-border)] last:border-b-0`}
                  >
                    <td className="box-border max-w-[196px] py-[13.5px] pl-2 pr-2 align-middle text-num-14 font-medium leading-5 text-[var(--admin-text)]">
                      {row.name}
                    </td>
                    <td className="box-border py-[13.5px] pl-2 pr-2 align-middle text-num-14 font-normal leading-5 text-[var(--admin-text)]">
                      {row.department}
                    </td>
                    <td className="box-border py-[13.5px] pl-2 pr-2 align-middle">
                      <div className="flex h-5 items-center gap-2">
                        <Users className="h-4 w-4 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
                        <span className="text-num-14 leading-5 text-[var(--admin-text)] tabular-nums">{row.studentsAssigned}</span>
                      </div>
                    </td>
                    <td className="box-border py-[13.5px] pl-2 pr-2 align-middle">
                      <div className="flex h-5 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
                        <span className="text-num-14 leading-5 text-[var(--admin-text)] tabular-nums">{row.reportsInProgress}</span>
                      </div>
                    </td>
                    <td className="box-border py-2 pl-2 pr-2 text-right align-middle">
                      <div className="flex h-8 items-start justify-end gap-2">
                        <button type="button" className={adminTableBtn}>
                          <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          {t('admin.common.actions.viewDetails')}
                        </button>
                        <button type="button" className={adminTableBtnPrimary}>
                          <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                          {t('admin.common.actions.manageStudents')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
        </AdminTableScroll>
      </div>
    </div>
  );
};

export default EncadrantsTablePanel;
