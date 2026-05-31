import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import { CheckCircle2, Clock3, Send, XCircle } from 'lucide-react';
import { studentHistoryStatsMock } from '../data/historyMockData';

const iconByKey = {
  total_events: Clock3,
  applied_actions: Send,
  accepted_actions: CheckCircle2,
  rejected_actions: XCircle,
} as const;

const bgByKey = {
  total_events: 'bg-[#3b82f6]',
  applied_actions: 'bg-[#a855f7]',
  accepted_actions: 'bg-[#22c55e]',
  rejected_actions: 'bg-[#ef4444]',
} as const;

const HistoryStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      studentHistoryStatsMock.map((item) => ({
        id: item.key,
        label: t(`student.mainHistory.stats.${item.key}`),
        value: item.value,
        icon: iconByKey[item.key as keyof typeof iconByKey] ?? Clock3,
        iconBgClass: bgByKey[item.key as keyof typeof bgByKey],
        onClick: () => console.log('Student history stat clicked', item.key),
      })),
    [t],
  );

  return (
    <PlatformKpiStrip
      items={items}
      columns={4}
      className="w-full min-w-0 max-w-full"
      ariaLabel={t('student.mainHistory.statsAria')}
    />
  );
};

export default HistoryStatsGrid;
