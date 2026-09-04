import { FunctionComponent, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlatformKpiStrip from '../../../../design-system/PlatformKpiStrip';
import { encadrantKpiTone } from '../../constants/encadrantKpiTones';
import { ENCADRANT_REPORTS_LATE_PATH } from '../reports_card/reports_late/constants/routes';
import { ENCADRANT_REPORTS_PENDING_PATH } from '../reports_card/reports_pending/constants/routes';
import { ENCADRANT_REPORTS_SUBMITTED_PATH } from '../reports_card/reports_submitted/constants/routes';
import { ENCADRANT_REPORTS_VALIDATED_PATH } from '../reports_card/reports_validated/constants/routes';
import { reportsSummaryMock } from '../data/reportsMock';
import type { ReportsSummaryStat } from '../types';

const iconMap = {
  submitted: FileText,
  pending: Clock,
  late: AlertTriangle,
  validated: CheckCircle2,
} as const;

const labelKeyByIcon: Record<ReportsSummaryStat['icon'], string> = {
  submitted: 'encadrant.reports.kpi.submitted',
  pending: 'encadrant.reports.kpi.pending',
  late: 'encadrant.reports.kpi.late',
  validated: 'encadrant.reports.kpi.validated',
};

const pathByIcon: Partial<Record<ReportsSummaryStat['icon'], string>> = {
  submitted: ENCADRANT_REPORTS_SUBMITTED_PATH,
  pending: ENCADRANT_REPORTS_PENDING_PATH,
  late: ENCADRANT_REPORTS_LATE_PATH,
  validated: ENCADRANT_REPORTS_VALIDATED_PATH,
};

const ReportsSummaryGrid: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      reportsSummaryMock.map((stat) => {
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
      columns={4}
      ariaLabel={t('encadrant.reports.summaryAria')}
    />
  );
};

export default ReportsSummaryGrid;
