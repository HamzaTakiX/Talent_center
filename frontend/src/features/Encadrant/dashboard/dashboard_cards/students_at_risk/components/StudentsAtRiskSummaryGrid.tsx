import { FunctionComponent, useMemo } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../../../constants/encadrantKpiTones';
import { studentsAtRiskSummaryMock } from '../data';
import type { StudentsAtRiskSummaryStat } from '../types';

const iconMap = {
  alert: AlertTriangle,
  check: CheckCircle2,
} as const;

/** Tone is unique per KPI when icons collide (high/medium both use alert). */
const labelKeyByTone: Record<StudentsAtRiskSummaryStat['tone'], string> = {
  red: 'encadrant.dashboard.atRisk.kpi.high',
  orange: 'encadrant.dashboard.atRisk.kpi.medium',
  green: 'encadrant.dashboard.atRisk.kpi.low',
};

const StudentsAtRiskSummaryGrid: FunctionComponent = () => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      studentsAtRiskSummaryMock.map((stat) => {
        const tones = encadrantKpiTone(stat.tone);
        return {
          id: `${stat.tone}-${stat.icon}`,
          label: t(labelKeyByTone[stat.tone]),
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
      ariaLabel={t('encadrant.dashboard.studentsAtRisk')}
    />
  );
};

export default StudentsAtRiskSummaryGrid;
