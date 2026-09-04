import { FunctionComponent, useMemo } from 'react';
import { AlertTriangle, Calendar, FilePenLine, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../constants/encadrantKpiTones';
import { ENCADRANT_ASSIGNED_STUDENTS_PATH } from '../dashboard_cards/assigned_students/constants/routes';
import { ENCADRANT_REPORTS_PENDING_PATH } from '../dashboard_cards/reports_pending/constants/routes';
import { ENCADRANT_UPCOMING_MEETINGS_PATH } from '../dashboard_cards/upcoming_meetings/constants/routes';
import { ENCADRANT_STUDENTS_AT_RISK_PATH } from '../dashboard_cards/students_at_risk/constants/routes';
import { dashboardStatsMock } from '../data';
import type { DashboardStatItem } from '../types';

/** Attention-first order using stable icon ids (not translated labels). */
const ATTENTION_ORDER = ['reports', 'alert', 'calendar', 'users'] as const;

const iconMap = {
  users: Users,
  alert: AlertTriangle,
  reports: FilePenLine,
  calendar: Calendar,
} as const;

const labelKeyByIcon: Record<DashboardStatItem['icon'], string> = {
  users: 'encadrant.dashboard.kpi.assignedStudents',
  alert: 'encadrant.dashboard.kpi.studentsAtRisk',
  reports: 'encadrant.dashboard.kpi.reportsPending',
  calendar: 'encadrant.dashboard.kpi.upcomingMeetings',
};

const pathByIcon: Partial<Record<DashboardStatItem['icon'], string>> = {
  users: ENCADRANT_ASSIGNED_STUDENTS_PATH,
  alert: ENCADRANT_STUDENTS_AT_RISK_PATH,
  reports: ENCADRANT_REPORTS_PENDING_PATH,
  calendar: ENCADRANT_UPCOMING_MEETINGS_PATH,
};

const DashboardStatsGrid: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const items = useMemo(() => {
    const rank = (icon: DashboardStatItem['icon']) => {
      const idx = ATTENTION_ORDER.indexOf(icon);
      return idx === -1 ? ATTENTION_ORDER.length : idx;
    };
    return [...dashboardStatsMock]
      .sort((a, b) => rank(a.icon) - rank(b.icon))
      .map((stat) => {
        const tones = encadrantKpiTone(stat.tone);
        const path = pathByIcon[stat.icon];
        return {
          id: stat.icon,
          label: t(labelKeyByIcon[stat.icon]),
          value: String(stat.value),
          icon: iconMap[stat.icon],
          accent: tones.accent,
          accentBg: tones.bg,
          onClick: path ? () => navigate(path) : undefined,
        };
      });
  }, [navigate, t]);

  return (
    <PlatformKpiStrip
      items={items}
      columns={4}
      ariaLabel={t('encadrant.dashboard.description')}
    />
  );
};

export default DashboardStatsGrid;
