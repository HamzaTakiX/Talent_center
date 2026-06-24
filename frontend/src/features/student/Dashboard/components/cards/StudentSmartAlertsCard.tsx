import { CSSProperties, FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import AdminSectionEmptyState from '../../../../admin/ui/AdminSectionEmptyState';
import type { StudentDashboardAlert } from '../../types/studentDashboardData';
import { useStudentDashboardContext } from '../../context/StudentDashboardContext';
import StudentSectionHeader from '../StudentSectionHeader';

const variantConfig: Record<
  StudentDashboardAlert['variant'],
  { className: string; Icon: LucideIcon }
> = {
  warning: { className: 'student-smart-alert--warning', Icon: AlertTriangle },
  info: { className: 'student-smart-alert--info', Icon: Sparkles },
  success: { className: 'student-smart-alert--success', Icon: CheckCircle2 },
};

const StudentSmartAlertsCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useStudentDashboardContext();
  const alerts = data.alerts;

  return (
    <DashboardPanel id="student-alerts" className="admin-section-panel student-smart-alerts-panel w-full">
      <StudentSectionHeader
        icon={<Sparkles strokeWidth={1.75} aria-hidden />}
        title={t('student.dashboard.sections.smartAlerts')}
        subtitle={t('student.dashboard.sections.smartAlertsSubtitle')}
      />

      {alerts.length === 0 ? (
        <div className="p-4 sm:p-5">
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="inbox"
            title={t('student.dashboard.empty.noAlerts')}
            description={t('student.dashboard.empty.noAlertsDesc')}
          />
        </div>
      ) : (
        <ul className="student-smart-alerts-list m-0 list-none p-0">
          {alerts.map((alert, index) => {
            const cfg = variantConfig[alert.variant];
            const RowIcon = cfg.Icon;
            return (
              <li
                key={alert.id}
                className="student-smart-alerts-list__item"
                style={{ '--student-alert-index': index } as CSSProperties}
              >
                <button
                  type="button"
                  onClick={() => navigate(alert.href)}
                  className={`student-smart-alert ${cfg.className}`}
                >
                  <span className="student-smart-alert__icon" aria-hidden>
                    <RowIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="student-smart-alert__body">
                    <span className="student-smart-alert__message">{alert.message}</span>
                    <span className="student-smart-alert__cta" aria-hidden>
                      <ChevronRight className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardPanel>
  );
};

export default StudentSmartAlertsCard;
