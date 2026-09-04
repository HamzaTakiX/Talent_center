import { FunctionComponent } from 'react';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import DocumentsOverviewStatGrid from '../../shared/DocumentsOverviewStatGrid';

const AllDocumentsOverviewCards: FunctionComponent = () => (
  <DocumentsOverviewStatGrid
    items={[
      {
        label: 'Total Documents',
        value: '892',
        badge: 'Catalogue',
        icon: FileText,
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.16)',
      },
      {
        label: 'Pending Review',
        value: '45',
        badge: '5% du total',
        icon: Clock,
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.16)',
        piePercent: 5,
      },
      {
        label: 'Approved',
        value: '789',
        badge: '88% du total',
        icon: CheckCircle,
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.16)',
        piePercent: 88,
      },
      {
        label: 'Rejected',
        value: '58',
        badge: '7% du total',
        icon: XCircle,
        accent: '#ef4444',
        accentBg: 'rgba(239, 68, 68, 0.16)',
        piePercent: 7,
      },
    ]}
  />
);

export default AllDocumentsOverviewCards;
