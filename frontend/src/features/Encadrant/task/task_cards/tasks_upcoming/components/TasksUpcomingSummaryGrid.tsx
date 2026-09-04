import { FunctionComponent, useMemo } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import { tasksUpcomingSummaryMock } from '../data';
import type { TasksUpcomingSummaryStat } from '../types';

const iconMap = {
  total: CheckCircle2,
  completed: CheckCircle2,
  pending: Clock,
} as const;

const labelKeyByIcon: Record<TasksUpcomingSummaryStat['icon'], string> = {
  total: 'encadrant.task.kpi.total',
  completed: 'encadrant.task.kpi.completed',
  pending: 'encadrant.task.kpi.pending',
};

const TasksUpcomingSummaryGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      tasksUpcomingSummaryMock.map((stat) => {
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
      ariaLabel={t('encadrant.header.titles.tasksUpcoming')}
    />
  );
};

export default TasksUpcomingSummaryGrid;
