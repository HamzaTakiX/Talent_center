import { FunctionComponent, MouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Activity, Bell, FileText, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import AdminSectionEmptyState from '../../../../admin/ui/AdminSectionEmptyState';
import {
  studentRecentActivity,
  type StudentActivityIconKey,
} from '../../data/studentDashboardMock';
import StudentSectionHeader from '../StudentSectionHeader';
import { STUDENT_SECONDARY_BUTTON } from '../../constants/studentDashboardStyles';

const activityIconMap: Record<StudentActivityIconKey, LucideIcon> = {
  message: MessageSquare,
  application: FileText,
  announcement: Bell,
};

const ActivityRow: FunctionComponent<{
  id: string;
  iconKey: StudentActivityIconKey;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}> = ({ id, iconKey, onClick }) => {
  const { t } = useTranslation();
  const Icon = activityIconMap[iconKey];

  return (
    <button type="button" onClick={onClick} className="student-activity-row">
      <span className="student-activity-row__icon" aria-hidden>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="text-[13px] font-medium text-[var(--admin-text)]">
          {t(`student.dashboard.mocks.activity.${id}.action`)}
        </span>
        <span className="text-[12px] text-[var(--admin-text-muted)]">
          {t(`student.dashboard.mocks.activity.${id}.time`)}
        </span>
      </span>
    </button>
  );
};

const StudentRecentActivityCard: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <DashboardPanel id="student-activity" className="admin-section-panel w-full">
      <StudentSectionHeader
        icon={<Activity strokeWidth={1.75} aria-hidden />}
        title={t('student.dashboard.sections.recentActivity')}
        subtitle={t('student.dashboard.sections.recentActivitySubtitle')}
      />

      <div className="flex flex-col gap-3 px-3 pb-4 pt-1 sm:px-4 sm:pb-5">
        {studentRecentActivity.length === 0 ? (
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="inbox"
            title={t('student.dashboard.empty.noActivity')}
            description={t('student.dashboard.empty.noActivityDesc')}
          />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {studentRecentActivity.map((row) => (
              <li key={row.id}>
                <ActivityRow
                  id={row.id}
                  iconKey={row.iconKey}
                  onClick={() => {
                    console.log('activity', row.id);
                  }}
                />
              </li>
            ))}
          </ul>
        )}

        <button type="button" className={`${STUDENT_SECONDARY_BUTTON} w-full`}>
          {t('student.dashboard.actions.viewAllActivity')}
        </button>
      </div>
    </DashboardPanel>
  );
};

export default StudentRecentActivityCard;
