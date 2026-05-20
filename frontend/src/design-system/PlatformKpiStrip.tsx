import { FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import AdminKpiGrid from '../features/admin/ui/AdminKpiGrid';
import AdminKpiStatCard from '../features/admin/ui/AdminKpiStatCard';
import { tonesFromBgClass } from '../features/admin/ui/adminKpiTones';

export interface PlatformKpiItem {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  /** Classe Tailwind legacy ex. `bg-[#22c55e]` — mappée vers accent KPI */
  iconBgClass?: string;
  accent?: string;
  accentBg?: string;
  onClick?: () => void;
}

interface PlatformKpiStripProps {
  items: PlatformKpiItem[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
  ariaLabel?: string;
}

/** Bandeau KPI unifié plateforme (admin + student). */
const PlatformKpiStrip: FunctionComponent<PlatformKpiStripProps> = ({
  items,
  columns = 4,
  className = '',
  ariaLabel,
}) => (
  <section aria-label={ariaLabel} className="min-w-0">
    <AdminKpiGrid columns={columns} className={className}>
    {items.map((item, index) => {
      const tones = item.iconBgClass
        ? tonesFromBgClass(item.iconBgClass)
        : { accent: item.accent ?? 'var(--admin-brand)', bg: item.accentBg ?? 'var(--admin-brand-muted)' };
      return (
        <AdminKpiStatCard
          key={item.id}
          label={item.label}
          value={item.value}
          icon={item.icon}
          accent={tones.accent}
          accentBg={tones.bg}
          index={index}
          onClick={item.onClick}
        />
      );
    })}
    </AdminKpiGrid>
  </section>
);

export default PlatformKpiStrip;
