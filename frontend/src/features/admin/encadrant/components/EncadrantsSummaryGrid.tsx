import { FunctionComponent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileEdit, User, Users, Video } from 'lucide-react';
import type { AdminEncadrantRow } from '../../api/types';
import EncadrantSummaryStatCard from './EncadrantSummaryStatCard';
import { ENCADRANT_CARD_ROUTES } from '../data/encadrantsMockData';
import { ENCADRANT_REPORT_FILTER_ROUTES } from '../reports/data/encadrantReportCardRoutes';
import { computeEncadrantReportKpiStats } from '../shared/utils/encadrantReportKpiStats';
import { useEncadrantReports } from '../reports/hooks/useEncadrantReports';
import AdminKpiGrid from '../../ui/AdminKpiGrid';

interface EncadrantsSummaryGridProps {
  rows: AdminEncadrantRow[];
  loading?: boolean;
}

const EncadrantsSummaryGrid: FunctionComponent<EncadrantsSummaryGridProps> = ({
  rows,
  loading = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { rows: reportRows, loading: reportsLoading } = useEncadrantReports();

  const stats = useMemo(() => {
    const totalAssigned = rows.reduce((sum, r) => sum + r.current_students, 0);
    const reportTotal = computeEncadrantReportKpiStats(reportRows).total;
    return [
      {
        labelKey: 'total',
        value: loading ? '—' : String(rows.length),
        Icon: User,
        iconBgClass: 'bg-[#a855f7]',
        route: ENCADRANT_CARD_ROUTES[0],
      },
      {
        labelKey: 'assigned',
        value: loading ? '—' : String(totalAssigned),
        Icon: Users,
        iconBgClass: 'bg-[#3b82f6]',
        route: ENCADRANT_CARD_ROUTES[1],
      },
      {
        labelKey: 'meetings',
        value: loading ? '—' : String(rows.filter((r) => r.current_students > 0).length),
        Icon: Video,
        iconBgClass: 'bg-[#22c55e]',
        route: ENCADRANT_CARD_ROUTES[2],
      },
      {
        labelKey: 'totalReports',
        value: loading || reportsLoading ? '—' : String(reportTotal),
        Icon: FileEdit,
        iconBgClass: 'bg-[#f97316]',
        route: ENCADRANT_REPORT_FILTER_ROUTES.all,
      },
    ];
  }, [rows, loading, reportRows, reportsLoading]);

  return (
    <AdminKpiGrid columns={4}>
      {stats.map((stat, index) => (
        <EncadrantSummaryStatCard
          key={stat.labelKey}
          label={t(`admin.kpi.encadrants.${stat.labelKey}`)}
          value={stat.value}
          IconComponent={stat.Icon}
          iconBgClass={stat.iconBgClass}
          index={index}
          onClick={() => navigate(stat.route)}
        />
      ))}
    </AdminKpiGrid>
  );
};

export default EncadrantsSummaryGrid;
