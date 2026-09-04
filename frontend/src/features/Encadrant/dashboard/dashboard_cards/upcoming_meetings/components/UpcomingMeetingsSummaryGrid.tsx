import { FunctionComponent, useMemo } from 'react';
import { Calendar, Clock, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import { upcomingMeetingsSummaryMock } from '../data';
import type { UpcomingMeetingsSummaryStat } from '../types';

const iconMap = {
  calendar: Calendar,
  clock: Clock,
  missed: XCircle,
} as const;

const labelKeyByIcon: Record<UpcomingMeetingsSummaryStat['icon'], string> = {
  calendar: 'encadrant.dashboard.meetings.kpi.today',
  clock: 'encadrant.dashboard.meetings.kpi.thisWeek',
  missed: 'encadrant.dashboard.meetings.kpi.missed',
};

const UpcomingMeetingsSummaryGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      upcomingMeetingsSummaryMock.map((stat) => {
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
      ariaLabel={t('encadrant.dashboard.upcomingMeetings')}
    />
  );
};

export default UpcomingMeetingsSummaryGrid;
