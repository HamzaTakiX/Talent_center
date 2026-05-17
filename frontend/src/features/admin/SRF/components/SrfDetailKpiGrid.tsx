import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';
import AdminKpiGrid from '../../ui/AdminKpiGrid';
import AdminKpiStatCard from '../../ui/AdminKpiStatCard';
import { tonesFromBgClass } from '../../ui/adminKpiTones';

export interface SrfDetailKpiItem {
  label?: string;
  labelKey?: string;
  valueDisplay: string;
  Icon: LucideIcon;
  iconBgClass: string;
}

interface SrfDetailKpiGridProps {
  items: SrfDetailKpiItem[];
  columns?: 2 | 3 | 4;
}

/** Grille KPI drill-down SRF — même rendu que `/admin/srf` (AdminKpiGrid + teintes). */
const SrfDetailKpiGrid: FunctionComponent<SrfDetailKpiGridProps> = ({ items, columns = 4 }) => {
  const { t } = useTranslation();
  return (
  <AdminKpiGrid columns={columns}>
    {items.map((item, index) => {
      const { accent, bg } = tonesFromBgClass(item.iconBgClass);
      const label = item.labelKey ? t(item.labelKey) : (item.label ?? '');
      return (
        <AdminKpiStatCard
          key={item.labelKey ?? item.label ?? String(index)}
          label={label}
          value={item.valueDisplay}
          icon={item.Icon}
          accent={accent}
          accentBg={bg}
          index={index}
        />
      );
    })}
  </AdminKpiGrid>
  );
};

export default SrfDetailKpiGrid;
