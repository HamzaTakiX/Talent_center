import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Upload, UserX } from 'lucide-react';
import { useAdminCopy, useAdminSearchPlaceholder } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type { StudentDashboardRow } from '../data/studentsDashboardMock';
import { AdminListToolbar, AdminModuleHeader, AdminTableEmptyState, AdminTableScroll } from '../../ui';
import { internshipStatusTableBadge, studentAccountTableBadge } from '../../ui/adminStatusBadges';
import { adminTableBtn } from '../../ui/adminTableButtons';

const INTERNSHIP_STATUS_KEYS: Record<string, string> = {
  Assigned: 'internshipStatus.assigned',
  Searching: 'internshipStatus.searching',
  None: 'internshipStatus.none',
};

interface StudentsDashboardTableProps {
  students: StudentDashboardRow[];
  query: string;
  onQueryChange: (v: string) => void;
}

const StudentsDashboardTable: FunctionComponent<StudentsDashboardTableProps> = ({
  students,
  query,
  onQueryChange,
}) => {
  const { t } = useTranslation();
  const { tableColumn, emptyState, createLabel, filterLabel } = useAdminCopy();
  const { internshipStatus, accountStatus } = useAdminTableValues();
  const searchPh = useAdminSearchPlaceholder('students');
  const [internshipFilter, setInternshipFilter] = useState('all');

  const internshipFilterOptions = useMemo(
    () => [
      { value: 'all', label: filterLabel('allStatuses') },
      { value: 'Assigned', label: filterLabel('internshipStatus.assigned') },
      { value: 'Searching', label: filterLabel('internshipStatus.searching') },
      { value: 'None', label: filterLabel('internshipStatus.none') },
    ],
    [filterLabel]
  );

  const displayStudents = useMemo(() => {
    if (internshipFilter === 'all') return students;
    return students.filter((s) => s.internshipStatus === internshipFilter);
  }, [students, internshipFilter]);

  return (
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
            toolbarAriaLabel={filterLabel('filterByInternshipStatus')}
            filter1={{
              value: internshipFilter,
              onChange: setInternshipFilter,
              options: internshipFilterOptions,
              ariaLabel: filterLabel('filterByInternshipStatus'),
            }}
            createLabel={createLabel('student')}
            onCreate={() => {}}
            actionExtra={
              <button type="button" className="admin-module-toolbar__btn">
                <Upload className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                <span>{t('admin.common.actions.importExcel')}</span>
              </button>
            }
          />
        }
      />

      <div className="admin-module-table-wrap px-4 pb-6 lg:px-6">
        <AdminTableScroll minWidth="900px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>{tableColumn('name')}</th>
              <th>{tableColumn('class')}</th>
              <th>{tableColumn('field')}</th>
              <th>{tableColumn('internshipStatus')}</th>
              <th>{tableColumn('status')}</th>
              <th>{tableColumn('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {displayStudents.length === 0 ? (
              <AdminTableEmptyState colSpan={6} title={emptyState('studentsFilters')} />
            ) : (
              displayStudents.map((student) => (
                <tr key={student.id}>
                  <td className="font-medium">{student.name}</td>
                  <td>{student.classLevel}</td>
                  <td>{student.field}</td>
                  <td>
                    <span className={internshipStatusTableBadge(student.internshipStatus)}>
                      {internshipStatus(student.internshipStatus)}
                    </span>
                  </td>
                  <td>
                    <span className={studentAccountTableBadge(student.statusLabel)}>
                      {accountStatus(student.statusLabel)}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button type="button" className={adminTableBtn}>
                        <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        {t('admin.common.actions.viewProfile')}
                      </button>
                      <button type="button" className={adminTableBtn}>
                        <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        {t('admin.common.actions.edit')}
                      </button>
                      <button type="button" className={adminTableBtn}>
                        <UserX className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        {t('admin.common.actions.deactivate')}
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

export default StudentsDashboardTable;
