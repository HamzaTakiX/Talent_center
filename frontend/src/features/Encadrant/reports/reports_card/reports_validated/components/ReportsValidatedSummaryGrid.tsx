import { FunctionComponent, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import { reportsValidatedSummaryMock } from '../data/reportsValidatedMock';
import type { ReportsValidatedSummaryStat } from '../types';

const iconMap = {
  total: FileText,
  submitted: CheckCircle2,
  late: AlertTriangle,
} as const;

const labelKeyByIcon: Record<ReportsValidatedSummaryStat['icon'], string> = {
  total: 'encadrant.reports.kpi.total',
  submitted: 'encadrant.reports.kpi.submitted',
  late: 'encadrant.reports.kpi.late',
};

const ReportsValidatedSummaryGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      reportsValidatedSummaryMock.map((stat) => {
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
      ariaLabel={t('encadrant.header.titles.reportsValidated')}
    />
  );
};

export default ReportsValidatedSummaryGrid;
