import { FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import AdminSectionEmptyState from '../../../../admin/ui/AdminSectionEmptyState';
import { studentSmartAlerts } from '../../data/studentDashboardMock';
import type { SmartAlertVariant } from '../../data/studentDashboardMock';
import StudentSectionHeader from '../StudentSectionHeader';

const variantConfig: Record<
  SmartAlertVariant,
  { className: string; Icon: LucideIcon }
> = {
  warning: { className: 'student-smart-alert--warning', Icon: AlertTriangle },
  info: { className: 'student-smart-alert--info', Icon: Sparkles },
  success: { className: 'student-smart-alert--success', Icon: CheckCircle2 },
};

const StudentSmartAlertsCard: FunctionComponent = () => {
  const { t } = useTranslation();

  const handleRowClick = (id: string) => {
    console.log('Smart alert', id);
  };

  return (
    <DashboardPanel id="student-alerts" className="admin-section-panel w-full">
      <StudentSectionHeader
        icon={<Sparkles strokeWidth={1.75} aria-hidden />}
        title={t('student.dashboard.sections.smartAlerts')}
        subtitle={t('student.dashboard.sections.smartAlertsSubtitle')}
      />

      {studentSmartAlerts.length === 0 ? (
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
          {studentSmartAlerts.map((alert) => {
            const cfg = variantConfig[alert.variant];
            const RowIcon = cfg.Icon;
            return (
              <li key={alert.id}>
                <button
                  type="button"
                  onClick={() => handleRowClick(alert.id)}
                  className={`student-smart-alert ${cfg.className}`}
                >
                  <span className="student-smart-alert__icon" aria-hidden>
                    <RowIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="student-smart-alert__message">{alert.message}</span>
                  <span className="student-smart-alert__cta">{alert.ctaLabel}</span>
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
