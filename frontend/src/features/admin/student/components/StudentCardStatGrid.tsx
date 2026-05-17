import { FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import AdminKpiGrid from '../../ui/AdminKpiGrid';
import StudentDashboardStatCard from './StudentDashboardStatCard';
import { useTranslateAdminLabel } from '../../i18n/useTranslateAdminLabel';

export interface StudentCardStatItem {
  label: string;
  labelKey?: string;
  value: number;
  Icon: LucideIcon;
  iconBgClass: string;
  valueSuffix?: string;
}

interface StudentCardStatGridProps {
  stats: StudentCardStatItem[];
  columns?: 2 | 3 | 4;
  onStatClick?: (labelKey: string) => void;
}

/** Grille KPI étudiants — panneau unifié `admin-kpi-panel` (fond carte aligné dashboard). */
const StudentCardStatGrid: FunctionComponent<StudentCardStatGridProps> = ({
  stats,
  columns = 4,
  onStatClick,
}) => {
  const translateLabel = useTranslateAdminLabel();

  return (
    <AdminKpiGrid columns={columns}>
      {stats.map((stat, index) => {
        const resolvedLabel = translateLabel(stat.label, stat.labelKey);
        const clickKey = stat.labelKey ?? stat.label;
        return (
          <StudentDashboardStatCard
            key={clickKey}
            label={resolvedLabel}
            value={stat.value}
            IconComponent={stat.Icon}
            iconBgClass={stat.iconBgClass}
            valueSuffix={stat.valueSuffix}
            index={index}
            onClick={onStatClick ? () => onStatClick(clickKey) : undefined}
          />
        );
      })}
    </AdminKpiGrid>
  );
};

export default StudentCardStatGrid;
