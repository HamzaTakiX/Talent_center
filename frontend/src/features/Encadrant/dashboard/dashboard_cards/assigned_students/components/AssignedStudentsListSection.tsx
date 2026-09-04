import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardPanel from '../../../../../admin/dashboard/ui/DashboardPanel';
import { assignedStudentsListMock } from '../data';
import { filterAssignedStudents } from '../utils/filterAssignedStudents';
import AssignedStudentsGrid from './AssignedStudentsGrid';
import AssignedStudentsToolbar from './AssignedStudentsToolbar';

const AssignedStudentsListSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(
    () => filterAssignedStudents(assignedStudentsListMock, searchQuery),
    [searchQuery],
  );

  return (
    <DashboardPanel
      className="admin-section-panel w-full min-w-0 max-w-full"
      aria-label={t('encadrant.dashboard.assignedStudents')}
    >
      <div className="flex min-w-0 flex-col gap-4 px-4 pb-5 pt-4 sm:gap-5 sm:px-5 sm:pb-6">
        <AssignedStudentsToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <AssignedStudentsGrid students={filteredStudents} />
      </div>
    </DashboardPanel>
  );
};

export default AssignedStudentsListSection;
