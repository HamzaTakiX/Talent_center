import { FunctionComponent, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import { reportsPendingSummaryMock } from '../data/reportsPendingMock';
import type { ReportsPendingSummaryStat } from '../types';

const iconMap = {
  total: FileText,
  submitted: CheckCircle2,
  late: AlertTriangle,
} as const;

const labelKeyByIcon: Record<ReportsPendingSummaryStat['icon'], string> = {
  total: 'encadrant.reports.kpi.total',
  submitted: 'encadrant.reports.kpi.submitted',
  late: 'encadrant.reports.kpi.late',
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
      ariaLabel={t('encadrant.header.titles.reportsPendingList')}
    />
  );
};

export default ReportsPendingSummaryGrid;
