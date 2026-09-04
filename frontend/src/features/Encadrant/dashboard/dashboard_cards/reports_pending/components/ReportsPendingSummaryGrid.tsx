import { FunctionComponent, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, FilePenLine } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import { reportsPendingSummaryMock } from '../data';
import type { ReportsPendingSummaryStat } from '../types';

const iconMap = {
  document: FilePenLine,
  alert: AlertTriangle,
  check: CheckCircle2,
} as const;

const labelKeyByIcon: Record<ReportsPendingSummaryStat['icon'], string> = {
  document: 'encadrant.dashboard.pendingReports.kpi.totalPending',
  alert: 'encadrant.dashboard.pendingReports.kpi.late',
  check: 'encadrant.dashboard.pendingReports.kpi.onTime',
};

const ReportsPendingSummaryGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      reportsPendingSummaryMock.map((stat) => {
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
      ariaLabel={t('encadrant.dashboard.pendingReports.title')}
    />
  );
};

export default ReportsPendingSummaryGrid;
