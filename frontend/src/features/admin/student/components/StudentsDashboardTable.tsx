import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Upload, UserX } from 'lucide-react';
import { adminStudentsApi } from '../../api/students';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type { AdminStudentRow } from '../../api/types';
import { useAdminTableDeleteFlow } from '../../shared/hooks/useAdminTableDeleteFlow';
import {
  AdminListToolbar,
  AdminModuleHeader,
  AdminPagination,
  AdminTableEmptyState,
  AdminTableScroll,
  AdminTableSkeletonRows,
} from '../../ui';
import { programTableLabel } from '../../shared/utils/programDisplay';
import AdminDeleteConfirmModal from '../../ui/AdminDeleteConfirmModal';
import AdminToolbarDeleteControl from '../../ui/AdminToolbarDeleteControl';
import StudentsImportModal from './StudentsImportModal';
import { platformAccountStatusTableBadge } from '../../ui/adminStatusBadges';
import { adminTableBtn } from '../../ui/adminTableButtons';

interface StudentsDashboardTableProps {
  students: AdminStudentRow[];
  query: string;
  onQueryChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  loading?: boolean;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onView: (student: AdminStudentRow) => void;
  onEdit: (student: AdminStudentRow) => void;
  onRefresh: () => void;
}

const StudentsDashboardTable: FunctionComponent<StudentsDashboardTableProps> = ({
  students,
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
  onCreate,
  onView,
  onEdit,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { tableColumn, emptyState, createLabel, filterLabel } = useAdminCopy();
  const { accountStatus } = useAdminTableValues();
  const searchPh = useAdminSearchPlaceholder('students');
  const [importOpen, setImportOpen] = useState(false);

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
    rows: students,
    kind: 'student',
    deleteOne: adminStudentsApi.delete,
    deleteBulk: adminStudentsApi.bulkDelete,
    onRefresh,
  });

  const statusFilterOptions = useMemo(
    () => [
      { value: 'all', label: filterLabel('allStatuses') },
      { value: 'PENDING', label: 'En attente' },
      { value: 'AUTHORIZED', label: 'Autorisé' },
      { value: 'ACTIVE', label: 'Actif' },
      { value: 'SUSPENDED', label: 'Suspendu' },
      { value: 'BLOCKED', label: 'Bloqué' },
    ],
    [filterLabel],
  );

  const handleToggleAccess = async (student: AdminStudentRow) => {
    await adminStudentsApi.updateAccess(student.id, {
      platform_access_granted: !student.platform_access_granted,
      account_status: !student.platform_access_granted ? 'AUTHORIZED' : 'PENDING',
    });
    onRefresh();
  };

  const colSpan = selectionMode ? 8 : 7;

  return (
    <>
      <StudentsImportModal
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
      <div className="box-border flex w-full min-w-0 flex-col admin-module-panel font-inter shadow-sm">
        <AdminModuleHeader
          layout="toolbar"
          title={t('admin.modules.students.title')}
          subtitle={t('admin.modules.students.subtitle')}
          actions={
            <AdminListToolbar
              controlsLayout="grouped"
              searchValue={query}
              onSearchChange={onQueryChange}
              searchPlaceholder={searchPh}
              toolbarAriaLabel={filterLabel('allStatuses')}
              filter1={{
                value: statusFilter,
                onChange: onStatusFilterChange,
                options: statusFilterOptions,
                ariaLabel: filterLabel('allStatuses'),
              }}
              createLabel={createLabel('student')}
              onCreate={onCreate}
              actionExtra={
                <button
                  type="button"
                  className="admin-module-toolbar__btn"
                  onClick={() => setImportOpen(true)}
                >
                  <Upload className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span>{t('admin.common.actions.importExcel')}</span>
                </button>
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

        <div className="admin-module-table-wrap px-4 pb-6 lg:px-6">
          <AdminTableScroll minWidth={selectionMode ? '1040px' : '1000px'} className="admin-table-scroll--panel">
            <thead>
              <tr>
                {selectionMode ? (
                  <th className="w-10">
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
                <th>{tableColumn('name')}</th>
                <th>{tableColumn('class')}</th>
                <th>{tableColumn('field')}</th>
                <th>SSO</th>
                <th>Onboarding</th>
                <th>{tableColumn('status')}</th>
                <th>{tableColumn('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <AdminTableSkeletonRows colSpan={colSpan} />
              ) : students.length === 0 ? (
                <AdminTableEmptyState colSpan={colSpan} title={emptyState('studentsFilters')} />
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    {selectionMode ? (
                      <td>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[var(--admin-border)] accent-[var(--admin-accent)]"
                          checked={selection.isSelected(student.id)}
                          onChange={() => selection.toggleRow(student.id)}
                          aria-label={student.full_name || student.email}
                        />
                      </td>
                    ) : null}
                    <td className="font-medium">
                      <div>{student.full_name || student.email}</div>
                      <div className="text-xs text-[var(--admin-text-secondary)]">{student.email}</div>
                    </td>
                    <td>{student.current_class || '—'}</td>
                    <td className="whitespace-nowrap font-medium">
                      {programTableLabel(student.filiere_code, student.program_major)}
                    </td>
                    <td>
                      <span
                        className={platformAccountStatusTableBadge(
                          student.sso_enabled ? 'AUTHORIZED' : 'PENDING',
                        )}
                      >
                        {student.sso_enabled ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-[var(--admin-text-secondary)]">
                        {student.onboarding_percent}%
                      </span>
                    </td>
                    <td>
                      <span className={platformAccountStatusTableBadge(student.account_status)}>
                        {accountStatus(student.account_status)}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button type="button" className={adminTableBtn} onClick={() => onView(student)}>
                          <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          {t('admin.common.actions.view')}
                        </button>
                        <button type="button" className={adminTableBtn} onClick={() => onEdit(student)}>
                          <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          {t('admin.common.actions.edit')}
                        </button>
                        <button
                          type="button"
                          className={adminTableBtn}
                          onClick={() => void handleToggleAccess(student)}
                        >
                          <UserX className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          {student.platform_access_granted
                            ? t('admin.common.actions.deactivate')
                            : 'Autoriser'}
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
            itemLabel={t('admin.pagination.students', { defaultValue: 'étudiants' })}
          />
        </div>
      </div>
    </>
  );
};

export default StudentsDashboardTable;
