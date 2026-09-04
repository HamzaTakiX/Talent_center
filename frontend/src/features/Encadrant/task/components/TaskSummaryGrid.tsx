import { FunctionComponent, useMemo } from 'react';
import { CalendarClock, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../constants/encadrantKpiTones';
import { ENCADRANT_TASKS_DONE_PATH } from '../task_cards/tasks_done/constants/routes';
import { ENCADRANT_TASKS_IN_PROGRESS_PATH } from '../task_cards/tasks_in_progress/constants/routes';
import { ENCADRANT_TASKS_UPCOMING_PATH } from '../task_cards/tasks_upcoming/constants/routes';
import { taskSummaryMock } from '../data';
import type { TaskSummaryStat } from '../types';

const iconMap = {
  check: CheckCircle2,
  clock: Clock,
  calendar: CalendarClock,
} as const;

const labelKeyByIcon: Record<TaskSummaryStat['icon'], string> = {
  check: 'encadrant.task.kpi.done',
  clock: 'encadrant.task.kpi.inProgress',
  calendar: 'encadrant.task.kpi.upcoming',
};

const pathByIcon: Partial<Record<TaskSummaryStat['icon'], string>> = {
  check: ENCADRANT_TASKS_DONE_PATH,
  clock: ENCADRANT_TASKS_IN_PROGRESS_PATH,
  calendar: ENCADRANT_TASKS_UPCOMING_PATH,
};

const TaskSummaryGrid: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      taskSummaryMock.map((stat) => {
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
      }),
    [navigate, t],
  );

  return (
    <PlatformKpiStrip
      items={items}
      columns={3}
      ariaLabel={t('encadrant.task.summaryAria')}
    />
  );
};

export default TaskSummaryGrid;
