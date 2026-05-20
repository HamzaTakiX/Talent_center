import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminKpiGrid from '../../../ui/AdminKpiGrid';
import AdminKpiStatCard from '../../../ui/AdminKpiStatCard';
import { tonesFromBgClass } from '../../../ui/adminKpiTones';
import { ENCADRANT_REPORT_FILTER_ROUTES } from '../data/encadrantReportCardRoutes';
import type { EncadrantReportCardStatItem } from '../utils/encadrantReportSubpageKpiStats';
interface EncadrantReportCardStatGridProps {
  stats: EncadrantReportCardStatItem[];
  columns?: 2 | 3 | 4 | 5;
}

const EncadrantReportCardStatGrid: FunctionComponent<EncadrantReportCardStatGridProps> = ({
  stats,
  columns = 4,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <AdminKpiGrid columns={columns}>
      {stats.map((stat, index) => {
        const { accent, bg } = tonesFromBgClass(stat.iconBgClass);
        return (
          <AdminKpiStatCard
            key={stat.filter}
            label={t(`admin.kpi.${stat.labelKey}`)}
            value={new Intl.NumberFormat('en-US').format(stat.value)}
            icon={stat.Icon}
            accent={accent}
            accentBg={bg}
            index={index}
            onClick={() => navigate(ENCADRANT_REPORT_FILTER_ROUTES[stat.filter])}
          />
        );
      })}
    </AdminKpiGrid>
  );
};

export default EncadrantReportCardStatGrid;
