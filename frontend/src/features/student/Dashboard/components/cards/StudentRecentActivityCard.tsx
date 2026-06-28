import { FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Activity, Bell, FileText, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import AdminSectionEmptyState from '../../../../admin/ui/AdminSectionEmptyState';
import { STUDENT_MAIN_HISTORY_PATH } from '../../../main_history/constants/routes';
import type { StudentActivityIconKey } from '../../types/studentDashboardData';
import { useStudentDashboardContext } from '../../context/StudentDashboardContext';
import StudentSectionHeader from '../StudentSectionHeader';
import { STUDENT_SECONDARY_BUTTON } from '../../constants/studentDashboardStyles';

const activityIconMap: Record<StudentActivityIconKey, LucideIcon> = {
  message: MessageSquare,
  application: FileText,
  announcement: Bell,
};

const ActivityRow: FunctionComponent<{
  iconKey: StudentActivityIconKey;
  action: string;
  time: string;
}> = ({ iconKey, action, time }) => {
  const Icon = activityIconMap[iconKey];

  return (
    <div className="student-activity-row">
      <span className="student-activity-row__icon" aria-hidden>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
        <span className="text-[13px] font-medium text-[var(--admin-text)]">{action}</span>
        <span className="text-[12px] text-[var(--admin-text-muted)]">{time}</span>
      </span>
    </div>
  );
};

const StudentRecentActivityCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useStudentDashboardContext();

  return (
    <DashboardPanel id="student-activity" className="admin-section-panel w-full">
      <StudentSectionHeader
        icon={<Activity strokeWidth={1.75} aria-hidden />}
        title={t('student.dashboard.sections.recentActivity')}
        subtitle={t('student.dashboard.sections.recentActivitySubtitle')}
      />

      <div className="flex flex-col gap-3 px-3 pb-4 pt-1 sm:px-4 sm:pb-5">
        {data.recentActivity.length === 0 ? (
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="inbox"
            title={t('student.dashboard.empty.noActivity')}
            description={t('student.dashboard.empty.noActivityDesc')}
          />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {data.recentActivity.map((row) => (
              <li key={row.id}>
                <ActivityRow iconKey={row.iconKey} action={row.action} time={row.time} />
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className={`${STUDENT_SECONDARY_BUTTON} w-full`}
          onClick={() => navigate(STUDENT_MAIN_HISTORY_PATH)}
        >
          {t('student.dashboard.actions.viewAllActivity')}
        </button>
      </div>
    </DashboardPanel>
  );
};

export default StudentRecentActivityCard;
