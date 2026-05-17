import { FunctionComponent } from 'react';
import { FileText, Clock, CheckCircle, XCircle, LucideIcon } from 'lucide-react';
import AdminKpiGrid from '../../../../ui/AdminKpiGrid';
import AdminKpiStatCard from '../../../../ui/AdminKpiStatCard';

const overviewStats: { label: string; value: string; icon: LucideIcon; accent: string; bg: string }[] = [
  { label: 'Total Documents', value: '892', icon: FileText, accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  { label: 'Pending Review', value: '45', icon: Clock, accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  { label: 'Approved', value: '789', icon: CheckCircle, accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  { label: 'Rejected', value: '58', icon: XCircle, accent: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
];

const AllDocumentsOverviewCards: FunctionComponent = () => (
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

export default AllDocumentsOverviewCards;
