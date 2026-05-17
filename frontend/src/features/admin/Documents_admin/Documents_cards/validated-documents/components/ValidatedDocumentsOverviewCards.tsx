import { FunctionComponent } from 'react';
import { Calendar, CheckCircle, LucideIcon } from 'lucide-react';
import AdminKpiGrid from '../../../../ui/AdminKpiGrid';
import AdminKpiStatCard from '../../../../ui/AdminKpiStatCard';

const overviewStats: { label: string; value: string; icon: LucideIcon; accent: string; bg: string }[] = [
  { label: 'Total Validated', value: '789', icon: CheckCircle, accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  { label: 'This Month', value: '156', icon: Calendar, accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  { label: 'This Week', value: '45', icon: Calendar, accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  { label: 'Today', value: '12', icon: Calendar, accent: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
];

const ValidatedDocumentsOverviewCards: FunctionComponent = () => (
  <AdminKpiGrid columns={4}>
    {overviewStats.map((stat, index) => (
      <AdminKpiStatCard
        key={stat.label}
        label={stat.label}
        value={stat.value}
        icon={stat.icon}
        accent={stat.accent}
        accentBg={stat.bg}
        index={index}
      />
    ))}
  </AdminKpiGrid>
);

export default ValidatedDocumentsOverviewCards;
