import { FunctionComponent, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardSectionHeader from '../../../admin/dashboard/components/DashboardSectionHeader';
import DashboardPanel from '../../../admin/dashboard/ui/DashboardPanel';
import { assignedStudentsMock } from '../data';
import { filterStudentsByQuery } from '../utils/filterStudentsByQuery';
import DashboardStudentsGrid from './DashboardStudentsGrid';
import DashboardStudentsToolbar from './DashboardStudentsToolbar';

const DashboardStudentsSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(
    () => filterStudentsByQuery(assignedStudentsMock, searchQuery),
    [searchQuery],
  );

  return (
    <DashboardPanel
      id="encadrant-my-students"
      className="admin-section-panel w-full min-w-0 max-w-full"
      aria-label={t('encadrant.dashboard.assignedStudents')}
    >
      <DashboardSectionHeader
        icon={<Users strokeWidth={1.75} aria-hidden />}
        title={t('encadrant.dashboard.assignedStudents')}
        subtitle={t('encadrant.dashboard.description')}
      />

      <div className="flex min-w-0 flex-col gap-4 px-4 pb-5 pt-1 sm:gap-5 sm:px-5 sm:pb-6">
        <DashboardStudentsToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <DashboardStudentsGrid students={filteredStudents} />
      </div>
    </DashboardPanel>
  );
};

export default DashboardStudentsSection;
