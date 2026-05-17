import { FunctionComponent } from 'react';
import { Calendar, Clock, FileText, XCircle, LucideIcon } from 'lucide-react';
import AdminKpiGrid from '../../../../ui/AdminKpiGrid';
import AdminKpiStatCard from '../../../../ui/AdminKpiStatCard';

const overviewStats: { label: string; value: string; icon: LucideIcon; accent: string; bg: string }[] = [
  { label: 'Total Rejected', value: '58', icon: XCircle, accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
  { label: 'This Month', value: '15', icon: Calendar, accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  { label: 'Resubmitted', value: '23', icon: FileText, accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  { label: 'Pending Resubmission', value: '35', icon: Clock, accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
];

const RejectedDocumentsOverviewCards: FunctionComponent = () => (
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

export default RejectedDocumentsOverviewCards;
