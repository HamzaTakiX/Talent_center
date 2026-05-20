import { FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminKpiGrid from '../../../../ui/AdminKpiGrid';
import AdminKpiStatCard from '../../../../ui/AdminKpiStatCard';
import { tonesFromBgClass } from '../../../../ui/adminKpiTones';

export interface EncadrantCardStatItem {
  labelKey: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
}

interface EncadrantCardStatGridProps {
  stats: EncadrantCardStatItem[];
  columns?: 2 | 3 | 4 | 5;
}

const EncadrantCardStatGrid: FunctionComponent<EncadrantCardStatGridProps> = ({
  stats,
  columns,
}) => {
  const { t } = useTranslation();
  const gridColumns = columns ?? (stats.length >= 5 ? 5 : stats.length === 3 ? 3 : 4);

  return (
    <AdminKpiGrid columns={gridColumns}>
      {stats.map((stat, index) => {
        const { accent, bg } = tonesFromBgClass(stat.iconBgClass);
        return (
          <AdminKpiStatCard
            key={stat.labelKey}
            label={t(`admin.kpi.${stat.labelKey}`)}
            value={new Intl.NumberFormat('en-US').format(stat.value)}
            icon={stat.Icon}
            accent={accent}
            accentBg={bg}
            index={index}
          />
        );
      })}
    </AdminKpiGrid>
  );
};

export default EncadrantCardStatGrid;
