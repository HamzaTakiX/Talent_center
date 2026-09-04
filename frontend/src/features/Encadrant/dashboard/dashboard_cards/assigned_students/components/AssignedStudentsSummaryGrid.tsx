import { FunctionComponent, useMemo } from 'react';
import { UserCheck, UserX, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import { assignedStudentsSummaryMock } from '../data';
import type { AssignedStudentsSummaryStat } from '../types';

const iconMap = {
  users: Users,
  active: UserCheck,
  inactive: UserX,
} as const;

const labelKeyByIcon: Record<AssignedStudentsSummaryStat['icon'], string> = {
  users: 'encadrant.dashboard.assigned.kpi.total',
  active: 'encadrant.dashboard.assigned.kpi.active',
  inactive: 'encadrant.dashboard.assigned.kpi.inactive',
};

const AssignedStudentsSummaryGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      assignedStudentsSummaryMock.map((stat) => {
        const tones = encadrantKpiTone(stat.tone);
        return {
          id: stat.icon,
          label: t(labelKeyByIcon[stat.icon]),
          value: String(stat.value),
          icon: iconMap[stat.icon],
          accent: tones.accent,
          accentBg: tones.bg,
        };
      }),
    [t],
  );

  return (
    <PlatformKpiStrip
      items={items}
      columns={3}
      ariaLabel={t('encadrant.dashboard.assignedStudents')}
    />
  );
};

export default AssignedStudentsSummaryGrid;
