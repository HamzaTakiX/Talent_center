import { FunctionComponent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FileText, Pencil, Users, UserPlus } from 'lucide-react';
import { adminCrudRoutes } from '../../../../shared/navigation/adminCrudRoutes';
import type { EncadrantRow } from '../../../data/encadrantsMockData';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminSearchEmptyState, AdminTableEmptyState, AdminTableScroll } from '../../../../ui';
import { ADMIN_TABLE_COL, SafeText } from '../../../../../../design-system/safeContent';

import { adminTableBtn, adminTableBtnMobile, adminTableBtnMobilePrimary, adminTableBtnPrimary } from '../../../../ui/adminTableButtons';

interface EncadrantListTableContentProps {
  rows: EncadrantRow[];
}



const EncadrantListTableContent: FunctionComponent<EncadrantListTableContentProps> = ({ rows }) => {
  const navigate = useNavigate();
  const stopBtn = (e: MouseEvent) => e.stopPropagation();
  const goEdit = (name: string) => navigate(adminCrudRoutes.encadrantEdit(name));

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {rows.length === 0 ? (
          <AdminSearchEmptyState title="No encadrants match your filters." />
        ) : (
          rows.map((row, index) => (
            <AdminMobileRowCard
              key={`${row.name}-${index}`}
              title={<SafeText as="span">{row.name}</SafeText>}
              fields={[
                { label: 'Department', value: <SafeText>{row.department}</SafeText> },
                {
                  label: 'Students assigned',
                  value: (
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      {row.studentsAssigned}
                    </span>
                  )
                },
                {
                  label: 'Reports in progress',
                  value: (
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      {row.reportsInProgress}
                    </span>
                  )
                }
              ]}
              actions={
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap" onClick={stopBtn}>
                  <button type="button" className={adminTableBtnMobile} onClick={() => goEdit(row.name)}>
                    <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span>View Details</span>
                  </button>
                  <button type="button" className={adminTableBtnMobile} onClick={() => goEdit(row.name)}>
                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span>Edit</span>
                  </button>
                  <button type="button" className={adminTableBtnMobilePrimary}>
                    <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    <span>Manage Students</span>
                  </button>
                </div>
              }
            />
          ))
        )}
      </div>

      <div className="admin-module-table-wrap hidden lg:block">
        <AdminTableScroll minWidth="800px" className="admin-table-scroll--panel">
          <thead>
            <tr className="border-b border-[var(--admin-border)]">
              <th className={`py-2.5 pl-2 pr-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.name}`}>Name</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.text}`}>Department</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.applicants}`}>Students Assigned</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.text}`}>Reports in Progress</th>
              <th className={`py-2.5 pl-4 pr-2 text-right text-sm font-medium leading-5 text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.actions}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <AdminTableEmptyState colSpan={5} title="No encadrants match your filters." />
            ) : (
              rows.map((row, index) => (
                <tr
                  key={`${row.name}-${index}`}
                  className="cursor-pointer border-b border-[var(--admin-border)] last:border-b-0 hover:bg-[var(--admin-row-hover)]"
                  onClick={() => {}}
                >
                  <td className="py-3 pl-2 pr-4 align-middle text-sm font-medium leading-5 text-[var(--admin-text)]"><SafeText>{row.name}</SafeText></td>
                  <td className="py-3 px-4 align-middle text-sm leading-5"><SafeText>{row.department}</SafeText></td>
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1.5 text-sm leading-5">
                      <Users className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      <span>{row.studentsAssigned}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1.5 text-sm leading-5">
                      <FileText className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      <span>{row.reportsInProgress}</span>
                    </div>
                  </td>
                  <td className="py-3 pl-4 pr-2 text-right align-middle">
                    <div className="flex flex-wrap items-center justify-end gap-2" onClick={stopBtn}>
                      <button type="button" className={adminTableBtn} onClick={() => goEdit(row.name)}>
                        <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        <span>View Details</span>
                      </button>
                      <button type="button" className={adminTableBtn} onClick={() => goEdit(row.name)}>
                        <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        <span>Edit</span>
                      </button>
                      <button type="button" className={adminTableBtnPrimary}>
                        <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                        <span>Manage Students</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableScroll>
      </div>
    </>
  );
};

export default EncadrantListTableContent;

