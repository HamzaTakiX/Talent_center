import { FunctionComponent } from 'react';
import { LineChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import { studentProgressMetrics } from '../../data/studentDashboardMock';
import StudentSectionHeader from '../StudentSectionHeader';
import { STUDENT_SECONDARY_BUTTON } from '../../constants/studentDashboardStyles';

const barToneClass = (key: string): string => {
  if (key === 'profile') return 'bg-[var(--admin-brand)]';
  if (key === 'cv') return 'bg-emerald-500';
  return 'bg-[color-mix(in_srgb,var(--admin-brand)_55%,#8b5cf6)]';
};

const StudentProgressCard: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <DashboardPanel id="student-progress" className="admin-section-panel w-full">
      <StudentSectionHeader
        icon={<LineChart strokeWidth={1.75} aria-hidden />}
        title={t('student.dashboard.sections.progress')}
        subtitle={t('student.dashboard.sections.progressSubtitle')}
      />

      <div className="flex flex-col gap-5 px-4 pb-5 pt-1 sm:px-5 sm:pb-6">
        {studentProgressMetrics.map((m) => (
          <div key={m.key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-[13px] font-medium text-[var(--admin-text-secondary)]">
                {t(`student.dashboard.mocks.progress.${m.key}`)}
              </span>
              <span className="shrink-0 rounded-md bg-[var(--admin-surface-inset)] px-1.5 py-0.5 text-[13px] font-bold tabular-nums text-[var(--admin-text)]">
                {m.percent}%
              </span>
            </div>
            <div className="student-progress-track h-2">
              <div
                className={`student-progress-fill h-2 transition-[width] duration-500 ease-out ${barToneClass(m.key)}`}
                style={{ width: `${m.percent}%` }}
              />
            </div>
          </div>
        ))}

        <button type="button" className={`${STUDENT_SECONDARY_BUTTON} w-full`}>
          {t('student.dashboard.actions.improveProfile')}
        </button>
      </div>
    </DashboardPanel>
  );
};

export default StudentProgressCard;
