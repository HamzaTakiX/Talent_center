import { FunctionComponent, useMemo } from 'react';
import { AlertCircle, Calendar, CalendarDays, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../constants/encadrantKpiTones';
import { agendaSummaryMock } from '../data';
import type { AgendaSummaryStat } from '../types';

const iconMap = {
  calendar: Calendar,
  clock: Clock,
  calendarUpcoming: CalendarDays,
  alert: AlertCircle,
} as const;

const labelKeyByIcon: Record<AgendaSummaryStat['icon'], string> = {
  calendar: 'encadrant.agenda.kpi.totalThisWeek',
  clock: 'encadrant.agenda.kpi.meetingsToday',
  calendarUpcoming: 'encadrant.agenda.kpi.upcoming',
  alert: 'encadrant.agenda.kpi.missed',
};

const AgendaSummaryGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      agendaSummaryMock.map((stat) => {
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
      columns={4}
      ariaLabel={t('encadrant.agenda.summaryAria')}
    />
  );
};

export default AgendaSummaryGrid;
