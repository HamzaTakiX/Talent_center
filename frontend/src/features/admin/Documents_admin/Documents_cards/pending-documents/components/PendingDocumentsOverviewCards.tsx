import { FunctionComponent } from 'react';
import { AlertCircle, Calendar, Clock, FileText } from 'lucide-react';
import DocumentsOverviewStatGrid from '../../shared/DocumentsOverviewStatGrid';

const PendingDocumentsOverviewCards: FunctionComponent = () => (
  <DocumentsOverviewStatGrid
    items={[
      {
        label: 'Total Pending',
        value: '45',
        badge: 'En attente',
        icon: Clock,
        accent: '#f59e0b',
        accentBg: 'rgba(245, 158, 11, 0.16)',
      },
      {
        label: 'Submitted Today',
        value: '12',
        badge: 'Aujourd\'hui',
        icon: Calendar,
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.16)',
        piePercent: 27,
      },
      {
        label: 'Pending >3 Days',
        value: '8',
        badge: 'Urgent',
        icon: AlertCircle,
        accent: '#ef4444',
        accentBg: 'rgba(239, 68, 68, 0.16)',
        piePercent: 18,
      },
      {
        label: 'Awaiting Action',
        value: '45',
        badge: 'Action requise',
        icon: FileText,
        accent: '#8b5cf6',
        accentBg: 'rgba(139, 92, 246, 0.16)',
        piePercent: 100,
      },
    ]}
  />
);

export default PendingDocumentsOverviewCards;
