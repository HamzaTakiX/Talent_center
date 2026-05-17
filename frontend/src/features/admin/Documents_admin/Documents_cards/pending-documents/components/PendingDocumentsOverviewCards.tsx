import { FunctionComponent } from 'react';
import { AlertCircle, Calendar, Clock, FileText, LucideIcon } from 'lucide-react';
import AdminKpiGrid from '../../../../ui/AdminKpiGrid';
import AdminKpiStatCard from '../../../../ui/AdminKpiStatCard';

const overviewStats: { label: string; value: string; icon: LucideIcon; accent: string; bg: string }[] = [
  { label: 'Total Pending', value: '45', icon: Clock, accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  { label: 'Submitted Today', value: '12', icon: Calendar, accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  { label: 'Pending >3 Days', value: '8', icon: AlertCircle, accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  { label: 'Awaiting Action', value: '45', icon: FileText, accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
];

const PendingDocumentsOverviewCards: FunctionComponent = () => (
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

export default PendingDocumentsOverviewCards;
