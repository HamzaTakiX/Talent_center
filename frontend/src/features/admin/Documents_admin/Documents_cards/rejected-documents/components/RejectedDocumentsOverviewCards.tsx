import { FunctionComponent } from 'react';
import { Calendar, Clock, FileText, XCircle } from 'lucide-react';
import DocumentsOverviewStatGrid from '../../shared/DocumentsOverviewStatGrid';

const RejectedDocumentsOverviewCards: FunctionComponent = () => (
  <DocumentsOverviewStatGrid
    items={[
      {
        label: 'Total Rejected',
        value: '58',
        badge: 'Rejetés',
        icon: XCircle,
        accent: '#ef4444',
        accentBg: 'rgba(239, 68, 68, 0.16)',
      },
      {
        label: 'This Month',
        value: '15',
        badge: '26% du total',
        icon: Calendar,
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.16)',
        piePercent: 26,
      },
      {
        label: 'Resubmitted',
        value: '23',
        badge: '40% du total',
        icon: FileText,
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.16)',
        piePercent: 40,
      },
      {
        label: 'Pending Resubmission',
        value: '35',
        badge: '60% du total',
        icon: Clock,
        accent: '#8b5cf6',
        accentBg: 'rgba(139, 92, 246, 0.16)',
        piePercent: 60,
      },
    ]}
  />
);

export default RejectedDocumentsOverviewCards;
