import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2, Users, Clock3, LucideIcon } from 'lucide-react';
import AdminKpiGrid from './AdminKpiGrid';
import AdminKpiStatCard from './AdminKpiStatCard';

export interface AdminHistoryStatItem {
  key: string;
  label: string;
  value: string;
  icon: string;
}

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  update: Pencil,
  create: Plus,
  delete: Trash2,
  history: Clock3,
  calendar: Clock3,
  total: Users,
};

const defaultTone = { accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' };

const toneByIcon: Record<string, { accent: string; bg: string }> = {
  create: { accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  delete: { accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  update: defaultTone,
  users: defaultTone,
};

interface AdminHistorySubStatsGridProps {
  stats: readonly AdminHistoryStatItem[];
  columns?: 2 | 3 | 4;
}

const AdminHistorySubStatsGrid: FunctionComponent<AdminHistorySubStatsGridProps> = ({
  stats,
  columns = 4,
}) => {
  const { t } = useTranslation();
  return (
  <AdminKpiGrid columns={columns} className="w-full">
    {stats.map((stat, index) => {
      const Icon = iconMap[stat.icon] ?? Users;
      const { accent, bg } = toneByIcon[stat.icon] ?? defaultTone;
      const label = t(`admin.kpi.historySub.${stat.key}`, stat.label);
      return (
        <AdminKpiStatCard
          key={stat.key}
          label={label}
          value={stat.value}
          icon={Icon}
          accent={accent}
          accentBg={bg}
          index={index}
        />
      );
    })}
  </AdminKpiGrid>
  );
};

export default AdminHistorySubStatsGrid;
