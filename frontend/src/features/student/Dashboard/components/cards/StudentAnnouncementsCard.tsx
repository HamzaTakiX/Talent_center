import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import AdminSectionEmptyState from '../../../../admin/ui/AdminSectionEmptyState';
import { STUDENT_ANNOUNCEMENTS_PATH } from '../../../Annoucements/constants/routes';
import FullAnnouncementCard from '../../../Annoucements/components/FullAnnouncementCard';
import { useStudentDashboardContext } from '../../context/StudentDashboardContext';
import StudentSectionHeader from '../StudentSectionHeader';

const StudentAnnouncementsCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useStudentDashboardContext();
  const rows = data.announcements;

  return (
    <DashboardPanel id="student-announcements" className="admin-section-panel w-full">
      <StudentSectionHeader
        icon={<Bell strokeWidth={1.75} aria-hidden />}
        title={t('student.dashboard.sections.announcements')}
        subtitle={t('student.dashboard.sections.announcementsSubtitle')}
        action={{ label: t('student.common.viewAll'), onClick: () => navigate(STUDENT_ANNOUNCEMENTS_PATH) }}
      />

      {rows.length === 0 ? (
        <div className="p-4 sm:p-5">
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="inbox"
            title={t('student.dashboard.empty.noAnnouncements')}
            description={t('student.dashboard.empty.noAnnouncementsDesc')}
          />
        </div>
      ) : (
        <div className="student-announcement-dashboard-list w-full min-w-0 px-4 pb-5 pt-1 sm:px-5 sm:pb-6">
          {rows.map((item) => (
            <FullAnnouncementCard
              key={item.id}
              item={item}
              variant={item.recommended ? 'recommended' : 'list'}
            />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
};

export default StudentAnnouncementsCard;
